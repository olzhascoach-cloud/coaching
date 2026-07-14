"use client";
import { useState } from "react";
import Container from "@/components/layout/Container";
import { site } from "@/data/site";

const formats = [
  "Стратегическая встреча",
  "Личное сопровождение",
  "Работа с командой",
  "Не знаю пока — хочу обсудить",
];

export default function FinalCTA() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [situation, setSituation] = useState("");
  const [format, setFormat] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError("Пожалуйста, укажите имя и телефон");
      return;
    }
    setError("");
    const msg = encodeURIComponent(
      `Здравствуйте, Олжас!\n\nИмя: ${name}\nТелефон: ${phone}${company ? `\nКомпания: ${company}` : ""}${role ? `\nРоль: ${role}` : ""}${format ? `\nФормат: ${format}` : ""}${situation ? `\n\nСитуация:\n${situation}` : ""}`
    );
    window.open(`https://wa.me/77017651460?text=${msg}`, "_blank");
    setSubmitted(true);
  }

  return (
    <section id="contact" className="py-24 md:py-32 bg-[var(--color-ink)]">
      <Container narrow>
        <div className="text-center mb-16">
          <p className="mb-4 text-[11px] tracking-[0.2em] uppercase text-[var(--color-bronze)] font-medium">
            Начать разговор
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-light text-white leading-[1.1] mb-6">
            Возможно, вам не нужен коуч.{" "}
            <br className="hidden md:block" />
            <em className="not-italic text-[var(--color-bronze)]">
              Возможно, вам нужен другой уровень разговора.
            </em>
          </h2>
          <p className="text-[var(--color-muted)] text-base leading-relaxed max-w-xl mx-auto">
            Коротко опишите ситуацию, которую вы сейчас решаете. Я лично
            посмотрю запрос и скажу, могу ли быть полезен.
          </p>
        </div>

        {submitted ? (
          <div className="text-center py-12">
            <p className="text-white text-xl font-light mb-3">Запрос отправлен</p>
            <p className="text-[var(--color-muted)]">
              Ваше сообщение открыто в WhatsApp. После знакомства мы вместе
              решим, есть ли смысл работать дальше.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Honeypot */}
            <input type="text" name="_trap" className="hidden" tabIndex={-1} autoComplete="off" />

            <div className="grid md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] tracking-[0.12em] uppercase text-[var(--color-muted)]">
                  Имя *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ваше имя"
                  className="bg-[var(--color-ink-2)] border border-[rgba(255,255,255,0.08)] text-white placeholder-[var(--color-muted-2)] px-4 py-3.5 text-sm focus:outline-none focus:border-[rgba(183,162,122,0.4)] transition-colors"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] tracking-[0.12em] uppercase text-[var(--color-muted)]">
                  WhatsApp *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 777 000 00 00"
                  className="bg-[var(--color-ink-2)] border border-[rgba(255,255,255,0.08)] text-white placeholder-[var(--color-muted-2)] px-4 py-3.5 text-sm focus:outline-none focus:border-[rgba(183,162,122,0.4)] transition-colors"
                  required
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] tracking-[0.12em] uppercase text-[var(--color-muted)]">
                  Компания
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Название компании"
                  className="bg-[var(--color-ink-2)] border border-[rgba(255,255,255,0.08)] text-white placeholder-[var(--color-muted-2)] px-4 py-3.5 text-sm focus:outline-none focus:border-[rgba(183,162,122,0.4)] transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] tracking-[0.12em] uppercase text-[var(--color-muted)]">
                  Роль в компании
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Собственник, CEO, партнёр..."
                  className="bg-[var(--color-ink-2)] border border-[rgba(255,255,255,0.08)] text-white placeholder-[var(--color-muted-2)] px-4 py-3.5 text-sm focus:outline-none focus:border-[rgba(183,162,122,0.4)] transition-colors"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] tracking-[0.12em] uppercase text-[var(--color-muted)]">
                Удобный формат
              </label>
              <div className="flex flex-wrap gap-2">
                {formats.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFormat(f)}
                    className={`px-4 py-2 text-sm border transition-colors ${
                      format === f
                        ? "border-[var(--color-bronze)] bg-[var(--color-bronze-dim)] text-[var(--color-bronze)]"
                        : "border-[rgba(255,255,255,0.08)] text-[var(--color-muted)] hover:border-[rgba(183,162,122,0.3)]"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] tracking-[0.12em] uppercase text-[var(--color-muted)]">
                Краткое описание ситуации
              </label>
              <textarea
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                rows={4}
                placeholder="Что сейчас происходит в бизнесе или жизни. Без лишних деталей — только суть."
                className="bg-[var(--color-ink-2)] border border-[rgba(255,255,255,0.08)] text-white placeholder-[var(--color-muted-2)] px-4 py-3.5 text-sm focus:outline-none focus:border-[rgba(183,162,122,0.4)] transition-colors resize-none"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              className="mt-2 min-h-[52px] bg-[var(--color-bronze)] text-[var(--color-ink)] text-sm font-medium tracking-[0.08em] uppercase hover:bg-[#cbb98c] transition-colors active:scale-[0.99]"
            >
              Отправить запрос
            </button>
            <p className="text-[12px] text-[var(--color-muted-2)] text-center leading-relaxed">
              Запрос не является автоматической записью. После знакомства мы
              вместе решим, есть ли смысл работать дальше.
            </p>
            <div className="text-center pt-2">
              <a
                href={site.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-bronze)] text-sm hover:underline"
              >
                Или написать напрямую в WhatsApp →
              </a>
            </div>
          </form>
        )}
      </Container>
    </section>
  );
}
