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

const schemaOrg = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://olzhas-coach.kz/#person",
      name: "Олжас Кундакбаев",
      url: "https://olzhas-coach.kz",
      image: "https://olzhas-coach.kz/images/hero-olzhas.jpg",
      jobTitle: "Бизнес-наставник, ICF PCC коуч",
      description:
        "Предприниматель и бизнес-наставник с 25-летним опытом. Создал 17 проектов. Сертифицированный коуч ICF PCC. Помогает собственникам бизнеса принимать стратегические решения.",
      sameAs: [
        "https://www.instagram.com/olzhas_kundakbayev/",
      ],
      knowsAbout: [
        "бизнес-коучинг",
        "стратегия",
        "предпринимательство",
        "командный коучинг",
      ],
    },
    {
      "@type": "ProfessionalService",
      "@id": "https://olzhas-coach.kz/#service",
      name: "Олжас Кундакбаев — Бизнес-наставник",
      url: "https://olzhas-coach.kz",
      description:
        "Стратегические сессии, личное сопровождение собственников бизнеса, работа с управленческими командами. ICF PCC коучинг.",
      provider: { "@id": "https://olzhas-coach.kz/#person" },
      areaServed: ["Казахстан", "СНГ"],
      serviceType: "Бизнес-коучинг и наставничество",
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+7-701-765-14-60",
        contactType: "customer service",
        availableLanguage: ["Russian", "Kazakh"],
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`${cormorant.variable} ${manrope.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
