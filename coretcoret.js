// import bcrypt from 'bcrypt';

// async function main() {
//     const password = 'mySecurePassword';
    
//     // Set the salt rounds (higher values make the hashing process slower)
//     const saltRounds = 12;  // You can experiment with this value (e.g., 10, 12, 14)

//     // Hash the password using bcrypt
//     const hashedPassword = await bcrypt.hash(password, saltRounds);
//     console.log(`Hashed Password: ${hashedPassword}`);

//     // To verify the password later, you would compare the entered password to the hashed value
//     const isMatch = await bcrypt.compare(password, hashedPassword);
//     console.log(`Password match: ${isMatch}`);  // true if password matches, false otherwise
// }

// main().catch(console.error);