CREATE DATABASE IF NOT EXISTS perpustakaan CHARACTER SET utf8mb4;
USE perpustakaan;
DROP TABLE IF EXISTS transaksi, buku, anggota, admin;
CREATE TABLE admin(id INT AUTO_INCREMENT PRIMARY KEY, nama VARCHAR(100) NOT NULL, username VARCHAR(50) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL);
CREATE TABLE anggota(id INT AUTO_INCREMENT PRIMARY KEY, nis VARCHAR(20) NOT NULL UNIQUE, nama VARCHAR(100) NOT NULL, kelas VARCHAR(20) NOT NULL, username VARCHAR(50) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE buku(id INT AUTO_INCREMENT PRIMARY KEY, kode VARCHAR(20) NOT NULL UNIQUE, judul VARCHAR(150) NOT NULL, pengarang VARCHAR(100) NOT NULL DEFAULT '-', kategori VARCHAR(50) NOT NULL DEFAULT 'Umum', stok INT NOT NULL DEFAULT 0, cover VARCHAR(255) NULL, CHECK (stok>=0), INDEX idx_judul(judul));
CREATE TABLE transaksi(id INT AUTO_INCREMENT PRIMARY KEY, anggota_id INT NOT NULL, buku_id INT NOT NULL, tgl_pinjam DATE NOT NULL, tgl_batas DATE NOT NULL, tgl_kembali DATE NULL, status ENUM('Dipinjam','Dikembalikan') NOT NULL DEFAULT 'Dipinjam',
 FOREIGN KEY (anggota_id) REFERENCES anggota(id) ON DELETE RESTRICT, FOREIGN KEY (buku_id) REFERENCES buku(id) ON DELETE RESTRICT, INDEX idx_status(status));
INSERT INTO admin(nama,username,password) VALUES ('Admin Perpustakaan','admin','$2b$10$bZci3anqc5d1NhJtIO8jUuYZbAPjMsGFLJ62pZukaNPssg57dxaYu');
INSERT INTO anggota(nis,nama,kelas,username,password) VALUES
('1001','Andi Pratama','XII RPL 1','andi','$2b$10$r3jn29xCw7rCge83B8nQsOTW0f1DPkmAHBxF/1V1NljPq5YeOHDMS'),('1002','Siti Aisyah','XII RPL 1','siti','$2b$10$r3jn29xCw7rCge83B8nQsOTW0f1DPkmAHBxF/1V1NljPq5YeOHDMS'),('1003','Budi Santoso','XI RPL 2','budi','$2b$10$r3jn29xCw7rCge83B8nQsOTW0f1DPkmAHBxF/1V1NljPq5YeOHDMS');
INSERT INTO buku(kode,judul,pengarang,kategori,stok) VALUES
('B001','Pemrograman Web dengan PHP','Rudi Hartono','Teknologi',5),('B002','Basis Data MySQL','Dewi Lestari','Teknologi',3),
('B003','Laskar Pelangi','Andrea Hirata','Novel',4),('B004','Matematika Kelas XII','Tim Kemdikbud','Pelajaran',6),('B005','Bumi Manusia','Pramoedya A. Toer','Novel',1);
INSERT INTO transaksi(anggota_id,buku_id,tgl_pinjam,tgl_batas,tgl_kembali,status) VALUES
(1,1,CURDATE()-INTERVAL 10 DAY,CURDATE()-INTERVAL 3 DAY,NULL,'Dipinjam'),(2,3,CURDATE()-INTERVAL 20 DAY,CURDATE()-INTERVAL 13 DAY,CURDATE()-INTERVAL 14 DAY,'Dikembalikan');
UPDATE buku SET stok=stok-1 WHERE id=1;
