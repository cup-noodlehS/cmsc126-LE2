"use client";

import { Sidebar } from "./Sidebar";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <Sidebar />
      <main className="md:ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
} 