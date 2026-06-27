import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getTournaments, type PublicTournament } from "../../api";
import EntityImage from "../../components/common/EntityImage";
import { XPageMeta } from "../../components/common/PageMeta";
import { statusLabel, statusTone } from "../../components/common/statusLabels";
import { APP_NAME } from "../../config/app";
import { ArrowRightIcon, ShootingStarIcon } from "../../icons";

const FEATURES = [
  {
    tag: "01 // TOURNOIS",
    title: "Tournois locaux",
    desc: "Creez des tournois, suivez leur validation admin et publiez uniquement les tournois acceptes.",
  },
  {
    tag: "02 // EQUIPES",
    title: "Equipes et joueurs",
    desc: "Gerez les equipes, les effectifs, les demandes d'inscription et les compositions de match.",
  },
  {
    tag: "03 // MATCHS",
    title: "Resultats et classements",
    desc: "Planifiez les matchs, saisissez les resultats, recalculez les classements et suivez les statistiques.",
  },
];

const FAQS = [
  {
    q: "Quel type de tournoi puis-je gerer ?",
    a: "Des tournois locaux de football avec equipes, joueurs, demandes d'inscription, matchs, resultats et classements.",
  },
  {
    q: "Les tournois sont-ils publics automatiquement ?",
    a: "Non. Un tournoi cree par un utilisateur reste en attente jusqu'a validation par un administrateur.",
  },
  {
    q: "Puis-je suivre les joueurs et les statistiques ?",
    a: "Oui. L'application gere les joueurs, les compositions, les evenements de match et les statistiques.",
  },
];

