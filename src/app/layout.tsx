import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OnboardSync | Anti-Ghosting Client Portal",
  description: "Streamlined asset collection for modern agencies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark m-0 p-0 bg-zinc-950 select-none">
      <body className="bg-zinc-950 text-zinc-50 antialiased min-h-screen m-0 p-0 selection:bg-zinc-800 selection:text-zinc-200">
        {children}
      </body>
    </html>
  );
}