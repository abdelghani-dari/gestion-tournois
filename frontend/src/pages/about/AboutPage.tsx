import { Link } from "react-router";
import { clsx } from "clsx";
import {
  Award,
  BookOpen,
  Building2,
  ExternalLink,
  GraduationCap,
  MapPin,
  Users,
} from "lucide-react";
import LandingNav from "../../components/landing/LandingNav";
import LandingFooter from "../../components/landing/LandingFooter";
import { XPageMeta } from "../../components/common/PageMeta";
import { APP_NAME } from "../../config/app";
import {
  HIGHTECH_LOGO,
  TEAM_AVATAR,
  TEAM_MEMBERS,
  TEAM_NAME,
} from "../../data/teamMembers";
import { useThemeTokens } from "../../components/theme/useThemeTokens";

export default function AboutPage() {
  const t = useThemeTokens();

  return (
    <>
      <XPageMeta
        title="À propos"
        description={`Découvrez l'équipe ${TEAM_NAME} et l'école High-Tech derrière ${APP_NAME}`}
      />

      <div className={clsx("min-h-screen font-sans", t.shellBg, t.textSecondary)}>
        <LandingNav />

        <main className="pb-20 pt-[4.25rem]">
          <section className={clsx("relative overflow-hidden border-b py-16 md:py-24", t.borderSubtle)}>
            <div className="pointer-events-none absolute left-1/3 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-500/10 blur-[100px]" />
            <div className="relative mx-auto max-w-4xl px-6 text-center">
              <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-brand-400">
                Équipe {TEAM_NAME}
              </p>
              <h1 className={clsx("mt-4 text-3xl font-black uppercase tracking-tight md:text-5xl", t.textPrimary)}>
                À propos de nous
              </h1>
              <p className={clsx("mx-auto mt-5 max-w-2xl text-sm leading-relaxed md:text-base", t.textMuted)}>
                Nous sommes une équipe de 7 étudiants en ingénierie informatique à l&apos;école
                High-Tech, un établissement d&apos;enseignement supérieur privé reconnu par l&apos;État
                au Maroc. Ce projet de fin d&apos;études vise à moderniser la gestion des tournois
                locaux de football.
              </p>
            </div>
          </section>

          <section className="py-16 md:py-20">
            <div className="mx-auto max-w-6xl px-6">
              <div
                className={clsx(
                  "overflow-hidden rounded-2xl border",
                  t.card,
                )}
              >
                <div className="grid grid-cols-1 lg:grid-cols-5">
                  <div className={clsx("flex flex-col items-center justify-center border-b p-8 lg:col-span-2 lg:border-b-0 lg:border-r", t.border)}>
                    <img
                      src={HIGHTECH_LOGO}
                      alt="École High-Tech"
                      className="h-24 w-auto max-w-full object-contain md:h-28"
                    />
                    <h2 className={clsx("mt-6 text-xl font-bold", t.textPrimary)}>
                      École High-Tech
                    </h2>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-brand-400">
                      Reconnue par l&apos;État
                    </p>
                  </div>

                  <div className="space-y-5 p-8 lg:col-span-3">
                    <div className="flex items-start gap-3">
                      <GraduationCap className="mt-0.5 size-5 shrink-0 text-brand-400" />
                      <div>
                        <h3 className={clsx("font-semibold", t.textPrimary)}>Grande école marocaine</h3>
                        <p className={clsx("mt-1 text-sm leading-relaxed", t.textMuted)}>
                          Fondée en 1986 à Rabat, High-Tech forme des lauréats en ingénierie et en
                          management avec des diplômes d&apos;État reconnus : Ingénieur, Master et Licence.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Building2 className="mt-0.5 size-5 shrink-0 text-brand-400" />
                      <div>
                        <h3 className={clsx("font-semibold", t.textPrimary)}>Campus au Maroc</h3>
                        <p className={clsx("mt-1 text-sm leading-relaxed", t.textMuted)}>
                          Implantée à Rabat (Agdal, Souissi) et à Fès, l&apos;école allie rigueur
                          académique et immersion professionnelle pour préparer les talents de demain.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 size-5 shrink-0 text-brand-400" />
                      <div>
                        <h3 className={clsx("font-semibold", t.textPrimary)}>Rabat · Agdal</h3>
                        <p className={clsx("mt-1 text-sm leading-relaxed", t.textMuted)}>
                          34, Rue Jabal Al Ayachi, Agdal — Rabat, Maroc
                        </p>
                      </div>
                    </div>

                    <a
                      href="https://www.hightech.edu/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium text-brand-400 transition-colors hover:text-brand-300"
                    >
                      Visiter hightech.edu
                      <ExternalLink className="size-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className={clsx("border-y py-16 md:py-20", t.border)}>
            <div className="mx-auto max-w-6xl px-6">
              <div className="mb-12 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400">
                  <Users className="size-6" />
                </div>
                <h2 className={clsx("text-2xl font-bold uppercase tracking-tight md:text-3xl", t.textPrimary)}>
                  Notre équipe
                </h2>
                <p className={clsx("mx-auto mt-3 max-w-xl text-sm", t.textMuted)}>
                  Sept membres, un même objectif : livrer une application complète de gestion de
                  tournois locaux, de la conception à la mise en production.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {TEAM_MEMBERS.map((member) => (
                  <article
                    key={member.name}
                    className={clsx(
                      "group flex flex-col items-center rounded-xl border p-6 text-center transition-colors",
                      t.card,
                      t.cardHover,
                    )}
                  >
                    <div className="relative">
                      <img
                        src={TEAM_AVATAR}
                        alt={member.name}
                        className="h-20 w-20 rounded-full object-cover ring-2 ring-brand-500/30"
                      />
                    </div>
                    <h3 className={clsx("mt-4 text-sm font-bold", t.textPrimary)}>{member.name}</h3>
                    <p className="mt-1 text-xs font-medium text-brand-400">{member.role}</p>
                    <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                      {member.skills.map((skill) => (
                        <span
                          key={skill}
                          className={clsx(
                            "rounded-md bg-brand-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-brand-300",
                          )}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="py-16 md:py-20">
            <div className="mx-auto max-w-4xl px-6">
              <div
                className={clsx(
                  "rounded-2xl border p-8 text-center md:p-12",
                  t.card,
                )}
              >
                <Award className="mx-auto size-10 text-brand-400" />
                <h2 className={clsx("mt-4 text-xl font-bold md:text-2xl", t.textPrimary)}>
                  Projet {APP_NAME}
                </h2>
                <p className={clsx("mx-auto mt-4 max-w-2xl text-sm leading-relaxed", t.textMuted)}>
                  Notre application permet aux organisateurs de créer et gérer des tournois locaux,
                  d&apos;administrer équipes et joueurs, de planifier les matchs, de calculer les
                  classements automatiquement et de suivre les statistiques en temps réel — le tout
                  avec une validation administrative des tournois publics.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
                  >
                    <BookOpen className="size-4" />
                    Retour à l&apos;accueil
                  </Link>
                  <Link
                    to="/login"
                    className={clsx(
                      "inline-flex items-center gap-2 rounded-lg border px-6 py-2.5 text-sm font-semibold transition-colors",
                      t.btnSecondary,
                    )}
                  >
                    Accéder à l&apos;application
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>

        <LandingFooter />
      </div>
    </>
  );
}
