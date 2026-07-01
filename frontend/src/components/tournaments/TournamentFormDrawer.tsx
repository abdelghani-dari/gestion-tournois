import { type FormEvent, useEffect, useState } from "react";
import { clsx } from "clsx";
import { ApiError, createTournament, getMyTournaments, updateTournament, type CreateTournamentPayload } from "../../api";
import Button from "../common/Button";
import FormDrawer from "../common/FormDrawer";
import ImageSourceInput, { type ImageSourceMode } from "../common/ImageSourceInput";
import { modalFormFooterClass } from "../common/formStyles";
import { useThemeTokens } from "../theme/useThemeTokens";
const emptyForm: CreateTournamentPayload = {
  name: "",
  description: "",
  city: "",
  location: "",
  banner_path: "",
  format: "league",
  start_date: "",
  end_date: "",
};

type Props = {
  open: boolean;
  editId?: number | null;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function TournamentFormDrawer({ open, editId, onClose, onSuccess }: Props) {
  const t = useThemeTokens();
  const isEditing = Boolean(editId);
  const [form, setForm] = useState<CreateTournamentPayload>(emptyForm);
  const [bannerMode, setBannerMode] = useState<ImageSourceMode>("upload");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const isBusy = submitting || loadingExisting;

  const fieldClass = clsx(
    "w-full rounded-sm border px-3 py-2 text-sm placeholder:opacity-[0.22] focus:border-brand-500/50 focus:outline-none",
    t.border,
    t.metricBg,
    t.textPrimary,
  );

  const updateForm = (key: keyof CreateTournamentPayload, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  useEffect(() => {
    if (!open) return;
    setError("");
    if (!editId) {
      setForm(emptyForm);
      setBannerFile(null);
      setBannerMode("upload");
      return;
    }

    let active = true;
    async function loadEditableTournament() {
      setLoadingExisting(true);
      try {
        const tournaments = await getMyTournaments();
        const tournament = tournaments.find((item) => item.id === editId);
        if (!active) return;
        if (!tournament) {
          setError("Tournoi introuvable.");
          return;
        }
        setForm({
          name: tournament.name,
          description: tournament.description ?? "",
          city: tournament.city ?? "",
          location: tournament.location ?? "",
          banner_path: tournament.banner_path ?? "",
          format: "league",
          start_date: tournament.start_date?.slice(0, 10) ?? "",
          end_date: tournament.end_date?.slice(0, 10) ?? "",
        });
        setBannerFile(null);
        setBannerMode("url");
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Impossible de charger le tournoi.");
      } finally {
        if (active) setLoadingExisting(false);
      }
    }
    void loadEditableTournament();
    return () => { active = false; };
  }, [open, editId]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const payload = { ...form, format: "league" as const };

    try {
      if (isEditing && editId) {
        if (bannerMode === "upload" && bannerFile) {
          throw new Error("Utilisez une URL d'image pour modifier la bannière.");
        }
        await updateTournament(editId, {
          name: payload.name,
          description: payload.description?.trim() || undefined,
          city: payload.city?.trim() || undefined,
          location: payload.location?.trim() || undefined,
          banner_path: payload.banner_path?.trim() || undefined,
          banner_url: payload.banner_path?.trim() || undefined,
          format: "league",
          start_date: payload.start_date,
          end_date: payload.end_date,
        });
      } else {
        await createTournament({
          name: payload.name,
          description: payload.description?.trim() || undefined,
          city: payload.city?.trim() || undefined,
          location: payload.location?.trim() || undefined,
          banner: bannerMode === "upload" ? bannerFile : null,
          banner_url: bannerMode === "url" ? payload.banner_path?.trim() || undefined : undefined,
          format: "league",
          start_date: payload.start_date,
          end_date: payload.end_date,
        });
        setForm(emptyForm);
        setBannerFile(null);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError && err.status === 401
        ? "Votre session a expiré."
        : err instanceof Error ? err.message : "Impossible d'enregistrer le tournoi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormDrawer
      open={open}
      onClose={onClose}
      title={isEditing ? "Modifier un tournoi" : "Créer un tournoi"}
      description={isEditing ? "Ajustez les informations." : "Proposez un tournoi local."}
      className="max-w-lg w-full"
    >
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="tournament-name" className={clsx("mb-1 block text-xs", t.textSecondary)}>Nom *</label>
          <input id="tournament-name" value={form.name} onChange={(e) => updateForm("name", e.target.value)} required disabled={isBusy} placeholder="Coupe de la ville" className={fieldClass} />
        </div>
        <div>
          <label htmlFor="tournament-city" className={clsx("mb-1 block text-xs", t.textSecondary)}>Ville</label>
          <input id="tournament-city" value={form.city} onChange={(e) => updateForm("city", e.target.value)} disabled={isBusy} placeholder="Casablanca" className={fieldClass} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="tournament-location" className={clsx("mb-1 block text-xs", t.textSecondary)}>Lieu</label>
          <input id="tournament-location" value={form.location} onChange={(e) => updateForm("location", e.target.value)} disabled={isBusy} placeholder="Stade municipal" className={fieldClass} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="tournament-description" className={clsx("mb-1 block text-xs", t.textSecondary)}>Description</label>
          <textarea id="tournament-description" value={form.description} onChange={(e) => updateForm("description", e.target.value)} disabled={isBusy} rows={2} placeholder="Tournoi local…" className={clsx(fieldClass, "resize-y")} />
        </div>
        <div>
          <label htmlFor="tournament-start" className={clsx("mb-1 block text-xs", t.textSecondary)}>Date début *</label>
          <input id="tournament-start" type="date" value={form.start_date} onChange={(e) => updateForm("start_date", e.target.value)} required disabled={isBusy} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="tournament-end" className={clsx("mb-1 block text-xs", t.textSecondary)}>Date fin *</label>
          <input id="tournament-end" type="date" value={form.end_date} onChange={(e) => updateForm("end_date", e.target.value)} required disabled={isBusy} className={fieldClass} />
        </div>
        <div className="sm:col-span-2">
          <ImageSourceInput
            label="Bannière"
            name="banner"
            mode={bannerMode}
            onModeChange={setBannerMode}
            file={bannerFile}
            onFileChange={setBannerFile}
            url={form.banner_path ?? ""}
            onUrlChange={(value) => updateForm("banner_path", value)}
            previewName={form.name || "Tournoi"}
            disabled={isBusy}
            compact
          />
        </div>
        <div className="sm:col-span-2">
          {error && <div className="mb-2 rounded-sm border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</div>}
          <div className={modalFormFooterClass()}>
            <Button type="submit" disabled={isBusy} className="w-full sm:w-auto">
              {submitting ? (isEditing ? "Modification..." : "Création...") : isEditing ? "Enregistrer" : "Créer le tournoi"}
            </Button>
          </div>
        </div>
      </form>
    </FormDrawer>
  );
}
