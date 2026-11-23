import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata = {
  title: "Perpustakaan Digital — Sistem Manajemen Perpustakaan Sekolah",
  description: "Aplikasi Perpustakaan Sekolah Digital modern untuk pengelolaan buku, anggota, dan transaksi peminjaman.",
};

const themeInitScript = `
(function() {
  try {
    var t = localStorage.getItem('perpustakaan-theme');
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {}
})();
`;

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen font-sans antialiased bg-[var(--bg-app)] text-[var(--text-primary)] selection:bg-brand-600 selection:text-white">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
