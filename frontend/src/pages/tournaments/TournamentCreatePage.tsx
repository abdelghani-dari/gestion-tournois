import { type FormEvent, useEffect, useState } from "react";
import { clsx } from "clsx";
import { Link, useNavigate, useSearchParams } from "react-router";
import { ApiError, createTournament, getMyTournaments, updateTournament, type CreateTournamentPayload } from "../../api";
import Button from "../../components/common/Button";
import ComponentCard from "../../components/common/ComponentCard";
import ImageSourceInput, { type ImageSourceMode } from "../../components/common/ImageSourceInput";
import { XPageMeta } from "../../components/common/PageMeta";
import PageStack, { GRID_GAP } from "../../components/common/PageStack";
import { useThemeTokens } from "../../components/theme/useThemeTokens";
import { AngleLeftIcon, ShootingStarIcon } from "../../icons";

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

export default function TournamentCreatePage() {
  const t = useThemeTokens();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditing = Boolean(editId);
  const [form, setForm] = useState<CreateTournamentPayload>(emptyForm);
  const [bannerMode, setBannerMode] = useState<ImageSourceMode>("url");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const isBusy = submitting || loadingExisting;

  const fieldClass = clsx(
    "w-full rounded-sm border px-4 py-2.5 text-sm focus:border-brand-500/50 focus:outline-none",
    t.border,
    t.metricBg,
    t.textPrimary,
  );

  const updateForm = (key: keyof CreateTournamentPayload, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  useEffect(() => {
    if (!editId) {
      setForm(emptyForm);
      setBannerFile(null);
      setBannerMode("url");
      setError("");
      return;
    }

    let active = true;

    async function loadEditableTournament() {
      setLoadingExisting(true);
      setError("");

      try {
        const tournaments = await getMyTournaments();
        const tournament = tournaments.find((item) => String(item.id) === editId);

        if (!active) return;

        if (!tournament) {
          setError("Tournoi introuvable parmi vos tournois.");
          return;
        }

        setForm({
          name: tournament.name,
          description: tournament.description ?? "",
          city: tournament.city ?? "",
          location: tournament.location ?? "",
          banner_path: tournament.banner_path ?? "",
          format: tournament.format === "knockout" ? "knockout" : "league",
          start_date: tournament.start_date?.slice(0, 10) ?? "",
          end_date: tournament.end_date?.slice(0, 10) ?? "",
        });
        setBannerFile(null);
        setBannerMode("url");
      } catch (err) {
        if (!active) return;
        if (err instanceof ApiError && err.status === 401) {
          setError("Votre session a expiré. Veuillez vous reconnecter.");
        } else {
          setError(err instanceof Error ? err.message : "Impossible de charger le tournoi.");
        }
      } finally {
        if (active) setLoadingExisting(false);
      }
    }

    void loadEditableTournament();

    return () => {
      active = false;
    };
  }, [editId]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setSuccess("");
    setError("");

    try {
      if (isEditing && editId) {
        if (bannerMode === "upload" && bannerFile) {
          throw new Error("La modification d'image par fichier n'est pas disponible ici. Utilisez une URL d'image.");
        }

        await updateTournament(Number(editId), {
          name: form.name,
          description: form.description?.trim() || undefined,
          city: form.city?.trim() || undefined,
          location: form.location?.trim() || undefined,
          banner_path: form.banner_path?.trim() || undefined,
          banner_url: form.banner_path?.trim() || undefined,
          format: form.format,
          start_date: form.start_date,
          end_date: form.end_date,
        });

        setSuccess("Tournoi modifié. Redirection...");
        window.setTimeout(() => navigate("/tournaments"), 700);
        return;
      }

      await createTournament({
        name: form.name,
        description: form.description?.trim() || undefined,
        city: form.city?.trim() || undefined,
        location: form.location?.trim() || undefined,
        banner: bannerMode === "upload" ? bannerFile : null,
        banner_url: bannerMode === "url" ? form.banner_path?.trim() || undefined : undefined,
        format: form.format,
        start_date: form.start_date,
        end_date: form.end_date,
      });

      setSuccess("Tournoi créé et envoyé pour validation. Redirection...");
      setForm(emptyForm);
      setBannerFile(null);
      window.setTimeout(() => navigate("/tournaments"), 700);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Votre session a expiré. Veuillez vous reconnecter.");
      } else {
        setError(err instanceof Error ? err.message : "Impossible de créer le tournoi.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <XPageMeta
        title={isEditing ? "Modifier un tournoi" : "Créer un tournoi"}
        description={isEditing ? "Mise à jour de votre tournoi" : "Nouvelle proposition de tournoi local"}
      />
      <PageStack>
        <Link to="/tournaments" className="inline-flex items-center gap-2 text-sm font-medium text-brand-500 hover:text-brand-400">
          <AngleLeftIcon className="size-4" />
          Retour aux tournois
        </Link>

        <div className={clsx("grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px]", GRID_GAP)}>
          <ComponentCard
            title={isEditing ? "Modifier un tournoi" : "Créer un tournoi"}
            desc={isEditing ? "Ajustez les informations visibles pour ce tournoi." : "Renseignez les informations du tournoi à proposer."}
          >
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {error && (
                <div className="rounded-sm border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300 lg:col-span-2">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-sm border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 lg:col-span-2">
                  {success}
                </div>
              )}

              <div>
                <label htmlFor="tournament-create-name" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Nom *</label>
                <input
                  id="tournament-create-name"
                  name="name"
                  value={form.name}
                  onChange={(event) => updateForm("name", event.target.value)}
                  required
                  disabled={isBusy}
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="tournament-create-city" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Ville</label>
                <input
                  id="tournament-create-city"
                  name="city"
                  value={form.city}
                  onChange={(event) => updateForm("city", event.target.value)}
                  disabled={isBusy}
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="tournament-create-location" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Lieu</label>
                <input
                  id="tournament-create-location"
                  name="location"
                  value={form.location}
                  onChange={(event) => updateForm("location", event.target.value)}
                  disabled={isBusy}
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="tournament-create-format" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Format *</label>
                <select
                  id="tournament-create-format"
                  name="format"
                  value={form.format ?? "league"}
                  onChange={(event) => updateForm("format", event.target.value)}
                  required
                  disabled={isBusy}
                  className={fieldClass}
                >
                  <option value="league">Ligue</option>
                  <option value="knockout">Elimination directe</option>
                </select>
              </div>

              <div className="lg:col-span-2">
                <label htmlFor="tournament-create-description" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Description</label>
                <textarea
                  id="tournament-create-description"
                  name="description"
                  value={form.description}
                  onChange={(event) => updateForm("description", event.target.value)}
                  disabled={isBusy}
                  rows={4}
                  className={clsx(fieldClass, "resize-y")}
                />
              </div>

              <div className="lg:col-span-2">
                <ImageSourceInput
                  label="Image du tournoi"
                  name="banner"
                  mode={bannerMode}
                  onModeChange={setBannerMode}
                  file={bannerFile}
                  onFileChange={setBannerFile}
                  url={form.banner_path ?? ""}
                  onUrlChange={(value) => updateForm("banner_path", value)}
                  previewName={form.name || "Tournoi"}
                  disabled={isBusy}
                />
                {isEditing && (
                  <p className={clsx("mt-2 text-xs", t.textMuted)}>
                    En modification, utilisez une URL d'image pour remplacer la bannière.
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="tournament-create-start-date" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Date début *</label>
                <input
                  id="tournament-create-start-date"
                  name="start_date"
                  type="date"
                  value={form.start_date}
                  onChange={(event) => updateForm("start_date", event.target.value)}
                  required
                  disabled={isBusy}
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="tournament-create-end-date" className={clsx("mb-1.5 block text-sm", t.textSecondary)}>Date fin *</label>
                <input
                  id="tournament-create-end-date"
                  name="end_date"
                  type="date"
                  value={form.end_date}
                  onChange={(event) => updateForm("end_date", event.target.value)}
                  required
                  disabled={isBusy}
                  className={fieldClass}
                />
              </div>

              <div className="flex flex-wrap gap-3 lg:col-span-2">
                <Button type="submit" disabled={isBusy || Boolean(isEditing && !editId)}>
                  {submitting
                    ? isEditing ? "Modification..." : "Création..."
                    : isEditing ? "Modifier le tournoi" : "Créer un tournoi"}
                </Button>
                <Link
                  to="/tournaments"
                  className={clsx("inline-flex items-center justify-center rounded-sm border px-4 py-2 text-sm font-medium transition-colors", t.btnSecondary)}
                >
                  Annuler
                </Link>
              </div>
            </form>
          </ComponentCard>

          <ComponentCard title="Validation" desc="Après création">
            <div className={clsx("rounded-md border p-5", t.card)}>
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-500/15 text-brand-400">
                  <ShootingStarIcon className="size-5" />
                </span>
                <div>
                  <p className={clsx("font-semibold", t.textPrimary)}>Proposez un nouveau tournoi local</p>
                  <p className={clsx("mt-2 text-sm", t.textSecondary)}>
                    Votre demande sera envoyée pour validation avant d'apparaître dans la liste publique.
                  </p>
                </div>
              </div>
            </div>
          </ComponentCard>
        </div>
      </PageStack>
    </>
  );
}
