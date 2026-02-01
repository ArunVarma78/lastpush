import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Provider from "./provider";
import { Toaster } from "sonner";
import ErrorBoundary from "@/components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title:
    "LastPush - AI-Based Voice Interview Platform for Candidate Pre-Screening",
  description:
    "Create AI-powered interviews and evaluate candidates effortlessly",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <Provider>
            {children}
            <Toaster position="top-right" richColors />
          </Provider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
