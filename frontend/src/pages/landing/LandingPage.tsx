import { useState } from "react";
import { Link } from "react-router";
import { XPageMeta } from "../../components/common/PageMeta";
import { XSeasonProvider } from "../../components/context/SeasonContext";
import { BOTOLA_LOGO } from "../../components/data/fotmobData";
import { APP_NAME } from "../../components/data/seasonData";
import { ArrowRightIcon, ShootingStarIcon } from "../../icons";
import LandingDashboardPreview from "./LandingDashboardPreview";

const FEATURES = [
  {
    tag: "01 // SAISONS",
    title: "Gestion multi-saisons",
    desc: "Créez et basculez entre vos saisons sportives. Suivez la progression, les journées jouées et l'avancement global.",
  },
  {
    tag: "02 // MATCHS",
    title: "Calendrier & résultats",
    desc: "Planifiez les rencontres, saisissez les scores, gérez les compositions et consultez les statistiques en temps réel.",
  },
  {
    tag: "03 // CLASSEMENTS",
    title: "Stats & classements",
    desc: "Classements automatiques, meilleurs buteurs, forme des équipes et tableaux de bord visuels pour piloter vos compétitions.",
  },
];

const FAQS = [
  {
    q: "Quels types de compétitions puis-je gérer ?",
    a: "Championnats, tournois à élimination directe, phases de groupes et saisons complètes. Tout est centralisé dans un seul dashboard.",
  },
  {
    q: "Les données sont-elles mises à jour en temps réel ?",
    a: "Oui. Chaque résultat saisi met à jour instantanément les classements, les statistiques des joueurs et les graphiques du dashboard.",
  },
  {
    q: "Puis-je gérer plusieurs équipes et joueurs ?",
    a: "Absolument. Importez vos effectifs, consultez les fiches joueurs, les drapeaux de nationalité et les statistiques individuelles par match.",
  },
];

