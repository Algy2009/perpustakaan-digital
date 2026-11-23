import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { query } from "@/lib/db";
import { pinjamBuku } from "../../actions";
import {
  AppLayout,
  Badge,
  Card,
  EmptyState,
  Msg,
  PageHeader,
  btn,
  btnSecondary,
  inp,
} from "@/components/ui";
import { IconBook, IconSearch } from "@/components/icons";

export default async function Pinjam({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const u = await requireRole("siswa");
  const { q = "", kat = "", ada = "", ok, err } = await searchParams;

  let sql = "SELECT * FROM buku WHERE (judul LIKE ? OR pengarang LIKE ?)";
  const p: any[] = [`%${q}%`, `%${q}%`];
  if (kat) {
    sql += " AND kategori=?";
    p.push(kat);
  }
  if (ada) sql += " AND stok>0";

  const [rows, kats] = await Promise.all([
    query(sql + " ORDER BY judul", p),
    query("SELECT DISTINCT kategori FROM buku ORDER BY kategori"),
  ]);

  return (
    <AppLayout nama={u.nama} role="siswa">
      <PageHeader
        title="Peminjaman Buku"
        description="Temukan buku yang ingin kamu baca. Batas peminjaman 7 hari, maksimal 3 buku aktif."
        actions={<Badge variant="blue">{rows.length} Buku Ditemukan</Badge>}
      />

      <Msg ok={ok} err={err} />

      {/* Filter Toolbar */}
      <Card className="p-4 sm:p-5 mb-6">
        <form className="flex flex-col lg:flex-row gap-3 lg:items-center">
          <div className="relative flex-1">
            <IconSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Cari judul buku atau nama pengarang..."
              className={`${inp} pl-10`}
            />
          </div>

          <select name="kat" defaultValue={kat} className={`${inp} lg:w-48`}>
            <option value="">Semua kategori</option>
            {kats.map((k: any) => (
              <option key={k.kategori} value={k.kategori}>
                {k.kategori}
              </option>
            ))}
          </select>

          <label className="inline-flex items-center gap-2.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900/60 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none whitespace-nowrap">
            <input
              type="checkbox"
              name="ada"
              value="1"
              defaultChecked={!!ada}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-600"
            />
            <span>Hanya yang tersedia</span>
          </label>

          <div className="flex gap-2">
            <button type="submit" className={`${btn} flex-1 lg:flex-none`}>
              Cari
            </button>
            {(q || kat || ada) && (
              <Link href="/siswa/pinjam" className={btnSecondary}>
                Reset
              </Link>
            )}
          </div>
        </form>
      </Card>

      {/* Catalog Card Grid */}
      {rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={<IconBook className="w-6 h-6" />}
            title="Buku tidak ditemukan"
            description="Coba ubah kata kunci pencarian atau pilih kategori lain."
            action={
              <Link href="/siswa/pinjam" className={btnSecondary}>
                Tampilkan Semua Buku
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rows.map((b: any) => (
            <Card
              key={b.id}
              className="group overflow-hidden flex flex-col hover:shadow-card-hover hover:border-brand-300 dark:hover:border-brand-700 transition-all duration-200"
            >
              <div className="p-5 flex gap-4 flex-1">
                {/* Cover Thumbnail */}
                {b.cover ? (
                  <img
                    src={`/cover/${b.cover}`}
                    alt={b.judul}
                    className="h-28 w-20 object-cover rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 shrink-0 shadow-xs"
                  />
                ) : (
                  <div className="flex h-28 w-20 shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-950/80 dark:to-brand-900/50 text-brand-600 dark:text-brand-400 ring-1 ring-brand-600/15">
                    <IconBook className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-mono font-semibold opacity-75">{b.kode}</span>
                  </div>
                )}

                {/* Book Info */}
                <div className="min-w-0 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                      <Badge variant="neutral">{b.kategori}</Badge>
                      {b.stok > 0 ? (
                        <Badge variant="emerald">Stok {b.stok}</Badge>
                      ) : (
                        <Badge variant="rose">Habis</Badge>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {b.judul}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
                      {b.pengarang}
                    </p>
                  </div>
                  <div className="mt-2 text-[11px] font-mono text-slate-400 dark:text-slate-500">
                    Kode: {b.kode}
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="px-5 py-3.5 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800">
                {b.stok > 0 ? (
                  <form action={pinjamBuku}>
                    <input type="hidden" name="buku_id" value={b.id} />
                    <button type="submit" className={`${btn} w-full py-2 text-xs`}>
                      Pinjam Buku Ini
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="w-full rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-500 font-medium py-2 text-xs cursor-not-allowed"
                  >
                    Stok Sedang Habis
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
