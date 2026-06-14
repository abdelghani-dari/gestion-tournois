import { Route, useParams } from "react-router";
import XAppLayout from "../components/layout/AppLayout";
import LandingPage from "./landing/LandingPage";
import LoginPage from "./auth/LoginPage";
import DashboardPage from "./dashboard/DashboardPage";
import SeasonsPage from "./seasons/SeasonsPage";
import ChampionshipsPage from "./championships/ChampionshipsPage";
import TournamentsPage from "./tournaments/TournamentsPage";
import TeamsPage from "./teams/TeamsPage";
import PlayersPage from "./players/PlayersPage";
import MatchesPage from "./matches/MatchesPage";
import MatchResultPage from "./matches/MatchResultPage";
import MatchCompositionPage from "./matches/MatchCompositionPage";
import RankingsPage from "./rankings/RankingsPage";
import StatisticsPage from "./statistics/StatisticsPage";
import UsersPage from "./users/UsersPage";
import ProfilePage from "./profile/ProfilePage";
import NotFoundPage from "./errors/NotFoundPage";
import DetailStub from "./shared/DetailStub";
import { XPageMeta } from "../components/common/PageMeta";
import GlassCard from "../components/common/GlassCard";
import StatusBadge from "../components/common/StatusBadge";
import NationalityFlag from "../components/ui/NationalityFlag";
import { useSeasonData } from "../components/context/SeasonContext";

function ChampionshipDetail() {
  const { id } = useParams();
  const { getChampionshipById } = useSeasonData();
  const c = getChampionshipById(Number(id));
  if (!c) return <NotFoundPage />;
  return (
    <>
      <XPageMeta title={c.name} description={c.description} />
      <DetailStub backTo="/championships">
        <GlassCard>
          <StatusBadge status={c.status} />
          <p className="mt-4 text-sm text-slate-300">{c.description}</p>
        </GlassCard>
      </DetailStub>
    </>
  );
}

function TournamentDetail() {
  const { id } = useParams();
  const { getTournamentById } = useSeasonData();
  const t = getTournamentById(Number(id));
  if (!t) return <NotFoundPage />;
  return (
    <>
      <XPageMeta title={t.name} description={t.description} />
      <DetailStub backTo="/tournaments">
        <GlassCard>
          <StatusBadge status={t.status} />
          <p className="mt-4 text-sm text-slate-300">{t.description}</p>
        </GlassCard>
      </DetailStub>
    </>
  );
}

function TeamDetail() {
  const { id } = useParams();
  const { getTeamById } = useSeasonData();
  const t = getTeamById(Number(id));
  if (!t) return <NotFoundPage />;
  return (
    <>
      <XPageMeta title={t.name} description={`${t.player_count} joueurs`} />
      <DetailStub backTo="/teams">
        <GlassCard className="flex items-center gap-4">
          <img src={t.logo_url} alt="" className="h-16 w-16 rounded-sm object-contain" />
          <div>
            <p className="font-medium text-white">{t.name}</p>
            <p className="text-sm text-zinc-400">{t.player_count} joueurs inscrits</p>
          </div>
        </GlassCard>
      </DetailStub>
    </>
  );
}

