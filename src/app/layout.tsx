import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ThemeProvider } from "./ThemeContext";
import { NotificationProvider } from "./NotificationContext";
import { SidebarLayout } from "./SidebarLayout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Atlas - Premium Productivity Dashboard",
  description: "Track your schedules, log habits, evaluate progress with smart AI insights and levels system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <ThemeProvider>
            <NotificationProvider>
              <SidebarLayout>
                {children}
              </SidebarLayout>
            </NotificationProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
