import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Punchi Car Niwasa - Vehicle Park, Malabe",
  description: "Choose from 400 vehicles in one place. Quality used cars from Japan with comprehensive inspection.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main className="bg-gray-200">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
