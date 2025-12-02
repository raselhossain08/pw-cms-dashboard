import type { Metadata } from "next";
import { Inter, Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";
import "./tiptap.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import Toaster from "@/components/Toaster";
import { QueryProvider } from "@/app/providers/QueryProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Personal Wings Admin Dashboard",
  description: "Personal Wings administrative dashboard",
  icons: {
    icon: "/icon.svg",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${geistMono.variable} ${montserrat.variable} antialiased`}
      >
        <ToastProvider>
          <AuthProvider>
            <QueryProvider>
              {children}
              <Toaster />
            </QueryProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
