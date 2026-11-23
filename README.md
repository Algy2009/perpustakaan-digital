# Perpustakaan Sekolah Digital

Sistem Informasi Manajemen Perpustakaan Sekolah Digital modern berbasis Next.js App Router, Tailwind CSS, TypeScript, dan MySQL.

## Fitur Utama
- **Modern SaaS UI/UX**: Antarmuka bersih, responsif, dan elegan.
- **Dark Mode & Light Mode**: Switcher tema tersimpan di `localStorage` tanpa flash.
- **Dashboard Admin**: Kartu statistik, diagram distribusi koleksi per kategori, rasio sirkulasi, dan log aktivitas transaksi terbaru.
- **Kelola Buku & Sampul**: CRUD buku lengkap dengan filter pencarian dan upload cover (JPG/PNG/WEBP).
- **Sirkulasi & Denda**: Peminjaman dan pengembalian dengan validasi stok & batas waktu 7 hari, denda otomatis Rp1.000/hari, serta ekspor laporan ke CSV.
- **Kelola Anggota**: Manajemen data siswa dan kredensial login.
- **Portal Siswa**: Pencarian katalog buku, kartu status peminjaman, dan riwayat sirkulasi.

## Cara Menjalankan
1. Pastikan server MySQL berjalan (mis. Laragon / XAMPP).
2. Impor database dari file `database/perpustakaan.sql`.
3. Sesuaikan konfigurasi database pada `.env.local`.
4. Install dependensi dan jalankan server pengembang:
   ```bash
   npm install
   npm run dev
   ```
5. Buka [http://localhost:3000](http://localhost:3000) di browser.

## Kredensial Uji Coba Default
- **Admin**: `admin` / `admin123`
- **Siswa**: `andi` / `siswa123` (atau `siti`, `budi`)

Dokumentasi teknis & skenario pengujian lengkap tersedia di `docs/DOKUMENTASI.md`.
