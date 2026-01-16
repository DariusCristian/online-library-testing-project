import { useCallback, useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import { AuthService } from "../services/auth.service";
import { CartService } from "../services/cart.service";
import { Storage, subscribeToStorage } from "../services/storage";
import { LoansService } from "../services/loans.service";
import { useUI } from "../app/ui";

const mapBooks = () => {
  const map = {};
  Storage.get("books").forEach((book) => {
    map[book.id] = book;
  });
  return map;
};

export default function LoanCart() {
  const user = AuthService.currentUser();
  const userId = user?.id;
  const { t } = useUI();
  const [items, setItems] = useState(() => CartService.loanItems());
  const [booksMap, setBooksMap] = useState(() => mapBooks());
  const [message, setMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reload = useCallback(() => {
    setItems(CartService.loanItems());
    setBooksMap(mapBooks());
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToStorage((key) => {
      // când se modifică coșul sau inventarul, reafișăm lista
      if (!key || key === "loan_cart" || key === "books") {
        reload();
      }
    });
    return unsubscribe;
  }, [reload]);

  if (!userId) return null;

  const handleRemove = (itemId) => {
    CartService.removeLoan(itemId);
    setMessage({ type: "success", text: t("msg.loanCartRemoved") });
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      setMessage({ type: "error", text: t("msg.loanCartEmpty") });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      items.forEach((item) => {
        // folosim același serviciu ca și checkout-ul direct
        LoansService.borrow(item.bookId, user);
      });
      CartService.clearLoanCart();
      setMessage({
        type: "success",
        text: t("msg.loanCartConfirmed"),
      });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayItems = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        book: booksMap[item.bookId],
      })),
    [items, booksMap]
  );

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <div className="page-header">
          <div>
            <p className="eyebrow">{t("nav.cartLoans")}</p>
            <h1 data-testid="loan-cart-title">{t("cartLoans.title")}</h1>
            <p className="muted">{t("cartLoans.subtitle")}</p>
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

        {displayItems.length === 0 ? (
          <p className="muted" data-testid="loan-cart-empty">
            {t("cartLoans.empty")}
          </p>
        ) : (
          <section className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>{t("cartLoans.tableBook")}</th>
                  <th>{t("cartLoans.tableAuthor")}</th>
                  <th>{t("cartLoans.tableAvailable")}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {displayItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.book?.title ?? t("books.unavailable")}</td>
                    <td>{item.book?.author ?? "-"}</td>
                    <td>
                      {item.book
                        ? `${item.book.available}/${item.book.total}`
                        : t("books.na")}
                    </td>
                    <td className="text-right">
                      <button
                        className="btn btn--ghost"
                        type="button"
                        onClick={() => handleRemove(item.id)}
                      >
                        {t("btn.remove") ?? "Elimină"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="divider" />
            <div className="text-right">
              <button
                className="btn btn--primary"
                type="button"
                disabled={isSubmitting}
                onClick={handleCheckout}
              >
                {t("cartLoans.confirm")}
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
