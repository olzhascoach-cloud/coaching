import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";

const reviews = [
  {
    name: "Айгерим Досова",
    role: "Основатель агентства недвижимости, Алматы",
    text: "После одной сессии с Олжасом я наконец поняла, почему третий год топчусь на месте. Он задаёт вопросы, от которых невозможно уйти. Через месяц подписала два крупнейших контракта в истории компании.",
  },
  {
    name: "Данияр Сейткалиев",
    role: "CEO IT-компании, 80+ сотрудников",
    text: "Пришёл с запросом — как выйти из операционки. Ушёл с пониманием, что сначала нужно решить вопрос доверия в команде. Три месяца сопровождения изменили и бизнес, и меня как человека.",
  },
  {
    name: "Жанна Мусина",
    role: "Со-основатель e-commerce компании",
    text: "Тимбилдинг на яхтах — это не просто приключение. Там всё по-настоящему: кто лидер, кто не слышит команду, где у нас провалы в коммуникации. Олжас переводит происходящее на воде в конкретный бизнес-язык.",
  },
];

export default function Cases() {
  return (
    <section id="cases" className="py-16 md:py-24 bg-[var(--color-ink-2)]">
      <Container>
        <SectionHeading
          kicker="Отзывы"
          title="Что говорят клиенты"
        />
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <div
              key={i}
              className="flex flex-col p-8 border border-[rgba(183,162,122,0.12)] bg-[var(--color-ink)] hover:border-[rgba(183,162,122,0.3)] transition-colors"
            >
              <div className="mb-5">
                <svg width="24" height="18" viewBox="0 0 24 18" fill="none">
                  <path
                    d="M0 18V10.8C0 4.8 3.6 1.2 10.8 0l1.2 2.4C8.4 3.6 6.6 5.4 6 8.4H10.8V18H0ZM13.2 18V10.8C13.2 4.8 16.8 1.2 24 0l1.2 2.4C21.6 3.6 19.8 5.4 19.2 8.4H24V18H13.2Z"
                    fill="var(--color-bronze)"
                    fillOpacity="0.4"
                  />
                </svg>
              </div>
              <p className="text-[var(--color-muted)] text-sm leading-relaxed flex-1">
                {r.text}
              </p>
              <div className="mt-6 pt-6 border-t border-[rgba(255,255,255,0.06)]">
                <p className="text-white text-sm font-medium">{r.name}</p>
                <p className="text-[var(--color-bronze)] text-[11px] mt-1 tracking-wide">
                  {r.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
