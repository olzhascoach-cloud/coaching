import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { cases } from "@/data/cases";

export default function Cases() {
  return (
    <section id="cases" className="py-24 md:py-32 bg-[var(--color-ink-2)]">
      <Container>
        <SectionHeading
          kicker="Кейсы"
          title="Результаты в&nbsp;реальных историях"
          subtitle="Конкретные ситуации, конкретные изменения."
        />
        <div className="mt-16 grid md:grid-cols-2 gap-6">
          {cases.map((c) => (
            <div
              key={c.id}
              className="border border-[rgba(183,162,122,0.1)] bg-[var(--color-ink)] p-8 md:p-10 flex flex-col gap-6"
            >
              {/* TODO: replace with verified case */}
              <div className="flex flex-col gap-1">
                <p className="text-white font-medium">{c.name}</p>
                <p className="text-[12px] text-[var(--color-muted)] tracking-wide">
                  {c.role} · {c.company}
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-[10px] tracking-[0.15em] uppercase text-[var(--color-bronze)] mb-2">
                    Было
                  </p>
                  <p className="text-[var(--color-muted)] text-sm leading-relaxed">{c.situation}</p>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.15em] uppercase text-[var(--color-bronze)] mb-2">
                    Работа
                  </p>
                  <p className="text-[var(--color-muted)] text-sm leading-relaxed">{c.work}</p>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.15em] uppercase text-[var(--color-bronze)] mb-2">
                    Результат
                  </p>
                  <p className="text-white text-sm leading-relaxed">{c.result}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
