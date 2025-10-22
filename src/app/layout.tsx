import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next"
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/providers/convex-client.provider";
import { ThemeProvider } from "next-themes";
import { LoadingProgressProvider } from "@/providers/bprogress.provider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Casino Intelligence Platform",
  description: "AI-powered platform for automated casino discovery and promotional offer tracking with real-time analytics dashboards. Built with Next.js, Convex, and OpenAI.",
  keywords: ["casino", "promotional offers", "AI automation", "analytics", "real-time dashboard"],
  authors: [{ name: "Martin Atole" }],
  openGraph: {
    title: "Casino Intelligence Platform",
    description: "Automated casino discovery and promotional offer tracking with AI-powered research",
    url: "https://project-casino.martinatole.com",
    siteName: "Casino Intelligence Platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
        >
          <ConvexClientProvider>
            <LoadingProgressProvider>
              {children}
              <Toaster
                position='top-right'
                richColors
              />
              <Analytics />
            </LoadingProgressProvider>
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
