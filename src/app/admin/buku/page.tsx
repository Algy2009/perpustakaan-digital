import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { query } from "@/lib/db";
import { simpanBuku, hapusBuku } from "../../actions";
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
  btnSecondarySm,
  inp,
} from "@/components/ui";
import { IconBook, IconEdit, IconPlus, IconSearch, IconTrash } from "@/components/icons";

export default async function Buku({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const u = await requireRole("admin");
  const { q = "", edit, ok, err } = await searchParams;
  const rows = await query(
    "SELECT * FROM buku WHERE judul LIKE ? OR pengarang LIKE ? OR kategori LIKE ? OR kode LIKE ? ORDER BY judul",
    Array(4).fill(`%${q}%`)
  );
  const e = edit ? (await query("SELECT * FROM buku WHERE id=?", [edit]))[0] : null;

  return (
    <AppLayout nama={u.nama} role="admin">
      <PageHeader
        title="Kelola Data Buku"
        description="Tambah koleksi baru, perbarui informasi, atur stok, dan unggah sampul buku."
        actions={<Badge variant="blue">{rows.length} Judul Ditampilkan</Badge>}
      />

      <Msg ok={ok} err={err} />

      {/* Form Card */}
      <Card className="p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/15 text-brand-600 dark:text-brand-400">
              {e ? <IconEdit className="w-4 h-4" /> : <IconPlus className="w-4 h-4" />}
            </span>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                {e ? `Ubah Buku: ${e.judul}` : "Tambah Buku Baru"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {e ? "Perbarui informasi buku lalu simpan perubahan." : "Isi detail buku untuk ditambahkan ke katalog."}
              </p>
            </div>
          </div>
          {e && (
            <Link href="/admin/buku" className={btnSecondarySm}>
              Batal Ubah
            </Link>
          )}
        </div>

        <form action={simpanBuku} key={e?.id ?? "new"} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <input type="hidden" name="id" defaultValue={e?.id} />

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Kode Buku *
            </label>
            <input name="kode" placeholder="Mis. B006" defaultValue={e?.kode} required className={inp} />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Judul Buku *
            </label>
            <input name="judul" placeholder="Judul lengkap buku" defaultValue={e?.judul} required className={inp} />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Pengarang
            </label>
            <input name="pengarang" placeholder="Nama pengarang" defaultValue={e?.pengarang} className={inp} />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Kategori
            </label>
            <input name="kategori" placeholder="Teknologi, Novel..." defaultValue={e?.kategori} className={inp} />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Stok
            </label>
            <input name="stok" type="number" min="0" placeholder="1" defaultValue={e?.stok ?? 1} className={inp} />
          </div>

          <div className="sm:col-span-2 lg:col-span-4">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Cover Buku (JPG, PNG, WEBP · maks 2 MB)
            </label>
            <div className="flex items-center gap-3">
              {e?.cover && (
                <img
                  src={`/cover/${e.cover}`}
                  alt=""
                  className="h-11 w-8 object-cover rounded-lg ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                />
              )}
              <input
                name="cover"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="block w-full text-xs text-slate-600 dark:text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 dark:file:bg-brand-500/15 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-brand-700 dark:file:text-brand-300 hover:file:bg-brand-100 dark:hover:file:bg-brand-500/25 transition-colors cursor-pointer"
              />
            </div>
          </div>

          <div className="sm:col-span-2 lg:col-span-2 flex items-end justify-end">
            <button type="submit" className={`${btn} w-full sm:w-auto`}>
              {e ? "Simpan Perubahan" : "Tambah Buku"}
            </button>
          </div>
        </form>
      </Card>

      {/* Search & Data Table Card */}
      <Card className="overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
          <form className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <IconSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Cari kode, judul, pengarang, atau kategori..."
                className={`${inp} pl-10`}
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className={btn}>
                Cari
              </button>
              {q && (
                <Link href="/admin/buku" className={btnSecondary}>
                  Reset
                </Link>
              )}
            </div>
          </form>
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon={<IconBook className="w-6 h-6" />}
            title="Tidak ada buku ditemukan"
            description={
              q
                ? `Tidak ada hasil yang cocok untuk pencarian "${q}".`
                : "Mulai tambahkan buku pertama menggunakan formulir di atas."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">Buku</th>
                  <th className="px-5 py-3.5">Kode</th>
                  <th className="px-5 py-3.5">Pengarang</th>
                  <th className="px-5 py-3.5">Kategori</th>
                  <th className="px-5 py-3.5">Stok</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {rows.map((b: any) => (
                  <tr
                    key={b.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3.5">
                        {b.cover ? (
                          <img
                            src={`/cover/${b.cover}`}
                            alt={b.judul}
                            className="h-14 w-10 object-cover rounded-lg ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                          />
                        ) : (
                          <div className="flex h-14 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/10 text-brand-500 dark:text-brand-400 ring-1 ring-brand-600/10">
                            <IconBook className="w-4 h-4" />
                          </div>
                        )}
                        <div className="font-semibold text-slate-900 dark:text-white leading-snug">
                          {b.judul}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="font-mono text-xs font-semibold px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {b.kode}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{b.pengarang}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant="neutral">{b.kategori}</Badge>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {b.stok === 0 ? (
                        <Badge variant="rose">Habis (0)</Badge>
                      ) : b.stok <= 2 ? (
                        <Badge variant="amber">Tersisa {b.stok}</Badge>
                      ) : (
                        <Badge variant="emerald">{b.stok} tersedia</Badge>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <a href={`?edit=${b.id}`} className={btnSecondarySm}>
                          <IconEdit className="w-3.5 h-3.5" />
                          <span>Ubah</span>
                        </a>
                        <form action={hapusBuku}>
                          <input type="hidden" name="id" value={b.id} />
                          <button type="submit" className={btnRed}>
                            <IconTrash className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AppLayout>
  );
}
