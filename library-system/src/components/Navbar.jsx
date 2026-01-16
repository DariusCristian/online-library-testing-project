import { NavLink, useNavigate } from "react-router-dom";
import { AuthService } from "../services/auth.service";
import { Roles } from "../models/enums";
import { useUI } from "../app/ui";

export default function Navbar() {
  const navigate = useNavigate();
  const user = AuthService.currentUser();
  const { t, toggleLang, toggleTheme, theme } = useUI();

  if (!user) return null;

  // meniul e construit dinamic pentru ca rutele depind de rol
  const links = [
    { to: "/dashboard", label: t("nav.dashboard"), testId: "nav-dashboard" },
    { to: "/books", label: t("nav.books"), testId: "nav-books" },
    { to: "/cart/loans", label: t("nav.cartLoans"), testId: "nav-loan-cart" },
    { to: "/cart/purchases", label: t("nav.cartPurchases"), testId: "nav-purchase-cart" },
    { to: "/me/loans", label: t("nav.myLoans"), testId: "nav-my-loans" },
    { to: "/me/history", label: t("nav.history"), testId: "nav-history" },
  ];

  if (user.role === Roles.ADMIN) {
    // afișăm secțiunea de administrare doar pentru administratori
    links.push({ to: "/admin", label: t("nav.admin"), testId: "nav-admin" });
  }

  const handleLogout = () => {
    // curățăm sesiunea și revenim la autentificare
    AuthService.logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="navbar">
      <div className="navbar__brand">{t("app.brand")}</div>
      <nav className="navbar__links">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            data-testid={link.testId}
            className={({ isActive }) =>
              ["navbar__link", isActive ? "active" : ""].join(" ").trim()
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="navbar__user">
        <div className="navbar__controls">
          <button
            className="btn btn--ghost"
            type="button"
            onClick={toggleLang}
            data-testid="lang-toggle"
          >
            {t("nav.language")}
          </button>
          <button
            className="btn btn--ghost"
            type="button"
            onClick={toggleTheme}
            data-testid="theme-toggle"
          >
            {theme === "dark" ? t("nav.themeLight") : t("nav.themeDark")}
          </button>
        </div>
        <span className="muted" style={{ fontWeight: 600 }}>
          {user.email}
        </span>
        <button className="btn btn--ghost" onClick={handleLogout}>
          {t("nav.logout")}
        </button>
      </div>
    </header>
  );
}
