import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { query } from "@/lib/db";
import { simpanAnggota, hapusAnggota } from "../../actions";
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
import { IconEdit, IconPlus, IconSearch, IconTrash, IconUsers } from "@/components/icons";

function initials(nama: string) {
  return nama
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export default async function Anggota({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const u = await requireRole("admin");
  const { q = "", edit, ok, err } = await searchParams;
  const rows = await query(
    "SELECT id,nis,nama,kelas,username FROM anggota WHERE nama LIKE ? OR nis LIKE ? OR kelas LIKE ? ORDER BY nama",
    Array(3).fill(`%${q}%`)
  );
  const e = edit ? (await query("SELECT id,nis,nama,kelas,username FROM anggota WHERE id=?", [edit]))[0] : null;

  return (
    <AppLayout nama={u.nama} role="admin">
      <PageHeader
        title="Kelola Anggota"
        description="Kelola data anggota siswa, NIS, kelas, dan kredensial akun perpustakaan."
        actions={<Badge variant="blue">{rows.length} Anggota</Badge>}
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
                {e ? `Ubah Anggota: ${e.nama}` : "Tambah Anggota Baru"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {e
                  ? "Kosongkan kolom password jika tidak ingin mengganti password anggota."
                  : "Password minimal 6 karakter untuk anggota baru."}
              </p>
            </div>
          </div>
          {e && (
            <Link href="/admin/anggota" className={btnSecondarySm}>
              Batal Ubah
            </Link>
          )}
        </div>

        <form action={simpanAnggota} key={e?.id ?? "new"} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <input type="hidden" name="id" defaultValue={e?.id} />

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              NIS *
            </label>
            <input name="nis" placeholder="Mis. 1004" defaultValue={e?.nis} required className={inp} />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Nama Lengkap *
            </label>
            <input name="nama" placeholder="Nama lengkap siswa" defaultValue={e?.nama} required className={inp} />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Kelas *
            </label>
            <input name="kelas" placeholder="XII RPL 1" defaultValue={e?.kelas} required className={inp} />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Username *
            </label>
            <input name="username" placeholder="Username login" defaultValue={e?.username} required className={inp} />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Password {e ? "(Opsional)" : "*"}
            </label>
            <input
              name="password"
              type="password"
              placeholder={e ? "Biarkan kosong" : "Min. 6 karakter"}
              className={inp}
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-6 flex justify-end">
            <button type="submit" className={btn}>
              {e ? "Simpan Perubahan" : "Tambah Anggota"}
            </button>
          </div>
        </form>
      </Card>

      {/* Search & Table Card */}
      <Card className="overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
          <form className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <IconSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Cari berdasarkan nama, NIS, atau kelas..."
                className={`${inp} pl-10`}
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className={btn}>
                Cari
              </button>
              {q && (
                <Link href="/admin/anggota" className={btnSecondary}>
                  Reset
                </Link>
              )}
            </div>
          </form>
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon={<IconUsers className="w-6 h-6" />}
            title="Tidak ada anggota ditemukan"
            description={
              q
                ? `Tidak ada data anggota yang cocok untuk "${q}".`
                : "Belum ada anggota terdaftar di perpustakaan."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">Anggota</th>
                  <th className="px-5 py-3.5">NIS</th>
                  <th className="px-5 py-3.5">Kelas</th>
                  <th className="px-5 py-3.5">Username</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {rows.map((a: any) => (
                  <tr
                    key={a.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300 text-xs font-bold ring-1 ring-brand-600/15">
                          {initials(a.nama)}
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-white">{a.nama}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="font-mono text-xs font-semibold px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {a.nis}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant="blue">{a.kelas}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">@{a.username}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <a href={`?edit=${a.id}`} className={btnSecondarySm}>
                          <IconEdit className="w-3.5 h-3.5" />
                          <span>Ubah</span>
                        </a>
                        <form action={hapusAnggota}>
                          <input type="hidden" name="id" value={a.id} />
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
