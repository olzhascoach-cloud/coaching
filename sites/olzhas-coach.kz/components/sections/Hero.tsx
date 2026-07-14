import Image from "next/image";
import { site } from "@/data/site";
import Button from "@/components/ui/Button";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-end md:items-center bg-[var(--color-ink)] overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-olzhas.jpg"
          alt="Олжас Кундакбаев"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(12,13,14,0.85)] via-[rgba(12,13,14,0.6)] to-[rgba(12,13,14,0.2)] md:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(12,13,14,0.7)] via-transparent to-transparent md:hidden" />
      </div>

      <div className="relative z-10 w-full mx-auto max-w-6xl px-6 lg:px-12 pb-20 pt-32 md:py-32">
        <div className="max-w-2xl">
          <p className="mb-6 text-[11px] tracking-[0.2em] uppercase text-[var(--color-bronze)] font-medium">
            Бизнес-наставник · ICF PCC
          </p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-[56px] font-light leading-[1.1] text-white mb-6">
            Помогаю собственникам принимать решения,{" "}
            <em className="not-italic text-[var(--color-bronze)]">
              которые меняют бизнес и жизнь
            </em>
          </h1>
          <p className="text-[var(--color-muted)] text-base md:text-lg leading-relaxed mb-10 max-w-xl">
            25 лет в предпринимательстве. 17 созданных проектов. Более 1 000 часов
            личной работы с предпринимателями и командами. Без теории со стороны —
            только опыт человека, который сам строил, терял, начинал заново и
            масштабировал.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Button href={site.whatsapp} external>
              Обсудить мою ситуацию
            </Button>
            <Button href="#experience" variant="ghost">
              Посмотреть опыт
            </Button>
          </div>
          <p className="mt-6 text-[12px] text-[var(--color-muted-2)] tracking-wide">
            В работу принимается ограниченное число собственников и команд
          </p>
        </div>
      </div>
    </section>
  );
}
