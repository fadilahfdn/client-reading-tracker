# Reading Tracker - Frontend

Aplikasi web pelacak aktivitas membaca pribadi yang membantu pengguna mencatat daftar buku, memantau progres halaman secara berkala, serta menulis ulasan dan rating untuk buku yang telah selesai dibaca.

> [!NOTE]
> **Status Proyek: Dalam Pengembangan Aktif (*Work in Progress*)**  
> Proyek ini masih terus dikembangkan secara bertahap. Struktur kode, tampilan antarmuka, maupun fungsionalitas dapat mengalami penyesuaian, perbaikan, atau penambahan fitur baru di masa mendatang.

- **Live Demo:** [client-reading-tracker.vercel.app](https://client-reading-tracker.vercel.app)
- **Backend API:** [reading-tracker-api-8jpa.onrender.com](https://reading-tracker-api-8jpa.onrender.com)

---

## Fitur Utama

- **Sistem Autentikasi Lengkap:**
  - Registrasi dan login menggunakan username serta password.
  - Masuk dan daftar instan menggunakan **Google OAuth 2.0**.
  - Alur **Forgot Password** & **Reset Password** mandiri melalui tautan verifikasi email.
- **Manajemen & Pelacakan Buku:**
  - Pencarian buku secara langsung melalui **Open Book API** untuk memudahkan pengambilan data buku (judul, penulis, dan sampul) secara otomatis.
  - Mengelompokkan koleksi buku berdasarkan status (*Unread*, *Reading*, dan *Completed*).
  - Pembaruan progres halaman membaca (`startPage`, `currentPage`, `endPage`) lengkap dengan pencatatan waktu mulai dan selesai.
  - Penyimpanan sampul buku (*cover URL*), rating, serta ulasan pribadi.
- **Antarmuka Adaptif (Light & Dark Mode):**
  - Palet warna netral hangat (*warm neutral*) dengan dukungan pergantian tema terang dan gelap yang tersimpan otomatis di `localStorage`.
  - Tata letak responsif untuk tampilan desktop maupun perangkat seluler.

---

## Teknologi yang Digunakan

- **Framework & Build Tool:** React, Vite
- **Routing:** React Router DOM
- **HTTP Client:** Axios
- **Autentikasi:** `@react-oauth/google`
- **Styling:** Vanilla CSS dengan CSS Custom Properties (Variables)
- **Deployment:** Vercel (dilengkapi konfigurasi SPA *rewrite* via `vercel.json`)

---

## Struktur Proyek

```text
├── public/
├── src/
│   ├── components/
│   │   ├── Auth.css             # Gaya terpadu untuk halaman autentikasi
│   │   ├── Dashboard.css        # Gaya halaman utama dashboard
│   │   ├── Dashboard.jsx        # Manajemen koleksi dan progres buku
│   │   ├── ForgotPassword.jsx   # Formulir permintaan tautan reset password
│   │   ├── Login.jsx            # Halaman masuk (Manual & Google OAuth)
│   │   ├── Register.jsx         # Halaman pendaftaran (Manual & Google OAuth)
│   │   └── ResetPassword.jsx    # Halaman pembuatan password baru via token
│   ├── App.jsx                  # Konfigurasi rute & GoogleOAuthProvider
│   ├── index.css                # Definisi tema warna global (Light & Dark)
│   └── main.jsx                 # Entry point aplikasi React
├── index.html
├── package.json
└── vercel.json                  # Aturan rewrite SPA untuk Vercel
```

---

## Menjalankan Proyek di Lokal

1. **Clone repositori ini:**
   ```bash
   git clone https://github.com/fadilahfdn/client-reading-tracker
   cd client-reading-tracker
   ```

2. **Instal dependensi:**
   ```bash
   npm install
   ```

3. **Konfigurasi variabel lingkungan:**
   Buat file `.env` di folder akar proyek dan isi variabel berikut:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
   ```

4. **Jalankan server pengembangan:**
   ```bash
   npm run dev
   ```
   Buka `http://localhost:5173` pada browser Anda.