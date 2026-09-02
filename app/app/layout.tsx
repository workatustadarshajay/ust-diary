import type { Metadata } from "next";
import Link from "next/link";
import { DM_Sans, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "UST Diary",
  description: "A quiet place for your everyday pages.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="site-header">
          <Link className="brand-mark" href="/">UST <span>Diary</span></Link>
          <nav className="site-nav" aria-label="Primary navigation">
            <Link href="/">Calendar</Link>
            <Link href="/book">Book</Link>
            <Link href="/search">Search</Link>
            <Link href="/templates">Templates</Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
