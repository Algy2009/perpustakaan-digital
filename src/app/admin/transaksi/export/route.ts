import { getSession } from "@/lib/auth";
import { ambilTransaksi, hitungDenda, logAktivitas } from "@/lib/services";
/** GET: ekspor transaksi (sesuai filter) menjadi file CSV. Hanya admin. */
export async function GET(req: Request) {
  const s = await getSession();
  if (s?.role !== "admin") return new Response("Forbidden", { status: 403 });
  const p = new URL(req.url).searchParams;
  const rows = await ambilTransaksi(p.get("q") ?? "", p.get("status") ?? "");
  const esc = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const head = ["ID", "Anggota", "Kelas", "Buku", "Tgl Pinjam", "Batas", "Tgl Kembali", "Status", "Denda (Rp)"];
  const csv = [head, ...rows.map((r) => [r.id, r.nama, r.kelas, r.judul, r.tgl_pinjam, r.tgl_batas, r.tgl_kembali, r.status, hitungDenda(r.tgl_batas, r.tgl_kembali).denda])].map((r) => r.map(esc).join(",")).join("\n");
  await logAktivitas(`EKSPOR CSV ${rows.length} baris`);
  return new Response("\ufeff" + csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="laporan_transaksi.csv"' } });
}
