import type { Metadata } from "next";
import { Chivo } from "next/font/google";
import "./globals.css";

const chivo = Chivo({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Aryxly — Lead & Project Tracker",
  description: "Internal lead, project, and payment tracker for Aryxly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${chivo.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="bg-canvas text-ink h-full font-sans" suppressHydrationWarning>{children}</body>
    </html>
  );
}
