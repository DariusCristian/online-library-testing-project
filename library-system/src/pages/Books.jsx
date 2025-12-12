import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { BooksService } from "../services/book.service";
import { CartService } from "../services/cart.service";
import { AuthService } from "../services/auth.service";
import { subscribeToStorage } from "../services/storage";

const formatPrice = (value) => `${Number(value || 0).toFixed(2)} lei`;

export default function Books() {
  const user = AuthService.currentUser();
  const [books, setBooks] = useState(() => BooksService.list());
  const [search, setSearch] = useState("");
  const [qty, setQty] = useState({});
  const [message, setMessage] = useState(null);

  const reload = useCallback(() => setBooks(BooksService.list()), []);

  const filteredBooks = useMemo(() => {
    // filtrează local lista pentru a nu lovi storage de fiecare dată
    const term = search.trim().toLowerCase();
    if (!term) return books;
    return books.filter((book) => {
      const values = [book.title, book.author, book.category];
      return values.some((value) => value?.toLowerCase().includes(term));
    });
  }, [books, search]);

  const notify = (type, text) => setMessage({ type, text });

  const handleBorrow = (bookId) => {
    CartService.addLoan(bookId);
    notify("success", "Cartea a fost adăugată în coșul de împrumuturi.");
  };

  const handleBuy = (bookId) => {
    const value = Number(qty[bookId] ?? 1);
    if (Number.isNaN(value) || value < 1) {
      notify("error", "Introduce o cantitate validă.");
      return;
    }
    CartService.addPurchase(bookId, value);
    setQty((prev) => ({ ...prev, [bookId]: 1 }));
    notify("success", "Adăugat în coșul de cumpărături.");
  };

  useEffect(() => {
    const unsubscribe = subscribeToStorage((key) => {
      if (!key || key === "books") {
        reload();
      }
    });
    return unsubscribe;
  }, [reload]);

  if (!user) return null;

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <div className="page-header">
          <div>
            <p className="eyebrow">Catalog</p>
            <h1>Cărți disponibile</h1>
            <p className="muted">
              Împrumută sau cumpără titlurile care te interesează.
            </p>
          </div>
          <div className="page-header__actions">
            <input
              className="input"
              style={{ minWidth: "240px" }}
              placeholder="Caută după titlu, autor sau categorie"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Link className="btn btn--ghost" to="/cart/loans">
              Coș împrumuturi
            </Link>
            <Link className="btn btn--ghost" to="/cart/purchases">
              Coș cumpărături
            </Link>
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

        {filteredBooks.length === 0 ? (
          <p className="muted">Nu există cărți după criteriile alese.</p>
        ) : (
          <div className="books-grid">
            {filteredBooks.map((book) => (
              <article key={book.id} className="book-card">
                <div>
                  <h3 style={{ marginBottom: "0.2rem" }}>{book.title}</h3>
                  <p className="muted">de {book.author}</p>
                </div>
                <p className="muted" style={{ fontSize: "0.9rem" }}>
                  {book.description || "Fără descriere"}
                </p>
                <div className="chips">
                  {book.category && <span className="tag">{book.category}</span>}
                  <span className="tag">
                    Stoc: {book.available}/{book.total}
                  </span>
                  <span className="tag tag--success">{formatPrice(book.price)}</span>
                </div>

                <div className="book-card__actions">
                  <button
                    className="btn btn--primary w-full"
                    type="button"
                    onClick={() => handleBorrow(book.id)}
                    disabled={book.available < 1}
                  >
                    Împrumută
                  </button>
                  <label className="qty-control">
                    <span className="qty-control__label">Cantitate cumpărare</span>
                    <div className="qty-control__row">
                      <input
                        className="input qty-control__input"
                        type="number"
                        min="1"
                        value={qty[book.id] ?? 1}
                        onChange={(event) =>
                          setQty((prev) => ({ ...prev, [book.id]: event.target.value }))
                        }
                      />
                      <button
                        className="btn btn--ghost"
                        type="button"
                        onClick={() => handleBuy(book.id)}
                      >
                        Cumpără
                      </button>
                    </div>
                  </label>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
