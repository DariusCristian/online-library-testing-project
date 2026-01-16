import { useCallback, useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import { AuthService } from "../services/auth.service";
import { CartService } from "../services/cart.service";
import { Storage, subscribeToStorage } from "../services/storage";
import { PurchasesService } from "../services/purchases.service";
import { useUI } from "../app/ui";

const mapBooks = () => {
  // pregătim un lookup rapid pentru detalii despre carte
  const map = {};
  Storage.get("books").forEach((book) => {
    map[book.id] = book;
  });
  return map;
};

const formatPrice = (value) => `${Number(value || 0).toFixed(2)} lei`;

export default function PurchaseCart() {
  const user = AuthService.currentUser();
  const { t } = useUI();
  const [items, setItems] = useState(() => CartService.purchaseItems());
  const [booksMap, setBooksMap] = useState(() => mapBooks());
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const reload = useCallback(() => {
    setItems(CartService.purchaseItems());
    setBooksMap(mapBooks());
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToStorage((key) => {
      // orice modificare a coșului sau inventarului reîmprospătează datele
      if (!key || key === "purchase_cart" || key === "books") {
        reload();
      }
    });
    return unsubscribe;
  }, [reload]);

  if (!user) return null;

  const updateQty = (itemId, qty) => {
    // păstrăm valorile valide direct în storage pentru a fi reflectate peste tot
    CartService.updatePurchase(itemId, qty);
  };

  const removeItem = (itemId) => {
    CartService.removePurchase(itemId);
    setMessage({ type: "success", text: t("msg.purchaseCartRemoved") });
  };

  const itemsWithDetails = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        book: booksMap[item.bookId],
        subtotal: Number(booksMap[item.bookId]?.price || 0) * Number(item.qty || 0),
      })),
    [items, booksMap]
  );

  const total = itemsWithDetails.reduce((sum, item) => sum + (item.subtotal || 0), 0);

  const handleCheckout = () => {
    if (itemsWithDetails.length === 0) {
      setMessage({ type: "error", text: t("msg.purchaseCartEmpty") });
      return;
    }

    setSubmitting(true);
    setMessage(null);
    try {
      itemsWithDetails.forEach((item) => {
        if (!item.book) {
          throw new Error(t("msg.purchaseUnavailable"));
        }
        // reaplicăm logica de cumpărare pentru fiecare articol din coș
        PurchasesService.buy(item.bookId, user, item.qty);
      });
      CartService.clearPurchaseCart();
      setMessage({
        type: "success",
        text: t("msg.purchaseConfirmed"),
      });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <div className="page-header">
          <div>
            <p className="eyebrow">{t("nav.cartPurchases")}</p>
            <h1 data-testid="purchase-cart-title">{t("cartPurchases.title")}</h1>
            <p className="muted">{t("cartPurchases.subtitle")}</p>
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

        {itemsWithDetails.length === 0 ? (
          <p className="muted">{t("cartPurchases.empty")}</p>
        ) : (
          <section className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>{t("cartPurchases.tableBook")}</th>
                  <th>{t("cartPurchases.tablePrice")}</th>
                  <th>{t("cartPurchases.tableQty")}</th>
                  <th>{t("cartPurchases.tableSubtotal")}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {itemsWithDetails.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.book?.title ?? t("books.unavailable")}</strong>
                      <div className="muted">{item.book?.author}</div>
                    </td>
                    <td>{formatPrice(item.book?.price)}</td>
                    <td>
                      <input
                        className="input"
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(event) => updateQty(item.id, event.target.value)}
                        style={{ width: "70px" }}
                      />
                    </td>
                    <td>{formatPrice(item.subtotal)}</td>
                    <td className="text-right">
                      <button
                        className="btn btn--ghost"
                        type="button"
                        onClick={() => removeItem(item.id)}
                      >
                        {t("btn.remove")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex-between" style={{ marginTop: "1rem" }}>
              <strong>{t("cartPurchases.total")}</strong>
              <strong>{formatPrice(total)}</strong>
            </div>
            <div className="text-right" style={{ marginTop: "1rem" }}>
              <button
                className="btn btn--primary"
                type="button"
                onClick={handleCheckout}
                disabled={submitting}
              >
                {t("cartPurchases.confirm")}
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
