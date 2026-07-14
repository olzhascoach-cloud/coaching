import Link from "next/link";
import { site } from "@/data/site";

export default function Footer() {
  return (
    <footer className="bg-[var(--color-ink-2)] border-t border-[rgba(183,162,122,0.08)]">
      <div className="mx-auto max-w-6xl px-6 lg:px-12 py-12 md:py-16">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <div>
            <p className="text-white font-medium mb-1">{site.name}</p>
            <p className="text-[12px] text-[var(--color-muted)] tracking-[0.1em] uppercase">
              {site.tagline}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              href={site.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-muted)] hover:text-[var(--color-bronze)] text-sm transition-colors"
            >
              {site.whatsappNumber}
            </Link>
            <Link
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-muted)] hover:text-[var(--color-bronze)] text-sm transition-colors"
            >
              Instagram
            </Link>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-[rgba(255,255,255,0.05)] flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p className="text-[12px] text-[var(--color-muted-2)]">
            © {site.year} {site.name}
          </p>
          <Link
            href="/privacy"
            className="text-[12px] text-[var(--color-muted-2)] hover:text-[var(--color-muted)] transition-colors"
          >
            Политика конфиденциальности
          </Link>
        </div>
      </div>
    </footer>
  );
}
