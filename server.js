const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const cors = require("cors");
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");
require("dotenv").config();
const path = require("path");
const userQuery = require("./database/mongodb/query");
const mongodb = require("./database/mongodb/db");
const verifyToken = require("./middlewares/jwt");

mongodb.connectDB();
const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use('/assets', express.static(path.join(__dirname, "assets")));


app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

function isAuthenticated(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    console.error("Invalid token:", err.message);
    return res
      .status(401)
      .json({ message: "Invalid token. Please log in again." });
  }
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.get("/protected", verifyToken, (req, res) => {
  res.status(200).json({ message: "This is a protected route" });
});

// Set up session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport session setup
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Configure Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

// Middleware to ensure the user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login.html");
}

// Root route
app.get("/", (req, res) => {
  res.redirect("/register.html");
});

// Google OAuth Routes
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login.html" }),
  (req, res) => {
    // Successful authentication, redirect to index.html
    res.redirect("/index.html");
  }
);

// Logout route
app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/login.html");
  });
});

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    // Periksa apakah email atau nama sudah ada di database
    const existingEmail = await userQuery.findOneByEmail(email);
    const existingName = await userQuery.findByName(name);

    if (existingEmail) {
      return res.status(400).json({ message: "Email is already registered" });
    }
    if (existingName && existingName.length > 0) {
      return res.status(400).json({ message: "Username is already taken" });
    }

    // Validasi tambahan pada email
    const allowedDomains = [".com", ".org", ".net", ".ac.id", ".co.uk"];
    const isValidDomain = allowedDomains.some((domain) =>
      email.endsWith(domain)
    );

    if (!isValidDomain || !email.includes("@")) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    // Hash password sebelum disimpan
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan pengguna baru ke database
    const newUser = await userQuery.createUser({
      name,
      email,
      password: hashedPassword,
    });
    console.log("User registered:", newUser);

    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    console.error("Error during registration:", error.message);
    res.status(500).json({ message: "Registration failed: " + error.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Fetch user by email
    const checkUser = await userQuery.findOneByEmail(email);

    if (!checkUser) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Log values to debug
    console.log("Password (input):", password);
    console.log("Password (hashed from DB):", checkUser.password);

    // Use await with bcrypt.compare
    const isPasswordValid = bcrypt.compare(password, checkUser.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate and send JWT token
    const token = jwt.sign(
      { id: checkUser._id, email: checkUser.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/create-quiz", async (req, res) => {
  try {
    const { title, description, totalQuestions } = req.body;
    const newQuiz = await userQuery.createQuiz({
      title,
      description,
      totalQuestions,
    });
    res
      .status(201)
      .json({ message: "Quiz created successfully", quiz: newQuiz });
  } catch (error) {
    console.error("Error creating quiz:", error);
    res.status(500).json({ message: "Error creating quiz", error });
  }
});

app.post("/submit-quiz", async (req, res) => {
  try {
    const { userId, quizId, correctAnswers, totalQuestions } = req.body;

    // Validate input
    if (!userId || !quizId || correctAnswers === undefined || !totalQuestions) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Save the quiz result
    const quizResult = await userQuery.submitQuizResult({
      userId,
      quizId,
      correctAnswers,
      totalQuestions,
    });

    res.status(201).json({
      message: "Quiz result submitted successfully",
      quizResult,
    });
  } catch (error) {
    console.error("Error submitting quiz result:", error);
    res.status(500).json({ message: "Error submitting quiz result", error });
  }
});

app.get("/completed-quizzes.html", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "completed-quizzes.html"));
});

app.get("/completed-quizzes", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all quiz progress records for the authenticated user
    const completedQuizzes = await userQuery.getCompletedQuizzes(userId);

    // Format the response to include quiz titles and scores
    const formattedQuizzes = completedQuizzes.map((quiz) => ({
      quizTitle: quiz.quizId.title,
      quizDescription: quiz.quizId.description,
      correctAnswers: quiz.correctAnswers,
      incorrectAnswers: quiz.incorrectAnswers,
      totalQuestions: quiz.totalQuestions,
      score: quiz.score,
      date: quiz.date,
    }));

    res.status(200).json({
      message: "Completed quizzes fetched successfully",
      quizzes: formattedQuizzes,
    });
  } catch (error) {
    console.error("Error fetching completed quizzes:", error);
    res
      .status(500)
      .json({ message: "Error fetching completed quizzes", error });
  }
});

