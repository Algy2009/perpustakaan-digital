import { appendFile } from "fs/promises";
import path from "path";
import { pool, query } from "./db";
export type Hasil = { ok: boolean; pesan: string };
const MAKS_PINJAM = 3, LAMA_HARI = 7;

/** Mencatat aktivitas ke logs/aktivitas.log (akses file). */
export async function logAktivitas(teks: string): Promise<void> {
  const baris = `[${new Date().toISOString()}] ${teks}\n`;
  await appendFile(path.join(process.cwd(), "logs", "aktivitas.log"), baris).catch(() => {});
}
/**
 * Memproses peminjaman dalam satu transaksi DB (stok dikurangi atomik).
 * @param anggotaId id anggota @param bukuId id buku
 * @returns {ok, pesan}
 */
export async function prosesPinjam(anggotaId: number, bukuId: number): Promise<Hasil> {
  const c = await pool.getConnection();
  try {
    await c.beginTransaction();
    const [aktif]: any = await c.execute("SELECT buku_id FROM transaksi WHERE anggota_id=? AND status='Dipinjam'", [anggotaId]);
    const ids: number[] = aktif.map((r: any) => r.buku_id); // array buku aktif
    if (ids.length >= MAKS_PINJAM) { await c.rollback(); return { ok: false, pesan: `Maksimal ${MAKS_PINJAM} buku sedang dipinjam` }; }
    if (ids.includes(bukuId)) { await c.rollback(); return { ok: false, pesan: "Buku ini sedang dipinjam anggota tersebut" }; }
    const [u]: any = await c.execute("UPDATE buku SET stok=stok-1 WHERE id=? AND stok>0", [bukuId]);
    if (u.affectedRows === 0) { await c.rollback(); return { ok: false, pesan: "Stok buku habis" }; }
    await c.execute("INSERT INTO transaksi(anggota_id,buku_id,tgl_pinjam,tgl_batas) VALUES (?,?,CURDATE(),DATE_ADD(CURDATE(),INTERVAL ? DAY))", [anggotaId, bukuId, LAMA_HARI]);
    await c.commit();
    await logAktivitas(`PINJAM anggota=${anggotaId} buku=${bukuId}`);
    return { ok: true, pesan: `Peminjaman berhasil, batas kembali ${LAMA_HARI} hari` };
  } catch (e) { await c.rollback(); return { ok: false, pesan: "Terjadi kesalahan database" }; }
  finally { c.release(); }
}
/**
 * Memproses pengembalian dan menambah stok.
 * @param transaksiId id transaksi @param anggotaId (opsional) batasi hanya milik anggota ini
 */
export async function prosesKembali(transaksiId: number, anggotaId?: number): Promise<Hasil> {
  const c = await pool.getConnection();
  try {
    await c.beginTransaction();
    const [t]: any = await c.execute("SELECT buku_id FROM transaksi WHERE id=? AND status='Dipinjam'" + (anggotaId ? " AND anggota_id=?" : "") + " FOR UPDATE", anggotaId ? [transaksiId, anggotaId] : [transaksiId]);
    if (!t.length) { await c.rollback(); return { ok: false, pesan: "Transaksi tidak ditemukan / sudah dikembalikan" }; }
    await c.execute("UPDATE transaksi SET status='Dikembalikan', tgl_kembali=CURDATE() WHERE id=?", [transaksiId]);
    await c.execute("UPDATE buku SET stok=stok+1 WHERE id=?", [t[0].buku_id]);
    await c.commit();
    await logAktivitas(`KEMBALI transaksi=${transaksiId}`);
    return { ok: true, pesan: "Buku berhasil dikembalikan" };
  } catch (e) { await c.rollback(); return { ok: false, pesan: "Terjadi kesalahan database" }; }
  finally { c.release(); }
}
/** Mengambil transaksi + nama anggota/judul, dengan filter teks & status (dipakai halaman & ekspor CSV). */
export async function ambilTransaksi(q = "", status = ""): Promise<any[]> {
  let sql = `SELECT t.id,a.nama,a.kelas,b.judul,t.tgl_pinjam,t.tgl_batas,t.tgl_kembali,t.status
    FROM transaksi t JOIN anggota a ON a.id=t.anggota_id JOIN buku b ON b.id=t.buku_id WHERE (a.nama LIKE ? OR b.judul LIKE ?)`;
  const p: any[] = [`%${q}%`, `%${q}%`];
  if (status) { sql += " AND t.status=?"; p.push(status); }
  return query(sql + " ORDER BY t.id DESC", p);
}

const DENDA_PER_HARI = 1000;
/**
 * Menghitung keterlambatan & denda (Rp1.000/hari).
 * @param batas tanggal batas (YYYY-MM-DD) @param kembali tanggal kembali, kosong = hari ini
 * @returns {hari, denda}
 */
export function hitungDenda(batas: string, kembali?: string | null): { hari: number; denda: number } {
  const akhir = new Date(kembali ?? new Date().toISOString().slice(0, 10)).getTime();
  const hari = Math.max(0, Math.round((akhir - new Date(batas).getTime()) / 86400000));
  return { hari, denda: hari * DENDA_PER_HARI };
}
/** Format angka ke Rupiah. */
export const rupiah = (n: number): string => "Rp" + n.toLocaleString("id-ID");
