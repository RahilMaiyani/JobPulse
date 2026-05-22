import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ msg: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const currentUser = await User.findById(decoded.id);
    
    if (!currentUser || currentUser.tokenVersion !== decoded.version) {
      return res.status(401).json({ msg: "Session invalidated by another login" });
    }

    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ msg: "Invalid token" });
  }
};