function formatDate(date?: string | null) {
  if (!date) return "-";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function PublicStatusBadge({ value }: { value?: string | null }) {
  const tone = statusTone(value) || "bg-zinc-800 text-zinc-300";

  return (
    <span className={`inline-flex rounded-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${tone}`}>
      {statusLabel(value)}
    </span>
  );
}

function TournamentMeta({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-zinc-600">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-medium text-zinc-200" title={value || "-"}>
        {value || "-"}
      </p>
    </div>
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
  return (
    <section id="public-tournaments" className="border-y border-zinc-900 bg-zinc-950/40 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-brand-400">
              Acces public
            </p>
            <h2 className="mt-3 text-2xl font-bold uppercase tracking-tight text-zinc-50 md:text-3xl">
              Tournois disponibles
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-500">
            Consultez les tournois acceptes par l'administration, leurs lieux, leurs dates et leurs informations publiques.
          </p>
        </div>

        {loading && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-80 animate-pulse rounded-md border border-zinc-900 bg-zinc-950/70" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-md border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && tournaments.length === 0 && (
          <div className="rounded-md border border-zinc-900 bg-zinc-950/60 px-5 py-12 text-center">
            <p className="text-sm font-medium text-zinc-300">Aucun tournoi disponible pour le moment.</p>
            <p className="mt-2 text-xs text-zinc-600">
              Les tournois apparaitront ici apres validation par un administrateur.
            </p>
          </div>
        )}

        {!loading && !error && tournaments.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {tournaments.map((tournament) => (
              <article
                key={tournament.id}
                className="group overflow-hidden rounded-md border border-zinc-900 bg-zinc-950/70 text-left transition-colors hover:border-brand-500/30"
              >
                <EntityImage
                  src={tournament.banner_path}
                  name={tournament.name}
                  className="h-44 w-full border-0 bg-brand-500/10"
                />

                <div className="space-y-5 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-bold text-zinc-50" title={tournament.name}>
                        {tournament.name}
                      </h3>
                      <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-relaxed text-zinc-500">
                        {tournament.description || "Informations publiques du tournoi."}
                      </p>
                    </div>
                    <PublicStatusBadge value={tournament.status ?? tournament.approval_status} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <TournamentMeta label="Ville" value={tournament.city} />
                    <TournamentMeta label="Lieu" value={tournament.location} />
                    <TournamentMeta label="Debut" value={formatDate(tournament.start_date)} />
                    <TournamentMeta label="Fin" value={formatDate(tournament.end_date)} />
                  </div>

                  <Link
                    to={`/tournaments/${tournament.id}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-sm border border-brand-500/50 bg-brand-500 px-4 py-2.5 text-[11px] font-mono font-bold uppercase tracking-widest text-white transition-colors hover:bg-brand-600"
                  >
                    Voir d&eacute;tails
                    <ArrowRightIcon className="size-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function LandingNav() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-zinc-900/80 bg-black/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="group flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-zinc-900 text-brand-400 ring-1 ring-brand-500/30">
            <ShootingStarIcon className="size-5" />
          </div>
          <span className="text-sm font-semibold uppercase tracking-widest text-zinc-50">
            Gestion<span className="text-brand-400">Tournois</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-xs font-semibold uppercase tracking-wider text-zinc-400 md:flex">
          <Link to="/#public-tournaments" className="border-b-2 border-transparent py-1.5 transition-colors hover:border-brand-500 hover:text-zinc-100">
            Tournois
          </Link>
          <Link to="/#features" className="border-b-2 border-transparent py-1.5 transition-colors hover:border-brand-500 hover:text-zinc-100">
            Fonctionnalites
          </Link>
          <Link to="/#faq" className="border-b-2 border-transparent py-1.5 transition-colors hover:border-brand-500 hover:text-zinc-100">
            FAQ
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="hidden rounded-sm border border-zinc-800 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white sm:inline-block"
          >
            Dashboard
          </Link>
          <Link
            to="/login"
            className="rounded-sm bg-brand-500 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(70,95,255,0.2)] transition-colors hover:bg-brand-600"
          >
            Connexion
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [tournaments, setTournaments] = useState<PublicTournament[]>([]);
  const [loadingTournaments, setLoadingTournaments] = useState(true);
  const [tournamentsError, setTournamentsError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadTournaments() {
      setLoadingTournaments(true);
      setTournamentsError("");

      try {
        const data = await getTournaments();
        if (!active) return;
        setTournaments(
          data.filter((tournament) => (
            !tournament.approval_status
            || ["accepted", "approved"].includes(tournament.approval_status)
          )),
        );
      } catch (err) {
        if (!active) return;
        setTournamentsError(err instanceof Error ? err.message : "Impossible de charger les tournois publics.");
      } finally {
        if (active) setLoadingTournaments(false);
      }
    }

    void loadTournaments();

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <XPageMeta
        title="Accueil"
        description="Plateforme de gestion des tournois locaux de football"
      />

      <div className="min-h-screen bg-[#050507] font-sans text-zinc-400">
        <LandingNav />

        <section className="relative overflow-hidden pb-24 pt-32 md:pb-32 md:pt-40">
          <div className="pointer-events-none absolute left-1/4 top-1/3 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand-500/[0.07] blur-[120px]" />
          <div className="pointer-events-none absolute right-1/4 top-1/4 h-[400px] w-[400px] translate-x-1/2 rounded-full bg-violet-500/[0.05] blur-[140px]" />

          <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-sm border border-brand-500/30 bg-zinc-900/40 px-3 py-1 backdrop-blur-md shadow-[0_0_15px_rgba(70,95,255,0.08)]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400" />
              <span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-brand-400">
                {APP_NAME} - Tournois locaux
              </span>
            </div>

            <h1 className="mt-8 text-4xl font-black uppercase italic leading-none tracking-tighter text-zinc-100 sm:text-5xl md:text-7xl">
              Organisez vos
              <br />
              <span className="bg-gradient-to-r from-brand-400 via-zinc-100 to-violet-400 bg-clip-text text-transparent">
                tournois locaux.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-zinc-400 md:text-base">
              Une interface moderne pour gerer les tournois, equipes, joueurs, demandes, matchs,
              classements, statistiques et compositions.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-sm bg-brand-500 px-8 py-3 text-[11px] font-mono font-bold uppercase tracking-widest text-white shadow-[0_0_25px_rgba(70,95,255,0.25)] transition-all duration-200 hover:bg-brand-600 hover:shadow-[0_0_35px_rgba(70,95,255,0.4)]"
              >
                Se connecter
                <ArrowRightIcon className="size-4" />
              </Link>
              <a
                href="#public-tournaments"
                className="rounded-sm border border-zinc-800 bg-transparent px-8 py-3 text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-400 transition-all duration-200 hover:bg-zinc-900/50 hover:text-zinc-200"
              >
                Voir les tournois
              </a>
            </div>

            <div className="mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { label: "Tournois", value: "Publics" },
                { label: "Equipes", value: "Locales" },
                { label: "Classements", value: "Automatiques" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-md border border-white/[0.06] bg-zinc-950/60 p-5 backdrop-blur-xl"
                >
                  <p className="text-2xl font-semibold text-white">{stat.value}</p>
                  <p className="mt-1 text-sm text-zinc-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <PublicTournamentsSection
          tournaments={tournaments}
          loading={loadingTournaments}
          error={tournamentsError}
        />

        <section id="features" className="border-y border-zinc-900 bg-zinc-950/30 py-24">
          <div className="mx-auto max-w-5xl px-6">
            <div className="mb-14 space-y-3 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md border border-white/[0.08] bg-white/[0.04]">
                <ShootingStarIcon className="size-6 text-brand-400" />
              </div>
              <h2 className="text-2xl font-bold uppercase tracking-tight text-zinc-50">
                Modules principaux
              </h2>
              <p className="mx-auto max-w-lg text-sm text-zinc-500">
                Le flux est centre sur les tournois locaux, de la creation a la saisie des resultats.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {FEATURES.map((f) => (
                <div
                  key={f.tag}
                  className="space-y-3 rounded-md border border-zinc-900 bg-zinc-950/50 p-6 text-left transition-colors hover:border-brand-500/20"
                >
                  <div className="text-[10px] font-mono font-bold uppercase text-brand-400">
                    {f.tag}
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
                    {f.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-zinc-500">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="border-t border-zinc-900 bg-zinc-950/20 py-20">
          <div className="mx-auto max-w-3xl px-6">
            <div className="mb-12 space-y-2 text-center">
              <h2 className="text-xl font-bold uppercase tracking-tight text-zinc-50">
                Questions frequentes
              </h2>
              <p className="text-xs text-zinc-500">
                Les bases du flux de gestion des tournois.
              </p>
            </div>

            <div className="space-y-3 text-left">
              {FAQS.map((item, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={item.q}
                    className="overflow-hidden rounded-md border border-zinc-900 bg-zinc-950"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="flex w-full cursor-pointer items-center justify-between p-4 text-left text-xs font-bold text-zinc-300 transition-colors hover:bg-zinc-900/40 focus:outline-none"
                    >
                      <span>{item.q}</span>
                      <svg
                        className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? "rotate-180 text-brand-400" : "text-zinc-500"}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div
                      className={`overflow-hidden transition-all ${isOpen ? "max-h-32 border-t border-zinc-900" : "max-h-0"}`}
                    >
                      <p className="bg-zinc-900/10 p-4 text-xs leading-relaxed text-zinc-500">
                        {item.a}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-900 py-16">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="text-2xl font-bold text-white md:text-3xl">
              Pret a gerer votre prochain tournoi ?
            </h2>
            <p className="mt-4 text-sm text-zinc-500">
              Accedez au dashboard ou consultez les tournois publics acceptes.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-sm bg-brand-500 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
              >
                Acceder au dashboard
                <ArrowRightIcon className="size-4" />
              </Link>
              <a
                href="#public-tournaments"
                className="rounded-sm border border-zinc-700 px-8 py-3 text-sm font-semibold text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
              >
                Voir les tournois
              </a>
            </div>
            <p className="mt-10 text-[10px] font-mono uppercase tracking-widest text-zinc-600">
              (c) {new Date().getFullYear()} {APP_NAME}
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
