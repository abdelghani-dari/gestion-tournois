/* eslint-disable react-refresh/only-export-components */
import { Navigate, Route, useLocation, useParams } from "react-router";
import { clsx } from "clsx";
import XAppLayout from "../components/layout/AppLayout";
import { useThemeTokens } from "../components/theme/useThemeTokens";
import LandingPage from "./landing/LandingPage";
import AboutPage from "./about/AboutPage";
import LoginPage from "./auth/LoginPage";
import DashboardPage from "./dashboard/DashboardPage";
import TournamentsPage from "./tournaments/TournamentsPage";
import TournamentDetailsPage from "./tournaments/TournamentDetailsPage";
import TeamsPage from "./teams/TeamsPage";
import TeamDetailsPage from "./teams/TeamDetailsPage";
import PlayersPage from "./players/PlayersPage";
import MatchesPage from "./matches/MatchesPage";
import MatchCompositionPage from "./matches/MatchCompositionPage";
import MatchDetailsPage from "./matches/MatchDetailsPage";
import RankingsPage from "./rankings/RankingsPage";
import StatisticsPage from "./statistics/StatisticsPage";
import ProfilePage from "./profile/ProfilePage";
import AdminTournamentsPage from "./admin/AdminTournamentsPage";
import AdminPendingUsersPage from "./admin/AdminPendingUsersPage";
import AdminUsersPage from "./admin/AdminUsersPage";
import JoinRequestsPage from "./join-requests/JoinRequestsPage";
import NotFoundPage from "./errors/NotFoundPage";
import { XPageMeta } from "../components/common/PageMeta";
import DetailStub from "./shared/DetailStub";
import { useAuth } from "../context/AuthContext";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const t = useThemeTokens();

  if (loading) {
    return (
      <div className={clsx("flex min-h-screen items-center justify-center text-sm", t.shellBg, t.textMuted)}>
        Chargement...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();
  const t = useThemeTokens();

  if (loading) {
    return <div className={clsx("flex min-h-[40vh] items-center justify-center text-sm", t.textMuted)}>Chargement...</div>;
  }
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

function DashboardRoute() {
  return <DashboardPage />;
}

function TournamentsRoute() {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminTournamentsPage /> : <TournamentsPage />;
}

function BracketRedirect() {
  const { id } = useParams();
  return <Navigate to={`/tournaments/${id}`} replace />;
}

function MatchCreatePage() {
  return (
    <>
      <XPageMeta title="Planifier un match" description="Creation d'un match" />
      <DetailStub backTo="/matches" />
    </>
  );
}

/** Main application route tree */
export const appRoutes = (
  <>
    <Route index element={<LandingPage />} />
    <Route path="about" element={<AboutPage />} />
    <Route path="login" element={<LoginPage />} />
    <Route path="signin" element={<LoginPage />} />
    <Route path="signup" element={<LoginPage />} />
    <Route path="matches/:id" element={<MatchDetailsPage />} />
    <Route path="tournaments/:id/bracket" element={<BracketRedirect />} />
    <Route path="tournaments/:id" element={<TournamentDetailsPage />} />

    <Route element={<RequireAuth><XAppLayout /></RequireAuth>}>
      <Route path="dashboard" element={<DashboardRoute />} />
      <Route path="seasons" element={<Navigate to="/tournaments" replace />} />
      <Route path="championships" element={<Navigate to="/tournaments" replace />} />
      <Route path="championships/:id" element={<Navigate to="/tournaments" replace />} />
      <Route path="championships/:id/ranking" element={<Navigate to="/rankings" replace />} />
      <Route path="tournaments" element={<TournamentsRoute />} />
      <Route path="tournaments/create" element={<Navigate to="/tournaments?create=1" replace />} />
      <Route path="tournaments/:id/ranking" element={<RankingsPage />} />
      <Route path="teams" element={<TeamsPage />} />
      <Route path="teams/:id" element={<TeamDetailsPage />} />
      <Route path="teams/:id/statistics" element={<StatisticsPage />} />
      <Route path="players" element={<PlayersPage />} />
      <Route path="players/:id" element={<Navigate to="/players" replace />} />
      <Route path="players/:id/statistics" element={<StatisticsPage />} />
      <Route path="join-requests" element={<JoinRequestsPage />} />
      <Route path="matches" element={<MatchesPage />} />
      <Route path="matches/create" element={<MatchCreatePage />} />
      <Route path="matches/:id/result" element={<Navigate to="/matches" replace />} />
      <Route path="matches/:id/composition" element={<MatchCompositionPage />} />
      <Route path="matches/:id/statistics" element={<StatisticsPage />} />
      <Route path="rankings" element={<RankingsPage />} />
      <Route path="statistics" element={<StatisticsPage />} />
      <Route path="admin" element={<Navigate to="/dashboard" replace />} />
      <Route path="admin/tournaments" element={<Navigate to="/tournaments" replace />} />
      <Route path="admin/tournaments/pending" element={<Navigate to="/tournaments" replace />} />
      <Route path="admin/users" element={<RequireAdmin><AdminUsersPage /></RequireAdmin>} />
      <Route path="admin/users/pending" element={<RequireAdmin><AdminPendingUsersPage /></RequireAdmin>} />
      <Route path="admin/teams" element={<Navigate to="/teams" replace />} />
      <Route path="admin/teams/:id" element={<Navigate to="/teams/:id" replace />} />
      <Route path="admin/players" element={<Navigate to="/players" replace />} />
      <Route path="admin/join-requests" element={<Navigate to="/join-requests" replace />} />
      <Route path="admin/matches" element={<Navigate to="/matches" replace />} />
      <Route path="users" element={<Navigate to="/profile" replace />} />
      <Route path="profile" element={<ProfilePage />} />
    </Route>

    <Route path="*" element={<NotFoundPage />} />
  </>
);
