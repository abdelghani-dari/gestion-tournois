import { Link } from "react-router";
import { clsx } from "clsx";
import Badge from "../ui/Badge";
import MediaImage from "../common/MediaImage";
import { MOROCCO_FLAG_URL } from "../common/nationalityAssets";
import { resolveTeamLogo } from "../common/teamAssets";
import { useThemeTokens } from "../theme/useThemeTokens";
import type { ApiPlayer, ApiTeam } from "../../api";
import { AngleRightIcon, PencilIcon } from "../../icons";

interface TeamCardProps {
  team: ApiTeam;
  players: ApiPlayer[];
  canEdit?: boolean;
  canDelete?: boolean;
  deleting?: boolean;
  onDelete?: (team: ApiTeam) => void;
  onEdit?: (team: ApiTeam) => void;
}

function playerName(player: ApiPlayer) {
  return `${player.first_name} ${player.last_name}`.trim();
}

function CardAction({
  to,
  onClick,
  label,
  tone = "default",
  disabled,
}: {
  to?: string;
  onClick?: () => void;
  label: string;
  tone?: "default" | "danger";
  disabled?: boolean;
}) {
  const t = useThemeTokens();
  const className = clsx(
    "inline-flex flex-1 items-center justify-center gap-1 rounded-md px-1.5 py-1.5 text-[11px] font-medium transition-colors",
    tone === "danger"
      ? "text-red-400 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
      : clsx(t.textSecondary, t.navHover, "hover:text-brand-400"),
  );

  if (to) {
    return (
      <Link to={to} className={className}>
        <span>{label}</span>
        <AngleRightIcon className="size-3 shrink-0 opacity-70" />
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={className}>
      <span>{label}</span>
      <AngleRightIcon className="size-3 shrink-0 opacity-70" />
    </button>
  );
}

export default function TeamCard({
  team,
  players,
  canEdit = false,
  canDelete = false,
  deleting = false,
  onDelete,
  onEdit,
}: TeamCardProps) {
  const t = useThemeTokens();
  const roster = players.filter((player) => player.team_id === team.id);
  const preview = roster.slice(0, 5);
  const topScorer = [...roster].sort((a, b) => (b.goals ?? 0) - (a.goals ?? 0))[0];

  return (
    <div className={clsx("flex h-full flex-col rounded-md border p-6 transition-all duration-200", t.card, t.cardHover)}>
      <div className="flex items-start gap-4">
        <MediaImage
          src={team.logo_path}
          fallback={resolveTeamLogo(null)}
          alt={team.name}
          className="h-16 w-16 shrink-0 object-contain"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <Link
              to={`/teams/${team.id}`}
              className={clsx("block min-w-0 flex-1 truncate text-base font-semibold hover:text-brand-500", t.textPrimary)}
            >
              {team.name}
            </Link>
            {canEdit && onEdit && (
              <button
                type="button"
                onClick={() => onEdit(team)}
                aria-label="Modifier l'équipe"
                title="Modifier"
                className={clsx(
                  "inline-flex size-8 shrink-0 items-center justify-center rounded-md border transition-colors",
                  t.border,
                  t.navHover,
                  t.textSecondary,
                  "hover:text-brand-400",
                )}
              >
                <PencilIcon className="size-3.5" />
              </button>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge color="info">{roster.length} joueurs</Badge>
            {topScorer && (topScorer.goals ?? 0) > 0 && (
              <Badge color="success">{topScorer.goals} buts</Badge>
            )}
          </div>
        </div>
      </div>

      <div className={clsx("mt-5 border-t pt-4", t.borderSubtle)}>
        <p className={clsx("mb-3 text-xs font-semibold uppercase tracking-wider", t.textMuted)}>Effectif</p>
        <ul className="space-y-2">
          {preview.map((player) => (
            <li key={player.id} className="flex items-center gap-2.5">
              <span className={clsx("w-6 text-center font-mono text-xs", t.textMuted)}>{player.number ?? "-"}</span>
              <img src={MOROCCO_FLAG_URL} alt="" className="h-3.5 w-5 shrink-0 object-cover" />
              <span className={clsx("min-w-0 flex-1 truncate text-sm", t.textSecondary)}>{playerName(player)}</span>
              <span className={clsx("text-xs", t.textMuted)}>{player.position ?? "-"}</span>
            </li>
          ))}
        </ul>
        {roster.length > 5 && (
          <p className={clsx("mt-3 text-xs", t.textMuted)}>+{roster.length - 5} autres joueurs</p>
        )}
      </div>

      <div className="mt-auto flex flex-row items-center justify-between gap-1 pt-3">
        <CardAction to={`/teams/${team.id}`} label="Détails" />
        <CardAction to={`/statistics?team_id=${team.id}`} label="Statistiques" />
        {canDelete && onDelete && (
          <CardAction
            label={deleting ? "Suppression..." : "Supprimer"}
            tone="danger"
            disabled={deleting}
            onClick={() => onDelete(team)}
          />
        )}
      </div>
    </div>
  );
}
