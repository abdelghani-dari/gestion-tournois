import { Navigate, Route, useLocation } from "react-router";
import XAppLayout from "../components/layout/AppLayout";
import LandingPage from "./landing/LandingPage";
import LoginPage from "./auth/LoginPage";
import DashboardPage from "./dashboard/DashboardPage";
import TournamentsPage from "./tournaments/TournamentsPage";
import TeamsPage from "./teams/TeamsPage";
import PlayersPage from "./players/PlayersPage";
import MatchesPage from "./matches/MatchesPage";
import MatchCompositionPage from "./matches/MatchCompositionPage";
import RankingsPage from "./rankings/RankingsPage";
import StatisticsPage from "./statistics/StatisticsPage";
import ProfilePage from "./profile/ProfilePage";
import AdminTournamentsPage from "./admin/AdminTournamentsPage";
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

    <Route element={<XAppLayout />}>
      <Route path="dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
      <Route path="seasons" element={<Navigate to="/tournaments" replace />} />
      <Route path="championships" element={<Navigate to="/tournaments" replace />} />
      <Route path="championships/:id" element={<Navigate to="/tournaments" replace />} />
      <Route path="championships/:id/ranking" element={<Navigate to="/rankings" replace />} />
      <Route path="tournaments" element={<TournamentsPage />} />
      <Route path="tournaments/:id" element={<Navigate to="/tournaments" replace />} />
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
      <Route path="admin/tournaments" element={<AdminTournamentsPage />} />
      <Route path="admin/tournaments/pending" element={<AdminTournamentsPage />} />
      <Route path="users" element={<Navigate to="/profile" replace />} />
      <Route path="profile" element={<ProfilePage />} />
    </Route>

    <Route path="*" element={<NotFoundPage />} />
  </>
);
