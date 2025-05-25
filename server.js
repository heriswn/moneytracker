require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const path = require("path");
const cors = require("cors");
const Transaction = require("./models/Transaction");
const User = require("./models/User");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: "sessions",
    }),
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// MongoDB connection
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/moneytracker",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// Passport config: Google
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
        user = await User.create({
          googleId: profile.id,
          displayName: profile.displayName,
          email: profile.emails?.[0]?.value || "",
        });
      }
      return done(null, user);
    }
  )
);

// Passport config: Local
passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      const user = await User.findOne({ email });
      if (!user || !user.password) return done(null, false);
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return done(null, false);
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

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login.html");
}

// Auth routes: Google
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login.html" }),
  (req, res) => {
    res.redirect("/");
  }
);

// Auth routes: Email/Password
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).send("Email already exists");
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });
    req.login(user, (err) => {
      if (err) return res.status(500).send("Login failed");
      res.redirect("/");
    });
  } catch (err) {
    res.status(500).send("Registration error");
  }
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login.html",
  })
);

app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/login.html");
  });
});

// API routes
app.get("/api/transactions", ensureAuthenticated, async (req, res) => {
  const transactions = await Transaction.find({ user: req.user._id });
  res.json(transactions);
});

app.post("/api/transactions", ensureAuthenticated, async (req, res) => {
  const { description, amount } = req.body;
  const transaction = new Transaction({
    description,
    amount,
    user: req.user._id,
  });
  await transaction.save();
  res.json(transaction);
});

// Serve index.html only if user is authenticated
app.get("/", ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
