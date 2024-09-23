import Providers from "@/components/providers/providers";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { ScrollArea } from "@/components/ui/scroll-area";

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    template: "%s • UICS Connect",
    default: "UICS Connect",
  },
  description: "Connecting the students and Alumni of the university of ibadan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn("font-sans antialiased ~text-sm/base", poppins.variable)}
      >
        <ScrollArea className="h-dvh w-full">
          <Providers>{children}</Providers>
        </ScrollArea>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
