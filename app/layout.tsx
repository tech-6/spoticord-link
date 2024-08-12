import "@/styles/globals.css";
import { Inter as FontSans } from "next/font/google";
import type { Metadata } from "next";

import { cn } from "@/lib/utils";

const fontSans = FontSans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Spoticord Link",
  description: "Link your Spotify account to Spoticord",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="dark h-full" lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/spoticord.webp" type="image/webp" sizes="any" />
      </head>
      <body
        className={cn(
          "h-full bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        {children}
      </body>
    </html>
  );
}
