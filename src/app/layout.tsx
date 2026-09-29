import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { StoreProvider } from "@/components/providers/store-provider";
import { ToastHost } from "@/components/ui/toast-host";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "EquipFlow — Equipment Management Demo",
  description:
    "Frontend prototype for lead-to-delivery equipment import and stock operations.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1d4ed8",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppShell>
          <StoreProvider>{children}</StoreProvider>
          <ToastHost />
        </AppShell>
      </body>
    </html>
  );
}
