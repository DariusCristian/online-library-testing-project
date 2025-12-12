import { useCallback, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { AuthService } from "../services/auth.service";
import { HistoryService } from "../services/history.service";
import { HistoryTypeEmphasis, HistoryTypeLabels } from "../models/enums";
import { subscribeToStorage } from "../services/storage";

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
            <p className="eyebrow">Istoric</p>
            <h1>Activitatea mea</h1>
            <p className="muted">Monitorizează toate acțiunile din cont.</p>
          </div>
        </div>

        <section className="card">
          {items.length === 0 ? (
            <p className="muted">Încă nu ai nicio activitate înregistrată.</p>
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
                      {HistoryTypeLabels[event.type] ?? event.type}
                    </span>
                    <span className="muted">{formatDate(event.at)}</span>
                  </div>
                  <p style={{ margin: "0.5rem 0" }}>{event.details}</p>
                  <div className="muted" style={{ fontSize: "0.85rem" }}>
                    {event.qty && <span style={{ marginRight: "1rem" }}>Cantitate: {event.qty}</span>}
                    {event.amount != null && (
                      <span>Valoare: {Number(event.amount).toFixed(2)} lei</span>
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
