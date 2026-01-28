import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Filmtorget - Köp & Sälj Film",
  description: "Marknadsplatsen för filmsamlare",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body className={inter.className}>
        <Navbar />
        <div className="min-h-screen flex flex-col">
          <main className="grow">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}