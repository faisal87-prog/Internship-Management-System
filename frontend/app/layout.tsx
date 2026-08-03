import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { MockAuthProvider } from "@/context/MockAuthContext";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "AI Internship Management Platform",
  description:
    "Internship program management with AI-assisted roadmaps, tasks, and reports.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} font-sans`}>
        <MockAuthProvider>{children}</MockAuthProvider>
      </body>
    </html>
  );
}
