interface SectionHeadingProps {
  kicker?: string;
  title: string;
  subtitle?: string;
  light?: boolean;
  center?: boolean;
}

export default function SectionHeading({
  kicker,
  title,
  subtitle,
  light,
  center,
}: SectionHeadingProps) {
  return (
    <div className={center ? "text-center" : ""}>
      {kicker && (
        <p className="mb-4 text-[11px] tracking-[0.2em] uppercase text-[var(--color-bronze)] font-medium">
          {kicker}
        </p>
      )}
      <h2
        className={`font-serif text-4xl md:text-5xl lg:text-6xl font-light leading-[1.1] ${
          light ? "text-[var(--color-ink)]" : "text-white"
        }`}
        dangerouslySetInnerHTML={{ __html: title }}
      />
      {subtitle && (
        <p
          className={`mt-6 text-lg leading-relaxed max-w-2xl ${
            center ? "mx-auto" : ""
          } ${light ? "text-[var(--color-ink-2)]" : "text-[var(--color-muted)]"}`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
