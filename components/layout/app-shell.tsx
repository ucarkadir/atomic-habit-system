import * as React from "react";
import Link from "next/link";

const navItems = [
  { href: "/setup", label: "Setup" },
  { href: "/daily", label: "Daily" },
  { href: "/weekly", label: "Weekly" },
  { href: "/monthly", label: "Monthly" },
  { href: "/help", label: "Help" }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-black/5 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/daily" className="flex flex-col">
            <span className="font-serif text-2xl font-semibold tracking-tight">
              Atomic Habit System
            </span>
            <span className="text-sm text-black/60">
              Dynamic metrics, dynamic rules, weekly and monthly insight
            </span>
          </Link>
          <nav className="flex flex-wrap items-center gap-2 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border bg-white px-4 py-2 text-black/70 transition hover:border-black/20 hover:text-black"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
