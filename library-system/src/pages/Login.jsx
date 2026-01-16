import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthService } from "../services/auth.service";
import { useUI } from "../app/ui";

export default function Login() {
  const navigate = useNavigate();
  const { t } = useUI();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    // dacă există deja sesiune mergem direct la dashboard
    const user = AuthService.currentUser();
    if (user) navigate("/dashboard", { replace: true });
  }, [navigate]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    try {
      // autentificarea scrie user-ul curent în sessionStorage
      AuthService.login(form.email.trim(), form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    // menținem formularul controlat pentru validare
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="page auth-page page-center">
      <div className="auth-card">
        <p className="eyebrow">{t("app.brand")}</p>
        <h1>{t("login.title")}</h1>
        <p className="muted">{t("login.subtitle")}</p>

        {error && <div className="alert alert--error">{error}</div>}

        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="input-label">
            {t("form.email")}
            <input
              className="input"
              type="email"
              name="email"
              data-testid="login-email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label className="input-label">
            {t("form.password")}
            <input
              className="input"
              type="password"
              name="password"
              data-testid="login-password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={4}
            />
          </label>

          <button className="btn btn--primary w-full" type="submit" data-testid="login-submit">
            {t("login.cta")}
          </button>
        </form>

        <p className="muted">
          {t("login.noAccount")} <Link to="/register">{t("login.createAccount")}</Link>
        </p>
      </div>
    </div>
  );
}
