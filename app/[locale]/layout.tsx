import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { Providers } from "../providers";
import { ThemeProvider } from "@/components/theme-provider";
import { FC } from "react";
import { AVAIL_LOCALES, AvailableLocales } from "@/lib/constants";
import { Toaster } from "sonner";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Students Film Festival of Faculty of Informatics Brno Voting system",
  description: "Vote for your favorite films",
};

type Props = {
  params: Promise<{ locale: string }>;
  children: React.ReactNode;
};

const RootLayout: FC<Props> = async ({ params, children }) => {
  const { locale } = await params;
  const lang = (AVAIL_LOCALES.find((x) => x.startsWith(locale ?? "")) ??
    "cz-CZ") as AvailableLocales;
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background font-sans dark:text-white`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster position="top-right" />
          <ModeToggle />
          <LanguageToggle lang={lang} />
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
