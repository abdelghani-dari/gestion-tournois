import { useEffect, useState } from "react";
import { Link } from "react-router";
import { clsx } from "clsx";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  MapPin,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { getPublicHomePreview, getMyTournaments, getTournaments, type PublicHomePreview, type PublicTournament } from "../../api";
import ComponentCard from "../../components/common/ComponentCard";
import EntityImage from "../../components/common/EntityImage";
import RankingPreviewTable from "../../components/dashboard/RankingPreviewTable";
import TopScorersCard from "../../components/dashboard/TopScorersCard";
import LandingNav from "../../components/landing/LandingNav";
import LandingFooter from "../../components/landing/LandingFooter";
import { XPageMeta } from "../../components/common/PageMeta";
import { statusLabel, statusTone } from "../../components/common/statusLabels";
import { APP_NAME } from "../../config/app";
import { useThemeTokens } from "../../components/theme/useThemeTokens";
import { useXTheme } from "../../components/context/XThemeContext";
import { useAuth } from "../../context/AuthContext";

const FEATURES = [
  {
    tag: "01 // TOURNOIS",
    title: "Tournois locaux",
    desc: "Créez des tournois, suivez leur validation admin et publiez uniquement les tournois acceptés.",
    icon: Trophy,
  },
  {
    tag: "02 // ÉQUIPES",
    title: "Équipes et joueurs",
    desc: "Gérez les équipes, les effectifs, les demandes d'inscription et les compositions de match.",
    icon: Users,
  },
  {
    tag: "03 // MATCHS",
    title: "Résultats et classements",
    desc: "Planifiez les matchs, saisissez les résultats, recalculez les classements et suivez les statistiques.",
    icon: BarChart3,
  },
];

const FAQS = [
  {
    q: "Qu'est-ce que Tournify ?",
    a: "Tournify est une plateforme web développée par l'équipe D10-PT19 à l'école High-Tech pour gérer des tournois locaux de football : création, équipes, joueurs, matchs, classements et statistiques.",
  },
  {
    q: "Quel type de tournoi puis-je gérer ?",
    a: "Des tournois locaux de football avec équipes, joueurs, demandes d'inscription, matchs, résultats et classements automatiques.",
  },
  {
    q: "Les tournois sont-ils publics automatiquement ?",
    a: "Non. Un tournoi créé par un utilisateur reste en attente jusqu'à validation par un administrateur. Seuls les tournois acceptés apparaissent sur la page d'accueil.",
  },
  {
    q: "Puis-je consulter les tournois sans compte ?",
    a: "Oui. La section « Tournois disponibles » est accessible publiquement. Vous pouvez voir les détails, les matchs et le classement sans vous connecter.",
  },
  {
    q: "Quels rôles existent dans l'application ?",
    a: "Deux rôles principaux : Utilisateur (organisateur de tournois) et Administrateur (validation des tournois et des comptes, supervision globale).",
  },
  {
    q: "Comment fonctionnent les classements ?",
    a: "Les classements sont recalculés automatiquement à partir des résultats des matchs : points, différence de buts, victoires et statistiques associées.",
  },
  {
    q: "Puis-je suivre les joueurs et les statistiques ?",
    a: "Oui. L'application gère les joueurs, les compositions, les événements de match, les buteurs et les statistiques détaillées par tournoi.",
  },
  {
    q: "Ce projet est-il réalisé dans un cadre académique ?",
    a: "Oui. Il s'agit d'un projet de fin d'études réalisé par 7 étudiants en ingénierie informatique à l'école High-Tech, établissement reconnu par l'État au Maroc.",
  },
];

