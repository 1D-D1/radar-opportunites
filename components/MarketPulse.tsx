"use client";

interface MarketPulseProps {
  pulse: string;
  scanDate: string;
}

function formatDateFrench(isoDate: string): string {
  const date = new Date(isoDate);
  const months = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre",
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export default function MarketPulse({ pulse, scanDate }: MarketPulseProps) {
  return (
    <div
      className="
        animate-fade-in
        rounded-[16px]
        border border-[#1e293b]
        border-l-2 border-l-[#6366f1]
        bg-gradient-to-r from-[#0c1222] to-[#111827]
        p-5
      "
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
            📡 Pouls du marché
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-[#94a3b8]">
            {pulse}
          </p>
        </div>

        <span className="shrink-0 text-[11px] font-bold uppercase tracking-wider text-[#64748b] sm:text-right">
          {formatDateFrench(scanDate)}
        </span>
      </div>
    </div>
  );
}
