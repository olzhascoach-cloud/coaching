import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Link from "next/link";

const mediaItems = [
  {
    outlet: "@parus.kapchagay",
    type: "Instagram",
    url: "https://www.instagram.com/parus.kapchagay/",
    desc: "Проекты, тимбилдинги, регаты",
    verified: true,
  },
  {
    outlet: "@parus.kapchagay",
    type: "Отзыв — коуч-сессия",
    url: "https://www.instagram.com/p/DZh_iu6slXp/",
    desc: "«Мы проходим коуч-сессию — Ромб ясности»",
    verified: true,
  },
  {
    outlet: "@parus.kapchagay",
    type: "Отзыв — тимбилдинг",
    url: "https://www.instagram.com/p/DaAjaFGM-4p/",
    desc: "Командный тимбилдинг на яхтах",
    verified: true,
  },
  {
    outlet: "@parus.kapchagay",
    type: "Отзыв — тимбилдинг",
    url: "https://www.instagram.com/p/DZz0FJZMOjf/",
    desc: "Командный тимбилдинг на яхтах",
    verified: true,
  },
  {
    outlet: "Forbes Kazakhstan",
    type: "Публикация",
    url: "#",
    desc: "Упоминание в материалах",
    verified: false,
  },
  {
    outlet: "Tengrinews / Zakon.kz",
    type: "Интервью",
    url: "#",
    desc: "Публикации и интервью",
    verified: false,
  },
];

export default function Media() {
  return (
    <section className="py-24 md:py-32 bg-[var(--color-ink-2)]">
      <Container>
        <SectionHeading
          kicker="Публичный опыт"
          title="Медиа и&nbsp;выступления"
          subtitle="Интервью, публикации, конференции, отзывы."
        />
        <div className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-px bg-[rgba(183,162,122,0.08)]">
          {mediaItems.map((item, i) => (
            <Link
              key={i}
              href={item.url}
              className="group bg-[var(--color-ink-2)] p-8 flex flex-col gap-3 hover:bg-[var(--color-ink-3)] transition-colors"
              {...(item.url !== "#"
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              <span className="text-[10px] tracking-[0.15em] uppercase text-[var(--color-bronze)]">
                {item.type}
              </span>
              <span className="text-white font-medium group-hover:text-[var(--color-bronze)] transition-colors">
                {item.outlet}
              </span>
              <span className="text-[12px] text-[var(--color-muted-2)] leading-relaxed">
                {item.desc}
              </span>
              {item.url !== "#" && (
                <span className="text-[11px] text-[var(--color-bronze)] mt-auto">
                  Открыть →
                </span>
              )}
            </Link>
          ))}
        </div>
        <p className="mt-6 text-[12px] text-[var(--color-muted-2)]">
          * Ссылки на Forbes и Tengrinews будут добавлены после верификации
        </p>
      </Container>
    </section>
  );
}
