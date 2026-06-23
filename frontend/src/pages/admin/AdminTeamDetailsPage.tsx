import { Link, useParams } from "react-router";
import { clsx } from "clsx";
import { useCallback, useEffect, useState } from "react";
import { createAdminPlayer, getAdminTeam, type ApiTeam, type PlayerPayload } from "../../api";
import Button from "../../components/common/Button";
import ComponentCard from "../../components/common/ComponentCard";
import EntityImage from "../../components/common/EntityImage";
import ImageSourceInput, { type ImageSourceMode } from "../../components/common/ImageSourceInput";
import { XPageMeta } from "../../components/common/PageMeta";
import PageStack from "../../components/common/PageStack";
import XModal from "../../components/common/XModal";
import { useThemeTokens } from "../../components/theme/useThemeTokens";
import { useAuth } from "../../context/AuthContext";

const emptyPlayerForm: Omit<PlayerPayload, "team_id"> = {
  first_name: "",
  last_name: "",
  birth_date: "",
  position: "",
  number: undefined,
  photo_path: "",
};

export default function AdminTeamDetailsPage() {
  const { id } = useParams();
  const t = useThemeTokens();
  const { isAdmin, loading: authLoading } = useAuth();
  const [team, setTeam] = useState<ApiTeam | null>(null);
  const [form, setForm] = useState(emptyPlayerForm);
  const [photoMode, setPhotoMode] = useState<ImageSourceMode>("url");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const loadTeam = useCallback(async () => {
    if (!isAdmin || !id) return;
    setLoading(true);
    setError("");
    try {
      setTeam(await getAdminTeam(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger l'équipe.");
    } finally {
      setLoading(false);
    }
  }, [id, isAdmin]);

  useEffect(() => {
    if (!authLoading) {
      const timer = window.setTimeout(() => void loadTeam(), 0);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [authLoading, loadTeam]);

  const closeCreate = () => {
    setCreateOpen(false);
    setForm(emptyPlayerForm);
    setPhotoMode("url");
    setPhotoFile(null);
  };

  const handleAddPlayer = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!team) return;
    setSaving(true);
    setError("");
    try {
      await createAdminPlayer({
        team_id: team.id,
        ...form,
        number: form.number ? Number(form.number) : undefined,
        photo: photoFile,
        photo_url: form.photo_path?.trim() || undefined,
      });
      closeCreate();
      await loadTeam();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ajout impossible.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <XPageMeta title="Détails équipe" description="Administration" />
      <PageStack>
        <Link to="/admin/teams" className="text-sm font-medium text-brand-500 hover:text-brand-400">Retour aux équipes</Link>
        <ComponentCard
          title={team?.name ?? "Equipe"}
          desc="Informations équipe et joueurs"
          action={team ? <Button type="button" onClick={() => setCreateOpen(true)}>Ajouter un joueur</Button> : undefined}
        >
          {!isAdmin ? (
            <div className="rounded-sm border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">Accès administrateur requis.</div>
          ) : loading ? (
            <p className={clsx("py-8 text-center text-sm", t.textMuted)}>Chargement...</p>
          ) : error ? (
            <div className="rounded-sm border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
          ) : team ? (
            <div className="space-y-6">
              <div className={clsx("rounded-md border p-4", t.card)}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <EntityImage src={team.logo_path} name={team.name} className="h-14 w-14 shrink-0 rounded-md" />
                  <div className="min-w-0">
                    <p className={clsx("truncate text-lg font-semibold", t.textPrimary)}>{team.name}</p>
                    <p className={clsx("text-sm", t.textSecondary)}>{team.city || "-"}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3 border-t border-white/10 pt-4 sm:grid-cols-2 lg:grid-cols-4">
                  <p className={t.textSecondary}>Ville: <span className={t.textPrimary}>{team.city || "-"}</span></p>
                  <p className={t.textSecondary}>Nom court: <span className={t.textPrimary}>{team.short_name || "-"}</span></p>
                  <p className={t.textSecondary}>Responsable: <span className={t.textPrimary}>{team.manager?.name || "-"}</span></p>
                  <p className={t.textSecondary}>Nombre de joueurs: <span className={t.textPrimary}>{team.players?.length ?? team.players_count ?? 0}</span></p>
                </div>
              </div>

              <div className="x-scroll overflow-x-auto">
                <table className="w-full min-w-[720px] table-fixed text-sm">
                  <thead>
                    <tr className={clsx("text-left text-xs font-semibold uppercase tracking-wider", t.tableHead)}>
                      <th className="px-4 py-3">ID</th>
                      <th className="w-20 px-4 py-3">Photo</th>
                      <th className="px-4 py-3">Prénom</th>
                      <th className="px-4 py-3">Nom</th>
                      <th className="px-4 py-3">Poste</th>
                      <th className="px-4 py-3">Numéro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(team.players ?? []).map((player) => (
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
                        <td className={clsx("px-4 py-3", t.textSecondary)}>{player.position || "-"}</td>
                        <td className={clsx("px-4 py-3", t.textSecondary)}>{player.number ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </ComponentCard>

        <XModal open={createOpen} onClose={closeCreate} title="Ajouter un joueur" className="max-w-3xl">
          <form onSubmit={handleAddPlayer} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input className={clsx("rounded-sm border px-3 py-2 text-sm", t.border, t.metricBg, t.textPrimary)} placeholder="Prénom *" value={form.first_name} required onChange={(e) => setForm((current) => ({ ...current, first_name: e.target.value }))} />
            <input className={clsx("rounded-sm border px-3 py-2 text-sm", t.border, t.metricBg, t.textPrimary)} placeholder="Nom *" value={form.last_name} required onChange={(e) => setForm((current) => ({ ...current, last_name: e.target.value }))} />
            <input type="date" className={clsx("rounded-sm border px-3 py-2 text-sm", t.border, t.metricBg, t.textPrimary)} value={form.birth_date} onChange={(e) => setForm((current) => ({ ...current, birth_date: e.target.value }))} />
            <input className={clsx("rounded-sm border px-3 py-2 text-sm", t.border, t.metricBg, t.textPrimary)} placeholder="Poste" value={form.position} onChange={(e) => setForm((current) => ({ ...current, position: e.target.value }))} />
            <input type="number" min="1" max="99" className={clsx("rounded-sm border px-3 py-2 text-sm", t.border, t.metricBg, t.textPrimary)} placeholder="Numéro" value={form.number ?? ""} onChange={(e) => setForm((current) => ({ ...current, number: e.target.value ? Number(e.target.value) : undefined }))} />
            <div className="md:col-span-2">
              <ImageSourceInput
                label="Photo"
                name="photo"
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
              <Button type="submit" disabled={saving}>{saving ? "Ajout..." : "Ajouter un joueur"}</Button>
            </div>
          </form>
        </XModal>
      </PageStack>
    </>
  );
}
