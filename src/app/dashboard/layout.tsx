import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // A clean, invisible wrapper matching your new light theme background
    <div className="min-h-screen w-full bg-zinc-50">
      {children}
    </div>
  );
}