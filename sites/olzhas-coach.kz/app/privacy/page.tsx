import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Политика конфиденциальности — Олжас Кундакбаев",
  robots: { index: false },
};

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[var(--color-ink)] py-32 px-6">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="text-[var(--color-bronze)] text-sm hover:underline mb-10 block"
        >
          ← На главную
        </Link>
        <h1 className="font-serif text-4xl font-light text-white mb-10">
          Политика конфиденциальности
        </h1>
        <div className="flex flex-col gap-6 text-[var(--color-muted)] text-sm leading-relaxed">
          <p>
            Настоящая политика описывает, как обрабатываются персональные данные,
            передаваемые через форму на сайте olzhas-coach.kz.
          </p>
          <h2 className="text-white text-base font-medium mt-4">Какие данные собираются</h2>
          <p>
            При заполнении формы запроса вы передаёте: имя, номер телефона,
            название компании, должность и описание ситуации. Эти данные
            используются исключительно для связи с вами по существу запроса.
          </p>
          <h2 className="text-white text-base font-medium mt-4">Как используются данные</h2>
          <p>
            Данные не передаются третьим лицам, не используются для рекламных
            рассылок и не хранятся в автоматизированных базах данных. Запрос
            передаётся напрямую через мессенджер WhatsApp.
          </p>
          <h2 className="text-white text-base font-medium mt-4">Согласие</h2>
          <p>
            Отправляя форму, вы соглашаетесь с тем, что указанные данные будут
            использованы для ответа на ваш запрос.
          </p>
          <h2 className="text-white text-base font-medium mt-4">Контакт</h2>
          <p>
            По вопросам обработки данных:{" "}
            <a
              href="https://wa.me/77017651460"
              className="text-[var(--color-bronze)] hover:underline"
            >
              +7 701 765 14 60
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
