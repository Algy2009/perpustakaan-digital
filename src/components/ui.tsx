import React from "react";
import { AppShell, NavItem } from "./AppShell";
import { IconAlert, IconCheck } from "./icons";

export const inp =
  "w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/80 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-brand-600 dark:focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-600/20 dark:focus:ring-brand-400/20 transition-all duration-150";

export const btn =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white font-medium px-4 py-2.5 text-sm shadow-sm shadow-brand-600/20 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:pointer-events-none";

export const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-medium px-4 py-2.5 text-sm shadow-xs transition-all duration-150 cursor-pointer";

export const btnSm =
  "inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium px-3 py-1.5 text-xs shadow-xs transition-all duration-150 cursor-pointer";

export const btnSecondarySm =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium px-3 py-1.5 text-xs transition-all duration-150 cursor-pointer";

export const btnRed =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 hover:bg-red-600 hover:text-white hover:border-red-600 dark:hover:bg-red-600 dark:hover:text-white text-red-600 dark:text-red-400 font-medium px-3 py-1.5 text-xs transition-all duration-150 cursor-pointer";

export const adminNavItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/buku", label: "Kelola Buku", icon: "book" },
  { href: "/admin/transaksi", label: "Transaksi", icon: "transactions" },
  { href: "/admin/anggota", label: "Kelola Anggota", icon: "users" },
];

export const siswaNavItems: NavItem[] = [
  { href: "/siswa", label: "Dashboard", icon: "dashboard" },
  { href: "/siswa/pinjam", label: "Peminjaman Buku", icon: "book" },
  { href: "/siswa/kembali", label: "Pengembalian Buku", icon: "return" },
  { href: "/siswa/riwayat", label: "Riwayat", icon: "history" },
];

export function AppLayout({
  nama,
  role,
  children,
}: {
  nama: string;
  role: "admin" | "siswa";
  children: React.ReactNode;
}) {
  return (
    <AppShell nama={nama} role={role} items={role === "admin" ? adminNavItems : siswaNavItems}>
      {children}
    </AppShell>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#111827] shadow-card dark:shadow-card-dark transition-colors duration-200 ${className}`}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sublabel,
  icon,
  tone = "blue",
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  icon: React.ReactNode;
  tone?: "blue" | "emerald" | "amber" | "rose";
}) {
  const tones = {
    blue: "bg-brand-50 dark:bg-brand-500/15 text-brand-600 dark:text-brand-400 ring-brand-600/10 dark:ring-brand-400/20",
    emerald: "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-emerald-600/10 dark:ring-emerald-400/20",
    amber: "bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-amber-600/10 dark:ring-amber-400/20",
    rose: "bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 ring-rose-600/10 dark:ring-rose-400/20",
  };

  return (
    <div className="group rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#111827] p-5 shadow-card dark:shadow-card-dark hover:shadow-card-hover dark:hover:border-slate-700 transition-all duration-200">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>
          {sublabel && (
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 truncate">
              {sublabel}
            </p>
          )}
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 transition-transform duration-200 group-hover:scale-105 ${tones[tone]}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export function Badge({
  children,
  variant = "neutral",
}: {
  children: React.ReactNode;
  variant?: "blue" | "emerald" | "amber" | "rose" | "neutral";
}) {
  const variants = {
    blue: "bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300 ring-brand-600/20 dark:ring-brand-400/25",
    emerald: "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-emerald-600/20 dark:ring-emerald-400/25",
    amber: "bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-amber-600/20 dark:ring-amber-400/25",
    rose: "bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 ring-rose-600/20 dark:ring-rose-400/25",
    neutral: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 ring-slate-300/60 dark:ring-slate-700",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${variants[variant]}`}>
      {children}
    </span>
  );
}

export function Msg({ ok, err }: { ok?: string; err?: string }) {
  if (!ok && !err) return null;
  const isErr = Boolean(err);
  return (
    <div
      role="alert"
      className={`mb-5 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
        isErr
          ? "border-rose-200 dark:border-rose-900/70 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300"
          : "border-emerald-200 dark:border-emerald-900/70 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300"
      }`}
    >
      {isErr ? (
        <IconAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 mt-0.5" />
      ) : (
        <IconCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
      )}
      <span>{err || ok}</span>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mb-3">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
