import { useState, useEffect } from "react";
import { clsx } from "clsx";
import { useThemeTokens } from "../theme/useThemeTokens";
import { useSeasonData } from "../context/SeasonContext";
import StatusBadge from "../common/StatusBadge";
import GlassCard from "../common/GlassCard";
import ProgressLine from "../common/ProgressLine";
import { PAGE_GAP, GRID_GAP } from "../common/PageStack";
import type { Championship } from "../types";

const TABS = [
  { id: "classement", label: "Classement" },
  { id: "progression", label: "Journées" },
  { id: "reglement", label: "Règlement" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const RULES = [
  { title: "Format", desc: "16 équipes, 30 journées aller-retour" },
  { title: "Points", desc: "Victoire 3 pts · Nul 1 pt · Défaite 0 pt" },
  { title: "Relégation", desc: "2 derniers relégués en Botola 2" },
  { title: "Qualification", desc: "Top 3 → compétitions continentales" },
];

interface ChampionshipDashboardProps {
  action?: React.ReactNode;
  championshipId?: number;
  showSelector?: boolean;
}

export default function ChampionshipDashboard({ action, championshipId, showSelector = false }: ChampionshipDashboardProps) {
  const t = useThemeTokens();
  const { rankings, getTeamById, championships, BOTOLA_LOGO, season } = useSeasonData();
  const [activeTab, setActiveTab] = useState<TabId>("classement");
  const [selectedId, setSelectedId] = useState(championshipId ?? championships[0]?.id ?? 0);

  useEffect(() => {
    if (championshipId !== undefined) {
      setSelectedId(championshipId);
    } else if (championships[0]) {
      setSelectedId(championships[0].id);
    }
  }, [championshipId, championships]);

  const champ = championships.find((c) => c.id === selectedId) ?? championships[0];
  const sorted = [...rankings].sort((a, b) => b.points - a.points || b.goal_difference - a.goal_difference);
  const matchdayProgress = season.status === "completed" ? 100 : 68;

  return (
    <div className={clsx("flex flex-col", PAGE_GAP)}>
      {showSelector && championships.length > 1 && (
        <div className={clsx("flex flex-wrap gap-2 rounded-md border p-1.5", t.border)}>
          {championships.map((c: Championship) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedId(c.id)}
              className={clsx(
                "rounded-sm px-3 py-1.5 text-sm font-medium transition-colors",
                selectedId === c.id ? t.tabActive : t.tabInactive
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      <div className={clsx("flex flex-wrap items-center gap-4 rounded-md border p-5", t.card)}>
        <img src={champ?.logo_url ?? BOTOLA_LOGO} alt="" className="h-14 w-14 object-contain" />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className={clsx("text-lg font-bold", t.textPrimary)}>{champ?.name ?? "Championnat"}</h2>
            {champ && <StatusBadge status={champ.status} />}
          </div>
          <p className={clsx("mt-1 text-sm", t.textSecondary)}>{champ?.description}</p>
        </div>
        <div className="text-right">
          <p className={clsx("text-xs font-semibold uppercase tracking-wider", t.textMuted)}>Saison</p>
          <p className={clsx("text-sm font-bold", t.textPrimary)}>{season.name.replace("Saison ", "")}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className={clsx("inline-flex rounded-md border p-1", t.border)}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "rounded-sm px-4 py-2 text-sm font-medium transition-all duration-200",
                activeTab === tab.id ? t.tabActive : t.tabInactive
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      <div className="relative min-h-[320px]">
        <div key={activeTab} style={{ animation: "fadeIn 0.25s ease-out" }}>
          {activeTab === "classement" && (
            <GlassCard padding="none" className="overflow-hidden">
              <div className="x-scroll overflow-x-auto">
                <table className="w-full min-w-[720px] table-fixed">
                  <colgroup>
                    <col className="w-12" />
                    <col className="w-[min(280px,40%)]" />
                    <col className="w-10" />
                    <col className="w-10" />
                    <col className="w-10" />
                    <col className="w-10" />
                    <col className="w-12" />
                    <col className="w-12" />
                    <col className="w-12" />
                    <col className="w-14" />
                  </colgroup>
                  <thead>
                    <tr className={clsx("border-b text-xs font-semibold uppercase tracking-wider", t.border, t.tableHead)}>
                      <th className="px-4 py-3 text-center md:px-6">#</th>
                      <th className="px-4 py-3 text-left md:px-6">Équipe</th>
                      <th className="px-4 py-3 text-center md:px-6">J</th>
                      <th className="px-4 py-3 text-center md:px-6">V</th>
                      <th className="px-4 py-3 text-center md:px-6">N</th>
                      <th className="px-4 py-3 text-center md:px-6">D</th>
                      <th className="px-4 py-3 text-center md:px-6">BP</th>
                      <th className="px-4 py-3 text-center md:px-6">BC</th>
                      <th className="px-4 py-3 text-center md:px-6">+/-</th>
                      <th className="px-4 py-3 text-center md:px-6">Pts</th>
                    </tr>
                  </thead>
                  <tbody className={clsx("divide-y", t.tableDivide)}>
                    {sorted.map((row, idx) => {
                      const team = getTeamById(row.team_id);
                      return (
                        <tr key={row.id} className={clsx("transition-colors", t.tableRow)}>
                          <td className={clsx("px-4 py-3.5 text-center text-sm font-bold md:px-6", t.textMuted)}>{idx + 1}</td>
                          <td className="px-4 py-3.5 md:px-6">
                            <div className="flex min-w-0 items-center gap-3">
                              <img src={team?.logo_url} alt="" className="h-8 w-8 shrink-0 object-contain" />
                              <span className={clsx("truncate text-sm font-medium", t.textPrimary)}>{team?.name}</span>
                            </div>
                          </td>
                          <td className={clsx("px-4 py-3.5 text-center text-sm tabular-nums md:px-6", t.textSecondary)}>{row.played}</td>
                          <td className={clsx("px-4 py-3.5 text-center text-sm tabular-nums md:px-6", t.textSecondary)}>{row.wins}</td>
                          <td className={clsx("px-4 py-3.5 text-center text-sm tabular-nums md:px-6", t.textSecondary)}>{row.draws}</td>
                          <td className={clsx("px-4 py-3.5 text-center text-sm tabular-nums md:px-6", t.textSecondary)}>{row.losses}</td>
                          <td className={clsx("px-4 py-3.5 text-center text-sm tabular-nums md:px-6", t.textSecondary)}>{row.goals_for}</td>
                          <td className={clsx("px-4 py-3.5 text-center text-sm tabular-nums md:px-6", t.textSecondary)}>{row.goals_against}</td>
                          <td className={clsx("px-4 py-3.5 text-center text-sm font-medium tabular-nums md:px-6", row.goal_difference >= 0 ? "text-emerald-500" : "text-rose-500")}>
                            {row.goal_difference > 0 ? "+" : ""}{row.goal_difference}
                          </td>
                          <td className={clsx("px-4 py-3.5 text-center text-sm font-bold tabular-nums md:px-6", t.textPrimary)}>{row.points}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )}

          {activeTab === "progression" && (
            <div className={clsx("grid grid-cols-1 md:grid-cols-2", GRID_GAP)}>
              <GlassCard>
                <ProgressLine
                  value={matchdayProgress}
                  label="Avancement saison"
                  sublabel={`${Math.round((matchdayProgress / 100) * 30)} / 30 journées`}
                />
              </GlassCard>
              <GlassCard>
                <p className={clsx("text-xs font-semibold uppercase tracking-wider", t.textMuted)}>Top 4</p>
                <div className="mt-4 space-y-2">
                  {sorted.slice(0, 4).map((r, i) => {
                    const team = getTeamById(r.team_id);
                    return (
                      <div key={r.id} className="flex items-center gap-2">
                        <span className={clsx("w-5 text-xs font-bold", t.textMuted)}>{i + 1}</span>
                        <img src={team?.logo_url} alt="" className="h-5 w-5 object-contain" />
                        <span className={clsx("truncate text-sm", t.textSecondary)}>{team?.name}</span>
                        <span className={clsx("ml-auto text-xs font-bold tabular-nums", t.textPrimary)}>{r.points} pts</span>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            </div>
          )}

          {activeTab === "reglement" && (
            <div className={clsx("grid grid-cols-1 sm:grid-cols-2", GRID_GAP)}>
              {RULES.map((rule) => (
                <GlassCard key={rule.title}>
                  <h4 className={clsx("text-sm font-semibold", t.textPrimary)}>{rule.title}</h4>
                  <p className={clsx("mt-2 text-sm leading-relaxed", t.textSecondary)}>{rule.desc}</p>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
