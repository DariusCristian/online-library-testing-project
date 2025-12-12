import { useCallback, useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import { AuthService } from "../services/auth.service";
import { CartService } from "../services/cart.service";
import { Storage, subscribeToStorage } from "../services/storage";
import { LoansService } from "../services/loans.service";

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
    setMessage({ type: "success", text: "Cartea a fost eliminată din coș." });
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      setMessage({ type: "error", text: "Coșul este gol." });
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
        text: "Împrumuturile au fost confirmate. Le găsești în secțiunea dedicată.",
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
            <p className="eyebrow">Coș împrumuturi</p>
            <h1>Cărți selectate pentru împrumut</h1>
            <p className="muted">
              Confirmă coșul pentru a face rezervarea și a vedea titlurile în
              „Împrumuturile mele”.
            </p>
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
          <p className="muted">Nu ai adăugat încă nicio carte în coș.</p>
        ) : (
          <section className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>Carte</th>
                  <th>Autor</th>
                  <th>Disponibil</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {displayItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.book?.title ?? "Carte indisponibilă"}</td>
                    <td>{item.book?.author ?? "-"}</td>
                    <td>
                      {item.book
                        ? `${item.book.available}/${item.book.total}`
                        : "N/A"}
                    </td>
                    <td className="text-right">
                      <button
                        className="btn btn--ghost"
                        type="button"
                        onClick={() => handleRemove(item.id)}
                      >
                        Elimină
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
                Confirmă împrumuturile
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
