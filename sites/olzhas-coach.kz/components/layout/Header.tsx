"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { site } from "@/data/site";
import MobileMenu from "./MobileMenu";

const navLinks = [
  { href: "#approach", label: "Подход" },
  { href: "#experience", label: "Опыт" },
  { href: "#services", label: "Форматы" },
  { href: "#cases", label: "Кейсы" },
  { href: "#about", label: "Обо мне" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[rgba(12,13,14,0.95)] backdrop-blur-md border-b border-[rgba(183,162,122,0.08)]"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-6xl px-6 lg:px-12 flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div>
            <Link href="/" className="block">
              <span className="text-white font-medium text-base leading-tight">
                Олжас Кундакбаев
              </span>
              <span className="block text-[10px] tracking-[0.12em] text-[var(--color-muted)] uppercase mt-0.5">
                Предприниматель · Наставник · ICF
              </span>
            </Link>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[13px] text-[var(--color-muted)] hover:text-white tracking-[0.06em] transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={site.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-4 inline-flex items-center min-h-[40px] px-5 text-[12px] font-medium tracking-[0.08em] uppercase bg-[var(--color-bronze)] text-[var(--color-ink)] hover:bg-[#cbb98c] transition-colors"
            >
              Обсудить задачу
            </Link>
          </nav>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-[5px]"
            aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={menuOpen}
          >
            <span
              className={`block w-6 h-px bg-white transition-all duration-300 ${
                menuOpen ? "translate-y-[6px] rotate-45" : ""
              }`}
            />
            <span
              className={`block w-6 h-px bg-white transition-all duration-300 ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block w-6 h-px bg-white transition-all duration-300 ${
                menuOpen ? "-translate-y-[6px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
