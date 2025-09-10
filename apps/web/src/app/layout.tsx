import type { Metadata } from "next";
import { Fira_Mono, Geist, Geist_Mono, Inter } from "next/font/google";
import "../index.css";
import Providers from "@/components/providers";
import Header from "@/components/header";

const interSans = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin"],
});

const firaMono = Fira_Mono({
  variable: "--font-fira-mono",
  subsets: ["latin"],
  weight: "500",
});

export const metadata: Metadata = {
  title: "portfolio",
  description: "portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${interSans.variable} ${firaMono.variable} antialiased`}
      >
        <Providers>
          <div className="grid grid-rows-[auto_1fr] h-dvh">
            <Header />
            <main className="container items-start mx-auto max-w-3xl py-8 space-y-6 flex flex-col gap-4">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
