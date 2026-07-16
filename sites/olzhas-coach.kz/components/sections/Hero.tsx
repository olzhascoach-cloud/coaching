import Image from "next/image";
import { site } from "@/data/site";
import Button from "@/components/ui/Button";

export default function Hero() {
  return (
    <section className="min-h-screen flex bg-[var(--color-ink)]">
      {/* Left — text */}
      <div className="flex flex-col justify-center w-full md:w-1/2 px-8 lg:px-16 pt-28 pb-16 md:py-32 order-2 md:order-1">
        <p className="mb-6 text-[11px] tracking-[0.2em] uppercase text-[var(--color-bronze)] font-medium">
          Бизнес-наставник · ICF PCC
        </p>
        <h1 className="font-serif text-4xl lg:text-[50px] font-light leading-[1.1] text-white mb-6">
          Помогаю собственникам принимать решения,{" "}
          <em className="not-italic text-[var(--color-bronze)]">
            которые меняют бизнес и жизнь
          </em>
        </h1>
        <p className="text-[var(--color-muted)] text-base leading-relaxed mb-10 max-w-md">
          25 лет в предпринимательстве. 17 созданных проектов. Более 1 000 часов
          личной работы с предпринимателями и командами.
        </p>
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <Button href={site.whatsapp} external>
            Написать в WhatsApp
          </Button>
          <Button href="#services" variant="ghost">
            Форматы работы
          </Button>
        </div>
        <p className="mt-6 text-[12px] text-[var(--color-muted-2)] tracking-wide">
          В работу принимается ограниченное число собственников
        </p>
      </div>

      {/* Right — photo */}
      <div className="hidden md:block relative w-1/2 order-1 md:order-2">
        <Image
          src="/images/hero-olzhas.jpg"
          alt="Олжас Кундакбаев"
          fill
          priority
          className="object-cover object-center"
          sizes="50vw"
        />
        {/* subtle left-edge fade to blend with text panel */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-ink)] via-transparent to-transparent w-1/3" />
      </div>

      {/* Mobile: photo as background behind text */}
      <div className="absolute inset-0 md:hidden">
        <Image
          src="/images/hero-olzhas.jpg"
          alt="Олжас Кундакбаев"
          fill
          priority
          className="object-cover object-top"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(12,13,14,0.55)] via-[rgba(12,13,14,0.7)] to-[rgba(12,13,14,0.95)]" />
      </div>
    </section>
  );
}
