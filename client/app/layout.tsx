import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/ui/ThemeProvider";
import { BudgetProvider } from "./context/BudgetContext";
import AuthUserMiddleware from "../components/layout/AuthUserMiddleware";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BudgeThink",
  description: "A personal budget tracking application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans`}
      >
        <ThemeProvider>
          <AuthUserMiddleware>
            <BudgetProvider>{children}</BudgetProvider>
          </AuthUserMiddleware>
        </ThemeProvider>
      </body>
    </html>
  );
}