app.post("/update-profile", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const { username } = req.body;

    // Update only the username for the logged-in user
    const updatedUser = await userQuery.updateUser(userId, {
      name: username,
    });

    res
      .status(200)
      .json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Error updating profile", error });
  }
});

// Add this endpoint to serve user information
app.get("/user-info", isAuthenticated, async (req, res) => {
  try {
    // Retrieve user information from the database based on the ID in the token
    const user = await userQuery.findUserById(req.user.id); // Ensure `findUserById` exists in `userQuery`

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ username: user.name, email: user.email });
  } catch (error) {
    console.error("Error fetching user info:", error.message);
    res.status(500).json({ message: "Failed to load user info" });
  }
});

app.get("/index.html", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/check-username", async (req, res) => {
  const { username } = req.query;
  try {
    const existingUser = await userQuery.findByName(username);
    if (existingUser && existingUser.length > 0) {
      return res.json({ available: false });
    }
    res.json({ available: true });
  } catch (error) {
    console.error("Error checking username:", error);
    res
      .status(500)
      .json({ message: "An error occurred while checking username." });
  }
});


app.put("/update-username", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const { newUsername } = req.body;

    // Check if the new username is already taken
    const existingUser = await userQuery.findByName(newUsername);
    if (existingUser && existingUser.length > 0) {
      return res.status(400).json({ message: "Username is already taken" });
    }

    // Update the username in the database
    const updatedUser = await userQuery.updateUser(userId, {
      name: newUsername,
    });

    res.status(200).json({
      message: "Username updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating username:", error.message);
    res.status(500).json({ message: "An error occurred while updating username" });
  }
});





// // Route to register a new user
// app.post("/register", async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     // Check if all required fields are present
//     if (!name || !email || !password) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     const existingName = await userQuery.findByName(name);
//     const existingEmail = await userQuery.findOneByEmail(email);

//     // Check if user already exists
//     if (existingName.length === 0 && !existingEmail) {
//       // Hash the password
//       const hashedPassword = await bcrypt.hash(password, 10);

//       const payload = { name, email, password: hashedPassword };

//       // Save the user to the database
//       await userQuery.createUser(payload);

//       res.status(201).json({ message: "Register success" });
//     } else {
//       return res.status(400).json({ message: "Name or email already registered" });
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(404).json({ message: "Register failed: " + error.message });
//   }
// });

// // Route to login user
// // Route to login user
// app.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const payload = { email, password };
//     const token = await login(payload); // Call the login function to get the token
//     res.status(200).json({ message: "Success login!", token });
//   } catch (err) {
//     res.status(500).json({ error: "Internal Server Error", message: err.message });
//   }
// });

// // Helper function for registering a user
// async function register(payload) {
//   try {
//     const checkEmail = await userQuery.findOneByEmail(payload.email);
//     const allowedDomains = [".com", ".org", ".net", ".ac.id", ".co.uk"];

//     const isValidDomain = allowedDomains.some((domain) =>
//       payload.email.endsWith(domain)
//     );

//     if (!isValidDomain || !payload.email.includes("@")) {
//       throw new Error("Invalid email format");
//     }

//     if (checkEmail) {
//       throw new Error("You already have an account, please log in!");
//     }

//     if (payload.password.length < 8) {
//       throw new Error("Password must be at least 8 characters");
//     }

//     // Hash the password before storing in the database
//     payload.password = await bcrypt.hash(payload.password, 10);
//     return payload;
//   } catch (error) {
//     throw new Error("Registration error: " + error.message);
//   }
// }

// // Helper function for logging in a user
// async function login(payload) {
//   try {
//     const checkUser = await userQuery.findOneByEmail(payload.email);

//     if (!checkUser) {
//       throw new Error("You haven't made an account yet, please register first");
//     }

//     console.log(checkUser);
//     console.log(payload.password);
//     console.log(checkUser.password);

//     const isValidPassword = await bcrypt.compare(payload.password, checkUser.password);

//     console.log(isValidPassword);

//     if (!isValidPassword) {
//       throw new Error("Incorrect password. Please check your password and try again");
//     }

//     const key = process.env.JWT_SECRET;
//     const token = jwt.sign({ email: checkUser.email }, key, { expiresIn: "30m" });
//     return token;
//   } catch (error) {
//     console.error("Error during login:", error.message);
//     throw new Error("Login failed: " + error.message);
//   }
// }
