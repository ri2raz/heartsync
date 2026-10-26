import "@fontsource-variable/inter";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "./globals.css";

import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { CrisisStrip } from "@/components/site/crisis-strip";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { themeInitScript } from "@/components/site/theme-script";
import { getCurrentUser } from "@/lib/auth";
import { APP_NAME, TAGLINE_EN, type Role } from "@/lib/constants";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: `${APP_NAME} — Kisi se baat karni hai?`, template: `%s · ${APP_NAME}` },
  description: `${TAGLINE_EN} Peer support, not therapy. First chat free.`,
  openGraph: {
    title: `${APP_NAME} — Bina judge kiye sunne wale`,
    description: TAGLINE_EN,
    type: "website",
    locale: "en_IN",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf7f3" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0a0d" },
  ],
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-bg"
        >
          Skip to content
        </a>
        <CrisisStrip />
        <Navbar user={user ? { alias: user.alias, role: user.role as Role } : null} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
