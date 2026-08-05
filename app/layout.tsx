import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ZaloButtonWrapper } from "@/components/viewer/zalo-button-wrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cal.nalu.vn"),
  title: "Nalu | Xem báo giá",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Nalu | Xem báo giá",
    images: ["/nalu-logo-trans-512x234.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nalu | Xem báo giá",
    images: ["/nalu-logo-trans-512x234.png"],
  },
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
        <ZaloButtonWrapper />
      </body>
    </html>
  );
}