function PlayerDetail() {
  const { id } = useParams();
  const { getPlayerById, getTeamById, formatPlayerName } = useSeasonData();
  const p = getPlayerById(Number(id));
  if (!p) return <NotFoundPage />;
  const team = getTeamById(p.team_id);
  return (
    <>
      <XPageMeta title={formatPlayerName(p)} description={`${p.position} — ${team?.name}`} />
      <DetailStub backTo="/players">
        <GlassCard>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <img src={p.photo_url} alt="" className="h-24 w-24 rounded-md object-cover ring-1 ring-white/10" />
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-white">#{p.shirt_number} {p.name}</h2>
                <NationalityFlag flagUrl={p.flag_url} country={p.cname} size="md" />
                <span className="text-sm text-zinc-400">{p.cname}</span>
              </div>
              <div className="flex items-center gap-2">
                <img src={team?.logo_url} alt="" className="h-6 w-6 object-contain" />
                <span className="text-sm text-zinc-300">{team?.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Buts", value: p.goals },
                  { label: "Passes D.", value: p.assists },
                  { label: "CJ", value: p.ycards },
                  { label: "CR", value: p.rcards },
                ].map((s) => (
                  <div key={s.label} className="rounded-sm bg-white/[0.04] px-3 py-2 text-center">
                    <p className="text-lg font-bold text-white">{s.value}</p>
                    <p className="text-xs text-zinc-500">{s.label}</p>
                  </div>
                ))}
              </div>
              {p.age && <p className="text-xs text-zinc-500">Âge : {p.age} ans · {p.position}</p>}
            </div>
          </div>
        </GlassCard>
      </DetailStub>
    </>
  );
}

function MatchDetail() {
  const { id } = useParams();
  const { getMatchById, getTeamById } = useSeasonData();
  const m = getMatchById(Number(id));
  if (!m) return <NotFoundPage />;
  const home = getTeamById(m.home_team_id);
  const away = getTeamById(m.away_team_id);
  return (
    <>
      <XPageMeta title="Détail du match" description={`${home?.name} vs ${away?.name}`} />
      <DetailStub backTo="/matches">
        <GlassCard>
          <div className="flex items-center justify-center gap-6">
            <span className="font-medium text-white">{home?.name}</span>
            <span className="text-2xl font-bold text-white">
              {m.home_score !== null ? `${m.home_score} - ${m.away_score}` : "vs"}
            </span>
            <span className="font-medium text-white">{away?.name}</span>
          </div>
          <div className="mt-4 flex justify-center">
            <StatusBadge status={m.status} />
          </div>
        </GlassCard>
      </DetailStub>
    </>
  );
}

function MatchCreatePage() {
  return (
    <>
      <XPageMeta title="Planifier un match" description="Création d'un match" />
      <DetailStub backTo="/matches" />
    </>
  );
}

/** Main application route tree */
export const appRoutes = (
  <>
    <Route index element={<LandingPage />} />
    <Route path="login" element={<LoginPage />} />

    <Route element={<XAppLayout />}>
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="seasons" element={<SeasonsPage />} />
      <Route path="championships" element={<ChampionshipsPage />} />
      <Route path="championships/:id" element={<ChampionshipDetail />} />
      <Route path="championships/:id/ranking" element={<RankingsPage />} />
      <Route path="tournaments" element={<TournamentsPage />} />
      <Route path="tournaments/:id" element={<TournamentDetail />} />
      <Route path="tournaments/:id/ranking" element={<RankingsPage />} />
      <Route path="teams" element={<TeamsPage />} />
      <Route path="teams/:id" element={<TeamDetail />} />
      <Route path="teams/:id/statistics" element={<StatisticsPage />} />
      <Route path="players" element={<PlayersPage />} />
      <Route path="players/:id" element={<PlayerDetail />} />
      <Route path="players/:id/statistics" element={<StatisticsPage />} />
      <Route path="matches" element={<MatchesPage />} />
      <Route path="matches/create" element={<MatchCreatePage />} />
      <Route path="matches/:id/result" element={<MatchResultPage />} />
      <Route path="matches/:id/composition" element={<MatchCompositionPage />} />
      <Route path="matches/:id/statistics" element={<StatisticsPage />} />
      <Route path="matches/:id" element={<MatchDetail />} />
      <Route path="rankings" element={<RankingsPage />} />
      <Route path="statistics" element={<StatisticsPage />} />
      <Route path="users" element={<UsersPage />} />
      <Route path="profile" element={<ProfilePage />} />
    </Route>

    <Route path="*" element={<NotFoundPage />} />
  </>
);
