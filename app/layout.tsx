import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const DEFAULT_SITE_URL: string =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nantes Transport Assistant 🚌",
  description: "Votre assistant intelligent pour les transports en commun à Nantes (TAN). Trouvez les arrêts et horaires en temps réel.",
  metadataBase: new URL(DEFAULT_SITE_URL),
  openGraph: {
    title: "Nantes Transport Assistant 🚌",
    description:
      "Votre assistant intelligent pour les transports en commun à Nantes (TAN). Trouvez les arrêts et horaires en temps réel.",
    type: "website",
    url: "/",
    images: [
      {
        url: "/opengraph-image.png",
        width: 512,
        height: 512,
        alt: "Nantes Transport Assistant",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
