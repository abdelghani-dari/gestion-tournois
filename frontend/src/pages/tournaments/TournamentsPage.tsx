import { useEffect, useMemo, useState } from "react";
import { clsx } from "clsx";
import { Link } from "react-router";
import { getPublicTournaments, type PublicTournament } from "../../api";
import { XPageMeta } from "../../components/common/PageMeta";
import PageStack, { GRID_GAP } from "../../components/common/PageStack";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/common/Button";
import EntityImage from "../../components/common/EntityImage";
import XModal from "../../components/common/XModal";
import { statusLabel, statusTone } from "../../components/common/statusLabels";
import { useThemeTokens } from "../../components/theme/useThemeTokens";
import { useAuth } from "../../context/AuthContext";
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
  const labelTone = statusTone(value);

  return (
    <span
      className={clsx(
        "inline-flex rounded-sm px-2 py-0.5 text-xs font-medium",
        labelTone || (tone === "approval" ? "bg-slate-500/15 text-slate-300" : clsx(t.metricBg, t.textSecondary)),
      )}
    >
      {statusLabel(value)}
    </span>
  );
}

export default function TournamentsPage() {
  const t = useThemeTokens();
  const { isAuthenticated, isAdmin } = useAuth();
  const [tournaments, setTournaments] = useState<PublicTournament[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detailsTournament, setDetailsTournament] = useState<PublicTournament | null>(null);
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
        const acceptedTournaments = data.filter((tournament) => tournament.approval_status === "accepted");
        setTournaments(acceptedTournaments);
        setSelectedId(acceptedTournaments[0]?.id ?? null);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Impossible de charger les tournois publics.");
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
      <XPageMeta title="Tournois" description="Liste des tournois publics acceptés" />
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
          desc={selected?.description || "Tournois locaux acceptés par l'administration"}
          action={
            <Link
              to={isAdmin ? "/admin/tournaments" : isAuthenticated ? "/dashboard" : "/login"}
              className="inline-flex items-center justify-center gap-2 rounded-sm border border-brand-500/50 bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600"
            >
              <PlusIcon className="size-4 shrink-0" />
              <span>Créer un tournoi</span>
            </Link>
          }
        >
          {selected && (
            <EntityImage
              src={selected.banner_path}
              name={selected.name}
              className="mb-5 h-44 w-full rounded-md"
            />
          )}

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
              Aucune donnée disponible.
            </p>
          )}

          {!loading && !error && tournaments.length > 0 && (
            <div className={clsx("grid grid-cols-1 lg:grid-cols-3", GRID_GAP)}>
              <div className={clsx("rounded-md border p-5", t.card)}>
                <p className={clsx("text-xs font-semibold uppercase tracking-wider", t.textMuted)}>Tournois acceptés</p>
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
                  <col className="w-[12%]" />
                </colgroup>
                <thead>
                  <tr className={clsx("text-left text-xs font-semibold uppercase tracking-wider", t.tableHead)}>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Nom</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Ville</th>
                    <th className="px-4 py-3">Lieu</th>
                    <th className="px-4 py-3 whitespace-nowrap">Début</th>
                    <th className="px-4 py-3 whitespace-nowrap">Fin</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3">Validation</th>
                    <th className="px-4 py-3">Détails</th>
                  </tr>
                </thead>
                <tbody>
                  {tournaments.map((tr) => (
                    <tr key={tr.id} className={clsx("transition-colors", t.tableRow, t.navHover)}>
                      <td className={clsx("px-4 py-3 font-mono", t.textMuted)}>{tr.id}</td>
                      <td className="px-4 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <EntityImage src={tr.banner_path} name={tr.name} className="h-10 w-14 shrink-0 rounded-sm" />
                          <button
                            type="button"
                            onClick={() => setSelectedId(tr.id)}
                            className="block max-w-full truncate text-left font-medium text-brand-500 hover:text-brand-400"
                            title={tr.name}
                          >
                            {tr.name}
                          </button>
                        </div>
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
                      <td className="px-4 py-3">
                        <Button type="button" size="sm" variant="secondary" onClick={() => setDetailsTournament(tr)}>
                          Détails
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <XModal
          open={Boolean(detailsTournament)}
          onClose={() => setDetailsTournament(null)}
          title={detailsTournament?.name ?? "Détails du tournoi"}
        >
          {detailsTournament && (
            <div className="space-y-3 text-sm">
              <EntityImage
                src={detailsTournament.banner_path}
                name={detailsTournament.name}
                className="h-36 w-full rounded-md"
              />
              {[
                ["Nom", detailsTournament.name],
                ["Ville", detailsTournament.city || "-"],
                ["Lieu", detailsTournament.location || "-"],
                ["Date début", formatDate(detailsTournament.start_date)],
                ["Date fin", formatDate(detailsTournament.end_date)],
                ["Statut", statusLabel(detailsTournament.status)],
                ["Validation", statusLabel(detailsTournament.approval_status)],
                ["Description", detailsTournament.description || "-"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4">
                  <span className={t.textMuted}>{label}</span>
                  <span className={clsx("text-right", t.textPrimary)}>{value}</span>
                </div>
              ))}
            </div>
          )}
        </XModal>
      </PageStack>
    </>
  );
}
