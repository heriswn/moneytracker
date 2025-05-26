const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true }, // Email juga harus required
  password: {
    type: String,
    required: function () {
      return !this.googleId;
    },
  }, // <-- PERBAIKAN DI SINI
  // password: { type: String, required: true }, // <-- Alternatif lebih sederhana jika semua user harus punya password
  googleId: { type: String, unique: true, sparse: true }, // sparse untuk memungkinkan null unik
  displayName: String,
});

userSchema.pre("save", async function (next) {
  // Tambahkan pengecekan if (this.password) untuk memastikan password itu ada dan bukan string kosong
  if (this.isModified("password") && this.password) {
    // <-- PERBAIKAN DI SINI
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
