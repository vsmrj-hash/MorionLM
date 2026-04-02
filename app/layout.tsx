import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MORIONLM — Personal AI Brain",
  description: "A cognitive operating system for thought synthesis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
