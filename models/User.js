// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  email: { type: String, required: false },
  password: { type: String, required: false },
  googleId: { type: String, required: false },
});

// Hash password before saving (for email/password accounts)
userSchema.pre("save", async function (next) {
  if (this.password && this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Compare input password with hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
