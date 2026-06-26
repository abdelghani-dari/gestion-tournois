import { clsx } from "clsx";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  deleteMatch,
  getAdminJoinRequests,
  getAdminMatches,
  getAdminPlayers,
  getAdminTeams,
  type ApiMatch,
  type ApiPlayer,
  type ApiTeam,
  type JoinRequest,
} from "../../api";
import Button from "../../components/common/Button";
import ComponentCard from "../../components/common/ComponentCard";
import { XPageMeta } from "../../components/common/PageMeta";
import PageStack from "../../components/common/PageStack";
import { useThemeTokens } from "../../components/theme/useThemeTokens";
import { useAuth } from "../../context/AuthContext";

type AdminReadOnlyKind = "teams" | "players" | "join-requests" | "matches";
type Row = Record<string, string | number | null | undefined>;

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleString("fr-FR") : "-";
}

function teamRows(rows: ApiTeam[]): Row[] {
  return rows.map((team) => ({
    ID: team.id,
    Name: team.name,
    City: team.city || "-",
    Manager: team.manager?.name || team.manager?.email || "-",
    "Created At": formatDate(team.created_at),
  }));
}

function playerRows(rows: ApiPlayer[]): Row[] {
  return rows.map((player) => ({
    ID: player.id,
    "First Name": player.first_name,
    "Last Name": player.last_name,
    Team: player.team?.name || "-",
    Position: player.position || "-",
    Number: player.number ?? "-",
  }));
}

function joinRequestRows(rows: JoinRequest[]): Row[] {
  return rows.map((request) => ({
    ID: request.id,
    Tournament: request.tournament?.name || "-",
    Team: request.team?.name || "-",
    Manager: request.manager?.name || request.manager?.email || "-",
    Status: request.status || "-",
    "Created At": formatDate(request.created_at),
  }));
}

function matchRows(rows: ApiMatch[]): Row[] {
  return rows.map((match) => ({
    ID: match.id,
    Tournament: match.tournament?.name || "-",
    "Home Team": match.homeTeam?.name || match.home_team?.name || "-",
    "Away Team": match.awayTeam?.name || match.away_team?.name || "-",
    "Match Date": formatDate(match.match_date),
    Score: match.home_score == null || match.away_score == null ? "-" : `${match.home_score} - ${match.away_score}`,
    Status: match.status || "-",
    "Result Status": match.result_status || "-",
  }));
}

const pageTitles = {
  teams: "Equipes",
  players: "Joueurs",
  "join-requests": "Demandes",
  matches: "Matchs",
};

export default function AdminReadOnlyPage({ kind }: { kind: AdminReadOnlyKind }) {
  const t = useThemeTokens();
  const { isAdmin, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const title = pageTitles[kind];
  const columns = useMemo(() => (rows[0] ? Object.keys(rows[0]) : []), [rows]);
  const displayColumns = useMemo(() => (kind === "matches" && columns.length > 0 ? [...columns, "Actions"] : columns), [columns, kind]);

  const loadRows = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError("");
    try {
      if (kind === "teams") setRows(teamRows(await getAdminTeams()));
      if (kind === "players") setRows(playerRows(await getAdminPlayers()));
      if (kind === "join-requests") setRows(joinRequestRows(await getAdminJoinRequests()));
      if (kind === "matches") setRows(matchRows(await getAdminMatches()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger les données.");
    } finally {
      setLoading(false);
    }
  }, [isAdmin, kind]);

  useEffect(() => {
    if (!authLoading) {
      const timer = window.setTimeout(() => void loadRows(), 0);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [authLoading, loadRows]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Supprimer ce match ?")) return;

    setDeletingId(id);
    setError("");

    try {
      await deleteMatch(id);
      await loadRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suppression impossible.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <XPageMeta title={`Admin ${title}`} description="Supervision" />
      <PageStack>
        <ComponentCard title={title} desc="Vue administrateur en lecture seule">
          {!isAdmin ? (
            <div className="rounded-sm border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">Accès administrateur requis.</div>
          ) : error ? (
            <div className="rounded-sm border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
          ) : loading ? (
            <p className={clsx("py-8 text-center text-sm", t.textMuted)}>Chargement...</p>
          ) : rows.length === 0 ? (
            <p className={clsx("py-8 text-center text-sm", t.textMuted)}>Aucune donnée disponible.</p>
          ) : (
            <div className="x-scroll overflow-x-auto">
              <table className="w-full min-w-[860px] table-fixed text-sm">
                <thead>
                  <tr className={clsx("text-left text-xs font-semibold uppercase tracking-wider", t.tableHead)}>
                    {displayColumns.map((column) => <th key={column} className="px-4 py-3">{column}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={String(row.ID)} className={clsx("transition-colors", t.tableRow, t.navHover)}>
                      {displayColumns.map((column) => (
                        <td key={column} className={clsx("px-4 py-3", column === "ID" ? `font-mono ${t.textMuted}` : t.textSecondary)}>
                          {column === "Actions" && typeof row.ID === "number" ? (
                            <Button type="button" size="sm" variant="danger" disabled={deletingId === row.ID} onClick={() => handleDelete(row.ID as number)}>
                              {deletingId === row.ID ? "Suppression..." : "Supprimer"}
                            </Button>
                          ) : (
                            row[column] ?? "-"
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ComponentCard>
      </PageStack>
    </>
  );
}
