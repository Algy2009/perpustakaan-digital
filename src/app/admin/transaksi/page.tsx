import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { query } from "@/lib/db";
import { ambilTransaksi, hitungDenda, rupiah } from "@/lib/services";
import { adminPinjam, kembalikanBuku, hapusTransaksi } from "../../actions";
import {
  AppLayout,
  Badge,
  Card,
  EmptyState,
  Msg,
  PageHeader,
  btn,
  btnRed,
  btnSecondary,
  btnSm,
  inp,
} from "@/components/ui";
import { IconDownload, IconPlus, IconReturn, IconSearch, IconTransactions, IconTrash } from "@/components/icons";

export default async function Transaksi({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const u = await requireRole("admin");
  const { q = "", status = "", ok, err } = await searchParams;
  const [rows, anggota, buku] = await Promise.all([
    ambilTransaksi(q, status),
    query("SELECT id,nama,kelas FROM anggota ORDER BY nama"),
    query("SELECT id,judul,stok FROM buku WHERE stok>0 ORDER BY judul"),
  ]);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <AppLayout nama={u.nama} role="admin">
      <PageHeader
        title="Transaksi Peminjaman & Pengembalian"
        description="Catat peminjaman buku untuk anggota, proses pengembalian, pantau denda, dan ekspor laporan."
        actions={
          <a
            href={`/admin/transaksi/export?q=${encodeURIComponent(q)}&status=${encodeURIComponent(status)}`}
            className={btnSecondary}
          >
            <IconDownload className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </a>
        }
      />

      <Msg ok={ok} err={err} />

      {/* Create New Loan Card */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/15 text-brand-600 dark:text-brand-400">
            <IconPlus className="w-4 h-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Buat Peminjaman Baru
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Batas peminjaman otomatis 7 hari · Maksimal 3 buku aktif per anggota.
            </p>
          </div>
        </div>

        <form action={adminPinjam} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-5">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Pilih Anggota
            </label>
            <select name="anggota_id" className={inp} required>
              {anggota.map((a: any) => (
                <option key={a.id} value={a.id}>
                  {a.nama} ({a.kelas})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-5">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Pilih Buku Tersedia
            </label>
            <select name="buku_id" className={inp} required>
              {buku.map((b: any) => (
                <option key={b.id} value={b.id}>
                  {b.judul} (stok {b.stok})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <button type="submit" className={`${btn} w-full`}>
              Proses Pinjam
            </button>
          </div>
        </form>
      </Card>

      {/* Filter & Table Card */}
      <Card className="overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
          <form className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <IconSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Cari nama anggota atau judul buku..."
                className={`${inp} pl-10`}
              />
            </div>
            <select name="status" defaultValue={status} className={`${inp} sm:w-44`}>
              <option value="">Semua status</option>
              <option value="Dipinjam">Dipinjam</option>
              <option value="Dikembalikan">Dikembalikan</option>
            </select>
            <div className="flex gap-2">
              <button type="submit" className={btn}>
                Filter
              </button>
              {(q || status) && (
                <Link href="/admin/transaksi" className={btnSecondary}>
                  Reset
                </Link>
              )}
            </div>
          </form>
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon={<IconTransactions className="w-6 h-6" />}
            title="Belum ada data transaksi"
            description="Tidak ada transaksi yang sesuai dengan filter pencarian saat ini."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">Anggota</th>
                  <th className="px-5 py-3.5">Buku</th>
                  <th className="px-5 py-3.5">Pinjam</th>
                  <th className="px-5 py-3.5">Batas</th>
                  <th className="px-5 py-3.5">Kembali</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Denda</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {rows.map((t: any) => {
                  const terlambat = t.status === "Dipinjam" && t.tgl_batas < today;
                  const { hari, denda } = hitungDenda(t.tgl_batas, t.tgl_kembali);
                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900 dark:text-white">{t.nama}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{t.kelas}</div>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-700 dark:text-slate-200">
                        {t.judul}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {t.tgl_pinjam}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div
                          className={
                            terlambat
                              ? "font-semibold text-rose-600 dark:text-rose-400"
                              : "text-slate-600 dark:text-slate-400"
                          }
                        >
                          {t.tgl_batas}
                        </div>
                        {terlambat && (
                          <div className="text-[11px] font-medium text-rose-500 dark:text-rose-400">
                            Terlambat {hari} hari
                          </div>
                        )}
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
                      <td className="px-5 py-3.5 font-semibold whitespace-nowrap">
                        <span className={denda > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-500 dark:text-slate-400 font-normal"}>
                          {rupiah(denda)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        {t.status === "Dipinjam" ? (
                          <form action={kembalikanBuku}>
                            <input type="hidden" name="id" value={t.id} />
                            <button type="submit" className={btnSm}>
                              <IconReturn className="w-3.5 h-3.5" />
                              <span>Kembalikan</span>
                            </button>
                          </form>
                        ) : (
                          <form action={hapusTransaksi}>
                            <input type="hidden" name="id" value={t.id} />
                            <button type="submit" className={btnRed}>
                              <IconTrash className="w-3.5 h-3.5" />
                              <span>Hapus</span>
                            </button>
                          </form>
                        )}
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
