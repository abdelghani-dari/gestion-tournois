import { useState } from "react";
import { APP_NAME } from "../../config/app";
import { logoFullSrc, logoIconSrc } from "./logoAssets";

const floatingCards = [
  { label: "16 équipes", value: "Groupes prêts", className: "left-8 top-16" },
  { label: "Matchs", value: "Calendrier live", className: "right-10 top-28" },
  { label: "Classement", value: "Points & forme", className: "left-12 bottom-24" },
  { label: "Champion", value: "Finale validée", className: "right-12 bottom-14" },
];

export default function AuthTournamentVisual() {
  const [fullLogoFailed, setFullLogoFailed] = useState(false);
  const [iconLogoFailed, setIconLogoFailed] = useState(false);
  const showFullLogo = Boolean(logoFullSrc) && !fullLogoFailed;
  const showIconLogo = Boolean(logoIconSrc) && !iconLogoFailed;

  return (
    <div className="relative hidden min-h-screen w-full overflow-hidden bg-[#07111F] lg:block">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(59,130,246,0.22),transparent_34%),radial-gradient(circle_at_78%_68%,rgba(16,185,129,0.18),transparent_30%),linear-gradient(135deg,#07111F_0%,#0B1627_48%,#081C18_100%)]" />
      <div className="absolute inset-0 opacity-[0.14] [background-image:linear-gradient(to_right,rgba(255,255,255,.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.18)_1px,transparent_1px)] [background-size:64px_64px]" />
      <div className="absolute left-1/2 top-1/2 h-[74vh] w-[64%] -translate-x-1/2 -translate-y-1/2 rounded-[999px] border border-white/10" />
      <div className="absolute left-1/2 top-1/2 h-[44vh] w-px -translate-y-1/2 bg-white/10" />
      <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
      <div className="absolute inset-x-12 bottom-10 h-px bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent" />

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 720 760" fill="none" aria-hidden="true">
        <path d="M88 210H208V158H278" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity=".72" />
        <path d="M88 294H208V346H278" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity=".52" />
        <path d="M278 158V346H370" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity=".78" />
        <path d="M632 244H512V188H442" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity=".72" />
        <path d="M632 328H512V384H442" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity=".52" />
        <path d="M442 188V384H370" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity=".78" />
        <path d="M132 530H252V474H322" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity=".55" />
        <path d="M588 530H468V474H398" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity=".55" />
      </svg>

      <div className="absolute left-1/2 top-[44%] w-[360px] -translate-x-1/2 -translate-y-1/2">
        <div className="relative rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-blue-500/25 via-transparent to-emerald-500/25 opacity-80" />
          <div className="relative">
            {showFullLogo ? (
              <div className="mx-auto flex h-28 max-w-[280px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-5 shadow-[0_0_60px_rgba(16,185,129,0.18)]">
                <img
                  src={logoFullSrc}
                  alt={APP_NAME}
                  className="max-h-20 w-full object-contain"
                  onError={() => setFullLogoFailed(true)}
                />
              </div>
            ) : showIconLogo ? (
              <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-400/10 shadow-[0_0_60px_rgba(16,185,129,0.28)]">
                <img
                  src={logoIconSrc}
                  alt={APP_NAME}
                  className="h-24 w-24 object-contain"
                  onError={() => setIconLogoFailed(true)}
                />
              </div>
            ) : (
              <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-400/10 shadow-[0_0_60px_rgba(16,185,129,0.28)]">
                <svg viewBox="0 0 96 96" className="h-20 w-20" fill="none" aria-hidden="true">
                  <path d="M30 19h36v10c0 11.5-7.1 21.4-17.8 24.8h-.4C37.1 50.4 30 40.5 30 29V19Z" fill="#F8FAFC" />
                  <path d="M36 55h24l-4 14H40l-4-14Z" fill="#3B82F6" />
                  <path d="M31 75h34" stroke="#10B981" strokeWidth="5" strokeLinecap="round" />
                  <path d="M30 26H18c0 12.2 7.7 20.8 19 22M66 26h12c0 12.2-7.7 20.8-19 22" stroke="#F8FAFC" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="m48 27 4.2 8.5 9.4 1.4-6.8 6.6 1.6 9.3L48 48.4l-8.4 4.4 1.6-9.3-6.8-6.6 9.4-1.4L48 27Z" fill="#10B981" />
                </svg>
              </div>
            )}
            <div className="mt-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-emerald-300">Tournoi premium</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal text-white">Organisez la finale</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Matchs, classements et demandes d'inscription dans une interface sportive unifiée.
              </p>
            </div>
          </div>
        </div>
      </div>

      {floatingCards.map((card) => (
        <div
          key={card.label}
          className={`absolute ${card.className} rounded-xl border border-white/10 bg-slate-950/55 px-4 py-3 shadow-[0_20px_45px_rgba(0,0,0,0.28)] backdrop-blur-md`}
        >
          <p className="text-sm font-semibold text-white">{card.label}</p>
          <p className="mt-1 text-xs text-slate-400">{card.value}</p>
        </div>
      ))}

      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-medium text-slate-300 backdrop-blur-md">
        <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.8)]" />
        Dashboard sportif sécurisé
      </div>
    </div>
  );
}
