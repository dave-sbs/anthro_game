import type { Metadata } from "next";
import { Crimson_Pro } from "next/font/google";
import "./globals.css";

const crimsonPro = Crimson_Pro({
  variable: "--font-crimson",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Campus path — anthropology of access",
  description:
    "A playable campus board and story archive: seasons, barriers, routes, no-go zones, and local notes tied to places.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${crimsonPro.variable} h-full antialiased`}
    >
      <body className={`${crimsonPro.className} min-h-full flex flex-col`}>{children}</body>
    </html>
  );
}
