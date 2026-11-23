import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { query } from "@/lib/db";
import { hitungDenda, rupiah } from "@/lib/services";
import { AppLayout, Badge, Card, PageHeader, StatCard } from "@/components/ui";
import {
  IconAlert,
  IconBook,
  IconChevronRight,
  IconClock,
  IconHistory,
  IconReturn,
} from "@/components/icons";

export default async function SiswaDash() {
  const u = await requireRole("siswa");

  const [aktifRows, [{ selesai }]] = await Promise.all([
    query(
      "SELECT t.id, b.judul, b.pengarang, b.cover, t.tgl_pinjam, t.tgl_batas FROM transaksi t JOIN buku b ON b.id=t.buku_id WHERE t.anggota_id=? AND t.status='Dipinjam' ORDER BY t.tgl_batas",
      [u.id]
    ),
    query(
      "SELECT COUNT(*) AS selesai FROM transaksi WHERE anggota_id=? AND status='Dikembalikan'",
      [u.id]
    ),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const sedangPinjam = aktifRows.length;
  const sisaKuota = Math.max(0, 3 - sedangPinjam);
  const totalDendaAktif = aktifRows.reduce(
    (sum: number, t: any) => sum + hitungDenda(t.tgl_batas).denda,
    0
  );

  const quickMenus = [
    {
      href: "/siswa/pinjam",
      title: "Peminjaman Buku",
      desc: "Jelajahi katalog buku, filter kategori, dan pinjam secara langsung.",
      icon: <IconBook className="w-5 h-5" />,
    },
    {
      href: "/siswa/kembali",
      title: "Pengembalian Buku",
      desc: "Lihat daftar buku aktif, batas tanggal kembali, dan proses pengembalian.",
      icon: <IconReturn className="w-5 h-5" />,
    },
    {
      href: "/siswa/riwayat",
      title: "Riwayat Peminjaman",
      desc: "Pantau seluruh histori peminjaman dan rincian denda keterlambatan.",
      icon: <IconHistory className="w-5 h-5" />,
    },
  ];

  return (
    <AppLayout nama={u.nama} role="siswa">
      <PageHeader
        title="Dashboard Siswa"
        description={`Halo, ${u.nama}. Kelola aktivitas membaca dan peminjaman bukumu dengan mudah.`}
      />

      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 via-brand-700 to-brand-800 p-6 sm:p-7 text-white shadow-lg shadow-brand-600/20 mb-6">
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="max-w-xl">
            <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-xs mb-3">
              Kuota Peminjaman: {sedangPinjam} dari 3 buku
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Siap membaca buku baru hari ini?
            </h2>
            <p className="mt-1.5 text-sm text-blue-100/90">
              Kamu dapat meminjam hingga 3 buku sekaligus dengan masa pinjam 7 hari.
            </p>
            {/* Progress bar */}
            <div className="mt-4 max-w-xs">
              <div className="h-2 w-full rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-white transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.round((sedangPinjam / 3) * 100))}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <Link
              href="/siswa/pinjam"
              className="inline-flex items-center gap-2 rounded-xl bg-white text-brand-700 hover:bg-blue-50 font-semibold px-4 py-2.5 text-sm shadow-sm transition-colors"
            >
              <IconBook className="w-4 h-4" />
              <span>Jelajahi Katalog</span>
            </Link>
            {sedangPinjam > 0 && (
              <Link
                href="/siswa/kembali"
                className="inline-flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-medium px-4 py-2.5 text-sm ring-1 ring-white/25 transition-colors"
              >
                <IconReturn className="w-4 h-4" />
                <span>Kembalikan Buku</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Sedang Dipinjam"
          value={sedangPinjam}
          sublabel={`Sisa kuota ${sisaKuota} buku lagi`}
          icon={<IconClock className="w-5 h-5" />}
          tone="blue"
        />
        <StatCard
          label="Buku Selesai Dibaca"
          value={selesai}
          sublabel="Total pengembalian selesai"
          icon={<IconHistory className="w-5 h-5" />}
          tone="emerald"
        />
        <StatCard
          label="Denda Berjalan"
          value={rupiah(totalDendaAktif)}
          sublabel={totalDendaAktif > 0 ? "Segera kembalikan buku terlambat" : "Tidak ada denda aktif"}
          icon={<IconAlert className="w-5 h-5" />}
          tone={totalDendaAktif > 0 ? "rose" : "emerald"}
        />
      </div>

      {/* Active Loans Preview */}
      {aktifRows.length > 0 && (
        <Card className="mb-6 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Buku yang Sedang Kamu Pinjam
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Perhatikan batas waktu pengembalian agar bebas denda
              </p>
            </div>
            <Link
              href="/siswa/kembali"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              <span>Kelola pengembalian</span>
              <IconChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {aktifRows.map((t: any) => {
              const terlambat = t.tgl_batas < today;
              const { hari, denda } = hitungDenda(t.tgl_batas);
              return (
                <div
                  key={t.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
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
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                        {t.judul}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {t.pengarang} · Pinjam {t.tgl_pinjam}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {terlambat ? (
                      <Badge variant="rose">Terlambat {hari} hari · {rupiah(denda)}</Badge>
                    ) : (
                      <Badge variant="blue">Batas: {t.tgl_batas}</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickMenus.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="group rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#111827] p-5 shadow-card dark:shadow-card-dark hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-card-hover transition-all duration-200 flex items-start gap-4"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/15 text-brand-600 dark:text-brand-400 group-hover:bg-brand-600 group-hover:text-white transition-colors">
              {m.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {m.title}
                </h3>
                <IconChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {m.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </AppLayout>
  );
}
