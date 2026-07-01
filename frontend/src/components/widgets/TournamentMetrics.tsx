import { clsx } from "clsx";
import Badge from "../ui/Badge";
import { useThemeTokens } from "../theme/useThemeTokens";
import { useSeasonData } from "../context/SeasonContext";
import { GRID_GAP } from "../common/PageStack";
import { ArrowUpIcon, ArrowDownIcon, GroupIcon, TableIcon, ShootingStarIcon, UserIcon } from "../../icons";

export default function TournamentMetrics() {
  const t = useThemeTokens();
  const { teams, players, tournaments, matches } = useSeasonData();

  const metrics = [
    {
      label: "Équipes",
      value: String(teams.length),
      change: teams.length >= 16 ? "16" : `${teams.length}`,
      up: true,
      icon: <GroupIcon className="size-6" />,
      color: "bg-cyan-500/15 text-cyan-400",
    },
    {
      label: "Matchs joués",
      value: String(matches.filter((m) => m.status === "completed").length),
      change: `${matches.length}`,
      up: true,
      icon: <TableIcon className="size-6" />,
      color: "bg-rose-500/15 text-rose-400",
    },
    {
      label: "Tournois",
      value: String(tournaments.length),
      change: String(tournaments.filter((t) => t.status === "active").length),
      up: true,
      icon: <ShootingStarIcon className="size-6" />,
      color: "bg-amber-500/15 text-amber-400",
    },
    {
      label: "Joueurs",
      value: String(players.length),
      change: "+",
      up: true,
      icon: <UserIcon className="size-6" />,
      color: "bg-indigo-500/15 text-indigo-400",
    },
  ];

  return (
    <div className={clsx("grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4", GRID_GAP)}>
      {metrics.map((m) => (
        <div key={m.label} className={clsx("rounded-md border p-6", t.card)}>
          <div className={`flex h-12 w-12 items-center justify-center rounded-md ${m.color}`}>
            {m.icon}
          </div>
          <div className="mt-5 flex items-end justify-between">
            <div>
              <span className={clsx("text-sm", t.textSecondary)}>{m.label}</span>
              <h4 className={clsx("mt-1 text-2xl font-bold", t.textPrimary)}>{m.value}</h4>
            </div>
            <Badge color={m.up ? "success" : "error"}>
              {m.up ? <ArrowUpIcon className="size-3" /> : <ArrowDownIcon className="size-3" />}
              {m.change}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
