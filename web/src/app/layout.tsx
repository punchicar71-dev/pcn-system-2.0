import type { Metadata } from "next";
import { Poppins, Noto_Sans_Sinhala } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-poppins" });
const notoSansSinhala = Noto_Sans_Sinhala({ subsets: ["sinhala"], weight: ["400", "500", "600", "700", "800"], variable: "--font-sinhala" });

export const metadata: Metadata = {
  title: "Punchi Car Niwasa - Vehicle Park, Malabe",
  description: "Choose from 400 vehicles in one place. Quality used cars from Japan with comprehensive inspection.",
  icons: {
    icon: "/logo_icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${notoSansSinhala.variable} font-sans`}>
        <Header />
        <main className="bg-gray-200">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
