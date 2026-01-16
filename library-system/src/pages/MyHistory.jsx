import { useCallback, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { AuthService } from "../services/auth.service";
import { HistoryService } from "../services/history.service";
import { HistoryTypeEmphasis } from "../models/enums";
import { subscribeToStorage } from "../services/storage";
import { useUI } from "../app/ui";

const formatDate = (value) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ro-RO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

export default function MyHistory() {
  const user = AuthService.currentUser();
  const userId = user?.id;
  const { t } = useUI();
  const [items, setItems] = useState(() => (userId ? HistoryService.forUser(userId) : []));

  const reload = useCallback(() => {
    if (!userId) return;
    // extragem istoricul din localStorage pentru utilizatorul curent
    setItems(HistoryService.forUser(userId));
  }, [userId]);

  useEffect(() => {
    if (!userId) return undefined;
    // când istoricul se schimbă în altă parte, actualizăm lista
    const unsubscribe = subscribeToStorage((key) => {
      if (!key || key === "history") {
        reload();
      }
    });
    return unsubscribe;
  }, [reload, userId]);

  if (!userId) return null;

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <div className="page-header">
          <div>
            <p className="eyebrow">{t("nav.history")}</p>
            <h1 data-testid="history-title">{t("history.title")}</h1>
            <p className="muted">{t("history.subtitle")}</p>
          </div>
        </div>

        <section className="card">
          {items.length === 0 ? (
            <p className="muted">{t("history.empty")}</p>
          ) : (
            <ul className="list">
              {items.map((event) => (
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
                  <p style={{ margin: "0.5rem 0" }}>{event.details}</p>
                  <div className="muted" style={{ fontSize: "0.85rem" }}>
                    {event.qty && (
                      <span style={{ marginRight: "1rem" }}>
                        {t("history.qty")}: {event.qty}
                      </span>
                    )}
                    {event.amount != null && (
                      <span>
                        {t("history.amount")}: {Number(event.amount).toFixed(2)} lei
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
