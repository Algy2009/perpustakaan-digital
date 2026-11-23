import Link from "next/link";
import { login } from "./actions";
import { inp, btn, Msg } from "@/components/ui";
import { ThemeToggle } from "@/components/ThemeProvider";
import { IconBook, IconGraduation, IconLibrary, IconShield, IconTransactions, IconUsers } from "@/components/icons";

export default async function Login({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const { role = "siswa", ok, err } = await searchParams;
  const isAdmin = role === "admin";

  return (
    <div className="min-h-screen flex flex-col justify-center bg-[var(--bg-app)] p-4 sm:p-6 lg:p-8 relative">
      {/* Top right theme switcher */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-20">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-4xl mx-auto">
        <div className="grid lg:grid-cols-12 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#111827] shadow-xl shadow-slate-900/5 dark:shadow-black/30">
          {/* Left Brand Panel */}
          <div className="lg:col-span-5 relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 p-8 sm:p-10 text-white flex flex-col justify-between">
            <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-brand-400/20 blur-2xl pointer-events-none" />

            <div className="relative">
              <div className="inline-flex items-center gap-3 mb-8">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur-xs">
                  <IconLibrary className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-base font-bold tracking-tight">Perpustakaan Digital</div>
                  <div className="text-xs text-blue-100/80">Sistem Manajemen Sekolah</div>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-snug">
                Kelola &amp; Akses Koleksi Buku Lebih Cepat.
              </h1>
              <p className="mt-3 text-sm text-blue-100/90 leading-relaxed">
                Platform perpustakaan sekolah modern untuk pencatatan katalog, peminjaman mandiri siswa, dan laporan sirkulasi otomatis.
              </p>
            </div>

            <div className="relative mt-8 pt-6 border-t border-white/15 space-y-3 text-xs text-blue-50/90">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15">
                  <IconBook className="w-4 h-4" />
                </span>
                <span>Katalog buku lengkap dengan pencarian cepat</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15">
                  <IconTransactions className="w-4 h-4" />
                </span>
                <span>Peminjaman &amp; pengembalian real-time</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15">
                  <IconUsers className="w-4 h-4" />
                </span>
                <span>Portal khusus Administrator dan Anggota Siswa</span>
              </div>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="lg:col-span-7 p-7 sm:p-10 flex flex-col justify-center">
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Selamat Datang Kembali
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Pilih peran Anda lalu masukkan kredensial akun untuk melanjutkan.
              </p>
            </div>

            {/* Role Switcher */}
            <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 mb-6">
              <Link
                href="/?role=siswa"
                className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all duration-150 ${
                  !isAdmin
                    ? "bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs ring-1 ring-slate-200/80 dark:ring-slate-700"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <IconGraduation className="w-4 h-4" />
                <span>Siswa</span>
              </Link>
              <Link
                href="/?role=admin"
                className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all duration-150 ${
                  isAdmin
                    ? "bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs ring-1 ring-slate-200/80 dark:ring-slate-700"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <IconShield className="w-4 h-4" />
                <span>Admin</span>
              </Link>
            </div>

            <Msg ok={ok} err={err} />

            <form action={login} className="space-y-4">
              <input type="hidden" name="role" value={isAdmin ? "admin" : "siswa"} />

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Username
                </label>
                <input
                  name="username"
                  placeholder={isAdmin ? "Masukkan username admin" : "Masukkan username siswa"}
                  required
                  autoComplete="username"
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
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className={inp}
                />
              </div>

              <button type="submit" className={`${btn} w-full py-3 mt-2`}>
                Masuk sebagai {isAdmin ? "Admin" : "Siswa"}
              </button>
            </form>

            {!isAdmin && (
              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center text-sm text-slate-600 dark:text-slate-400">
                Belum menjadi anggota perpustakaan?{" "}
                <Link
                  href="/daftar"
                  className="font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  Daftar sekarang
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
