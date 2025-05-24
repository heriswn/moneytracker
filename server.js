require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const Transaction = require("./models/Transaction");
const User = require("./models/User");

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.static("public"));

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails?.[0].value,
        });
      }
      return done(null, user);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Auth routes
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/",
    successRedirect: "/", // redirect to home
  })
);

app.get("/auth/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

app.get("/api/user", (req, res) => {
  res.json({ user: req.user || null });
});

// Middleware to check auth
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: "Unauthorized" });
}

// API routes
app.get("/api/transactions", isLoggedIn, async (req, res) => {
  console.log("User:", req.user);
  const transactions = await Transaction.find({ userId: req.user.id });
  res.json(transactions);
});

app.post("/api/transactions", isLoggedIn, async (req, res) => {
  const transaction = new Transaction({
    ...req.body,
    userId: req.user.id,
  });
  await transaction.save();
  res.json(transaction);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);