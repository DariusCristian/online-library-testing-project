import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { AuthService } from "../services/auth.service";
import { Storage, subscribeToStorage } from "../services/storage";
import { LoansService } from "../services/loans.service";
import { HistoryService } from "../services/history.service";
import { useUI } from "../app/ui";
import {
  HistoryTypeEmphasis,
  HistoryTypes,
  LoanStatus,
  Roles,
} from "../models/enums";

const formatDate = (value) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ro-RO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const buildStats = (user) => {
  // citim toate sursele necesare pentru panoul centralizat
  const books = Storage.get("books");
  const myLoans = LoansService.myLoans(user.id);
  const history = HistoryService.forUser(user.id);

  const activeBooks = books.filter((b) => b.isActive !== false);
  const activeLoans = myLoans.filter((l) => l.status === LoanStatus.BORROWED);
  const totalPurchased = history.filter((h) => h.type === HistoryTypes.BUY);

  return {
    activeBooks: activeBooks.length,
    totalCopies: activeBooks.reduce((sum, b) => sum + Number(b.available || 0), 0),
    activeLoans: activeLoans.length,
    completedLoans: myLoans.length - activeLoans.length,
    totalPurchased: totalPurchased.length,
    recentHistory: history.slice(0, 5),
  };
};

export default function Dashboard() {
  const user = AuthService.currentUser();
  const { t } = useUI();
  const [stats, setStats] = useState(() => (user ? buildStats(user) : null));

  const refreshStats = useCallback(() => {
    if (!user) return;
    setStats(buildStats(user));
  }, [user]);

  useEffect(() => {
    if (!user) return undefined;
    refreshStats();
    // ascultăm orice modificare din storage pentru a păstra dashboard-ul sincron
    const unsubscribe = subscribeToStorage((key) => {
      if (!key || key === "books" || key === "loans" || key === "history") {
        refreshStats();
      }
    });
    return unsubscribe;
  }, [refreshStats, user]);

  if (!user) return null;

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <div className="page-header">
          <div>
            <p className="eyebrow">{t("dashboard.welcome")}</p>
            <h1 data-testid="dashboard-title">{user.email}</h1>
            <p className="muted">
              {t("dashboard.role")}:{" "}
              <strong>
                {user.role === Roles.ADMIN ? t("dashboard.roleAdmin") : t("dashboard.roleUser")}
              </strong>
            </p>
          </div>
          <div className="page-header__actions">
            <Link className="btn btn--primary" to="/books">
              {t("dashboard.searchBooks")}
            </Link>
            <Link className="btn btn--ghost" to="/me/loans">
              {t("dashboard.myLoans")}
            </Link>
          </div>
        </div>

        {stats && (
          <>
            <section className="card">
              <h2 data-testid="dashboard-stats">{t("dashboard.quickStats")}</h2>
              <div className="stats-grid">
                <article className="stat-card">
                  <p className="stat-label">{t("dashboard.activeBooks")}</p>
                  <p className="stat-value">{stats.activeBooks}</p>
                </article>
                <article className="stat-card">
                  <p className="stat-label">{t("dashboard.availableCopies")}</p>
                  <p className="stat-value">{stats.totalCopies}</p>
                </article>
                <article className="stat-card">
                  <p className="stat-label">{t("dashboard.activeLoans")}</p>
                  <p className="stat-value">{stats.activeLoans}</p>
                </article>
                <article className="stat-card">
                  <p className="stat-label">{t("dashboard.completedLoans")}</p>
                  <p className="stat-value">{stats.completedLoans}</p>
                </article>
                <article className="stat-card">
                  <p className="stat-label">{t("dashboard.purchases")}</p>
                  <p className="stat-value">{stats.totalPurchased}</p>
                </article>
              </div>
            </section>

            <section className="card">
              <div className="flex-between">
                <h2>{t("dashboard.recentActivity")}</h2>
                <Link to="/me/history" className="btn btn--ghost">
                  {t("dashboard.viewHistory")}
                </Link>
              </div>
              {stats.recentHistory.length === 0 ? (
                <p className="muted">{t("dashboard.noActivity")}</p>
              ) : (
                <ul className="list">
                  {stats.recentHistory.map((event) => (
                    <li key={event.id} className="list-item">
                      <div className="flex-between">
                        <span
                          className={[
                            "tag",
                            HistoryTypeEmphasis[event.type] || "",
                          ]
                            .join(" ")
                            .trim()}
                        >
                          {t(`history.type.${event.type}`)}
                        </span>
                        <span className="muted">{formatDate(event.at)}</span>
                      </div>
                      <p style={{ margin: "0.4rem 0 0" }}>{event.details}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
