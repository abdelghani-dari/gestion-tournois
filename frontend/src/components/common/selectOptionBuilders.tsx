import type { ReactNode } from "react";
import type { SearchableSelectOption } from "./SearchableSelect";
import type { ApiPlayer, ApiTeam, PublicTournament } from "../../api";
import OwnedItemBadge from "./OwnedItemBadge";
import { PlayerPhotoNameCell, TeamLogoNameCell } from "../statistics/StatisticTableCells";
import EntityImage from "./EntityImage";

type OwnerUserId = number | null | undefined;

function optionRow(content: ReactNode, owned?: boolean) {
  return (
    <div className="flex w-full min-w-0 items-center gap-2">
      <div className="min-w-0 flex-1">{content}</div>
      <OwnedItemBadge owned={owned} />
    </div>
  );
}

export function teamSelectOptions(teams: ApiTeam[], ownerUserId?: OwnerUserId): SearchableSelectOption[] {
  return teams.map((team) => ({
    value: String(team.id),
    label: team.name,
    searchText: [team.name, team.short_name, team.city].filter(Boolean).join(" "),
    content: optionRow(
      <TeamLogoNameCell name={team.name} logoPath={team.logo_path} />,
      ownerUserId != null && Number(team.manager_id) === Number(ownerUserId),
    ),
  }));
}

export function playerSelectOptions(players: ApiPlayer[], ownerUserId?: OwnerUserId): SearchableSelectOption[] {
  return players.map((player) => {
    const label = `${player.first_name ?? ""} ${player.last_name ?? ""}`.trim() || `Joueur #${player.id}`;
    return {
      value: String(player.id),
      label,
      searchText: [player.first_name, player.last_name, player.position, player.team?.name].filter(Boolean).join(" "),
      content: optionRow(
        <PlayerPhotoNameCell name={label} photoPath={player.photo_path} />,
        ownerUserId != null && Number(player.team?.manager_id) === Number(ownerUserId),
      ),
    };
  });
}

function TournamentOptionRow({ tournament }: { tournament: PublicTournament }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <EntityImage
        src={tournament.banner_path}
        name={tournament.name}
        className="h-6 w-6 shrink-0 rounded border-0 object-cover"
      />
      <span className="min-w-0 truncate font-medium">{tournament.name}</span>
    </div>
  );
}

export function tournamentSelectOptions(tournaments: PublicTournament[], ownerUserId?: OwnerUserId): SearchableSelectOption[] {
  return tournaments.map((tournament) => ({
    value: String(tournament.id),
    label: tournament.name,
    searchText: [tournament.name, tournament.city, tournament.location].filter(Boolean).join(" "),
    content: optionRow(
      <TournamentOptionRow tournament={tournament} />,
      ownerUserId != null && Number(tournament.created_by) === Number(ownerUserId),
    ),
  }));
}

export function simpleSelectOptions(items: { value: string; label: string; content?: ReactNode }[]): SearchableSelectOption[] {
  return items.map((item) => ({ value: item.value, label: item.label, content: item.content }));
}

export function teamFilterOptions(
  teams: ApiTeam[],
  emptyLabel = "Toutes les équipes",
  ownerUserId?: OwnerUserId,
): SearchableSelectOption[] {
  return [{ value: "", label: emptyLabel }, ...teamSelectOptions(teams, ownerUserId)];
}

export function tournamentFilterOptions(
  tournaments: PublicTournament[],
  emptyLabel = "Tous les tournois",
  ownerUserId?: OwnerUserId,
): SearchableSelectOption[] {
  return [{ value: "", label: emptyLabel }, ...tournamentSelectOptions(tournaments, ownerUserId)];
}
