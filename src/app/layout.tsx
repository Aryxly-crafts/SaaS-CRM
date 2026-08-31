import type { Metadata, Viewport } from "next";
import { Chivo } from "next/font/google";
import "./globals.css";
import { SwCleanup } from "@/components/sw-cleanup";

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
  icons: {
    icon: [{ url: "/favicon.ico" }],
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
        <SwCleanup />
      </body>
    </html>
  );
}

