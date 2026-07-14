import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";

const points = [
  { label: "Начинал и развивал бизнесы", detail: "Не изучал их со стороны" },
  { label: "Создавал команды", detail: "И знает, где они ломаются" },
  { label: "Проходил кризисы", detail: "Не как наблюдатель, а как автор решений" },
  { label: "Создавал технологические продукты", detail: "QR-платежи, электронное подписание" },
  { label: "Стал ICF-коучем", detail: "Не вместо предпринимательства, а в дополнение к нему" },
];

export default function Difference() {
  return (
    <section id="approach" className="py-24 md:py-32 bg-[var(--color-warm)]">
      <Container>
        <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-start">
          <div>
            <SectionHeading
              kicker="Чем я отличаюсь"
              title="Я знаю бизнес не только со стороны&nbsp;успеха"
              light
            />
            <blockquote className="mt-10 pl-6 border-l-2 border-[var(--color-bronze)]">
              <p className="font-serif text-2xl md:text-3xl font-light text-[var(--color-ink)] leading-snug italic">
                «Из 17 созданных мной стартапов десять не стали успешными.
                Именно поэтому я умею видеть не только возможности, но и цену
                ошибки».
              </p>
            </blockquote>
          </div>
          <div className="flex flex-col gap-0">
            {points.map((p, i) => (
              <div
                key={i}
                className="py-5 border-b border-[rgba(12,13,14,0.08)] last:border-0"
              >
                <p className="text-[var(--color-ink)] font-medium text-base">{p.label}</p>
                <p className="text-[var(--color-muted-2)] text-sm mt-1">{p.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
