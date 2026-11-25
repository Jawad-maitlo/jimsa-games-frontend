import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "../components/providers/ThemeProvider";
import { AuthProvider } from "../components/providers/AuthProvider";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";

export const metadata: Metadata = {
  title: "Jimsa Games — Real-Time Multiplayer Gaming Arena",
  description:
    "Your Arena. Your Rules. Your Victory. Challenge friends in real-time multiplayer games including Red Light Green Light, Glass Bridge, Chess, Ludo, Card Clash, Trust or Betray, and Treasure Hunt.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
