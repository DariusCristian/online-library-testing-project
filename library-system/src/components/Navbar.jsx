import { NavLink, useNavigate } from "react-router-dom";
import { AuthService } from "../services/auth.service";
import { Roles } from "../models/enums";

export default function Navbar() {
  const navigate = useNavigate();
  const user = AuthService.currentUser();

  if (!user) return null;

  // meniul e construit dinamic pentru ca rutele depind de rol
  const links = [
    { to: "/dashboard", label: "Panou" },
    { to: "/books", label: "Cărți" },
    { to: "/cart/loans", label: "Coș împrumuturi" },
    { to: "/cart/purchases", label: "Coș cumpărături" },
    { to: "/me/loans", label: "Împrumuturile mele" },
    { to: "/me/history", label: "Istoric" },
  ];

  if (user.role === Roles.ADMIN) {
    // afișăm secțiunea de administrare doar pentru administratori
    links.push({ to: "/admin", label: "Admin" });
  }

  const handleLogout = () => {
    // curățăm sesiunea și revenim la autentificare
    AuthService.logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="navbar">
      <div className="navbar__brand">Biblioteca Online</div>
      <nav className="navbar__links">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              ["navbar__link", isActive ? "active" : ""].join(" ").trim()
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="navbar__user">
        <span className="muted" style={{ fontWeight: 600 }}>
          {user.email}
        </span>
        <button className="btn btn--ghost" onClick={handleLogout}>
          Delogare
        </button>
      </div>
    </header>
  );
}
