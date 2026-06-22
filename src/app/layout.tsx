import type { Metadata } from "next";
import { Inter, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { APP } from "@/lib/config";

// Clean, legible body/data font.
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

// Characterful display font for emotional headlines (Clash Display stand-in).
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: {
    default: `${APP.name} — Play. Win. Give.`,
    template: `%s · ${APP.name}`,
  },
  description: APP.tagline,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full", inter.variable, display.variable)}
    >
      <body className="min-h-full flex flex-col font-sans antialiased">
        <ThemeProvider>
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
