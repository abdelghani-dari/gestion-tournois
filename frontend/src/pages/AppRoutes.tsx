/* eslint-disable react-refresh/only-export-components */
import { Navigate, Route, useLocation } from "react-router";
import XAppLayout from "../components/layout/AppLayout";
import LandingPage from "./landing/LandingPage";
import LoginPage from "./auth/LoginPage";
import DashboardPage from "./dashboard/DashboardPage";
import TournamentsPage from "./tournaments/TournamentsPage";
import TournamentDetailsPage from "./tournaments/TournamentDetailsPage";
import TeamsPage from "./teams/TeamsPage";
import PlayersPage from "./players/PlayersPage";
import MatchesPage from "./matches/MatchesPage";
import MatchCompositionPage from "./matches/MatchCompositionPage";
import RankingsPage from "./rankings/RankingsPage";
import StatisticsPage from "./statistics/StatisticsPage";
import ProfilePage from "./profile/ProfilePage";
import AdminDashboardPage from "./admin/AdminDashboardPage";
import AdminTournamentsPage from "./admin/AdminTournamentsPage";
import AdminPendingUsersPage from "./admin/AdminPendingUsersPage";
import AdminUsersPage from "./admin/AdminUsersPage";
import AdminReadOnlyPage from "./admin/AdminReadOnlyPage";
import AdminTeamsPage from "./admin/AdminTeamsPage";
import AdminTeamDetailsPage from "./admin/AdminTeamDetailsPage";
import AdminPlayersPage from "./admin/AdminPlayersPage";
import JoinRequestsPage from "./join-requests/JoinRequestsPage";
import NotFoundPage from "./errors/NotFoundPage";
import { XPageMeta } from "../components/common/PageMeta";
import DetailStub from "./shared/DetailStub";
import { useAuth } from "../context/AuthContext";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-slate-400">
        Chargement...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

function DashboardRoute() {
  const { isAdmin } = useAuth();
  return isAdmin ? <Navigate to="/admin" replace /> : <DashboardPage />;
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
    <Route path="login" element={<LoginPage />} />
    <Route path="signin" element={<LoginPage />} />
    <Route path="signup" element={<LoginPage />} />
    <Route path="tournaments/:id" element={<TournamentDetailsPage />} />

    <Route element={<RequireAuth><XAppLayout /></RequireAuth>}>
      <Route path="dashboard" element={<DashboardRoute />} />
      <Route path="seasons" element={<Navigate to="/tournaments" replace />} />
      <Route path="championships" element={<Navigate to="/tournaments" replace />} />
      <Route path="championships/:id" element={<Navigate to="/tournaments" replace />} />
      <Route path="championships/:id/ranking" element={<Navigate to="/rankings" replace />} />
      <Route path="tournaments" element={<TournamentsPage />} />
      <Route path="tournaments/:id/ranking" element={<RankingsPage />} />
      <Route path="teams" element={<TeamsPage />} />
      <Route path="teams/:id" element={<Navigate to="/teams" replace />} />
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
      <Route path="matches/:id" element={<Navigate to="/matches" replace />} />
      <Route path="rankings" element={<RankingsPage />} />
      <Route path="statistics" element={<StatisticsPage />} />
      <Route path="admin" element={<AdminDashboardPage />} />
      <Route path="admin/tournaments" element={<AdminTournamentsPage />} />
      <Route path="admin/tournaments/pending" element={<AdminTournamentsPage />} />
      <Route path="admin/users" element={<AdminUsersPage />} />
      <Route path="admin/users/pending" element={<AdminPendingUsersPage />} />
      <Route path="admin/teams" element={<AdminTeamsPage />} />
      <Route path="admin/teams/:id" element={<AdminTeamDetailsPage />} />
      <Route path="admin/players" element={<AdminPlayersPage />} />
      <Route path="admin/join-requests" element={<AdminReadOnlyPage kind="join-requests" />} />
      <Route path="admin/matches" element={<AdminReadOnlyPage kind="matches" />} />
      <Route path="users" element={<Navigate to="/profile" replace />} />
      <Route path="profile" element={<ProfilePage />} />
    </Route>

    <Route path="*" element={<NotFoundPage />} />
  </>
);
