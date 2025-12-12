import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthService } from "../services/auth.service";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    // validăm local parola dublă înainte de a apela serviciul
    if (form.password !== form.confirm) {
      setError("Parolele nu coincid");
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
        <p className="eyebrow">Biblioteca Online</p>
        <h1>Cont nou</h1>
        <p className="muted">
          Creează un cont pentru a împrumuta și cumpăra titluri.
        </p>

        {error && <div className="alert alert--error">{error}</div>}
        {success && <div className="alert alert--success">{success}</div>}

        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="input-label">
            Email
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
            Parolă
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
            Confirmare parolă
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
            Creează cont
          </button>
        </form>

        <p className="muted">
          Ai deja cont? <Link to="/login">Autentifică-te</Link>
        </p>
      </div>
    </div>
  );
}
