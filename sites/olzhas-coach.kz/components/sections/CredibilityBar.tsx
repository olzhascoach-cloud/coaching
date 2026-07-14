import { stats } from "@/data/stats";

export default function CredibilityBar() {
  return (
    <section className="bg-[var(--color-ink-2)] border-y border-[rgba(183,162,122,0.1)]">
      <div className="mx-auto max-w-6xl px-6 lg:px-12 py-12 md:py-14">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 md:gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1">
              <span className="font-serif text-3xl md:text-4xl font-light text-white leading-none">
                {stat.value}
              </span>
              <span className="text-[12px] text-[var(--color-muted)] leading-tight mt-1">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
