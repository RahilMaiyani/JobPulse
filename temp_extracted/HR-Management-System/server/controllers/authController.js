import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid password" });

    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role, version: user.tokenVersion },
      process.env.JWT_SECRET,
      { expiresIn: "10h" }
    );

    const { password: _, tokenVersion: __, ...safeUser } = user._doc;

    res.json({
      token,
      user: safeUser
    });
  } catch (err) {
    res.status(500).json({ msg: "Login failed" });
  }
};