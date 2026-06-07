import React from "react";
import Link from "next/link";
import { LayoutDashboard, Users, PlusCircle, Settings, LogOut, Layers } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex font-sans antialiased">
      {/* High-End Fixed Admin Sidebar */}
      <aside className="w-64 border-r border-zinc-900 bg-zinc-950 p-6 flex flex-col justify-between hidden md:flex">
        <div className="space-y-8">
          {/* App Branding */}
          <div className="flex items-center gap-2.5 px-2">
            <Layers className="w-6 h-6 text-white" />
            <span className="font-black text-lg tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              ClientSprint
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold bg-zinc-900 border border-zinc-800 text-white transition-all">
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </Link>
            <Link href="/dashboard/new" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/40 transition-all">
              <PlusCircle className="w-4 h-4" />
              <span>Create Portal</span>
            </Link>
          </nav>
        </div>

        {/* Lower Meta Block */}
        <div className="space-y-4 border-t border-zinc-900 pt-4">
          <div className="flex items-center gap-3 px-3 text-zinc-500 text-xs font-semibold uppercase tracking-wider">
            Agency Mode
          </div>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-zinc-500 hover:text-red-400 transition-colors">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Frame Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}