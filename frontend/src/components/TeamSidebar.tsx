import  { useState, useMemo } from 'react';

export interface Team {
  id: number;
  name: string;
  shortName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  pts: number;
  position: number;
  logo: string;
}

interface TeamSidebarProps {
  teams: Team[];
  selectedTeam: Team | null;
  onTeamSelect: (team: Team) => void;
}

export default function TeamSidebar({ teams, selectedTeam, onTeamSelect }: TeamSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTeams = useMemo(() => {
    return teams.filter(
      (team) =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.shortName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [teams, searchTerm]);

  return (
    <div className="h-full w-full bg-zinc-950 rounded-lg flex flex-col overflow-hidden text-left font-sans">
      
      {/* Search Header */}
      <div className="p-4 border-b border-zinc-900 bg-zinc-950">
        <div className="relative">
          <input
            type="text"
            placeholder="Search teams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 pl-9 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors font-medium"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 pointer-events-none">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </span>
        </div>
      </div>

      {/* Standings List */}
      <div className="flex-grow overflow-y-auto bg-black p-2 space-y-1.5">
        {filteredTeams.length > 0 ? (
          filteredTeams.map((team) => {
            const isSelected = selectedTeam?.id === team.id;

            return (
              <button
                key={team.id}
                onClick={() => onTeamSelect(team)}
                className={`w-full flex items-center justify-between p-3 rounded border transition-all text-left focus:outline-none relative group ${
                  isSelected
                    ? "border-blue-600 bg-zinc-900 text-zinc-50"
                    : "border-zinc-900 bg-zinc-950/60 hover:border-zinc-800 hover:bg-zinc-900/30 text-zinc-300"
                }`}
              >
                {/* Left side: Rank + Logo + Name */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Clean Standing Rank Number - No border, no bg */}
                  <span className={`w-5 h-6 flex items-center justify-center font-black text-sm flex-shrink-0 select-none ${
                    team.position <= 3 ? "text-blue-500" : "text-zinc-650"
                  }`}>
                    {team.position}
                  </span>

                  {/* Team Logo image - no bg */}
                  <div className="w-9 h-9 flex items-center justify-center flex-shrink-0 p-0.5">
                    <img
                      src={team.logo}
                      alt={`${team.name} logo`}
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.classList.remove('hidden');
                      }}
                    />
                    <span className="text-xs font-bold text-zinc-500 hidden">
                      {team.name.charAt(0)}
                    </span>
                  </div>

                  {/* Name and Stats */}
                  <div className="min-w-0">
                    <span className="text-xs font-bold block truncate text-zinc-200 group-hover:text-zinc-50 transition-colors">
                      {team.shortName || team.name}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 block uppercase tracking-wider mt-0.5">
                      {team.played}GP <span className="text-zinc-700">•</span> {team.wins}W-{team.draws}D-{team.losses}L
                    </span>
                  </div>
                </div>

                {/* Right side: Points - Clean layout, no border, no bg */}
                <div className="text-right flex-shrink-0 pl-2 font-mono select-none">
                  <span className="text-sm font-black text-zinc-150 block leading-tight">
                    {team.pts}
                  </span>
                  <span className="text-[9px] font-bold text-zinc-600 block leading-none uppercase tracking-wider">
                    PTS
                  </span>
                </div>
              </button>
            );
          })
        ) : (
          <div className="text-xs text-zinc-650 italic text-center py-8">
            No matching teams found
          </div>
        )}
      </div>

    </div>
  );
}
