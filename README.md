# Sinyal — Chat App (100% Vercel)

Chat app dengan login, register, dan cari orang lewat username.
Tidak ada server database yang perlu kamu kelola sendiri — semua penyimpanan
pakai **Vercel KV** (Redis serverless bawaan Vercel), dan backend-nya pakai
**Vercel Serverless Functions**. Frontend-nya HTML/CSS/JS murni tanpa framework.

## Struktur folder

```
vercel-chat/
├── public/
│   └── index.html      -> seluruh UI (login, register, cari user, chat)
├── api/
│   ├── register.js      -> daftar akun baru
│   ├── login.js          -> login
│   ├── me.js             -> cek sesi masih aktif
│   ├── search.js         -> cari username
│   ├── conversations.js  -> daftar kontak yang pernah chat
│   └── messages.js       -> kirim & ambil pesan
├── lib/
│   └── auth.js
├── package.json
└── README.md
```

## Cara deploy

### 1. Push ke GitHub
Upload folder ini ke repo GitHub baru (bisa lewat web GitHub, drag & drop file,
atau `git init` dari komputer kamu).

### 2. Import ke Vercel
1. Buka https://vercel.com/new
2. Pilih repo GitHub yang tadi dibuat
3. Framework preset biarkan **Other** — Vercel otomatis mengenali `public/`
   sebagai static folder dan `api/*.js` sebagai serverless functions.
4. Klik **Deploy** (nanti akan error dulu karena KV belum disambung, tidak apa-apa).

### 3. Tambahkan Vercel KV
1. Di dashboard project kamu di Vercel → tab **Storage**
2. Klik **Create Database** → pilih **KV** (Redis)
3. Setelah dibuat, klik **Connect Project** dan hubungkan ke project chat ini
   — Vercel otomatis menambahkan environment variable `KV_REST_API_URL` dan
   `KV_REST_API_TOKEN` (dan variannya) ke project kamu.

### 4. Redeploy
Kembali ke tab **Deployments** → klik titik tiga pada deployment terakhir →
**Redeploy**. Setelah selesai, app sudah bisa diakses lewat domain `*.vercel.app`
yang diberikan Vercel.

## Cara pakai
1. Buka domain Vercel kamu → klik **Daftar**, buat username + password
2. Ketik username teman di kolom pencarian sidebar → klik hasilnya
3. Mulai chat. Pesan otomatis refresh tiap ~2.5 detik (polling, bukan websocket,
   supaya tetap 100% jalan di serverless Vercel tanpa server tambahan)

## Catatan teknis
- Password disimpan sebagai hash (bcrypt), bukan plain text
- Sesi login pakai token acak yang disimpan di Vercel KV dengan masa berlaku 7 hari
- Pencarian username pakai substring match sederhana (cocok untuk skala kecil–menengah).
  Kalau user sudah ribuan, pertimbangkan indexing yang lebih canggih (misal Redis sorted set + prefix search)
- Karena pakai polling, ada jeda beberapa detik sebelum pesan baru muncul —
  bukan real-time murni. Kalau butuh real-time instan, opsinya nambah Pusher/Ably
  (masih bisa gratis & tetap jalan di atas Vercel functions), tapi itu di luar
  "tanpa layanan tambahan" yang diminta.
