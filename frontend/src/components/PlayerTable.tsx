import React, { useState, useMemo } from 'react';
import playerPlaceholder from '../assets/player-placeholder/player-placeholder.png';

export interface PlayerData {
  id: number;
  name: string;
  shirtNumber: number;
  country: string;
  countryCode: string;
  role: string; // 'Keeper' | 'Defender' | 'Midfielder' | 'Attacker'
  teamid: number;
  teamName: string;
  teamLogoColor: string;
  teamLogoText: string;
  teamLogoUrl: string;
  value: number;
  isInjured: boolean;
  rating: number;
  isAvailable: boolean;
}

interface PlayerTableProps {
  players: PlayerData[];
  uniqueTeams: { teamid: number; name: string }[];
  selectedFilterTeamId: number | null;
  onSelectFilterTeamId: (teamid: number | null) => void;
  // Season filtering props
  seasons: { id: string; name: string }[];
  selectedSeasonId: string;
  onSelectSeasonId: (id: string) => void;
}

// Helper to map country codes to emojis
const getCountryFlag = (ccode: string): string => {
  const code = ccode?.toUpperCase();
  if (code === 'MAR') return '🇲🇦';
  if (code === 'TUN') return '🇹🇳';
  if (code === 'SEN') return '🇸🇳';
  if (code === 'DZA') return '🇩🇿';
  if (code === 'CIV') return '🇨🇮';
  if (code === 'EGY') return '🇪🇬';
  return '🏳️';
};

export default function PlayerTable({
  players,
  uniqueTeams,
  selectedFilterTeamId,
  onSelectFilterTeamId,
  seasons,
  selectedSeasonId,
  onSelectSeasonId
}: PlayerTableProps) {
  // Inputs & Filter states (Only filtering by team name, season, and position)
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState<'All' | 'Keeper' | 'Defender' | 'Midfielder' | 'Attacker'>('All');

  // Available positions mapping
  const positions = ['All Positions', 'Keeper', 'Defender', 'Midfielder', 'Attacker'];

  // Apply search and position filters
  const processedPlayers = useMemo(() => {
    let result = [...players];

    // 1. Text Search Filter (filters by player name)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.role.toLowerCase().includes(query) ||
          p.teamName.toLowerCase().includes(query)
      );
    }

    // 2. Position Filter
    if (positionFilter !== 'All') {
      result = result.filter((p) => p.role === positionFilter);
    }

    // 3. Team Filter
    if (selectedFilterTeamId !== null) {
      result = result.filter((p) => p.teamid === selectedFilterTeamId);
    }

    return result;
  }, [players, searchQuery, positionFilter, selectedFilterTeamId]);

  return (
    <div className="bg-[#0e0e11] rounded-lg p-5 flex flex-col gap-5 select-none text-left font-sans">
      
      {/* Search & Filters Controls Bar - Strictly Team Name, Seasons, and Position */}
      <div className="flex flex-col lg:flex-row items-center gap-3">
        {/* Search player input */}
        <div className="relative w-full lg:w-72">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search players..."
            className="w-full pl-9 pr-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded text-xs font-semibold text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Dynamic filters layout */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto lg:ml-auto">
          {/* Position Selector */}
          <select
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value as any)}
            className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2.5 text-[11px] font-bold text-zinc-350 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {positions.map((pos) => (
              <option key={pos} value={pos === 'All Positions' ? 'All' : pos}>
                {pos}
              </option>
            ))}
          </select>

          {/* Teams Selector */}
          <select
            value={selectedFilterTeamId ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              onSelectFilterTeamId(val ? parseInt(val) : null);
            }}
            className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2.5 text-[11px] font-bold text-zinc-350 focus:outline-none focus:border-blue-500 cursor-pointer max-w-[150px] truncate"
          >
            <option value="">All Teams</option>
            {uniqueTeams.map((team) => (
              <option key={team.teamid} value={team.teamid}>
                {team.name}
              </option>
            ))}
          </select>

          {/* Seasons Selector */}
          <select
            value={selectedSeasonId}
            onChange={(e) => onSelectSeasonId(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2.5 text-[11px] font-bold text-zinc-350 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Players Data Grid - Clean rows with odd/even styling (PLAYER, POSITION, TEAM) */}
      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-zinc-900/60 text-[10px] font-mono text-zinc-550 uppercase tracking-widest">
              <th className="py-3.5 text-left font-bold w-64">Player</th>
              <th className="py-3.5 text-left font-bold px-4">Position</th>
              <th className="py-3.5 text-left font-bold px-4">Team</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900/30">
            {processedPlayers.length > 0 ? (
              processedPlayers.map((player) => {
                return (
                  <tr 
                    key={player.id} 
                    className="odd:bg-black even:bg-zinc-950/45 hover:bg-zinc-900/10 transition-colors border-b border-zinc-900/10"
                  >
                    {/* Player Info */}
                    <td className="py-3 text-left">
                      <div className="flex items-center gap-4">
                        {/* Placeholder profile avatar - BIGGER, no bg color */}
                        <div className="w-16 h-16 overflow-hidden flex items-center justify-center flex-shrink-0 relative bg-transparent">
                          <img
                            src={playerPlaceholder}
                            alt={player.name}
                            className="w-14 h-14 object-contain opacity-90"
                            onError={(e) => {
                              e.currentTarget.style.opacity = '0';
                            }}
                          />
                          {player.isInjured && (
                            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-rose-500 border border-black flex items-center justify-center text-[8px] font-black text-white select-none">
                              !
                            </span>
                          )}
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-sm font-bold text-zinc-100 block tracking-wide">
                            {player.name}
                          </span>
                          <span className="text-xs font-semibold text-zinc-500 flex items-center gap-1.5">
                            <span>#{player.shirtNumber || '--'}</span>
                            <span className="text-zinc-650">•</span>
                            <span>{getCountryFlag(player.countryCode)}</span>
                            <span>{player.country}</span>
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Position badge */}
                    <td className="py-3 px-4 text-left">
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-blue-950/40 text-blue-400 border border-blue-900/30">
                        {player.role}
                      </span>
                    </td>

                    {/* Team display */}
                    <td className="py-3 px-4 text-left">
                      <div className="flex items-center gap-3">
                        {/* Team logo image - BIGGER, no bg color */}
                        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 bg-transparent">
                          {player.teamLogoUrl ? (
                            <img
                              src={player.teamLogoUrl}
                              alt={`${player.teamName} logo`}
                              className="w-9 h-9 object-contain"
                              draggable={false}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 font-extrabold text-[8px]">
                              {player.teamLogoText}
                            </div>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-zinc-300">{player.teamName}</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={3} className="py-12 text-center text-xs text-zinc-600 italic">
                  No matching players found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
