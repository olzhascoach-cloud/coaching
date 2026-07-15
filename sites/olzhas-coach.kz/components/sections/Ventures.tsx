import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { ventures } from "@/data/ventures";
import Image from "next/image";

export default function Ventures() {
  return (
    <section id="experience" className="py-24 md:py-32 bg-[var(--color-ink)]">
      <Container>
        <SectionHeading
          kicker="Проекты и опыт"
          title="Опыт, за которым стоят реальные&nbsp;проекты"
        />
        <div className="mt-16 grid md:grid-cols-2 gap-6">
          {ventures.map((v) => (
            <div
              key={v.id}
              className="bg-[var(--color-ink-2)] border border-[rgba(183,162,122,0.1)] flex flex-col hover:border-[rgba(183,162,122,0.25)] transition-colors overflow-hidden"
            >
              {v.image && v.id === "parusa" && (
                <div className="relative h-48 w-full">
                  <Image
                    src={v.image}
                    alt={v.title}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(23,25,27,0.9)] to-transparent" />
                </div>
              )}
              <div className="p-8 md:p-10 flex flex-col gap-4 flex-1">
                {v.image && v.id !== "parusa" && (
                  <div className="h-10 flex items-center">
                    <Image
                      src={v.image}
                      alt={v.title}
                      width={120}
                      height={40}
                      className="object-contain object-left max-h-10 w-auto opacity-80"
                    />
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {v.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] tracking-[0.15em] uppercase text-[var(--color-bronze)] border border-[rgba(183,162,122,0.25)] px-2.5 py-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="font-serif text-3xl font-light text-white">{v.title}</h3>
                <p className="text-[var(--color-bronze)] text-sm tracking-wide">{v.subtitle}</p>
                <p className="text-[var(--color-muted)] text-sm leading-relaxed">{v.description}</p>
                <div className="mt-auto pt-4 border-t border-[rgba(255,255,255,0.05)]">
                  <p className="text-white text-sm italic leading-relaxed">{v.insight}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
