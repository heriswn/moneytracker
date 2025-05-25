// routes/auth.js
const express = require("express");
const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const router = express.Router();

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login.html",
    successRedirect: "/",
  })
);

// Register with email & password
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });
    const user = new User({ email, password });
    await user.save();
    res.status(200).json({ message: "User registered" });
  } catch (err) {
    res.status(500).json({ message: "Error registering user" });
  }
});

// Login with email & password
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login.html",
  })
);

// Logout
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/login.html");
  });
});

module.exports = router;
