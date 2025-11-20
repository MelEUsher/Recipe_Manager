import Link from "next/link";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Recipe Manager",
  description: "Manage your recipes with ease.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900">
        <div className="min-h-screen">
          <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <Link href="/recipes" className="text-lg font-semibold text-slate-900 hover:text-indigo-700">
                Recipe Manager
              </Link>
              <nav className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                <Link
                  href="/recipes"
                  className="rounded-lg px-3 py-2 transition hover:bg-slate-100 hover:text-indigo-700"
                >
                  Home
                </Link>
                <Link
                  href="/recipes/new"
                  className="rounded-lg bg-indigo-600 px-3 py-2 text-white transition hover:bg-indigo-700"
                >
                  Create Recipe
                </Link>
              </nav>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
