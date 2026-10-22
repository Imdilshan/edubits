// commenting out for migration changes
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    const cookieToken = req.headers.cookie?.split(";").map((part) => part.trim())
      .find((part) => part.startsWith("edubits_auth="))?.slice("edubits_auth=".length);
    const token = cookieToken;

    if (!token) {
      return res.status(401).json({
        error: "No token, authorization denied",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    if (decoded.type === "quiz") {
      return res.status(401).json({ error: "Invalid token" });
    }
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        error: "User not found",
      });
    }

    if ((decoded.tokenVersion || 0) !== (user.tokenVersion || 0)) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.user = user;

    next();
  } catch (err) {
    return res.status(401).json({
      error: "Invalid token",
    });
  }
};

module.exports = authMiddleware;
