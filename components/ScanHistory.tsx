"use client";

const FRENCH_MONTHS = [
  "janvier", "f\u00e9vrier", "mars", "avril", "mai", "juin",
  "juillet", "ao\u00fbt", "septembre", "octobre", "novembre", "d\u00e9cembre",
];

interface Opportunity {
  name: string;
  tagline: string;
  scores: {
    urgence: number;
    faisabilite: number;
    rentabilite: number;
    competition: number;
    timing: number;
  };
}

interface Scan {
  id: string;
  scan_date: string;
  market_pulse: string;
  opportunities: Opportunity[];
  status: string;
}

interface ScanHistoryProps {
  scans: Scan[];
  onSelectScan: (scanId: string) => void;
}

function formatFrenchDate(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = FRENCH_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export default function ScanHistory({ scans, onSelectScan }: ScanHistoryProps) {
  return (
    <div>
      {/* Title */}
      <h3 className="text-[16px] font-bold text-[#f1f5f9] mb-4">
        {"\uD83D\uDCDC"} Historique des scans
      </h3>

      {/* Empty state */}
      {scans.length === 0 && (
        <p className="text-[#64748b] text-center py-8">
          Aucun scan pr{"\u00e9"}c{"\u00e9"}dent
        </p>
      )}

      {/* Scan list */}
      <div className="space-y-3">
        {scans.map((scan, index) => {
          const topOpportunities = scan.opportunities.slice(0, 3);

          return (
            <div
              key={scan.id}
              onClick={() => onSelectScan(scan.id)}
              className="bg-[#111827] border border-[#1e293b] rounded-[12px] p-4 cursor-pointer hover:border-[#f59e0b]/30 transition-colors duration-200 animate-fade-in"
              style={{ animationDelay: `${index * 80}ms`, animationFillMode: "both" }}
            >
              {/* Top row: date + opportunity count */}
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <span className="text-[14px] font-semibold text-[#f1f5f9]">
                  {formatFrenchDate(scan.scan_date)}
                </span>
                <span className="text-[12px] text-[#94a3b8] bg-[#0c1222] border border-[#1e293b] rounded-full px-2.5 py-0.5">
                  {scan.opportunities.length} opportunit{"\u00e9"}
                  {scan.opportunities.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Market pulse (truncated to 1 line) */}
              <p className="text-[13px] text-[#94a3b8] line-clamp-1 mb-3 break-words">
                {scan.market_pulse}
              </p>

              {/* Top opportunity badges */}
              {topOpportunities.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {topOpportunities.map((opp) => (
                    <span
                      key={opp.name}
                      className="text-[11px] text-[#94a3b8] bg-[#0c1222] border border-[#1e293b] rounded-md px-2 py-0.5 truncate max-w-[140px]"
                    >
                      {opp.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
