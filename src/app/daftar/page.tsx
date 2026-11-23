import Link from "next/link";
import { daftar } from "../actions";
import { inp, btn, Msg } from "@/components/ui";
import { ThemeToggle } from "@/components/ThemeProvider";
import { IconArrowLeft, IconLibrary } from "@/components/icons";

export default async function Daftar({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const { err } = await searchParams;

  return (
    <div className="min-h-screen flex flex-col justify-center bg-[var(--bg-app)] p-4 sm:p-6 relative">
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-20">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md mx-auto">
        <div className="mb-6 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-md shadow-brand-600/25 mb-3">
            <IconLibrary className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Daftar Anggota Baru
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Buat akun siswa untuk mulai meminjam buku di Perpustakaan Digital.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#111827] p-6 sm:p-8 shadow-xl shadow-slate-900/5 dark:shadow-black/30">
          <Msg err={err} />

          <form action={daftar} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  NIS
                </label>
                <input name="nis" placeholder="Contoh: 1004" required className={inp} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Kelas
                </label>
                <input name="kelas" placeholder="Mis. XII RPL 1" required className={inp} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nama Lengkap
              </label>
              <input name="nama" placeholder="Masukkan nama lengkap" required className={inp} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Username
              </label>
              <input
                name="username"
                placeholder="Minimal 4 karakter"
                required
                minLength={4}
                className={inp}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <input
                name="password"
                type="password"
                placeholder="Minimal 6 karakter"
                required
                minLength={6}
                className={inp}
              />
            </div>

            <button type="submit" className={`${btn} w-full py-3 mt-2`}>
              Buat Akun Anggota
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
            <Link
              href="/?role=siswa"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline"
            >
              <IconArrowLeft className="w-4 h-4" />
              <span>Kembali ke halaman login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
