import type { Metadata, Viewport } from "next";
import { Chivo } from "next/font/google";
import "./globals.css";
import { PwaRegister } from "@/components/pwa-register";

const chivo = Chivo({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const viewport: Viewport = {
  themeColor: "#2f7eda",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Aryxly — Lead & Project Tracker",
  description: "Internal lead, project, and payment tracker for Aryxly.",
  manifest: "/manifest.webmanifest",
  applicationName: "Aryxly",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Aryxly",
  },
  formatDetection: {
    telephone: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${chivo.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="bg-canvas text-ink h-full font-sans" suppressHydrationWarning>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}

