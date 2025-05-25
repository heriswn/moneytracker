const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/User");
const Transaction = require("./models/Transaction");
const cors = require("cors");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/moneytracker",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.static("public"));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret", // Gunakan salah satu nilai default yang Anda inginkan
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// Google OAuth
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        user = await User.create({ googleId: profile.id });
      }
      return done(null, user);
    }
  )
);

// Local Strategy
passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      const user = await User.findOne({ email });
      if (!user) return done(null, false, { message: "Email not registered" });
      const match = await user.comparePassword(password);
      if (!match) return done(null, false, { message: "Incorrect password" });
      return done(null, user);
    }
  )
);

// Auth Routes
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/");
  }
);

app.post("/auth/register", async (req, res) => {
  const { email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing)
    return res.status(400).json({ message: "Email already registered" });
  const user = new User({ email, password });
  await user.save();
  res.json({ message: "User registered" });
});

app.post("/auth/login", passport.authenticate("local"), (req, res) => {
  res.json({ message: "Login successful", user: req.user });
});

app.get("/auth/logout", (req, res) => {
  req.logout(() => res.redirect("/"));
});

// API routes
app.get("/api/transactions", async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  const transactions = await Transaction.find({ userId: req.user._id });
  res.json(transactions);
});

app.post("/api/transactions", async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  const transaction = new Transaction({ ...req.body, userId: req.user._id });
  await transaction.save();
  res.json(transaction);
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));

const authRoutes = require("./routes/auth"); // Pastikan file ini ada
app.use("/auth", authRoutes);

require("./config/passport-config")(passport); // Pastikan file ini ada
