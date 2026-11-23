import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { query } from "@/lib/db";
import { kembalikanBuku } from "../../actions";
import { hitungDenda, rupiah } from "@/lib/services";
import {
  AppLayout,
  Badge,
  Card,
  EmptyState,
  Msg,
  PageHeader,
  btn,
  btnSm,
} from "@/components/ui";
import { IconBook, IconReturn } from "@/components/icons";

export default async function Kembali({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const u = await requireRole("siswa");
  const { ok, err } = await searchParams;
  const rows = await query(
    "SELECT t.id, b.judul, b.pengarang, b.cover, t.tgl_pinjam, t.tgl_batas FROM transaksi t JOIN buku b ON b.id=t.buku_id WHERE t.anggota_id=? AND t.status='Dipinjam' ORDER BY t.tgl_batas",
    [u.id]
  );
  const today = new Date().toISOString().slice(0, 10);

  return (
    <AppLayout nama={u.nama} role="siswa">
      <PageHeader
        title="Pengembalian Buku"
        description="Daftar buku yang sedang kamu pinjam. Kembalikan tepat waktu untuk menghindari denda Rp1.000/hari."
        actions={<Badge variant="blue">{rows.length} Buku Aktif</Badge>}
      />

      <Msg ok={ok} err={err} />

      <Card className="overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState
            icon={<IconReturn className="w-6 h-6" />}
            title="Tidak ada buku yang sedang dipinjam"
            description="Kamu belum memiliki pinjaman buku aktif saat ini. Yuk jelajahi katalog untuk meminjam buku!"
            action={
              <Link href="/siswa/pinjam" className={btn}>
                <IconBook className="w-4 h-4" />
                <span>Cari Buku untuk Dipinjam</span>
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">Buku</th>
                  <th className="px-5 py-3.5">Tanggal Pinjam</th>
                  <th className="px-5 py-3.5">Batas Kembali</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Denda</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {rows.map((t: any) => {
                  const terlambat = t.tgl_batas < today;
                  const { hari, denda } = hitungDenda(t.tgl_batas);
                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {t.cover ? (
                            <img
                              src={`/cover/${t.cover}`}
                              alt={t.judul}
                              className="h-12 w-9 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                            />
                          ) : (
                            <div className="flex h-12 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/15 text-brand-600 dark:text-brand-400">
                              <IconBook className="w-4 h-4" />
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {t.judul}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {t.pengarang}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {t.tgl_pinjam}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={
                            terlambat
                              ? "font-semibold text-rose-600 dark:text-rose-400"
                              : "text-slate-700 dark:text-slate-300"
                          }
                        >
                          {t.tgl_batas}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {terlambat ? (
                          <Badge variant="rose">Terlambat {hari} hari</Badge>
                        ) : (
                          <Badge variant="blue">Aktif</Badge>
                        )}
                      </td>
                      <td className="px-5 py-4 font-semibold whitespace-nowrap">
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
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <form action={kembalikanBuku}>
                          <input type="hidden" name="id" value={t.id} />
                          <button type="submit" className={btnSm}>
                            <IconReturn className="w-3.5 h-3.5" />
                            <span>Kembalikan</span>
                          </button>
                        </form>
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
