import { useState, useEffect } from "react";
import { Link } from "react-router";
import { clsx } from "clsx";
import { XPageMeta } from "../../components/common/PageMeta";
import PageStack, { GRID_GAP } from "../../components/common/PageStack";
import ComponentCard from "../../components/common/ComponentCard";
import StatusBadge from "../../components/common/StatusBadge";
import Button from "../../components/common/Button";
import TournamentBracket from "../../components/tournaments/TournamentBracket";
import TournamentProgressCard from "../../components/tournaments/TournamentProgressCard";
import { useSeasonData } from "../../components/context/SeasonContext";
import { useThemeTokens } from "../../components/theme/useThemeTokens";
import { PlusIcon } from "../../icons";

export default function TournamentsPage() {
  const t = useThemeTokens();
  const { tournaments, getSeasonById, formatDate } = useSeasonData();
  const multiple = tournaments.length > 1;
  const [selectedId, setSelectedId] = useState(tournaments[0]?.id ?? 0);
  const selected = tournaments.find((tr) => tr.id === selectedId) ?? tournaments[0];

  useEffect(() => {
    if (tournaments[0]) setSelectedId(tournaments[0].id);
  }, [tournaments]);

  const progressValue = selected?.status === "completed" ? 100 : selected?.status === "active" ? 45 : 20;

  return (
    <>
      <XPageMeta title="Tournois" description="Liste des tournois" />
      <PageStack>
        {multiple && (
          <div className={clsx("flex flex-wrap gap-2 rounded-md border p-1.5", t.border)}>
            {tournaments.map((tr) => (
              <button
                key={tr.id}
                type="button"
                onClick={() => setSelectedId(tr.id)}
                className={clsx(
                  "rounded-sm px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
                  selectedId === tr.id ? t.tabActive : t.tabInactive
                )}
              >
                {tr.name}
              </button>
            ))}
          </div>
        )}

        <ComponentCard
          title={selected?.name ?? "Tournoi"}
          desc={selected?.description ?? "Tableau éliminatoire"}
          action={
            <Button className="gap-2">
              <PlusIcon className="size-4 shrink-0" />
              <span>Créer</span>
            </Button>
          }
        >
          <TournamentBracket />
        </ComponentCard>

        {multiple && (
          <div className={clsx("grid grid-cols-1 xl:grid-cols-3", GRID_GAP)}>
            <TournamentProgressCard
              title={selected?.name ?? "Tournoi"}
              subtitle={getSeasonById(selected?.season_id ?? 0)?.name.replace("Saison ", "")}
              value={progressValue}
              played={Math.round((progressValue / 100) * 8)}
              total={8}
            />

            <div className={clsx("overflow-hidden rounded-md border xl:col-span-2", t.card)}>
              <div className="x-scroll overflow-x-auto">
                <table className="w-full min-w-[640px] table-fixed text-sm">
                  <colgroup>
                    <col className="w-[28%]" />
                    <col className="w-[22%]" />
                    <col className="w-[14%]" />
                    <col className="w-[14%]" />
                    <col className="w-[12%]" />
                    <col className="w-[10%]" />
                  </colgroup>
                  <thead>
                    <tr className={clsx("text-left text-xs font-semibold uppercase tracking-wider", t.tableHead)}>
                      <th className="px-4 py-3">Tournoi</th>
                      <th className="px-4 py-3">Saison</th>
                      <th className="px-4 py-3 whitespace-nowrap">Début</th>
                      <th className="px-4 py-3 whitespace-nowrap">Fin</th>
                      <th className="px-4 py-3">Statut</th>
                      <th className="px-4 py-3 text-right">Classement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tournaments.map((tr) => (
                      <tr key={tr.id} className={clsx("transition-colors", t.tableRow, t.navHover)}>
                        <td className="px-4 py-3">
                          <Link
                            to={`/tournaments/${tr.id}`}
                            className="block truncate font-medium text-brand-500 hover:text-brand-400"
                            title={tr.name}
                          >
                            {tr.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <span className={clsx("inline-block max-w-full truncate rounded-full px-2 py-0.5 text-xs", t.metricBg, t.textSecondary)}>
                            {getSeasonById(tr.season_id)?.name.replace("Saison ", "") ?? "—"}
                          </span>
                        </td>
                        <td className={clsx("px-4 py-3 whitespace-nowrap tabular-nums", t.textSecondary)}>
                          {formatDate(tr.start_date)}
                        </td>
                        <td className={clsx("px-4 py-3 whitespace-nowrap tabular-nums", t.textSecondary)}>
                          {formatDate(tr.end_date)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={tr.status} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link to={`/tournaments/${tr.id}/ranking`} className="text-xs text-brand-500 hover:text-brand-400 whitespace-nowrap">
                            Voir →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </PageStack>
    </>
  );
}
