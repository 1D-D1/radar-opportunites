"use client";

interface MarketPulseProps {
  pulse: string;
  scanDate: string;
}

function formatDateFrench(isoDate: string): string {
  const date = new Date(isoDate);
  const months = [
    "janvier", "f\u00e9vrier", "mars", "avril", "mai", "juin",
    "juillet", "ao\u00fbt", "septembre", "octobre", "novembre", "d\u00e9cembre",
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
        border-l-2 border-l-[#f59e0b]
        bg-gradient-to-r from-[#0c1222] to-[#111827]
        p-4 sm:p-5
      "
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
            {"\uD83D\uDCE1"} Pouls du march{"\u00e9"}
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-[#94a3b8] break-words">
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
