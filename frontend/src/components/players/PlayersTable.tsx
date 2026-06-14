import { useNavigate } from "react-router";
import { clsx } from "clsx";
import GlassCard from "../common/GlassCard";
import { useThemeTokens } from "../theme/useThemeTokens";
import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";
import NationalityFlag from "../ui/NationalityFlag";
import type { Player, Team } from "../types";
import { AngleRightIcon } from "../../icons";

const positionColors: Record<string, "success" | "info" | "warning" | "primary"> = {
  GK: "info",
  DEF: "primary",
  MID: "warning",
  ATT: "success",
  RW: "success",
  LW: "success",
  ST: "success",
};

interface PlayersTableProps {
  players: Player[];
  getTeamById: (id: number) => Team | undefined;
  formatPlayerName: (p: Player) => string;
  emptyMessage?: string;
}

export default function PlayersTable({
  players,
  getTeamById,
  formatPlayerName,
  emptyMessage = "Aucun joueur",
}: PlayersTableProps) {
  const t = useThemeTokens();
  const navigate = useNavigate();

  return (
    <GlassCard padding="none" className="overflow-hidden">
      <div className="x-scroll overflow-x-auto">
        <table className="w-full min-w-[640px] table-fixed">
          <colgroup>
            <col className="w-14" />
            <col />
            <col className="w-12" />
            <col className="w-14" />
            <col className="w-20" />
            <col className="w-12" />
            <col className="w-12" />
            <col className="w-12" />
            <col className="w-10" />
          </colgroup>
          <thead>
            <tr className={clsx("border-b", t.border, t.tableHead)}>
              <th className="px-4 py-3 md:px-6" />
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider md:px-6">Joueur</th>
              <th className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wider">Nat.</th>
              <th className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wider">Équipe</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider md:px-6">Poste</th>
              <th className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wider">N°</th>
              <th className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wider">Buts</th>
              <th className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wider">PdA</th>
              <th className="px-2 py-3" />
            </tr>
          </thead>
          <tbody className={clsx("divide-y", t.tableDivide)}>
            {players.length === 0 ? (
              <tr>
                <td colSpan={9} className={clsx("px-6 py-10 text-center text-sm", t.textMuted)}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              players.map((p) => {
                const team = getTeamById(p.team_id);
                return (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/players/${p.id}`)}
                    className={clsx("group cursor-pointer transition-colors", t.tableRow, t.navHover)}
                  >
                    <td className="px-4 py-3 md:px-6">
                      <Avatar src={p.photo_url} size="medium" />
                    </td>
                    <td className="px-4 py-3 md:px-6">
                      <span className={clsx("truncate text-sm font-medium", t.textPrimary)}>
                        {formatPlayerName(p)}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-center">
                      <NationalityFlag flagUrl={p.flag_url} country={p.cname} size="sm" />
                    </td>
                    <td className="px-2 py-3 text-center">
                      {team ? (
                        <img
                          src={team.logo_url}
                          alt=""
                          title={team.name}
                          className="mx-auto h-7 w-7 object-contain"
                        />
                      ) : (
                        <span className={t.textMuted}>—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 md:px-6">
                      <Badge color={positionColors[p.position] ?? "light"}>{p.position}</Badge>
                    </td>
                    <td className={clsx("px-2 py-3 text-center font-mono text-sm font-semibold tabular-nums", t.textSecondary)}>
                      {p.shirt_number}
                    </td>
                    <td className="px-2 py-3 text-center text-sm font-semibold tabular-nums text-emerald-500">
                      {p.goals}
                    </td>
                    <td className={clsx("px-2 py-3 text-center text-sm tabular-nums", t.textSecondary)}>
                      {p.assists}
                    </td>
                    <td className="px-2 py-3 text-right">
                      <AngleRightIcon
                        className={clsx(
                          "ml-auto size-4 opacity-25 transition-opacity group-hover:opacity-70",
                          t.textMuted
                        )}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
