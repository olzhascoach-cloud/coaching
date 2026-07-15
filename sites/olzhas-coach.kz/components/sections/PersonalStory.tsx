import Container from "@/components/layout/Container";
import Image from "next/image";

export default function PersonalStory() {
  return (
    <section id="about" className="py-24 md:py-32 bg-[var(--color-ink-2)]">
      <Container>
        <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-center">
          <div className="aspect-[3/4] bg-[var(--color-ink-3)] relative overflow-hidden">
            <Image
              src="/images/olzhas-portrait.jpg"
              alt="Олжас Кундакбаев"
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div>
            <p className="mb-4 text-[11px] tracking-[0.2em] uppercase text-[var(--color-bronze)] font-medium">
              Обо мне
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-white leading-[1.1] mb-8">
              Бизнес — важная часть жизни. Но не вся&nbsp;жизнь
            </h2>
            <div className="flex flex-col gap-5 text-[var(--color-muted)] text-base leading-relaxed">
              <p>
                Предпринимательство научило меня создавать. Отцовство — отвечать
                не только за себя. Парусный спорт — принимать решения в
                меняющихся условиях. Коучинг — слышать человека за его
                должностью и результатами.
              </p>
              <p>
                Я строил бизнесы с 2000-х. Семь успешных, десять — нет. Создавал
                команды, проходил кризисы, принимал решения в условиях
                неопределённости. Участвовал в более чем 15 международных
                регатах. Написал две книги.
              </p>
              <p>
                В 2020 году получил сертификацию ICF PCC — не чтобы стать коучем
                по профессии, а чтобы помогать предпринимателям точнее. Как
                человек, который был внутри, а не снаружи.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
