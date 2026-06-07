import { useState, useMemo, useEffect } from 'react';
import LeagueHeader from './LeagueHeader';
import TeamSidebar from './TeamSidebar';
import type { Team } from './TeamSidebar';
import PlayerTable from './PlayerTable';
import type { PlayerData } from './PlayerTable';
import rawPlayersData from '../assets/data/players.json';
import rawTeamsData from '../assets/data/teams.json';

const SEASONS_LIST = [
  { id: 's2025', name: 'Saison 2025/2026' },
  { id: 's2024', name: 'Saison 2024/2025' }
];

export default function Dashboard() {
  // Standings & season states
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>(SEASONS_LIST[0].id);

  // 1. Transform raw teams and standings list from teams.json
  const teams: Team[] = useMemo(() => {
    return rawTeamsData.map((t: any) => ({
      id: t.fotmobId,
      name: t.name,
      shortName: t.shortName,
      played: t.played,
      wins: t.wins,
      draws: t.draws,
      losses: t.losses,
      pts: t.points,
      position: t.position,
      logo: t.logo
    }));
  }, []);

  // Set default selected team to first team on load
  useEffect(() => {
    if (teams.length > 0 && selectedTeam === null) {
      setSelectedTeam(teams[0]);
    }
  }, [teams, selectedTeam]);

  // 2. Transform raw players database list (supporting nested category arrays in squad lists)
  const players: PlayerData[] = useMemo(() => {
    const list: PlayerData[] = [];
    rawPlayersData.forEach((team: any) => {
      const sidebarTeam = teams.find((t) => t.id === team.teamid);

      if (!team.squad) return;

      // Normalize squad array (Berkane uses flat array, Fes uses nested array)
      const categories: any[] = [];
      team.squad.forEach((item: any) => {
        if (Array.isArray(item)) {
          item.forEach((subItem) => {
            if (subItem) categories.push(subItem);
          });
        } else if (item) {
          categories.push(item);
        }
      });

      categories.forEach((category: any) => {
        if (!category) return;
        const title = category.title || '';
        let role = 'Midfielder';
        const lowerTitle = title.toLowerCase();
        
        if (lowerTitle.includes('keeper')) role = 'Keeper';
        else if (lowerTitle.includes('defender')) role = 'Defender';
        else if (lowerTitle.includes('midfielder')) role = 'Midfielder';
        else if (lowerTitle.includes('forward') || lowerTitle.includes('attacker') || lowerTitle.includes('keepers') || lowerTitle.includes('defenders') || lowerTitle.includes('midfielders') || lowerTitle.includes('attackers')) {
          role = 'Attacker';
        } else {
          return; // Skip staff/coach
        }

        if (!category.members) return;
        category.members.forEach((m: any) => {
          let val = 8.5;
          if (m.transferValue) {
            val = Math.max(4.0, Math.min(15.0, Number((m.transferValue / 100000).toFixed(1))));
          } else {
            val = Number((6.0 + (m.id % 60) / 10).toFixed(1));
          }

          list.push({
            id: m.id,
            name: m.name,
            shirtNumber: m.shirtNumber || (m.id % 99) + 1,
            country: m.cname || 'Morocco',
            countryCode: m.ccode || 'MAR',
            role,
            teamid: team.teamid,
            teamName: team.name,
            teamLogoColor: 'from-zinc-700 to-zinc-900', // fallback
            teamLogoText: sidebarTeam?.shortName.substring(0, 2) || 'FC',
            teamLogoUrl: sidebarTeam?.logo || '',
            value: val,
            isInjured: m.injured || false,
            rating: m.rating || Number((6.5 + (m.id % 25) / 10).toFixed(1)),
            isAvailable: !m.injured
          });
        });
      });
    });
    return list;
  }, [teams]);

  // Unique team list for filtering dropdown
  const uniqueTeams = useMemo(() => {
    return teams.map((t) => ({ teamid: t.id, name: t.name }));
  }, [teams]);

  // Standings click team select
  const handleTeamSelect = (team: Team) => {
    setSelectedTeam(team);
  };

  // Find active tournament name
  const activeTournamentName = "Botola Pro Inwi";

  // Calculate available players count for the selected team
  // const currentTeamPlayersAvailable = useMemo(() => {
  //   if (selectedTeam === null) return 0;
  //   return players.filter((p) => p.teamid === selectedTeam.id).length;
  // }, [players, selectedTeam]);

  // Helper to handle team select from dropdown in PlayerTable
  const handleDropdownTeamSelect = (teamid: number | null) => {
    if (teamid === null) {
      if (teams.length > 0) setSelectedTeam(teams[0]);
    } else {
      const team = teams.find((t) => t.id === teamid);
      if (team) setSelectedTeam(team);
    }
  };

  return (
    <div className="flex flex-row flex-grow h-[calc(100vh-64px)] overflow-hidden bg-black mt-16">
      
      {/* Left Sidebar Panel - Standing List (Scrolls independently) */}
      <div className="w-80 lg:w-96 border-r border-zinc-900 h-full overflow-hidden p-4 flex-shrink-0 bg-black">
        <TeamSidebar
          teams={teams}
          selectedTeam={selectedTeam}
          onTeamSelect={handleTeamSelect}
        />
      </div>

      {/* Right Main Panel - Player list details (Scrolls independently) */}
      <div className="flex-grow h-full overflow-y-auto p-6 space-y-6 bg-black">
        {/* Top Header Controls (displays tournament name) */}
        <LeagueHeader
          tournamentName={activeTournamentName}
        />

        {/* Roster table */}
        <PlayerTable
          players={players}
          uniqueTeams={uniqueTeams}
          selectedFilterTeamId={selectedTeam ? selectedTeam.id : null}
          onSelectFilterTeamId={handleDropdownTeamSelect}
          seasons={SEASONS_LIST}
          selectedSeasonId={selectedSeasonId}
          onSelectSeasonId={setSelectedSeasonId}
        />
      </div>

    </div>
  );
}
