import type { Metadata } from "next";
import { Barlow_Condensed, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import WelcomeWizard from "./components/WelcomeWizard";

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
  title: "CyberTrack: verify AI under pressure",
  description:
    "Tactical mission arena for high-pressure technical incidents in Cursor with local Gemma4 only. Scored on evidence discipline, model skepticism, and defensible calls when the cloud goes dark.",
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
        <WelcomeWizard />
      </body>
    </html>
  );
}
