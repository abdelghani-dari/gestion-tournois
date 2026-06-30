import { clsx } from "clsx";
import { useCallback, useEffect, useState } from "react";
import { ApiError, createAdminPlayer, deletePlayer, getAdminPlayers, getAdminTeams, type ApiPlayer, type ApiTeam, type PlayerPayload } from "../../api";
import Button from "../../components/common/Button";
import ConfirmModal from "../../components/common/ConfirmModal";
import FormSearchableSelect from "../../components/common/FormSearchableSelect";
import ComponentCard from "../../components/common/ComponentCard";
import EntityImage from "../../components/common/EntityImage";
import ImageSourceInput, { type ImageSourceMode } from "../../components/common/ImageSourceInput";
import { XPageMeta } from "../../components/common/PageMeta";
import PageStack from "../../components/common/PageStack";
import XModal from "../../components/common/XModal";
import { useThemeTokens } from "../../components/theme/useThemeTokens";
import { useAuth } from "../../context/AuthContext";

const emptyForm: PlayerPayload = {
  team_id: 0,
  first_name: "",
  last_name: "",
  birth_date: "",
  position: "",
  number: undefined,
  photo_path: "",
};

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString("fr-FR") : "-";
}

export default function AdminPlayersPage() {
  const t = useThemeTokens();
  const { isAdmin, loading: authLoading } = useAuth();
  const [players, setPlayers] = useState<ApiPlayer[]>([]);
  const [teams, setTeams] = useState<ApiTeam[]>([]);
  const [form, setForm] = useState<PlayerPayload>(emptyForm);
  const [photoMode, setPhotoMode] = useState<ImageSourceMode>("upload");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [playerToDelete, setPlayerToDelete] = useState<ApiPlayer | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError("");
    try {
      const [playersData, teamsData] = await Promise.all([getAdminPlayers(), getAdminTeams()]);
      setPlayers(playersData);
      setTeams(teamsData);
      setForm((current) => ({ ...current, team_id: current.team_id || teamsData[0]?.id || 0 }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger les joueurs.");
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!authLoading) {
      const timer = window.setTimeout(() => void loadData(), 0);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [authLoading, loadData]);

  const closeCreate = () => {
    setCreateOpen(false);
    setForm({ ...emptyForm, team_id: teams[0]?.id || 0 });
    setPhotoFile(null);
    setPhotoMode("url");
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await createAdminPlayer({
        ...form,
        team_id: Number(form.team_id),
        number: form.number ? Number(form.number) : undefined,
        photo: photoFile,
        photo_url: form.photo_path?.trim() || undefined,
      });
      closeCreate();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ajout impossible.");
    } finally {
      setSaving(false);
    }
  };

  const playerName = (player: ApiPlayer) => `${player.first_name} ${player.last_name}`.trim();

  const handleConfirmDelete = async () => {
    if (!playerToDelete) return;

    setDeletingId(playerToDelete.id);
    setError("");
    setSuccess("");

    try {
      await deletePlayer(playerToDelete.id);
      setSuccess("Joueur supprime.");
      setPlayerToDelete(null);
      await loadData();
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setError("Suppression refusee par l'API pour ce joueur.");
      } else {
        setError(err instanceof Error ? err.message : "Suppression impossible.");
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <XPageMeta title="Admin Joueurs" description="Tous les joueurs" />
      <PageStack>
        <ComponentCard
          title="Joueurs"
          desc="Tous les joueurs de toutes les équipes"
          action={<Button type="button" onClick={() => setCreateOpen(true)}>Ajouter un joueur</Button>}
        >
          {!isAdmin ? (
            <div className="rounded-sm border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">Accès administrateur requis.</div>
          ) : (
            <div className="space-y-5">
              {(error || success) && (
                <div
                  className={clsx(
                    "rounded-sm border px-4 py-3 text-sm",
                    error ? "border-red-500/20 bg-red-500/10 text-red-300" : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
                  )}
                >
                  {error || success}
                </div>
              )}
              {loading ? (
                <p className={clsx("py-8 text-center text-sm", t.textMuted)}>Chargement...</p>
              ) : players.length === 0 ? (
                <p className={clsx("py-8 text-center text-sm", t.textMuted)}>Aucun joueur disponible.</p>
              ) : (
                <div className="x-scroll overflow-x-auto">
                  <table className="w-full min-w-[980px] table-fixed text-sm">
                    <thead>
                      <tr className={clsx("text-left text-xs font-semibold uppercase tracking-wider", t.tableHead)}>
                        <th className="px-4 py-3">ID</th>
                        <th className="w-20 px-4 py-3">Photo</th>
                        <th className="px-4 py-3">Prénom</th>
                        <th className="px-4 py-3">Nom</th>
                        <th className="px-4 py-3">Équipe</th>
                        <th className="px-4 py-3">Poste</th>
                        <th className="px-4 py-3">Numéro</th>
                        <th className="px-4 py-3">Créé le</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {players.map((player) => (
                        <tr key={player.id} className={clsx("transition-colors", t.tableRow, t.navHover)}>
                          <td className={clsx("px-4 py-3 font-mono", t.textMuted)}>{player.id}</td>
                          <td className="px-4 py-3">
                            <EntityImage
                              src={player.photo_path}
                              name={`${player.first_name} ${player.last_name}`}
                              className="h-10 w-10 rounded-full"
                            />
                          </td>
                          <td className={clsx("px-4 py-3", t.textPrimary)}>{player.first_name}</td>
                          <td className={clsx("px-4 py-3", t.textPrimary)}>{player.last_name}</td>
                          <td className={clsx("px-4 py-3", t.textSecondary)}>{player.team?.name || "-"}</td>
                          <td className={clsx("px-4 py-3", t.textSecondary)}>{player.position || "-"}</td>
                          <td className={clsx("px-4 py-3", t.textSecondary)}>{player.number ?? "-"}</td>
                          <td className={clsx("px-4 py-3", t.textSecondary)}>{formatDate(player.created_at)}</td>
                          <td className="px-4 py-3">
                            <Button type="button" size="sm" variant="danger" disabled={deletingId === player.id} onClick={() => setPlayerToDelete(player)}>
                              {deletingId === player.id ? "Suppression..." : "Supprimer"}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </ComponentCard>

        <XModal open={createOpen} onClose={closeCreate} title="Ajouter un joueur" className="max-w-3xl">
          <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormSearchableSelect
              id="admin-player-team"
              label="Équipe *"
              value={form.team_id ? String(form.team_id) : ""}
              onChange={(value) => setForm((current) => ({ ...current, team_id: Number(value) }))}
              emptyOptionLabel="Sélectionner une équipe"
              options={teams.map((team) => ({
                value: String(team.id),
                label: team.name,
              }))}
            />
            <input className={clsx("rounded-sm border px-3 py-2 text-sm", t.border, t.metricBg, t.textPrimary)} placeholder="Prénom *" value={form.first_name} required onChange={(e) => setForm((current) => ({ ...current, first_name: e.target.value }))} />
            <input className={clsx("rounded-sm border px-3 py-2 text-sm", t.border, t.metricBg, t.textPrimary)} placeholder="Nom *" value={form.last_name} required onChange={(e) => setForm((current) => ({ ...current, last_name: e.target.value }))} />
            <input type="date" className={clsx("rounded-sm border px-3 py-2 text-sm", t.border, t.metricBg, t.textPrimary)} value={form.birth_date} onChange={(e) => setForm((current) => ({ ...current, birth_date: e.target.value }))} />
            <input className={clsx("rounded-sm border px-3 py-2 text-sm", t.border, t.metricBg, t.textPrimary)} placeholder="Poste" value={form.position} onChange={(e) => setForm((current) => ({ ...current, position: e.target.value }))} />
            <input type="number" min="1" max="99" className={clsx("rounded-sm border px-3 py-2 text-sm", t.border, t.metricBg, t.textPrimary)} placeholder="Numéro" value={form.number ?? ""} onChange={(e) => setForm((current) => ({ ...current, number: e.target.value ? Number(e.target.value) : undefined }))} />
            <div className="md:col-span-2">
              <ImageSourceInput
                label="Photo"
                name="photo"
                variant="photo"
                mode={photoMode}
                onModeChange={setPhotoMode}
                file={photoFile}
                onFileChange={setPhotoFile}
                url={form.photo_path ?? ""}
                onUrlChange={(value) => setForm((current) => ({ ...current, photo_path: value }))}
                previewName={`${form.first_name} ${form.last_name}`.trim() || "Joueur"}
                disabled={saving}
              />
            </div>
            <div className="flex justify-end gap-2 md:col-span-2">
              <Button type="button" variant="secondary" onClick={closeCreate} disabled={saving}>Annuler</Button>
              <Button type="submit" disabled={saving || !form.team_id}>{saving ? "Ajout..." : "Ajouter un joueur"}</Button>
            </div>
          </form>
        </XModal>

        <ConfirmModal
          open={Boolean(playerToDelete)}
          onClose={() => setPlayerToDelete(null)}
          title="Supprimer le joueur"
          message={
            playerToDelete
              ? `Voulez-vous vraiment supprimer le joueur « ${playerName(playerToDelete)} » ? Cette action est irréversible.`
              : ""
          }
          confirmLabel="Supprimer"
          loading={deletingId !== null}
          onConfirm={() => void handleConfirmDelete()}
        />
      </PageStack>
    </>
  );
}
