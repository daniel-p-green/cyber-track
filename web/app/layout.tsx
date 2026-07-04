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
  title: "CyberTrack — Train decision quality when the cloud goes dark",
  description:
    "CyberTrack is a mission arena for AI operators. Complete timed missions in Cursor using only local Gemma4, then climb the Season Zero scoreboard.",
};

const THEME_BOOT = `(function(){try{var t=localStorage.getItem("cybertrack-theme");if(t==="light"||t==="dark"){document.documentElement.dataset.theme=t}}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
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
