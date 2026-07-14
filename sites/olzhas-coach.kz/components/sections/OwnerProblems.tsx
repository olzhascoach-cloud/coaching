import SectionHeading from "@/components/ui/SectionHeading";
import Container from "@/components/layout/Container";

const situations = [
  "Бизнес упёрся в потолок.",
  "Собственник остаётся главным узким местом.",
  "Команда ждёт всех решений сверху.",
  "Партнёры перестали слышать друг друга.",
  "Есть деньги и результаты, но пропал смысл.",
  "Нужно принять решение, которое нельзя делегировать.",
];

export default function OwnerProblems() {
  return (
    <section className="py-24 md:py-32 bg-[var(--color-ink)]">
      <Container>
        <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-start">
          <SectionHeading
            kicker="Когда нужен не ещё один консультант"
            title="В какой-то момент проблема бизнеса перестаёт быть только&nbsp;бизнес-проблемой"
            subtitle="Компания может расти, а собственник — терять свободу. Команда может увеличиваться, а решений на вашем столе становится только больше."
          />
          <div className="flex flex-col gap-0">
            {situations.map((text, i) => (
              <div
                key={i}
                className="flex items-start gap-4 py-5 border-b border-[rgba(255,255,255,0.06)] last:border-0"
              >
                <span className="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full border border-[rgba(183,162,122,0.3)] flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-bronze)]" />
                </span>
                <p className="text-[var(--color-muted)] text-base leading-relaxed">
                  {text}
                </p>
              </div>
            ))}
            <p className="mt-8 text-white text-base leading-relaxed">
              В таких ситуациях редко не хватает информации. Чаще не хватает
              ясности, честного разговора и сильного собеседника, который способен
              увидеть всю систему.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
