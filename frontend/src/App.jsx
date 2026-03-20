import { NavLink, Route, Routes } from "react-router-dom";
import { useTranslation } from "react-i18next";

import LanguageToggle from "./components/LanguageToggle";
import DashboardPage from "./pages/DashboardPage";
import SellerDetailPage from "./pages/SellerDetailPage";
import SellerListPage from "./pages/SellerListPage";

function App() {
  const { t } = useTranslation();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">{t("app.tagline")}</p>
          <h1>{t("app.title")}</h1>
        </div>
        <LanguageToggle />
      </header>

      <nav className="nav-tabs">
        <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
          {t("nav.sellers")}
        </NavLink>
        <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
          {t("nav.dashboard")}
        </NavLink>
      </nav>

      <main className="page-shell">
        <Routes>
          <Route path="/" element={<SellerListPage />} />
          <Route path="/seller/:sellerId" element={<SellerDetailPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
