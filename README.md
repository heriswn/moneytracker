# 💰 Money Tracker Web App

Aplikasi pencatatan keuangan sederhana (money tracker) berbasis web menggunakan:

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js + Express
- Database: MongoDB Atlas
- Hosting: Render.com

---

## 🚀 Demo Live
[https://moneytracker-yourname.onrender.com](https://moneytracker-yourname.onrender.com)

---

## 🔧 Fitur

- Tambah transaksi (pemasukan/pengeluaran)
- Lihat daftar transaksi
- Simpan data ke MongoDB Atlas

---

## 🛠 Cara Menjalankan di Lokal

### 1. Clone repositori

```bash
git clone https://github.com/heriswn/moneytracker.git
cd moneytracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Buat file `.env`

Buat file `.env` di folder utama:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>.mongodb.net/moneytracker?retryWrites=true&w=majority
```

> Ganti `<username>`, `<password>`, dan `<cluster-url>` sesuai MongoDB Atlas kamu.

### 4. Jalankan server

```bash
node server.js
```

Aplikasi berjalan di:
[http://localhost:3000](http://localhost:3000)

---

## ☁️ Cara Deploy ke Render.com

### 1. Buat akun & login ke [https://render.com](https://render.com)

### 2. Deploy Web Service:

- Klik **"New Web Service"**
- Hubungkan ke repo GitHub `moneytracker`
- Pilih:
  - Build Command: `npm install`
  - Start Command: `node server.js`

### 3. Tambahkan Environment Variable:

- **Key:** `MONGODB_URI`
- **Value:** URI MongoDB kamu dalam format `mongodb+srv://...`

### 4. Klik "Deploy"

---

## 📁 Struktur Folder

```
moneytracker/
│
├── public/             # Frontend (HTML, CSS, JS)
│   ├── index.html
│   └── ...
│
├── models/             # Mongoose Models
│   └── Transaction.js
│
├── .env                # (lokal only) MongoDB URI
├── server.js           # Express server
├── package.json
└── README.md
```

---

## ✍️ Kontribusi

Pull request dan ide baru sangat diterima!

---

## 🔒 License

MIT License
