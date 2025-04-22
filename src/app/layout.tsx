import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/ui/navbar";
import { ToastProvider } from "@/providers/toast-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BlockTickets - Blockchain Verified Movie Tickets",
  description: "Book movies and events with blockchain verified tickets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0A0A10] text-black`}>
        <Navbar />
        <main className="min-h-screen bg-gradient-to-b from-[#0A0A10] to-[#121218]">
          {children}
        </main>
        <Toaster />
        <ToastProvider />
      </body>
    </html>
  );
}
