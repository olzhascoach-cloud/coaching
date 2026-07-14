import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["cyrillic", "latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["cyrillic", "latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Олжас Кундакбаев — Бизнес-наставник для предпринимателей",
  description:
    "25 лет в предпринимательстве. Помогаю собственникам принимать решения, которые меняют бизнес и жизнь. Стратегические сессии, личное сопровождение, работа с командами. Алматы, Казахстан.",
  keywords: [
    "бизнес-наставник",
    "бизнес-коуч Казахстан",
    "коуч ICF Алматы",
    "стратегическая сессия для собственника",
    "командный коучинг",
    "сопровождение предпринимателей",
    "Олжас Кундакбаев",
  ],
  authors: [{ name: "Олжас Кундакбаев" }],
  creator: "Олжас Кундакбаев",
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "https://olzhas-coach.kz",
    siteName: "Олжас Кундакбаев",
    title: "Олжас Кундакбаев — Бизнес-наставник для предпринимателей",
    description:
      "Помогаю собственникам принимать решения, которые меняют бизнес и жизнь. 25 лет в предпринимательстве, ICF-коуч.",
    images: [
      {
        url: "/images/hero-olzhas.jpg",
        width: 1200,
        height: 630,
        alt: "Олжас Кундакбаев",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Олжас Кундакбаев — Бизнес-наставник для предпринимателей",
    description:
      "Помогаю собственникам принимать решения, которые меняют бизнес и жизнь.",
    images: ["/images/hero-olzhas.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  metadataBase: new URL("https://olzhas-coach.kz"),
  alternates: {
    canonical: "https://olzhas-coach.kz",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`${cormorant.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}
