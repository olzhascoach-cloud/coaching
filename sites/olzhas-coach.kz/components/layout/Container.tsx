import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  narrow?: boolean;
}

export default function Container({ children, className = "", narrow }: ContainerProps) {
  return (
    <div
      className={`mx-auto w-full px-6 lg:px-12 ${narrow ? "max-w-3xl" : "max-w-6xl"} ${className}`}
    >
      {children}
    </div>
  );
}
