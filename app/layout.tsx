import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppInitializer } from "@/components/app-initializer";
import { ThemeProvider } from "@/components/theme-provider";
import { AppToaster } from "@/components/toaster";

const geist = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Timerapportering",
  description: "Timeregistrering",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nb" suppressHydrationWarning>
      <head>
        {/* Apply theme before paint to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme')||'system';if(t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}})()`,
          }}
        />
      </head>
      <body className={`${geist.variable} ${geistMono.variable} antialiased`}>
        <SidebarProvider>
          <AppInitializer />
          <ThemeProvider />
          <AppSidebar />
          <main className="flex-1 flex flex-col min-h-screen">
            <div className="flex items-center gap-3 px-5 py-3 border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
            </div>
            <div className="flex-1 p-6 md:p-8">{children}</div>
          </main>
        </SidebarProvider>
        <AppToaster />
      </body>
    </html>
  );
}
