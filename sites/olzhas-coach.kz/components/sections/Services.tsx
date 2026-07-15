import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { services } from "@/data/services";
import Button from "@/components/ui/Button";

export default function Services() {
  return (
    <section id="services" className="py-16 md:py-20 bg-[var(--color-ink)]">
      <Container>
        <SectionHeading
          kicker="Форматы работы"
          title="Три направления"
          subtitle="Без тарифов и пакетов. Формат определяется после понимания задачи."
        />
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <div
              key={s.id}
              className={`flex flex-col p-8 md:p-10 border ${
                i === 1
                  ? "border-[rgba(183,162,122,0.4)] bg-[rgba(183,162,122,0.04)]"
                  : "border-[rgba(255,255,255,0.07)] bg-[var(--color-ink-2)]"
              }`}
            >
              <h3 className="font-serif text-2xl md:text-3xl font-light text-white leading-snug mb-4">
                {s.title}
              </h3>
              <p className="text-[var(--color-muted)] text-sm leading-relaxed mb-6">
                {s.description}
              </p>
              <ul className="flex flex-col gap-2 mb-8">
                {s.suitableFor.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-[var(--color-muted)]">
                    <span className="flex-shrink-0 w-1 h-1 rounded-full bg-[var(--color-bronze)] mt-2" />
                    {item}
                  </li>
                ))}
              </ul>
              {s.note && (
                <p className="text-[11px] tracking-[0.1em] uppercase text-[var(--color-bronze)] mb-6">
                  {s.note}
                </p>
              )}
              <div className="mt-auto">
                <Button
                  href={s.ctaLink}
                  variant={i === 1 ? "primary" : "ghost"}
                  external
                  className="w-full justify-center"
                >
                  {s.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
