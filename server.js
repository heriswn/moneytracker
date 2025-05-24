const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

// 🌐 Load environment variables from .env file (for local dev)
require("dotenv").config();

// 🔐 Cek apakah MONGODB_URI tersedia
if (!process.env.MONGODB_URI) {
  console.error("❌ MONGODB_URI tidak ditemukan di environment variable!");
  process.exit(1); // hentikan server
}

// 🔗 Koneksi ke MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
  })
  .then(() => console.log("✅ Terkoneksi ke MongoDB Atlas"))
  .catch((err) => {
    console.error("❌ Gagal konek ke MongoDB:", err);
    process.exit(1);
  });

// 🔧 Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// 📦 Model
const Transaction = require("./models/Transaction");

// 📡 Routes
app.get("/api/transactions", async (req, res) => {
  const transactions = await Transaction.find();
  res.json(transactions);
});

app.post("/api/transactions", async (req, res) => {
  const transaction = new Transaction(req.body);
  await transaction.save();
  res.json(transaction);
});

// 🚀 Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
