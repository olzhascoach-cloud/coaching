import Container from "@/components/layout/Container";

const fits = [
  "У вас есть действующий бизнес или серьёзный предпринимательский опыт",
  "Вы готовы честно смотреть на ситуацию",
  "Вы ищете не мотивацию, а изменения",
  "Вы готовы принимать решения и действовать",
  "Вам нужен сильный разговор на равных",
];

const notFits = [
  "Если нужен волшебный совет за одну встречу",
  "Если вся ответственность должна остаться на консультанте",
  "Если вы хотите подтвердить уже принятое решение",
  "Если вы пока не готовы ничего менять",
];

export default function Qualification() {
  return (
    <section className="py-24 md:py-32 bg-[var(--color-warm)]">
      <Container>
        <p className="mb-4 text-[11px] tracking-[0.2em] uppercase text-[var(--color-bronze)] font-medium">
          Квалификация
        </p>
        <h2 className="font-serif text-4xl md:text-5xl font-light text-[var(--color-ink)] mb-16">
          Мы подойдём друг другу,&nbsp;если…
        </h2>
        <div className="grid md:grid-cols-2 gap-12 md:gap-16">
          <div>
            <p className="text-[11px] tracking-[0.15em] uppercase text-[#3a7a3a] font-medium mb-6">
              Подходит
            </p>
            <div className="flex flex-col gap-0">
              {fits.map((text, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 py-4 border-b border-[rgba(12,13,14,0.08)] last:border-0"
                >
                  <span className="flex-shrink-0 mt-1 text-[#3a7a3a] text-lg leading-none">✓</span>
                  <p className="text-[var(--color-ink)] text-base leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] tracking-[0.15em] uppercase text-[#8a4040] font-medium mb-6">
              Не подходит
            </p>
            <div className="flex flex-col gap-0">
              {notFits.map((text, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 py-4 border-b border-[rgba(12,13,14,0.08)] last:border-0"
                >
                  <span className="flex-shrink-0 mt-1 text-[#8a4040] text-lg leading-none">×</span>
                  <p className="text-[var(--color-ink-3)] text-base leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
