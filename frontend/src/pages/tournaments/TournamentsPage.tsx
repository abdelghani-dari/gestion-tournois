import { useEffect, useMemo, useState } from "react";
import { clsx } from "clsx";
import { getPublicTournaments, type PublicTournament } from "../../api";
import { XPageMeta } from "../../components/common/PageMeta";
import PageStack, { GRID_GAP } from "../../components/common/PageStack";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/common/Button";
import { useThemeTokens } from "../../components/theme/useThemeTokens";
import { PlusIcon } from "../../icons";

function formatDate(date?: string | null) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function TournamentStatus({ value, tone = "default" }: { value?: string | null; tone?: "default" | "approval" }) {
  const t = useThemeTokens();
  const normalized = value ?? "-";
  const positive = ["accepted", "open", "active", "approved"].includes(normalized);
  const pending = ["pending", "upcoming"].includes(normalized);

  return (
    <span
      className={clsx(
        "inline-flex rounded-sm px-2 py-0.5 text-xs font-medium capitalize",
        positive && "bg-emerald-500/15 text-emerald-400",
        pending && "bg-amber-500/15 text-amber-400",
        !positive && !pending && tone === "approval" && "bg-slate-500/15 text-slate-300",
        !positive && !pending && tone === "default" && clsx(t.metricBg, t.textSecondary),
      )}
    >
      {normalized}
    </span>
  );
}

export default function TournamentsPage() {
  const t = useThemeTokens();
  const [tournaments, setTournaments] = useState<PublicTournament[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadTournaments() {
      setLoading(true);
      setError("");

      try {
        const data = await getPublicTournaments();
        if (!active) return;
        setTournaments(data);
        setSelectedId(data[0]?.id ?? null);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Unable to load public tournaments.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadTournaments();

    return () => {
      active = false;
    };
  }, []);

  const selected = useMemo(
    () => tournaments.find((tr) => tr.id === selectedId) ?? tournaments[0],
    [tournaments, selectedId],
  );

  return (
    <>
      <XPageMeta title="Tournois" description="Liste des tournois publics acceptes" />
      <PageStack>
        {tournaments.length > 1 && (
          <div className={clsx("flex flex-wrap gap-2 rounded-md border p-1.5", t.border)}>
            {tournaments.map((tr) => (
              <button
                key={tr.id}
                type="button"
                onClick={() => setSelectedId(tr.id)}
                className={clsx(
                  "rounded-sm px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
                  selected?.id === tr.id ? t.tabActive : t.tabInactive,
                )}
              >
                {tr.name}
              </button>
            ))}
          </div>
        )}

        <ComponentCard
          title={selected?.name ?? "Tournois publics"}
          desc={selected?.description || "Tournois locaux acceptes par l'administration"}
          action={
            <Button className="gap-2" disabled>
              <PlusIcon className="size-4 shrink-0" />
              <span>Creation plus tard</span>
            </Button>
          }
        >
          {loading && (
            <p className={clsx("py-10 text-center text-sm", t.textMuted)}>
              Chargement des tournois publics...
            </p>
          )}

          {!loading && error && (
            <div className="rounded-sm border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {!loading && !error && tournaments.length === 0 && (
            <p className={clsx("py-10 text-center text-sm", t.textMuted)}>
              No accepted tournaments yet.
            </p>
          )}

          {!loading && !error && tournaments.length > 0 && (
            <div className={clsx("grid grid-cols-1 lg:grid-cols-3", GRID_GAP)}>
              <div className={clsx("rounded-md border p-5", t.card)}>
                <p className={clsx("text-xs font-semibold uppercase tracking-wider", t.textMuted)}>Tournois acceptes</p>
                <p className={clsx("mt-1 text-2xl font-bold", t.textPrimary)}>{tournaments.length}</p>
              </div>
              <div className={clsx("rounded-md border p-5", t.card)}>
                <p className={clsx("text-xs font-semibold uppercase tracking-wider", t.textMuted)}>Ville</p>
                <p className={clsx("mt-1 truncate text-lg font-semibold", t.textPrimary)}>{selected?.city || "-"}</p>
              </div>
              <div className={clsx("rounded-md border p-5", t.card)}>
                <p className={clsx("text-xs font-semibold uppercase tracking-wider", t.textMuted)}>Lieu</p>
                <p className={clsx("mt-1 truncate text-lg font-semibold", t.textPrimary)}>{selected?.location || "-"}</p>
              </div>
            </div>
          )}
        </ComponentCard>

        {!loading && !error && tournaments.length > 0 && (
          <div className={clsx("overflow-hidden rounded-md border", t.card)}>
            <div className="x-scroll overflow-x-auto">
              <table className="w-full min-w-[960px] table-fixed text-sm">
                <colgroup>
                  <col className="w-[70px]" />
                  <col className="w-[20%]" />
                  <col className="w-[24%]" />
                  <col className="w-[13%]" />
                  <col className="w-[16%]" />
                  <col className="w-[12%]" />
                  <col className="w-[12%]" />
                  <col className="w-[11%]" />
                  <col className="w-[12%]" />
                </colgroup>
                <thead>
                  <tr className={clsx("text-left text-xs font-semibold uppercase tracking-wider", t.tableHead)}>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Nom</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Ville</th>
                    <th className="px-4 py-3">Lieu</th>
                    <th className="px-4 py-3 whitespace-nowrap">Debut</th>
                    <th className="px-4 py-3 whitespace-nowrap">Fin</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3">Validation</th>
                  </tr>
                </thead>
                <tbody>
                  {tournaments.map((tr) => (
                    <tr key={tr.id} className={clsx("transition-colors", t.tableRow, t.navHover)}>
                      <td className={clsx("px-4 py-3 font-mono", t.textMuted)}>{tr.id}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setSelectedId(tr.id)}
                          className="block max-w-full truncate text-left font-medium text-brand-500 hover:text-brand-400"
                          title={tr.name}
                        >
                          {tr.name}
                        </button>
                      </td>
                      <td className={clsx("px-4 py-3", t.textSecondary)}>
                        <span className="block truncate" title={tr.description ?? ""}>
                          {tr.description || "-"}
                        </span>
                      </td>
                      <td className={clsx("px-4 py-3", t.textSecondary)}>{tr.city || "-"}</td>
                      <td className={clsx("px-4 py-3", t.textSecondary)}>
                        <span className="block truncate" title={tr.location ?? ""}>
                          {tr.location || "-"}
                        </span>
                      </td>
                      <td className={clsx("px-4 py-3 whitespace-nowrap tabular-nums", t.textSecondary)}>
                        {formatDate(tr.start_date)}
                      </td>
                      <td className={clsx("px-4 py-3 whitespace-nowrap tabular-nums", t.textSecondary)}>
                        {formatDate(tr.end_date)}
                      </td>
                      <td className="px-4 py-3">
                        <TournamentStatus value={tr.status} />
                      </td>
                      <td className="px-4 py-3">
                        <TournamentStatus value={tr.approval_status} tone="approval" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </PageStack>
    </>
  );
}
