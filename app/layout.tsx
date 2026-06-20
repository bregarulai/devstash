import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { CommandPaletteProvider } from "@/hooks/useCommandPalette/useCommandPalette";
import { CommandPaletteClient } from "@/components/dashboard/CommandPaletteClient/CommandPaletteClient";
import { UnsavedChangesProvider } from "@/components/items/itemDrawer/UnsavedChangesProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevStash",
  description: "A unified hub for developer knowledge & resources",
};

export const viewport = {
  themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#09090b" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark`}
      style={{ color: "var(--foreground)", backgroundColor: "var(--background)" }}
    >
      <head />
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background text-foreground antialiased`}>
        <CommandPaletteProvider>
          <UnsavedChangesProvider>
            {children}
          </UnsavedChangesProvider>
          <Toaster position="top-center" richColors />
          <CommandPaletteClient />
        </CommandPaletteProvider>
      </body>
    </html>
  );
}
