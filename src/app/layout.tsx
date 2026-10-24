import type { Metadata } from "next";
import "./globals.css";
import "./v1.css";
export const metadata: Metadata = {
  title: "ActionOS — Turn intention into impact",
  description:
    "Discover community needs, build teams, and verify meaningful outcomes. ActionOS by UNMUTED.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
