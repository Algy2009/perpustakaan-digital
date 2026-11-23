"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions";
import { ThemeToggle } from "./ThemeProvider";
import {
  IconBook,
  IconClose,
  IconDashboard,
  IconHistory,
  IconLibrary,
  IconLogout,
  IconMenu,
  IconReturn,
  IconTransactions,
  IconUsers,
} from "./icons";

export type NavItem = {
  href: string;
  label: string;
  icon: "dashboard" | "book" | "transactions" | "users" | "return" | "history";
};

function NavIcon({ name, className }: { name: NavItem["icon"]; className?: string }) {
  switch (name) {
    case "dashboard":
      return <IconDashboard className={className} />;
    case "book":
      return <IconBook className={className} />;
    case "transactions":
      return <IconTransactions className={className} />;
    case "users":
      return <IconUsers className={className} />;
    case "return":
      return <IconReturn className={className} />;
    case "history":
      return <IconHistory className={className} />;
  }
}

function getInitials(nama: string) {
  return nama
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function AppShell({
  nama,
  role,
  items,
  children,
}: {
  nama: string;
  role: "admin" | "siswa";
  items: NavItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeItem =
    items.find((item) => item.href === pathname) ??
    items.find((item) => item.href !== `/${role}` && pathname.startsWith(item.href)) ??
    items[0];

  const isActive = (href: string) => {
    if (href === `/${role}`) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const initials = getInitials(nama) || (role === "admin" ? "AD" : "SW");

  const SidebarContent = (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex h-16 items-center justify-between px-5 border-b border-slate-200/80 dark:border-slate-800/80">
        <Link href={`/${role}`} className="flex items-center gap-3 group" onClick={() => setMobileOpen(false)}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm shadow-brand-600/30 group-hover:bg-brand-700 transition-colors">
            <IconLibrary className="w-5 h-5" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              Perpustakaan
            </div>
            <div className="text-[11px] font-medium text-brand-600 dark:text-brand-400">
              {role === "admin" ? "Admin Workspace" : "Portal Siswa"}
            </div>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="lg:hidden rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Tutup menu"
        >
          <IconClose className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Menu Utama
        </div>
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-brand-600 text-white shadow-sm shadow-brand-600/25"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <NavIcon
                name={item.icon}
                className={`w-[18px] h-[18px] transition-colors ${
                  active
                    ? "text-white"
                    : "text-slate-400 dark:text-slate-500 group-hover:text-brand-600 dark:group-hover:text-brand-400"
                }`}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Profile & Logout */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 p-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600/10 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 text-xs font-bold ring-1 ring-brand-600/20">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                {nama}
              </div>
              <div className="text-[11px] font-medium capitalize text-slate-500 dark:text-slate-400">
                {role === "admin" ? "Administrator" : "Anggota Siswa"}
              </div>
            </div>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/70 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-red-200 dark:hover:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <IconLogout className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[var(--bg-app)] text-[var(--text-primary)]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col bg-white dark:bg-[#0F172A] border-r border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200">
        {SidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-[#0F172A] border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-200 ease-out lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {SidebarContent}
      </aside>

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-[#0F172A]/85 backdrop-blur-md transition-colors duration-200">
          <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="lg:hidden inline-flex items-center justify-center rounded-xl p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Buka menu navigasi"
              >
                <IconMenu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 min-w-0">
                <span className="hidden sm:inline text-xs font-medium text-slate-400 dark:text-slate-500">
                  Perpustakaan Digital
                </span>
                <span className="hidden sm:inline text-slate-300 dark:text-slate-700">/</span>
                <span className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {activeItem?.label ?? "Dashboard"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3">
              <ThemeToggle />

              <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white text-xs font-bold shadow-xs">
                  {initials}
                </div>
                <div className="hidden md:block leading-tight">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 max-w-[140px] truncate">
                    {nama}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">
                    {role}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Main Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
