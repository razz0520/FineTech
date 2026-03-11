import { ReactNode } from "react";
import { clsx, type ClassValue } from "clsx";

function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

interface PremiumCardProps {
  children: ReactNode;
  className?: string;
  gradient?: boolean;
}

export function PremiumCard({ children, className, gradient = false }: PremiumCardProps) {
  return (
    <div
      className={cn(
        "premium-card p-6",
        gradient &&
          "after:absolute after:inset-0 after:bg-gradient-to-br after:from-cyan-500/5 after:to-emerald-500/5 after:opacity-100",
        className,
      )}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}
