import { BrowserRouter as Router, Routes } from "react-router";
import { ScrollToTop } from "./components/common/ScrollToTop";
import { XThemeProvider } from "./components/context/XThemeContext";
import { appRoutes } from "./pages/AppRoutes";

export default function App() {
  return (
    <XThemeProvider>
      <Router>
        <ScrollToTop />
        <Routes>{appRoutes}</Routes>
      </Router>
    </XThemeProvider>
  );
}
