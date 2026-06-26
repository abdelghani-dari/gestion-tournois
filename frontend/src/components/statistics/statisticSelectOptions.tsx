import { Circle, Goal, Handshake, Shield } from "lucide-react";
import type { SearchableSelectOption } from "../common/SearchableSelect";
import type { ApiPlayer, ApiTeam, StatisticType } from "../../api";
import OwnedItemBadge from "../common/OwnedItemBadge";
import MediaImage from "../common/MediaImage";
import { resolveTeamLogo } from "../common/teamAssets";
import { PLAYER_PLACEHOLDER_URL } from "../common/playerAssets";

type OwnerUserId = number | null | undefined;

export const STAT_TYPE_OPTIONS: Array<{ value: StatisticType; label: string; icon: React.ReactNode }> = [
  { value: "goal", label: "But", icon: <Goal className="size-4 text-emerald-400" /> },
  { value: "assist", label: "Passe décisive", icon: <Handshake className="size-4 text-sky-400" /> },
  { value: "yellow_card", label: "Carton jaune", icon: <Circle className="size-4 fill-yellow-400 text-yellow-400" /> },
  { value: "red_card", label: "Carton rouge", icon: <Circle className="size-4 fill-red-500 text-red-500" /> },
  { value: "clean_sheet", label: "Clean sheet", icon: <Shield className="size-4 text-violet-400" /> },
];

export function teamSelectOptions(teams: ApiTeam[], ownerUserId?: OwnerUserId): SearchableSelectOption[] {
  return teams.map((team) => ({
    value: String(team.id),
    label: team.short_name || team.name,
    searchText: `${team.name} ${team.short_name ?? ""}`,
    content: (
      <span className="flex w-full min-w-0 items-center gap-2">
        <MediaImage src={team.logo_path} fallback={resolveTeamLogo(null)} alt="" className="size-6 shrink-0 object-contain" />
        <span className="min-w-0 flex-1 truncate">{team.short_name || team.name}</span>
        <OwnedItemBadge owned={ownerUserId != null && Number(team.manager_id) === Number(ownerUserId)} />
      </span>
    ),
  }));
}

export function playerSelectOptions(
  players: ApiPlayer[],
  labelFn: (p: ApiPlayer) => string,
  ownerUserId?: OwnerUserId,
): SearchableSelectOption[] {
  return players.map((player) => ({
    value: String(player.id),
    label: labelFn(player),
    searchText: labelFn(player),
    content: (
      <span className="flex w-full min-w-0 items-center gap-2">
        <MediaImage src={player.photo_path} fallback={PLAYER_PLACEHOLDER_URL} alt="" className="size-6 shrink-0 rounded-full object-cover" />
        <span className="min-w-0 flex-1 truncate">{labelFn(player)}</span>
        <OwnedItemBadge owned={ownerUserId != null && Number(player.team?.manager_id) === Number(ownerUserId)} />
      </span>
    ),
  }));
}

export function statTypeSelectOptions(): SearchableSelectOption[] {
  return STAT_TYPE_OPTIONS.map((type) => ({
    value: type.value,
    label: type.label,
    content: (
      <span className="flex items-center gap-2">
        {type.icon}
        <span>{type.label}</span>
      </span>
    ),
  }));
}
