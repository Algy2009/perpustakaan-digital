"use server";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import { setSession, clearSession, requireRole, getSession } from "@/lib/auth";
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { prosesPinjam, prosesKembali, logAktivitas } from "@/lib/services";

const s = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const go = (path: string, msg: string, ok = false): never =>
  redirect(`${path}${path.includes("?") ? "&" : "?"}${ok ? "ok" : "err"}=${encodeURIComponent(msg)}`);

/** Validasi login Admin/Siswa; sukses -> dashboard, gagal -> kembali ke form login. */
export async function login(f: FormData) {
  const role = s(f, "role") === "admin" ? "admin" : "siswa";
  const u = s(f, "username");
  const r = (await query(`SELECT * FROM ${role === "admin" ? "admin" : "anggota"} WHERE username=?`, [u]))[0];
  if (!r || !(await bcrypt.compare(String(f.get("password") ?? ""), r.password))) go(`/?role=${role}`, "Username atau password salah");
  await setSession({ id: r.id, role, nama: r.nama });
  await logAktivitas(`LOGIN ${role} ${u}`);
  redirect(`/${role}`);
}
export async function logout() { await clearSession(); redirect("/"); }

/** Registrasi anggota baru (siswa). */
export async function daftar(f: FormData) {
  const [nis, nama, kelas, username] = ["nis", "nama", "kelas", "username"].map((k) => s(f, k));
  const pw = String(f.get("password") ?? "");
  if (!nis || !nama || !kelas || username.length < 4 || pw.length < 6) go("/daftar", "Semua field wajib; username min 4, password min 6 karakter");
  try { await query("INSERT INTO anggota(nis,nama,kelas,username,password) VALUES (?,?,?,?,?)", [nis, nama, kelas, username, await bcrypt.hash(pw, 10)]); }
  catch { go("/daftar", "NIS atau username sudah terdaftar"); }
  go("/?role=siswa", "Pendaftaran berhasil, silakan login", true);
}

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const EXT: Record<string, string> = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };
/** Validasi (tipe JPG/PNG/WEBP, maks 2 MB) lalu simpan file cover ke folder uploads/. @returns {nama} atau {error} */
async function simpanCover(file: FormDataEntryValue | null): Promise<{ nama?: string; error?: string }> {
  if (!(file instanceof File) || file.size === 0) return {};
  const ext = EXT[file.type];
  if (!ext) return { error: "Cover harus berformat JPG, PNG, atau WEBP" };
  if (file.size > 2 * 1024 * 1024) return { error: "Ukuran cover maksimal 2 MB" };
  await mkdir(UPLOAD_DIR, { recursive: true });
  const nama = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  await writeFile(path.join(UPLOAD_DIR, nama), Buffer.from(await file.arrayBuffer()));
  return { nama };
}
const hapusFile = (n?: string | null) => (n ? unlink(path.join(UPLOAD_DIR, path.basename(n))).catch(() => {}) : Promise.resolve());

/** CRUD Buku (admin): tambah bila id kosong, ubah bila ada; mendukung upload cover. */
export async function simpanBuku(f: FormData) {
  await requireRole("admin");
  const id = s(f, "id");
  const v = [s(f, "kode"), s(f, "judul"), s(f, "pengarang") || "-", s(f, "kategori") || "Umum", Math.max(0, parseInt(s(f, "stok")) || 0)];
  if (!v[0] || !v[1]) go("/admin/buku", "Kode dan judul wajib diisi");
  const c = await simpanCover(f.get("cover"));
  if (c.error) go("/admin/buku", c.error);
  try {
    if (id) {
      const lama = (await query("SELECT cover FROM buku WHERE id=?", [id]))[0]?.cover;
      await query("UPDATE buku SET kode=?,judul=?,pengarang=?,kategori=?,stok=?,cover=COALESCE(?,cover) WHERE id=?", [...v, c.nama ?? null, id]);
      if (c.nama) await hapusFile(lama);
    } else await query("INSERT INTO buku(kode,judul,pengarang,kategori,stok,cover) VALUES (?,?,?,?,?,?)", [...v, c.nama ?? null]);
  } catch { await hapusFile(c.nama); go("/admin/buku", "Kode buku sudah dipakai"); }
  go("/admin/buku", "Data buku disimpan", true);
}
export async function hapusBuku(f: FormData) {
  await requireRole("admin");
  const lama = (await query("SELECT cover FROM buku WHERE id=?", [s(f, "id")]))[0]?.cover;
  try { await query("DELETE FROM buku WHERE id=?", [s(f, "id")]); } catch { go("/admin/buku", "Buku masih memiliki riwayat transaksi"); }
  await hapusFile(lama);
  go("/admin/buku", "Buku dihapus", true);
}
/** CRUD Anggota (admin); password kosong saat edit = tidak diubah. */
export async function simpanAnggota(f: FormData) {
  await requireRole("admin");
  const id = s(f, "id"), pw = String(f.get("password") ?? "");
  const v = [s(f, "nis"), s(f, "nama"), s(f, "kelas"), s(f, "username")];
  if (v.some((x) => !x) || (!id && pw.length < 6)) go("/admin/anggota", "Data wajib diisi (password min 6 karakter untuk anggota baru)");
  try {
    if (id) {
      await query("UPDATE anggota SET nis=?,nama=?,kelas=?,username=? WHERE id=?", [...v, id]);
      if (pw) await query("UPDATE anggota SET password=? WHERE id=?", [await bcrypt.hash(pw, 10), id]);
    } else await query("INSERT INTO anggota(nis,nama,kelas,username,password) VALUES (?,?,?,?,?)", [...v, await bcrypt.hash(pw, 10)]);
  } catch { go("/admin/anggota", "NIS atau username sudah dipakai"); }
  go("/admin/anggota", "Data anggota disimpan", true);
}
export async function hapusAnggota(f: FormData) {
  await requireRole("admin");
  try { await query("DELETE FROM anggota WHERE id=?", [s(f, "id")]); } catch { go("/admin/anggota", "Anggota masih memiliki riwayat transaksi"); }
  go("/admin/anggota", "Anggota dihapus", true);
}
/** Siswa meminjam buku. */
export async function pinjamBuku(f: FormData) {
  const u = await requireRole("siswa");
  const h = await prosesPinjam(u.id, Number(s(f, "buku_id")));
  go("/siswa/pinjam", h.pesan, h.ok);
}
/** Pengembalian: siswa hanya miliknya sendiri, admin semua. */
export async function kembalikanBuku(f: FormData) {
  const u = await getSession();
  if (!u) redirect("/");
  const h = await prosesKembali(Number(s(f, "id")), u.role === "siswa" ? u.id : undefined);
  go(u.role === "admin" ? "/admin/transaksi" : "/siswa/kembali", h.pesan, h.ok);
}
/** Admin membuat peminjaman untuk anggota. */
export async function adminPinjam(f: FormData) {
  await requireRole("admin");
  const h = await prosesPinjam(Number(s(f, "anggota_id")), Number(s(f, "buku_id")));
  go("/admin/transaksi", h.pesan, h.ok);
}
/** Admin menghapus riwayat transaksi yang sudah dikembalikan. */
export async function hapusTransaksi(f: FormData) {
  await requireRole("admin");
  const r: any = await query("DELETE FROM transaksi WHERE id=? AND status='Dikembalikan'", [s(f, "id")]);
  go("/admin/transaksi", r.affectedRows ? "Riwayat dihapus" : "Hanya transaksi berstatus Dikembalikan yang dapat dihapus", !!r.affectedRows);
}
