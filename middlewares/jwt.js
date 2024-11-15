const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  // Check for the token in the "Authorization" header
  const token = req.headers["authorization"];
  
  // Ensure token is provided
  if (!token) {
    return res.status(403).json({ message: "No token provided." });
  }

  // Verify token
  const key = process.env.JWT_SECRET;
  jwt.verify(token, key, (err, decoded) => {
    if (err) {
      return res.status(500).json({ message: "Failed to authenticate token." });
    }
    
    // Attach the decoded token payload (user information) to the request object
    req.userId = decoded.id; // Assuming 'id' is stored in the JWT payload
    next(); // Continue to the next middleware or route handler
  });
}

module.exports = verifyToken;
