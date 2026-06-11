import { useMemo, useState } from "react";
import { clsx } from "clsx";
import { XPageMeta } from "../../components/common/PageMeta";
import PageStack, { GRID_GAP } from "../../components/common/PageStack";
import SectionBar from "../../components/common/SectionBar";
import Button from "../../components/common/Button";
import FilterSearchInput from "../../components/common/FilterSearchInput";
import SearchableFilter, { DropdownGroupProvider } from "../../components/common/SearchableFilter";
import { teamIdsFromMatches } from "../../components/common/filterUtils";
import TeamCard from "../../components/teams/TeamCard";
import { useSeasonData } from "../../components/context/SeasonContext";
import { useThemeTokens } from "../../components/theme/useThemeTokens";
import { PlusIcon } from "../../icons";

export default function TeamsPage() {
  const t = useThemeTokens();
  const { teams, championships, tournaments, matches } = useSeasonData();
  const [searchQuery, setSearchQuery] = useState("");
  const [championshipId, setChampionshipId] = useState<number | null>(null);
  const [tournamentId, setTournamentId] = useState<number | null>(null);

  const championshipOptions = useMemo(
    () => championships.map((c) => ({ id: c.id, label: c.name })),
    [championships]
  );
  const tournamentOptions = useMemo(
    () => tournaments.map((tr) => ({ id: tr.id, label: tr.name })),
    [tournaments]
  );

  const filteredTeams = useMemo(() => {
    let list = teams;
    const compTeamIds = teamIdsFromMatches(matches, { championshipId, tournamentId });
    if (compTeamIds) {
      list = list.filter((team) => compTeamIds.has(team.id));
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((team) => team.name.toLowerCase().includes(q));
    }
    return list;
  }, [teams, matches, championshipId, tournamentId, searchQuery]);

  const hasFilters = searchQuery.trim() !== "" || championshipId !== null || tournamentId !== null;

  const resetFilters = () => {
    setSearchQuery("");
    setChampionshipId(null);
    setTournamentId(null);
  };

  return (
    <>
      <XPageMeta title="Équipes" description="Clubs de la saison active" />
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
                placeholder="Rechercher une équipe…"
              />
              <SearchableFilter
                filterId="teams-championship"
                label="Championnat"
                value={championshipId}
                options={championshipOptions}
                onChange={setChampionshipId}
                allLabel="Tous championnats"
                searchPlaceholder="Rechercher…"
              />
              <SearchableFilter
                filterId="teams-tournament"
                label="Tournoi"
                value={tournamentId}
                options={tournamentOptions}
                onChange={setTournamentId}
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

        {filteredTeams.length > 0 ? (
          <div className={clsx("grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4", GRID_GAP)}>
            {filteredTeams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        ) : (
          <p className={clsx("py-12 text-center text-sm", t.textMuted)}>Aucune équipe trouvée.</p>
        )}
      </PageStack>
    </>
  );
}
