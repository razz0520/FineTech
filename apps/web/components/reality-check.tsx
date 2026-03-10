"use client";

import { usePathname } from "next/navigation";

const DATA: Record<string, string> = {
  "/dashboard":
    "You are confusing nominal balance with actual wealth; without automated savings, your 'net worth' is merely a transient accounting error.",
  "/learn":
    "Theoretical knowledge without capital deployment is just entertainment; your 1250 XP is worth exactly $0 in a liquidity crisis.",
  "/playground":
    "A predictive model with 0.82 confidence is still a coin flip in a black-swan event; the market does not care about your 'Attention Weights'.",
  "/portfolio":
    "Your Tech Concentration Risk is at 100%. Diversification is the only free lunch, and you are currently starving by choice.",
  "/advisor":
    "Seeking advice is a signal of uncertainty. In high-stakes finance, uncertainty is the primary driver of liquidation.",
  default:
    "The spreadsheet does not lie, but your perception does. Performance is the only metric that survives the audit.",
};

export function StrategicRealityCheck() {
  const pathname = usePathname();
  const truth = DATA[pathname] || DATA.default;

  return (
    <div className="mt-12 pt-8 border-t border-white/5 animate-fade-in">
      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">
        [CALC] Strategic Reality Check
      </h3>
      <div className="glass-panel p-6 rounded-2xl border-rose-500/10 bg-rose-500/5 group hover:bg-rose-500/10 transition-all duration-500">
        <p className="text-sm font-mono text-slate-400 leading-relaxed italic group-hover:text-slate-300 transition-colors">
          &quot;{truth}&quot;
        </p>
      </div>
    </div>
  );
}
