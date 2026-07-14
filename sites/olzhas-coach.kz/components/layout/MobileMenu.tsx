"use client";
import { useEffect } from "react";
import Link from "next/link";
import { site } from "@/data/site";

const navLinks = [
  { href: "#approach", label: "Подход" },
  { href: "#experience", label: "Опыт" },
  { href: "#services", label: "Форматы" },
  { href: "#cases", label: "Кейсы" },
  { href: "#about", label: "Обо мне" },
];

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <div
      className={`fixed inset-0 z-40 flex flex-col bg-[var(--color-ink)] transition-opacity duration-300 ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <div className="flex-1 flex flex-col justify-center px-8 gap-8">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="font-serif text-4xl font-light text-white hover:text-[var(--color-bronze)] transition-colors"
          >
            {link.label}
          </Link>
        ))}
        <Link
          href={site.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="mt-4 inline-flex items-center justify-center min-h-[52px] px-8 bg-[var(--color-bronze)] text-[var(--color-ink)] text-sm font-medium tracking-[0.08em] uppercase"
        >
          Обсудить задачу
        </Link>
      </div>
    </div>
  );
}
