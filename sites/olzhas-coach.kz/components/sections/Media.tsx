import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Link from "next/link";

// TODO: replace with verified media mentions + real logos
const mediaItems = [
  { outlet: "Forbes Kazakhstan", type: "Статья", url: "#", verified: false },
  { outlet: "Tengrinews", type: "Интервью", url: "#", verified: false },
  { outlet: "Zakon.kz", type: "Публикация", url: "#", verified: false },
  { outlet: "Радио", type: "Эфир", url: "#", verified: false },
  { outlet: "Конференции", type: "Выступление", url: "#", verified: false },
  { outlet: "Подкасты", type: "Подкаст", url: "#", verified: false },
];

export default function Media() {
  return (
    <section className="py-24 md:py-32 bg-[var(--color-ink-2)]">
      <Container>
        <SectionHeading
          kicker="Публичный опыт"
          title="Медиа и&nbsp;выступления"
          subtitle="Интервью, публикации, конференции, эфиры."
        />
        <div className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-px bg-[rgba(183,162,122,0.08)]">
          {mediaItems.map((item, i) => (
            <Link
              key={i}
              href={item.url}
              className="group bg-[var(--color-ink-2)] p-8 flex flex-col gap-3 hover:bg-[var(--color-ink-3)] transition-colors"
              {...(item.url !== "#" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              <span className="text-[10px] tracking-[0.15em] uppercase text-[var(--color-bronze)]">
                {item.type}
              </span>
              <span className="text-white font-medium group-hover:text-[var(--color-bronze)] transition-colors">
                {item.outlet}
              </span>
              {item.url !== "#" && (
                <span className="text-[12px] text-[var(--color-muted-2)]">Читать →</span>
              )}
            </Link>
          ))}
        </div>
        <p className="mt-6 text-[12px] text-[var(--color-muted-2)]">
          * Ссылки на реальные публикации будут добавлены после верификации
        </p>
      </Container>
    </section>
  );
}
