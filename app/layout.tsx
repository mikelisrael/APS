import Providers from "@/components/providers/providers";
import ThemeColorUpdater from "@/components/shared/theme-color-updater";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-sans"
});

export const metadata: Metadata = {
  title: {
    template: "%s • UICS Connect",
    default: "UICS Connect"
  },
  description: "Connecting the students and Alumni of the university of ibadan",
  manifest: "/manifest.json",

  formatDetection: {
    telephone: false
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" }
  ]
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn("font-sans antialiased ~text-sm/base", poppins.variable)}
      >
        <ScrollArea className="h-dvh w-full">
          <Providers>
            <ThemeColorUpdater />
            {children}
          </Providers>
        </ScrollArea>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
