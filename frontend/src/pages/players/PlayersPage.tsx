import { useMemo, useCallback, useState } from "react";
import { useSearchParams } from "react-router";
import { clsx } from "clsx";
import { XPageMeta } from "../../components/common/PageMeta";
import PageStack, { GRID_GAP } from "../../components/common/PageStack";
import SectionBar from "../../components/common/SectionBar";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/common/Button";
import FilterSearchInput from "../../components/common/FilterSearchInput";
import SearchableFilter, { DropdownGroupProvider } from "../../components/common/SearchableFilter";
import { teamIdsFromMatches } from "../../components/common/filterUtils";
import PlayersTable from "../../components/players/PlayersTable";
import ScorersRankingTable from "../../components/players/ScorersRankingTable";
import { useSeasonData } from "../../components/context/SeasonContext";
import { PlusIcon } from "../../icons";

export default function PlayersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const {
    players,
    teams,
    championships,
    tournaments,
    matches,
    getTeamById,
    formatPlayerName,
  } = useSeasonData();

  const teamId = searchParams.get("team") ? Number(searchParams.get("team")) : null;
  const championshipId = searchParams.get("championship") ? Number(searchParams.get("championship")) : null;
  const tournamentId = searchParams.get("tournament") ? Number(searchParams.get("tournament")) : null;

  const setFilter = useCallback(
    (key: "team" | "championship" | "tournament", value: number | null) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value === null) next.delete(key);
        else next.set(key, String(value));
        return next;
      });
    },
    [setSearchParams]
  );

  const resetFilters = () => {
    setSearchQuery("");
    setSearchParams({});
  };

  const filteredPlayers = useMemo(() => {
    let list = players;
    const compTeamIds = teamIdsFromMatches(matches, { championshipId, tournamentId });

    if (compTeamIds) {
      list = list.filter((p) => compTeamIds.has(p.team_id));
    }
    if (teamId) {
      list = list.filter((p) => p.team_id === teamId);
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((p) => {
        const teamName = getTeamById(p.team_id)?.name.toLowerCase() ?? "";
        return (
          formatPlayerName(p).toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.position.toLowerCase().includes(q) ||
          teamName.includes(q) ||
          String(p.shirt_number).includes(q) ||
          p.cname.toLowerCase().includes(q)
        );
      });
    }
    return list;
  }, [players, matches, teamId, championshipId, tournamentId, searchQuery, getTeamById, formatPlayerName]);

  const teamOptions = useMemo(
    () => teams.map((t) => ({ id: t.id, label: t.name })),
    [teams]
  );
  const championshipOptions = useMemo(
    () => championships.map((c) => ({ id: c.id, label: c.name })),
    [championships]
  );
  const tournamentOptions = useMemo(
    () => tournaments.map((tr) => ({ id: tr.id, label: tr.name })),
    [tournaments]
  );

  const hasFilters =
    searchQuery.trim() !== "" || teamId !== null || championshipId !== null || tournamentId !== null;

  return (
    <>
      <XPageMeta title="Joueurs" description="Effectifs de la saison active" />
      <PageStack>
        <SectionBar
          action={
            <Button className="gap-2">
              <PlusIcon className="size-4 shrink-0" />
              <span>Ajouter</span>
            </Button>
          }
        >
          <DropdownGroupProvider>
            <div className="flex flex-wrap items-center gap-2">
              <FilterSearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Rechercher un joueur…"
              />
              <SearchableFilter
                filterId="players-team"
                label="Équipe"
                value={teamId}
                options={teamOptions}
                onChange={(id) => setFilter("team", id)}
                allLabel="Toutes les équipes"
                searchPlaceholder="Rechercher…"
              />
              <SearchableFilter
                filterId="players-championship"
                label="Championnat"
                value={championshipId}
                options={championshipOptions}
                onChange={(id) => setFilter("championship", id)}
                allLabel="Tous championnats"
                searchPlaceholder="Rechercher…"
              />
              <SearchableFilter
                filterId="players-tournament"
                label="Tournoi"
                value={tournamentId}
                options={tournamentOptions}
                onChange={(id) => setFilter("tournament", id)}
                allLabel="Tous tournois"
                searchPlaceholder="Rechercher…"
              />
              {hasFilters && (
                <Button variant="secondary" size="sm" onClick={resetFilters}>
                  Réinitialiser
                </Button>
              )}
            </div>
          </DropdownGroupProvider>
        </SectionBar>

        <div className={clsx("grid grid-cols-1 xl:grid-cols-4", GRID_GAP)}>
          <div className="xl:col-span-3">
            <PlayersTable
              players={filteredPlayers}
              getTeamById={getTeamById}
              formatPlayerName={formatPlayerName}
              emptyMessage="Aucun joueur"
            />
          </div>
          <div className="xl:col-span-1">
            <ComponentCard title="Classement buteurs" desc={`${filteredPlayers.length} joueurs · G`}>
              <ScorersRankingTable players={filteredPlayers} />
            </ComponentCard>
          </div>
        </div>
      </PageStack>
    </>
  );
}
