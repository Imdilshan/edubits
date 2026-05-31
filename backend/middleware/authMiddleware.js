
// const jwt = require("jsonwebtoken");
// const User = require("../models/User");

// module.exports = async (req, res, next) => {
//   const authHeader = req.header("Authorization");

//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).json({ error: "No token, authorization denied" });
//   }

//   const token = authHeader.split(" ")[1];

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     const user = await User.findById(decoded.id).select("-password");
//     if (!user) {
//       return res.status(401).json({ error: "User not found" });
//     }

//     req.user = user;
//     next();
//   } catch {
//     res.status(401).json({ error: "Invalid token" });
//   }
// };

// // commenting out for migration changes