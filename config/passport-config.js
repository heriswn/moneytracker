// config/passport-config.js
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/User");
const bcrypt = require("bcrypt");

module.exports = function (passport) {
  // Serialize user
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Google Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });
          if (!user) {
            user = new User({
              googleId: profile.id,
              email: profile.emails[0].value,
            });
            await user.save();
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // Local Strategy
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email });
          if (!user) return done(null, false, { message: "Incorrect email." });
          const isMatch = await user.comparePassword(password);
          if (!isMatch)
            return done(null, false, { message: "Incorrect password." });
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
};
