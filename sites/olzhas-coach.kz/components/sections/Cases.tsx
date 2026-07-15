import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Image from "next/image";
import Link from "next/link";

const reviews = [
  {
    src: "/images/reviews/review-1.jpg",
    url: "https://www.instagram.com/p/DZh_iu6slXp/",
    label: "Коуч-сессия «Ромб ясности»",
  },
  {
    src: "/images/reviews/review-2.jpg",
    url: "https://www.instagram.com/p/DaAjaFGM-4p/",
    label: "Командный тимбилдинг",
  },
  {
    src: "/images/reviews/review-3.jpg",
    url: "https://www.instagram.com/p/DZz0FJZMOjf/",
    label: "Командный тимбилдинг",
  },
];

const companies = [
  { name: "MOST Finance", image: "/images/reviews/review-timb.jpg" },
];

export default function Cases() {
  return (
    <section id="cases" className="py-24 md:py-32 bg-[var(--color-ink-2)]">
      <Container>
        <SectionHeading
          kicker="Отзывы"
          title="Команды, которые уже&nbsp;прошли путь"
          subtitle="Реальные компании. Реальный опыт на воде и в коучинге."
        />

        {/* MOST Finance showcase */}
        <div className="mt-16 relative overflow-hidden h-64 md:h-80">
          <Image
            src="/images/reviews/review-timb.jpg"
            alt="MOST Finance — тимбилдинг на яхтах"
            fill
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[rgba(12,13,14,0.8)] to-transparent" />
          <div className="absolute inset-0 flex items-center px-10 md:px-16">
            <div>
              <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--color-bronze)] mb-3">
                Корпоративный клиент
              </p>
              <p className="font-serif text-3xl md:text-4xl font-light text-white">
                MOST Finance
              </p>
              <p className="text-[var(--color-muted)] text-sm mt-2">
                Командный тимбилдинг · Яхты SB20 · Коучинг ICF
              </p>
            </div>
          </div>
        </div>

        {/* Instagram review grid */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {reviews.map((r, i) => (
            <Link
              key={i}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden block"
            >
              <Image
                src={r.src}
                alt={r.label}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 33vw, 25vw"
              />
              <div className="absolute inset-0 bg-[rgba(12,13,14,0)] group-hover:bg-[rgba(12,13,14,0.4)] transition-colors flex items-end p-3">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-bronze)"
                    strokeWidth="1.8"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                  <span className="text-[11px] text-[var(--color-bronze)]">
                    @parus.kapchagay
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <p className="mt-6 text-[12px] text-[var(--color-muted-2)]">
          Подробные кейсы добавляются с разрешения клиентов
        </p>
      </Container>
    </section>
  );
}
