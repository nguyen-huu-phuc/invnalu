import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ZaloButton } from "@/components/viewer/zalo-button";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "inv.nalu.vn | Xem báo giá",
  description: "Viewer economic analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={inter.variable}>
      <body className="font-sans antialiased">
        {children}
        <ZaloButton />
      </body>
    </html>
  );
}
