import type { Metadata } from "next";
import { Barlow_Condensed, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-barlow",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CyberTrack — Offline AI Operator Readiness",
  description:
    "CyberTrack is a mission league for AI operators. Complete timed missions in Cursor using only local Gemma4, then climb the Season Zero scoreboard.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <style>{`
          :root {
            --font-display: var(--font-barlow), "Arial Narrow", sans-serif;
            --font-mono: var(--font-jetbrains), ui-monospace, monospace;
          }
        `}</style>
      </head>
      <body className={`${barlowCondensed.variable} ${jetbrainsMono.variable}`}>
        <Header />
        <main style={{ minHeight: "calc(100vh - 56px)" }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
