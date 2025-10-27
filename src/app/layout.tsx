import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
import { BookingProvider } from "@/contexts/BookingContext";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pconnect App",
  description:
    "P-Conect is a cloud-based workplace platform that unifies people flow, attendance, and space utilization. QR-based check-in/out captures accurate presence data without hardware hassles, delivering instant visibility of who is on-site, when, and where. The hot-desking module lets employees reserve desks or rooms in advance or on arrival, with rules for teams, zones, and capacities—reducing congestion and improving space efficiency. Administrators manage everything from a secure web console: roles and permissions, site policies, notifications, and detailed reports for payroll and compliance. Built with a mobile-first experience and open APIs, P-Conect is designed to plug into Microsoft 365/Entra ID and building systems, supporting government departments, multi-tenant offices, and education campuses that need dependable, auditable occupancy and productivity insight.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <Script
          crossOrigin="anonymous"
          src="//unpkg.com/same-runtime/dist/index.global.js"
        />
      </head>
      <body suppressHydrationWarning className="antialiased">
        <BookingProvider>
          <ClientBody>{children}</ClientBody>
        </BookingProvider>
      </body>
    </html>
  );
}
