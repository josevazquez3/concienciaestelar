import type { Metadata } from "next";
import { Cinzel, Inter, Lato } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  style: ["normal", "italic"],
  variable: "--font-lato",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Consciencia Estelar | Una nueva humanidad está emergiendo",
  description:
    "Un espacio de encuentro para volver a mirar el cielo y reconocerte en él. Plataforma de acompañamiento espiritual y astrológico.",
  keywords: [
    "astrología",
    "membresía",
    "acompañamiento espiritual",
    "consciencia estelar",
  ],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-AR"
      className={`${cinzel.variable} ${lato.variable} ${inter.variable}`}
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
