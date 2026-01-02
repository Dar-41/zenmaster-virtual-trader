import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trade Battle DS - Multiplayer Trading Game",
  description: "Real-time multiplayer trading game for Indian stock market",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

