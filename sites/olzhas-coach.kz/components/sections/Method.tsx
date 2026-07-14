import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";

const steps = [
  {
    num: "01",
    title: "Увидеть реальную ситуацию",
    body: "Отделить факты от эмоций, привычек, ожиданий команды и давления окружения. То, что кажется проблемой, часто не является ею.",
  },
  {
    num: "02",
    title: "Найти решение собственника",
    body: "Не копировать чужую стратегию, а определить решение, которое подходит конкретному человеку, бизнесу и этапу жизни.",
  },
  {
    num: "03",
    title: "Перевести решение в действия",
    body: "Собрать приоритеты, ответственность, сроки и договорённости с командой. Чтобы решение стало движением, а не записью в блокноте.",
  },
];

export default function Method() {
  return (
    <section className="py-24 md:py-32 bg-[var(--color-ink-2)]">
      <Container>
        <SectionHeading
          kicker="Авторский подход"
          title="Я не даю готовых ответов там, где собственник должен найти&nbsp;свой"
          subtitle="Три этапа работы, через которые проходит каждый запрос."
        />
        <div className="mt-16 grid md:grid-cols-3 gap-px bg-[rgba(183,162,122,0.08)]">
          {steps.map((step) => (
            <div
              key={step.num}
              className="bg-[var(--color-ink-2)] p-8 md:p-10 flex flex-col gap-4"
            >
              <span className="font-serif text-5xl font-light text-[rgba(183,162,122,0.3)]">
                {step.num}
              </span>
              <h3 className="text-white text-xl font-medium leading-snug">{step.title}</h3>
              <p className="text-[var(--color-muted)] text-sm leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 pl-6 border-l border-[rgba(183,162,122,0.3)]">
          <p className="text-[var(--color-muted)] text-base leading-relaxed italic max-w-2xl">
            Как в парусном спорте: нельзя управлять ветром, но можно выбрать
            курс, настроить паруса и собрать команду, которая понимает общий
            манёвр.
          </p>
        </div>
      </Container>
    </section>
  );
}
