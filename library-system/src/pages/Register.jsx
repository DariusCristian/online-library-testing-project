import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthService } from "../services/auth.service";
import { useUI } from "../app/ui";

export default function Register() {
  const navigate = useNavigate();
  const { t } = useUI();
  const [form, setForm] = useState({ email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    // validăm local parola dublă înainte de a apela serviciul
    if (form.password !== form.confirm) {
      setError(t("msg.passwordMismatch"));
      return;
    }

    try {
      AuthService.register(form.email.trim(), form.password);
      setSuccess("Cont creat. Te poți autentifica acum.");
      // mic delay pentru a afișa mesajul de succes înainte de redirect
      setTimeout(() => navigate("/login"), 800);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    // folosim același handler pentru fiecare câmp al formularului
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="page auth-page page-center">
      <div className="auth-card">
        <p className="eyebrow">{t("app.brand")}</p>
        <h1>{t("register.title")}</h1>
        <p className="muted">{t("register.subtitle")}</p>

        {error && <div className="alert alert--error">{error}</div>}
        {success && <div className="alert alert--success">{success}</div>}

        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="input-label">
            {t("form.email")}
            <input
              className="input"
              type="email"
              name="email"
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
              value={form.password}
              onChange={handleChange}
              required
              minLength={4}
            />
          </label>

          <label className="input-label">
            {t("form.confirmPassword")}
            <input
              className="input"
              type="password"
              name="confirm"
              value={form.confirm}
              onChange={handleChange}
              required
              minLength={4}
            />
          </label>

          <button className="btn btn--primary w-full" type="submit">
            {t("register.cta")}
          </button>
        </form>

        <p className="muted">
          {t("register.hasAccount")} <Link to="/login">{t("register.signIn")}</Link>
        </p>
      </div>
    </div>
  );
}
