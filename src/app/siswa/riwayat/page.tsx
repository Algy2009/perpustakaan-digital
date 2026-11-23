import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { query } from "@/lib/db";
import { hitungDenda, rupiah } from "@/lib/services";
import {
  AppLayout,
  Badge,
  Card,
  EmptyState,
  PageHeader,
  StatCard,
  btn,
} from "@/components/ui";
import { IconAlert, IconBook, IconCheck, IconHistory } from "@/components/icons";

export default async function Riwayat() {
  const u = await requireRole("siswa");
  const rows = await query(
    "SELECT b.judul, b.pengarang, t.tgl_pinjam, t.tgl_batas, t.tgl_kembali, t.status FROM transaksi t JOIN buku b ON b.id=t.buku_id WHERE t.anggota_id=? ORDER BY t.id DESC",
    [u.id]
  );

  const today = new Date().toISOString().slice(0, 10);
  const totalDenda = rows.reduce(
    (n: number, t: any) => n + hitungDenda(t.tgl_batas, t.tgl_kembali).denda,
    0
  );
  const totalSelesai = rows.filter((t: any) => t.status === "Dikembalikan").length;

  return (
    <AppLayout nama={u.nama} role="siswa">
      <PageHeader
        title="Riwayat Peminjaman"
        description="Catatan lengkap seluruh buku yang pernah kamu pinjam beserta status dan denda keterlambatan (Rp1.000/hari)."
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Total Transaksi"
          value={rows.length}
          sublabel="Seluruh peminjaman tercatat"
          icon={<IconHistory className="w-5 h-5" />}
          tone="blue"
        />
        <StatCard
          label="Sudah Dikembalikan"
          value={totalSelesai}
          sublabel="Transaksi selesai"
          icon={<IconCheck className="w-5 h-5" />}
          tone="emerald"
        />
        <StatCard
          label="Total Denda"
          value={rupiah(totalDenda)}
          sublabel="Termasuk denda berjalan"
          icon={<IconAlert className="w-5 h-5" />}
          tone={totalDenda > 0 ? "rose" : "emerald"}
        />
      </div>

      {/* History Table */}
      <Card className="overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState
            icon={<IconHistory className="w-6 h-6" />}
            title="Belum ada riwayat peminjaman"
            description="Setelah kamu meminjam buku, seluruh riwayat transaksi akan muncul di sini."
            action={
              <Link href="/siswa/pinjam" className={btn}>
                <IconBook className="w-4 h-4" />
                <span>Mulai Pinjam Buku</span>
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">Judul Buku</th>
                  <th className="px-5 py-3.5">Pinjam</th>
                  <th className="px-5 py-3.5">Batas</th>
                  <th className="px-5 py-3.5">Kembali</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Denda</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {rows.map((t: any, i: number) => {
                  const terlambat = t.status === "Dipinjam" && t.tgl_batas < today;
                  const { denda } = hitungDenda(t.tgl_batas, t.tgl_kembali);
                  return (
                    <tr
                      key={i}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900 dark:text-white">{t.judul}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{t.pengarang}</div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {t.tgl_pinjam}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {t.tgl_batas}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {t.tgl_kembali ?? "—"}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {t.status === "Dikembalikan" ? (
                          <Badge variant="emerald">Dikembalikan</Badge>
                        ) : terlambat ? (
                          <Badge variant="rose">Terlambat</Badge>
                        ) : (
                          <Badge variant="blue">Dipinjam</Badge>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold whitespace-nowrap">
                        <span
                          className={
                            denda > 0
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-slate-500 dark:text-slate-400 font-normal"
                          }
                        >
                          {rupiah(denda)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AppLayout>
  );
}
