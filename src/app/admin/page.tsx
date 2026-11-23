import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { query } from "@/lib/db";
import { hitungDenda, rupiah } from "@/lib/services";
import { AppLayout, Badge, Card, PageHeader, StatCard, btn, btnSecondary } from "@/components/ui";
import {
  IconAlert,
  IconBook,
  IconChevronRight,
  IconClock,
  IconPlus,
  IconTransactions,
  IconUsers,
} from "@/components/icons";

export default async function AdminDash() {
  const u = await requireRole("admin");

  const [[st], kategoriRows, recentRows] = await Promise.all([
    query(`
      SELECT
        (SELECT COUNT(*) FROM buku) AS buku,
        (SELECT COALESCE(SUM(stok), 0) FROM buku) AS total_stok,
        (SELECT COUNT(*) FROM anggota) AS anggota,
        (SELECT COUNT(*) FROM transaksi WHERE status='Dipinjam') AS aktif,
        (SELECT COUNT(*) FROM transaksi WHERE status='Dipinjam' AND tgl_batas < CURDATE()) AS terlambat,
        (SELECT COUNT(*) FROM transaksi WHERE status='Dikembalikan') AS selesai
    `),
    query(`
      SELECT kategori, COUNT(*) AS judul, COALESCE(SUM(stok), 0) AS stok
      FROM buku
      GROUP BY kategori
      ORDER BY judul DESC, kategori ASC
      LIMIT 6
    `),
    query(`
      SELECT t.id, a.nama, a.kelas, b.judul, t.tgl_pinjam, t.tgl_batas, t.tgl_kembali, t.status
      FROM transaksi t
      JOIN anggota a ON a.id = t.anggota_id
      JOIN buku b ON b.id = t.buku_id
      ORDER BY t.id DESC
      LIMIT 5
    `),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const totalTx = Number(st.aktif) + Number(st.selesai);
  const pctKembali = totalTx > 0 ? Math.round((Number(st.selesai) / totalTx) * 100) : 0;
  const maxKat = Math.max(1, ...kategoriRows.map((k: any) => Number(k.judul)));

  // SVG Donut metrics
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const kembaliDash = (pctKembali / 100) * circumference;

  const quickLinks = [
    {
      href: "/admin/buku",
      title: "Kelola Buku",
      desc: "Tambah katalog baru, perbarui stok, dan unggah cover buku.",
      icon: <IconBook className="w-5 h-5" />,
    },
    {
      href: "/admin/transaksi",
      title: "Transaksi Sirkulasi",
      desc: "Catat peminjaman, pengembalian, cek denda, dan ekspor CSV.",
      icon: <IconTransactions className="w-5 h-5" />,
    },
    {
      href: "/admin/anggota",
      title: "Kelola Anggota",
      desc: "Kelola data siswa terdaftar, kelas, dan akses akun.",
      icon: <IconUsers className="w-5 h-5" />,
    },
  ];

  return (
    <AppLayout nama={u.nama} role="admin">
      <PageHeader
        title="Dashboard Admin"
        description={`Selamat datang kembali, ${u.nama}. Pantau ringkasan koleksi dan aktivitas perpustakaan hari ini.`}
        actions={
          <>
            <Link href="/admin/buku" className={btnSecondary}>
              <IconPlus className="w-4 h-4" />
              <span>Tambah Buku</span>
            </Link>
            <Link href="/admin/transaksi" className={btn}>
              <IconTransactions className="w-4 h-4" />
              <span>Transaksi Baru</span>
            </Link>
          </>
        }
      />

      {/* 4 Modern Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Judul Buku"
          value={st.buku}
          sublabel={`${st.total_stok} eksemplar tersedia di rak`}
          icon={<IconBook className="w-5 h-5" />}
          tone="blue"
        />
        <StatCard
          label="Total Anggota"
          value={st.anggota}
          sublabel="Siswa aktif terdaftar"
          icon={<IconUsers className="w-5 h-5" />}
          tone="emerald"
        />
        <StatCard
          label="Peminjaman Aktif"
          value={st.aktif}
          sublabel={`${st.selesai} transaksi telah dikembalikan`}
          icon={<IconClock className="w-5 h-5" />}
          tone="amber"
        />
        <StatCard
          label="Melewati Batas"
          value={st.terlambat}
          sublabel={Number(st.terlambat) > 0 ? "Perlu tindak lanjut pengembalian" : "Semua peminjaman tepat waktu"}
          icon={<IconAlert className="w-5 h-5" />}
          tone={Number(st.terlambat) > 0 ? "rose" : "emerald"}
        />
      </div>

      {/* Analytics Row: Category Distribution & Circulation Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
        {/* Category Distribution Bar Chart */}
        <Card className="lg:col-span-7 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Distribusi Koleksi per Kategori
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Jumlah judul dan total stok buku berdasarkan kategori
              </p>
            </div>
            <Link
              href="/admin/buku"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              Lihat katalog
            </Link>
          </div>

          {kategoriRows.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">
              Belum ada data kategori buku.
            </p>
          ) : (
            <div className="space-y-4">
              {kategoriRows.map((k: any) => {
                const widthPct = Math.max(8, Math.round((Number(k.judul) / maxKat) * 100));
                return (
                  <div key={k.kategori} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-200">
                        {k.kategori}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        <strong className="text-slate-900 dark:text-white">{k.judul}</strong> judul · {k.stok} stok
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all duration-500"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Circulation Ring Chart */}
        <Card className="lg:col-span-5 p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Rasio Pengembalian
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Perbandingan transaksi selesai vs masih dipinjam
            </p>
          </div>

          <div className="my-5 flex items-center justify-center gap-6">
            <div className="relative h-28 w-28 shrink-0">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  strokeWidth="10"
                  className="stroke-slate-100 dark:stroke-slate-800"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${kembaliDash} ${circumference}`}
                  className="stroke-brand-600 dark:stroke-brand-500 transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-slate-900 dark:text-white">{pctKembali}%</span>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Selesai</span>
              </div>
            </div>

            <div className="space-y-3 text-xs flex-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-full bg-brand-600" />
                  Dikembalikan
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">{st.selesai}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                  Sedang Dipinjam
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">{st.aktif}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Total Transaksi</span>
                <span className="font-bold text-slate-900 dark:text-white">{totalTx}</span>
              </div>
            </div>
          </div>

          <Link
            href="/admin/transaksi"
            className="inline-flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/70 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-brand-500/15 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            <span>Kelola semua transaksi</span>
            <IconChevronRight className="w-4 h-4" />
          </Link>
        </Card>
      </div>

      {/* Recent Transactions Table */}
      <Card className="mb-6 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Aktivitas Transaksi Terbaru
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              5 pencatatan peminjaman dan pengembalian terakhir
            </p>
          </div>
          <Link
            href="/admin/transaksi"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
          >
            <span>Lihat semua</span>
            <IconChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-3">Anggota</th>
                <th className="px-6 py-3">Judul Buku</th>
                <th className="px-6 py-3">Tgl Pinjam</th>
                <th className="px-6 py-3">Batas Kembali</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Denda</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {recentRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    Belum ada aktivitas transaksi.
                  </td>
                </tr>
              ) : (
                recentRows.map((t: any) => {
                  const terlambat = t.status === "Dipinjam" && t.tgl_batas < today;
                  const { denda } = hitungDenda(t.tgl_batas, t.tgl_kembali);
                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-6 py-3.5">
                        <div className="font-medium text-slate-900 dark:text-white">{t.nama}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{t.kelas}</div>
                      </td>
                      <td className="px-6 py-3.5 font-medium text-slate-700 dark:text-slate-200">
                        {t.judul}
                      </td>
                      <td className="px-6 py-3.5 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {t.tgl_pinjam}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <span
                          className={
                            terlambat
                              ? "font-semibold text-rose-600 dark:text-rose-400"
                              : "text-slate-600 dark:text-slate-400"
                          }
                        >
                          {t.tgl_batas}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        {t.status === "Dikembalikan" ? (
                          <Badge variant="emerald">Dikembalikan</Badge>
                        ) : terlambat ? (
                          <Badge variant="rose">Terlambat</Badge>
                        ) : (
                          <Badge variant="blue">Dipinjam</Badge>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-right font-medium whitespace-nowrap">
                        <span className={denda > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-500 dark:text-slate-400"}>
                          {rupiah(denda)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick Access Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickLinks.map((q) => (
          <Link
            key={q.href}
            href={q.href}
            className="group rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#111827] p-5 shadow-card dark:shadow-card-dark hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-card-hover transition-all duration-200 flex items-start gap-4"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/15 text-brand-600 dark:text-brand-400 group-hover:bg-brand-600 group-hover:text-white transition-colors">
              {q.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {q.title}
                </h3>
                <IconChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {q.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </AppLayout>
  );
}
