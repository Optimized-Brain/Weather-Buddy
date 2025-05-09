import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { AppProviders } from "@/providers/AppProviders";
import Header from "@/components/Header";

const geistSans = GeistSans; // Using the direct import
const geistMono = GeistMono;

export const metadata: Metadata = {
  title: "WeatherEye - Your Weather Companion",
  description: "Get detailed weather forecasts for cities around the world.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased flex flex-col min-h-screen">
        <AppProviders>
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="py-4 text-center text-sm text-muted-foreground border-t">
            © {new Date().getFullYear()} WeatherEye. All rights reserved.
          </footer>
        </AppProviders>
      </body>
    </html>
  );
}
