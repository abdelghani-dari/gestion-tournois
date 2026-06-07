import React from 'react';

interface LeagueHeaderProps {
  tournamentName: string;
  description?: string;
}

export default function LeagueHeader({
  tournamentName,
  description = "Moroccan Elite Football Championship"
}: LeagueHeaderProps) {
  return (
    <div className="sticky top-0 z-30 bg-[#0e0e11]/90 backdrop-blur-sm border-b border-zinc-900/80 py-3 px-4 flex items-center gap-3 select-none text-left">
      {/* Small Logo */}
      <div className="w-8 h-8 rounded bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm flex-shrink-0">
        <span>🏆</span>
      </div>

      {/* Title & Description */}
      <div className="space-y-0.5">
        <h2 className="text-sm font-bold text-zinc-50 tracking-wide leading-tight">{tournamentName}</h2>
        <p className="text-[10px] text-zinc-500 font-medium leading-none">{description}</p>
      </div>
    </div>
  );
}
