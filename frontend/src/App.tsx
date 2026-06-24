import { BrowserRouter as Router, Routes } from "react-router";
import { ScrollToTop } from "./components/common/ScrollToTop";
import AuthExpiredRedirect from "./components/auth/AuthExpiredRedirect";
import { XThemeProvider } from "./components/context/XThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { PendingCountsProvider } from "./components/context/PendingCountsContext";
import { appRoutes } from "./pages/AppRoutes";

export default function App() {
  return (
    <XThemeProvider>
      <AuthProvider>
        <PendingCountsProvider>
          <Router>
            <ScrollToTop />
            <AuthExpiredRedirect />
            <Routes>{appRoutes}</Routes>
          </Router>
        </PendingCountsProvider>
      </AuthProvider>
    </XThemeProvider>
  );
}