function LandingNav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-900/80 bg-black/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded bg-zinc-900 ring-1 ring-brand-500/30">
            <img src={BOTOLA_LOGO} alt="" className="h-6 w-6 object-contain" />
          </div>
          <span className="text-sm font-semibold uppercase tracking-widest text-zinc-50">
            Gestion<span className="text-brand-400">Tournois</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-xs font-semibold uppercase tracking-wider text-zinc-400 md:flex">
          <a href="#features" className="border-b-2 border-transparent py-1.5 transition-colors hover:border-brand-500 hover:text-zinc-100">
            Fonctionnalités
          </a>
          <a href="#preview" className="border-b-2 border-transparent py-1.5 transition-colors hover:border-brand-500 hover:text-zinc-100">
            Aperçu
          </a>
          <a href="#faq" className="border-b-2 border-transparent py-1.5 transition-colors hover:border-brand-500 hover:text-zinc-100">
            FAQ
          </a>
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
            className="rounded-sm bg-brand-500 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-brand-600 shadow-[0_0_20px_rgba(70,95,255,0.2)]"
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

  return (
    <>
      <XPageMeta
        title="Accueil"
        description="Plateforme de gestion des tournois et championnats sportifs"
      />

      <div className="min-h-screen bg-[#050507] font-sans text-zinc-400">
          <LandingNav />

          {/* Hero */}
          <section className="relative overflow-hidden pt-32 pb-24 md:pt-40 md:pb-32">
            <div className="pointer-events-none absolute top-1/3 left-1/4 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand-500/[0.07] blur-[120px]" />
            <div className="pointer-events-none absolute top-1/4 right-1/4 h-[400px] w-[400px] translate-x-1/2 rounded-full bg-violet-500/[0.05] blur-[140px]" />
            <div className="pointer-events-none absolute top-12 left-12 hidden h-8 w-8 border-l border-t border-zinc-800/60 lg:block" />
            <div className="pointer-events-none absolute top-12 right-12 hidden h-8 w-8 border-r border-t border-zinc-800/60 lg:block" />

            <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
              <div className="inline-flex items-center gap-2 rounded-sm border border-brand-500/30 bg-zinc-900/40 px-3 py-1 backdrop-blur-md shadow-[0_0_15px_rgba(70,95,255,0.08)]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400" />
                <span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-brand-400">
                  {APP_NAME} · Saison 2025-2026
                </span>
              </div>

              <h1 className="mt-8 text-4xl font-black uppercase italic leading-none tracking-tighter text-zinc-100 sm:text-5xl md:text-7xl">
                Pilotez vos
                <br />
                <span className="bg-gradient-to-r from-brand-400 via-zinc-100 to-violet-400 bg-clip-text text-transparent">
                  compétitions.
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-zinc-400 md:text-base">
                Saisons, championnats, tournois, équipes et matchs — une plateforme moderne
                pour les responsables sportifs qui veulent des stats claires et un pilotage sans friction.
              </p>

              <div className="mx-auto mt-6 h-px w-12 bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />

              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-sm bg-brand-500 px-8 py-3 text-[11px] font-mono font-bold uppercase tracking-widest text-white transition-all duration-200 shadow-[0_0_25px_rgba(70,95,255,0.25)] hover:bg-brand-600 hover:shadow-[0_0_35px_rgba(70,95,255,0.4)]"
                >
                  Se connecter
                  <ArrowRightIcon className="size-4" />
                </Link>
                <Link
                  to="/dashboard"
                  className="rounded-sm border border-zinc-800 bg-transparent px-8 py-3 text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-400 transition-all duration-200 hover:bg-zinc-900/50 hover:text-zinc-200"
                >
                  Explorer le dashboard
                </Link>
                <a
                  href="#preview"
                  className="rounded-sm border border-zinc-800/60 px-8 py-3 text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-500 transition-all duration-200 hover:border-brand-500/30 hover:text-brand-400"
                >
                  Voir l&apos;aperçu
                </a>
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-4 text-[9px] font-mono tracking-wider text-zinc-600">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-700">STATUT:</span>
                  <span className="flex items-center gap-1 text-emerald-500">
                    <span className="inline-block h-1 w-1 animate-ping rounded-full bg-emerald-500" />
                    EN LIGNE
                  </span>
                </div>
                <span className="text-zinc-700">|</span>
                <div>
                  <span className="text-zinc-700">DONNÉES:</span>{" "}
                  <span className="text-zinc-400">BOTOLA PRO</span>
                </div>
                <span className="hidden text-zinc-700 sm:inline">|</span>
                <div className="hidden sm:block">
                  <span className="text-zinc-700">MODE:</span>{" "}
                  <span className="text-zinc-400">DASHBOARD LIVE</span>
                </div>
              </div>

              <div className="mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                  { label: "Équipes", value: "16+" },
                  { label: "Matchs gérés", value: "100+" },
                  { label: "Statistiques", value: "Temps réel" },
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

          {/* Features */}
          <section id="features" className="border-y border-zinc-900 bg-zinc-950/30 py-24">
            <div className="mx-auto max-w-5xl px-6">
              <div className="mb-14 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md border border-white/[0.08] bg-white/[0.04]">
                  <ShootingStarIcon className="size-6 text-brand-400" />
                </div>
                <h2 className="text-2xl font-bold uppercase tracking-tight text-zinc-50">
                  Tout ce dont vous avez besoin
                </h2>
                <p className="mx-auto max-w-lg text-sm text-zinc-500">
                  De la planification des matchs aux classements automatiques, chaque module
                  est pensé pour le quotidien des organisateurs.
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

          {/* Dashboard preview */}
          <section id="preview" className="relative py-24">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-500/[0.03] via-transparent to-transparent" />
            <div className="relative px-6">
              <XSeasonProvider>
                <LandingDashboardPreview />
              </XSeasonProvider>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="border-t border-zinc-900 bg-zinc-950/20 py-20">
            <div className="mx-auto max-w-3xl px-6">
              <div className="mb-12 space-y-2 text-center">
                <h2 className="text-xl font-bold uppercase tracking-tight text-zinc-50">
                  Questions fréquentes
                </h2>
                <p className="text-xs text-zinc-500">
                  Tout ce qu&apos;il faut savoir avant de démarrer.
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

          {/* Footer CTA */}
          <section className="border-t border-zinc-900 py-16">
            <div className="mx-auto max-w-3xl px-6 text-center">
              <h2 className="text-2xl font-bold text-white md:text-3xl">
                Prêt à gérer votre prochaine saison ?
              </h2>
              <p className="mt-4 text-sm text-zinc-500">
                Accédez au dashboard complet ou connectez-vous pour commencer.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 rounded-sm bg-brand-500 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
                >
                  Accéder au dashboard
                  <ArrowRightIcon className="size-4" />
                </Link>
                <Link
                  to="/login"
                  className="rounded-sm border border-zinc-700 px-8 py-3 text-sm font-semibold text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
                >
                  Connexion
                </Link>
              </div>
              <p className="mt-10 text-[10px] font-mono uppercase tracking-widest text-zinc-600">
                © {new Date().getFullYear()} {APP_NAME}
              </p>
            </div>
          </section>
        </div>
    </>
  );
}