function formatDate(date?: string | null) {
  if (!date) return "—";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function PublicStatusBadge({ value }: { value?: string | null }) {
  const tone = statusTone(value) || "bg-zinc-800 text-zinc-300";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${tone}`}>
      {statusLabel(value)}
    </span>
  );
}

function PublicTournamentsSection({
  tournaments,
  loading,
  error,
}: {
  tournaments: PublicTournament[];
  loading: boolean;
  error: string;
}) {
  const t = useThemeTokens();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(3);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, Math.max(0, tournaments.length - itemsPerPage)));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <section id="public-tournaments" className={clsx("border-y py-24", t.border, t.shellBg)}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-brand-400">
            <ShieldCheck className="size-3.5" />
            Accès public
          </p>
          <h2 className={clsx("mt-4 text-3xl font-black uppercase tracking-tight md:text-4xl", t.textPrimary)}>
            Tournois disponibles
          </h2>
          <p className={clsx("mt-4 text-sm leading-relaxed md:text-base", t.textMuted)}>
            Découvrez les tournois validés par l&apos;administration. Consultez leurs lieux, dates,
            statut et accédez aux détails publics sans créer de compte.
          </p>
        </div>

        {loading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className={clsx("h-72 animate-pulse rounded-xl border", t.card)} />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && tournaments.length === 0 && (
          <div className={clsx("rounded-xl border px-5 py-14 text-center", t.card)}>
            <Trophy className="mx-auto size-10 text-brand-400/60" />
            <p className={clsx("mt-4 text-sm font-medium", t.textPrimary)}>Aucun tournoi disponible pour le moment.</p>
            <p className={clsx("mt-2 text-xs", t.textMuted)}>
              Les tournois apparaîtront ici après validation par un administrateur.
            </p>
          </div>
        )}

        {!loading && !error && tournaments.length > 0 && (
          <div className="relative px-8">
            {/* Carousel container with hidden scrollbar */}
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-300 ease-in-out"
                style={{
                  transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`,
                }}
              >
                {tournaments.map((tournament) => (
                  <div
                    key={tournament.id}
                    className="w-full shrink-0 px-2 sm:w-1/2 lg:w-1/3"
                  >
                    <article className={clsx("group flex flex-col overflow-hidden rounded-xl border transition-colors h-full", t.card, t.cardHover)}>
                      <div className="relative">
                        <EntityImage src={tournament.banner_path} name={tournament.name} className="h-36 w-full border-0 bg-brand-500/10 object-cover" />
                        <div className="absolute right-2 top-2 flex flex-wrap justify-end gap-1">
                          <PublicStatusBadge value={tournament.status ?? tournament.approval_status} />
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col p-3">
                        <h3 className={clsx("line-clamp-1 text-sm font-bold", t.textPrimary)}>{tournament.name}</h3>
                        <p className={clsx("mt-1 line-clamp-2 flex-1 text-[11px] leading-relaxed", t.textMuted)}>
                          {tournament.description || "Informations publiques du tournoi."}
                        </p>
                        <div className={clsx("mt-3 grid grid-cols-2 gap-2 text-[10px]", t.textMuted)}>
                          <span className="inline-flex items-center gap-1"><MapPin className="size-3 text-brand-400" />{tournament.city || "—"}</span>
                          <span className="inline-flex items-center gap-1"><Calendar className="size-3 text-brand-400" />{formatDate(tournament.start_date)}</span>
                        </div>
                        <Link
                          to={`/tournaments/${tournament.id}`}
                          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-brand-600"
                        >
                          Voir les détails
                          <ArrowRight className="size-3.5" />
                        </Link>
                      </div>
                    </article>
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel navigation controls */}
            {tournaments.length > itemsPerPage && (
              <>
                <button
                  type="button"
                  onClick={prevSlide}
                  disabled={currentIndex === 0}
                  className={clsx(
                    "absolute -left-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border shadow-md backdrop-blur-md transition-all",
                    currentIndex === 0 ? "opacity-30 cursor-not-allowed" : "hover:scale-105 active:scale-95",
                    t.card,
                    t.textPrimary,
                    t.border
                  )}
                  aria-label="Précédent"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  disabled={currentIndex >= tournaments.length - itemsPerPage}
                  className={clsx(
                    "absolute -right-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border shadow-md backdrop-blur-md transition-all",
                    currentIndex >= tournaments.length - itemsPerPage ? "opacity-30 cursor-not-allowed" : "hover:scale-105 active:scale-95",
                    t.card,
                    t.textPrimary,
                    t.border
                  )}
                  aria-label="Suivant"
                >
                  <ChevronRight className="size-4" />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function LandingPreviewSection() {
  const t = useThemeTokens();
  const [preview, setPreview] = useState<PublicHomePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadPreview() {
      setLoading(true);
      setError("");
      try {
        const data = await getPublicHomePreview();
        if (active) setPreview(data);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Impossible de charger l'aperçu.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadPreview();
    return () => { active = false; };
  }, []);

  const featuredName = preview?.featured_tournament?.name ?? "Tournoi en vedette";

  return (
    <section className={clsx("border-t py-20", t.border)}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 text-center md:text-left">
          <p className="inline-flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-brand-400">
            <BarChart3 className="size-3.5" />
            Classement &amp; buteurs
          </p>
          <h2 className={clsx("mt-3 text-2xl font-bold uppercase tracking-tight md:text-3xl", t.textPrimary)}>
            Tendances du moment
          </h2>
          <p className={clsx("mt-2 text-sm", t.textMuted)}>{featuredName}</p>
        </div>

        {loading && (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <div className={clsx("h-80 animate-pulse rounded-xl border xl:col-span-8", t.card)} />
            <div className={clsx("h-80 animate-pulse rounded-xl border xl:col-span-4", t.card)} />
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">{error}</div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <div className="xl:col-span-8">
              <ComponentCard title="Classement" desc={`Top 5 · ${featuredName}`}>
                <RankingPreviewTable rankings={preview?.ranking_preview ?? []} limit={5} />
              </ComponentCard>
            </div>
            <div className="xl:col-span-4">
              <ComponentCard title="Meilleurs buteurs" desc="Top 5 de la saison">
                <TopScorersCard scorers={preview?.top_scorers ?? []} limit={5} fill />
              </ComponentCard>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default function LandingPage() {
  const t = useThemeTokens();
  const { theme } = useXTheme();
  const { isAuthenticated, isAdmin, user } = useAuth();
  const canAccessDashboard = isAdmin || (user?.tournament_count ?? 0) > 0;
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [tournaments, setTournaments] = useState<PublicTournament[]>([]);
  const [loadingTournaments, setLoadingTournaments] = useState(true);
  const [tournamentsError, setTournamentsError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadTournaments() {
      setLoadingTournaments(true);
      setTournamentsError("");
      try {
        const publicData = await getTournaments();
        const accepted = publicData.filter((tournament) => (
          !tournament.approval_status
          || ["accepted", "approved"].includes(tournament.approval_status)
        ));
        if (!active) return;
        if (isAuthenticated && isAdmin) {
          setTournaments(accepted);
        } else if (isAuthenticated && user?.id) {
          const mine = await getMyTournaments();
          const mineIds = new Set(mine.map((t) => t.id));
          setTournaments(accepted.filter((t) => mineIds.has(t.id) || Number(t.created_by) === Number(user.id)));
        } else {
          setTournaments(accepted);
        }
      } catch (err) {
        if (!active) return;
        setTournamentsError(err instanceof Error ? err.message : "Impossible de charger les tournois publics.");
      } finally {
        if (active) setLoadingTournaments(false);
      }
    }
    void loadTournaments();
    return () => { active = false; };
  }, [isAuthenticated, isAdmin, user?.id]);

  return (
    <>
      <XPageMeta title="Accueil" description="Plateforme de gestion des tournois locaux de football" />

      <div className={clsx("min-h-screen font-sans", t.shellBg, t.textSecondary)}>
        <LandingNav />

        <section className="relative overflow-hidden pb-24 pt-[5.5rem] md:pb-32 md:pt-36">
          <div className="pointer-events-none absolute left-1/4 top-1/3 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand-500/[0.07] blur-[120px]" />
          <div className="pointer-events-none absolute right-1/4 top-1/4 h-[400px] w-[400px] translate-x-1/2 rounded-full bg-violet-500/[0.05] blur-[140px]" />

          <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
            <div className={clsx("inline-flex items-center gap-2 rounded-full border px-4 py-1.5 backdrop-blur-md", t.glassBox)}>
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400" />
              <span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-brand-400">
                {APP_NAME} · Tournois locaux
              </span>
            </div>

            <h1 className={clsx("mt-8 text-4xl font-black uppercase italic leading-none tracking-tighter sm:text-5xl md:text-7xl", t.textPrimary)}>
              Organisez vos
              <br />
              <span className={clsx("bg-gradient-to-r from-brand-400 via-brand-300 to-violet-400 bg-clip-text text-transparent", theme === "light" && "via-zinc-700")}>
                tournois locaux.
              </span>
            </h1>

            <p className={clsx("mx-auto mt-6 max-w-xl text-sm leading-relaxed md:text-base", t.textMuted)}>
              Une interface moderne pour gérer les tournois, équipes, joueurs, demandes, matchs,
              classements, statistiques et compositions.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              {isAuthenticated ? (
                canAccessDashboard ? (
                  <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-8 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-[0_0_25px_rgba(70,95,255,0.25)] hover:bg-brand-600">
                    Accéder au dashboard
                    <ArrowRight className="size-4" />
                  </Link>
                ) : (
                  <Link to="/tournaments" className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-8 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-[0_0_25px_rgba(70,95,255,0.25)] hover:bg-brand-600">
                    Voir les tournois
                    <Trophy className="size-4" />
                  </Link>
                )
              ) : (
                <>
                  <Link to="/login" className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-8 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-[0_0_25px_rgba(70,95,255,0.25)] hover:bg-brand-600">
                    Se connecter
                    <ArrowRight className="size-4" />
                  </Link>
                  <a href="#public-tournaments" className={clsx("inline-flex items-center gap-2 rounded-lg border px-8 py-3 text-xs font-bold uppercase tracking-widest", t.btnSecondary)}>
                    <Trophy className="size-4" />
                    Voir les tournois
                  </a>
                </>
              )}
            </div>

            <div className="mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { label: "Tournois", value: "Publics", icon: Trophy },
                { label: "Équipes", value: "Locales", icon: Users },
                { label: "Classements", value: "Automatiques", icon: BarChart3 },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className={clsx("rounded-xl border p-5 backdrop-blur-xl", t.card)}>
                  <Icon className="mx-auto size-6 text-brand-400" />
                  <p className={clsx("mt-3 text-2xl font-semibold", t.textPrimary)}>{value}</p>
                  <p className={clsx("mt-1 text-sm", t.textMuted)}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <PublicTournamentsSection tournaments={tournaments} loading={loadingTournaments} error={tournamentsError} />
        <LandingPreviewSection />

        <section id="features" className={clsx("border-y py-24", t.border)}>
          <div className="mx-auto max-w-5xl px-6">
            <div className="mb-14 space-y-3 text-center">
              <Sparkles className="mx-auto size-7 text-brand-400" />
              <h2 className={clsx("text-2xl font-bold uppercase tracking-tight", t.textPrimary)}>Modules principaux</h2>
              <p className={clsx("mx-auto max-w-lg text-sm", t.textMuted)}>
                Le flux est centré sur les tournois locaux, de la création à la saisie des résultats.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {FEATURES.map((f) => (
                <div key={f.tag} className={clsx("space-y-3 rounded-xl border p-6 text-left transition-colors", t.card, t.cardHover)}>
                  <f.icon className="size-6 text-brand-400" />
                  <div className="text-[10px] font-mono font-bold uppercase text-brand-400">{f.tag}</div>
                  <h3 className={clsx("text-sm font-bold uppercase tracking-wider", t.textPrimary)}>{f.title}</h3>
                  <p className={clsx("text-xs leading-relaxed", t.textMuted)}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className={clsx("border-t py-20", t.border)}>
          <div className="mx-auto max-w-3xl px-6">
            <div className="mb-12 space-y-2 text-center">
              <HelpCircle className="mx-auto size-8 text-brand-400" />
              <h2 className={clsx("text-xl font-bold uppercase tracking-tight", t.textPrimary)}>Questions fréquentes</h2>
              <p className={clsx("text-xs", t.textMuted)}>Tout ce qu&apos;il faut savoir sur {APP_NAME} et son utilisation.</p>
            </div>

            <div className="space-y-3 text-left">
              {FAQS.map((item, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={item.q} className={clsx("overflow-hidden rounded-xl border", t.card)}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className={clsx(
                        "flex w-full cursor-pointer items-center justify-between gap-4 p-4 text-left text-sm font-semibold transition-colors focus:outline-none",
                        t.textPrimary,
                        t.navHover,
                      )}
                    >
                      <span>{item.q}</span>
                      <ChevronDown className={clsx("size-4 shrink-0 transition-transform", isOpen ? "rotate-180 text-brand-400" : t.textMuted)} />
                    </button>
                    <div className={clsx("overflow-hidden transition-all", isOpen ? "max-h-48 border-t" : "max-h-0", t.border)}>
                      <p className={clsx("p-4 text-sm leading-relaxed", t.textMuted)}>{item.a}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className={clsx("py-16", t.shellBg)}>
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className={clsx("text-2xl font-bold md:text-3xl", t.textPrimary)}>Prêt à gérer votre prochain tournoi ?</h2>
            <p className={clsx("mt-4 text-sm", t.textMuted)}>Accédez au dashboard ou consultez les tournois publics acceptés.</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              {isAuthenticated ? (
                canAccessDashboard ? (
                  <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-8 py-3 text-sm font-semibold text-white hover:bg-brand-600">
                    Accéder au dashboard
                    <ArrowRight className="size-4" />
                  </Link>
                ) : (
                  <a href="#public-tournaments" className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-8 py-3 text-sm font-semibold text-white hover:bg-brand-600">
                    Voir les tournois disponibles
                    <Trophy className="size-4" />
                  </a>
                )
              ) : (
                <>
                  <Link to="/login" className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-8 py-3 text-sm font-semibold text-white hover:bg-brand-600">
                    Se connecter
                    <ArrowRight className="size-4" />
                  </Link>
                  <a href="#public-tournaments" className={clsx("inline-flex items-center gap-2 rounded-lg border px-8 py-3 text-sm font-semibold", t.btnSecondary)}>
                    Voir les tournois
                  </a>
                </>
              )}
              <Link to="/about" className={clsx("inline-flex items-center gap-2 rounded-lg border px-8 py-3 text-sm font-semibold", t.btnSecondary)}>
                À propos de l&apos;équipe
              </Link>
            </div>
          </div>
        </section>

        <LandingFooter />
      </div>
    </>
  );
}

/** Re-export for public detail pages */
export { default as LandingNav } from "../../components/landing/LandingNav";
