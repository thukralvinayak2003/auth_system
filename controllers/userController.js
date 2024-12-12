const bcrypt = require("bcrypt");
const User = require("../models/User");
const { generateToken, setTokenCookie } = require("../utils/auth");

class UserController {
  static async register(req, res) {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
      }

      if (password.length < 8) {
        return res
          .status(400)
          .json({ error: "Password must be at least 8 characters long" });
      }

      const existingUser = await User.checkExistingUser(username, email);
      if (existingUser) {
        return res
          .status(409)
          .json({ error: "Username or email already exists" });
      }

      const newUser = await User.create(username, email, password);

      const token = generateToken(newUser);
      setTokenCookie(res, token);

      const { password: _, ...userResponse } = newUser;

      res.status(201).json({
        message: "Registration successful",
        user: userResponse,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error during registration" });
    }
  }

  static async login(req, res) {
    try {
      const { username, password } = req.body;

      const user = await User.findByUsernameOrEmail(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = generateToken(user);
      setTokenCookie(res, token);

      const { password: _, ...userResponse } = user;

      res.json({
        message: "Login successful",
        user: userResponse,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error during login" });
    }
  }

  static logout(req, res) {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.json({ message: "Logged out successfully" });
  }

  static async getProfile(req, res) {
    try {
      const userId = req.user.id;
      const userProfile = await User.findProfileById(userId);

      if (!userProfile) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(userProfile);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error retrieving profile" });
    }
  }
}

module.exports = UserController;
