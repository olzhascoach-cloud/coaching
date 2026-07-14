import { ReactNode } from "react";
import Link from "next/link";

interface ButtonProps {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
  external?: boolean;
}

export default function Button({
  href,
  children,
  variant = "primary",
  className = "",
  external,
}: ButtonProps) {
  const base =
    "inline-flex items-center gap-2 min-h-[48px] px-7 text-sm font-medium tracking-[0.08em] uppercase transition-all duration-200 cursor-pointer select-none";
  const styles = {
    primary:
      "bg-[var(--color-bronze)] text-[var(--color-ink)] hover:bg-[#cbb98c] active:scale-[0.98]",
    ghost:
      "border border-[rgba(183,162,122,0.4)] text-[var(--color-bronze)] hover:border-[var(--color-bronze)] hover:bg-[var(--color-bronze-dim)] active:scale-[0.98]",
  };

  const props = external ? { target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <Link href={href} className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </Link>
  );
}
