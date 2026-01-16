import { useCallback, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { AuthService } from "../services/auth.service";
import { LoansService } from "../services/loans.service";
import { Storage, subscribeToStorage } from "../services/storage";
import { LoanStatus } from "../models/enums";
import { useUI } from "../app/ui";

const formatDate = (value) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ro-RO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const buildBooksMap = () => {
  // mapăm rapid id -> carte pentru a evita căutări repetate
  const map = {};
  Storage.get("books").forEach((book) => {
    map[book.id] = book;
  });
  return map;
};

export default function MyLoans() {
  const user = AuthService.currentUser();
  const userId = user?.id;
  const { t } = useUI();
  const [loans, setLoans] = useState(() =>
    userId ? LoansService.myLoans(userId) : []
  );
  const [booksMap, setBooksMap] = useState(() => buildBooksMap());
  const [message, setMessage] = useState(null);

  if (!userId) return null;

  const reload = useCallback(() => {
    if (!userId) return;
    setLoans(LoansService.myLoans(userId));
    setBooksMap(buildBooksMap());
  }, [userId]);

  useEffect(() => {
    if (!userId) return undefined;
    const unsubscribe = subscribeToStorage((key) => {
      if (!key || key === "loans" || key === "books") {
        reload();
      }
    });
    return unsubscribe;
  }, [reload, userId]);

  const handleReturn = (loanId) => {
    try {
      // serviciul validează utilizatorul și actualizează stocul
      LoansService.returnLoan(loanId, user);
      reload();
      setMessage({ type: "success", text: t("msg.loanReturned") });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <div className="page-header">
          <div>
            <p className="eyebrow">{t("nav.myLoans")}</p>
            <h1>{t("loans.title")}</h1>
            <p className="muted">{t("loans.subtitle")}</p>
          </div>
        </div>

        {message && (
          <div
            className={[
              "alert",
              message.type === "error" ? "alert--error" : "alert--success",
            ]
              .join(" ")
              .trim()}
          >
            {message.text}
          </div>
        )}

        {loans.length === 0 ? (
          <p className="muted">{t("loans.empty")}</p>
        ) : (
          <div className="form-grid">
            {loans.map((loan) => {
              const book = booksMap[loan.bookId];
              const isBorrowed = loan.status === LoanStatus.BORROWED;
              return (
                <article key={loan.id} className="card">
                  <div className="flex-between">
                    <div>
                      <h3 style={{ margin: "0 0 0.3rem" }}>
                        {book?.title ?? t("books.deleted")}
                      </h3>
                      <p className="muted">{book?.author}</p>
                    </div>
                    <span
                      className={[
                        "tag",
                        isBorrowed ? "tag--warning" : "tag--success",
                      ]
                        .join(" ")
                        .trim()}
                    >
                      {t(`loan.status.${loan.status}`)}
                    </span>
                  </div>
                  <div style={{ display: "grid", gap: "0.4rem" }}>
                    <p className="muted">
                      {t("loans.borrowedAt")}: {formatDate(loan.loanDate)}
                    </p>
                    <p className="muted">
                      {t("loans.returnedAt")}:{" "}
                      {loan.returnDate ? formatDate(loan.returnDate) : "-"}
                    </p>
                  </div>
                  <div className="text-right">
                    <button
                      className="btn btn--primary"
                      type="button"
                      disabled={!isBorrowed}
                      onClick={() => handleReturn(loan.id)}
                    >
                      {t("loans.returnAction")}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
