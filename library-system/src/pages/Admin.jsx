import { useCallback, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { AuthService } from "../services/auth.service";
import { BooksService } from "../services/book.service";
import { PurchasesService } from "../services/purchases.service";
import { Storage, seed, subscribeToStorage } from "../services/storage";

const CATEGORY_OPTIONS = [
  "Fictiune",
  "Non-fictiune",
  "Stintifice",
  "Business",
  "Dezvoltare personala",
  "Religie",
  "Istorie",
  "Bibliografii",
  "Economie",
];

const createEmptyForm = () => ({
  title: "",
  author: "",
  isbn: "",
  category: CATEGORY_OPTIONS[0] ?? "",
  description: "",
  price: "",
  total: 1,
});

export default function Admin() {
  const user = AuthService.currentUser();
  const readBooks = () => {
    // normalizează lista din storage (asigură vector chiar dacă e coruptă)
    const data = Storage.get("books");
    return Array.isArray(data) ? data : [];
  };

  const [books, setBooks] = useState(readBooks);
  const [form, setForm] = useState(createEmptyForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [stockInputs, setStockInputs] = useState({});
  const [priceInputs, setPriceInputs] = useState({});

  if (!user) return null;

  // helper folosit după fiecare acțiune care modifică lista de cărți
  const reload = useCallback(() => setBooks(readBooks()), []);

  useEffect(() => {
    const unsubscribe = subscribeToStorage((key) => {
      if (!key || key === "books") {
        reload();
      }
    });
    return unsubscribe;
  }, [reload]);

  const handleResetData = () => {
    setError("");
    setMessage("");
    Storage.clear();
    seed();
    reload();
    setStockInputs({});
    setPriceInputs({});
    setForm(createEmptyForm());
    setMessage("Datele demo au fost resetate.");
  };

  const handleAdd = (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!form.title.trim() || !form.author.trim()) {
      setError("Titlul și autorul sunt obligatorii.");
      return;
    }

    try {
      BooksService.add(
        {
          title: form.title.trim(),
          author: form.author.trim(),
          isbn: form.isbn.trim(),
          category: form.category.trim(),
          description: form.description.trim(),
          total: Number(form.total),
          price: Number(form.price),
        },
        user
      );
      setForm(createEmptyForm());
      reload();
      setMessage("Cartea a fost adăugată.");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStock = (bookId) => {
    setError("");
    setMessage("");
    const qty = Number(stockInputs[bookId] || 1);
    if (Number.isNaN(qty) || qty < 1) {
      setError("Introduce o cantitate validă pentru stoc.");
      return;
    }
    try {
      PurchasesService.addStock(bookId, user, qty);
      reload();
      setMessage("Stoc actualizat.");
      setStockInputs((prev) => ({ ...prev, [bookId]: 1 }));
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePriceUpdate = (bookId) => {
    setError("");
    setMessage("");
    const value = priceInputs[bookId];
    if (value === undefined) {
      setError("Introdu un preț nou.");
      return;
    }
    const price = Number(value);
    if (Number.isNaN(price) || price < 0) {
      setError("Prețul trebuie să fie pozitiv.");
      return;
    }
    try {
      BooksService.update(bookId, { price }, user);
      reload();
      setMessage("Preț actualizat.");
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleActive = (book) => {
    setError("");
    setMessage("");
    try {
      if (book.isActive === false) {
        BooksService.update(book.id, { isActive: true }, user);
        setMessage("Cartea a fost reactivată.");
      } else {
        BooksService.remove(book.id, user);
        setMessage("Cartea a fost dezactivată.");
      }
      reload();
    } catch (err) {
      setError(err.message);
    }
  };

  const sortedBooks = [...books].sort((a, b) =>
    a.title.localeCompare(b.title)
  );

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <div className="page-header">
          <div>
            <p className="eyebrow">Administrare</p>
            <h1>Gestionare catalog</h1>
            <p className="muted">
              Adaugă, actualizează și dezactivează cărțile disponibile.
            </p>
          </div>
          <div className="page-header__actions">
            <button className="btn btn--ghost" type="button" onClick={handleResetData}>
              Resetează datele demo
            </button>
          </div>
        </div>

        {(error || message) && (
          <div
            className={[
              "alert",
              error ? "alert--error" : "alert--success",
            ]
              .join(" ")
              .trim()}
          >
            {error || message}
          </div>
        )}

        <section className="card" style={{ marginBottom: "1.5rem" }}>
          <h2>Adaugă o carte</h2>
          <form className="form-grid" onSubmit={handleAdd}>
            <label className="input-label">
              Titlu
              <input
                className="input"
                value={form.title}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, title: event.target.value }))
                }
                required
              />
            </label>
            <label className="input-label">
              Autor
              <input
                className="input"
                value={form.author}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, author: event.target.value }))
                }
                required
              />
            </label>
            <label className="input-label">
              ISBN
              <input
                className="input"
                value={form.isbn}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, isbn: event.target.value }))
                }
              />
            </label>
            <label className="input-label">
              Categorie
              <select
                className="input"
                value={form.category}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, category: event.target.value }))
                }
              >
                {CATEGORY_OPTIONS.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label className="input-label">
              Descriere
              <textarea
                className="input"
                rows={3}
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
              />
            </label>
            <div className="flex" style={{ flexWrap: "wrap" }}>
              <label className="input-label" style={{ flex: "1 1 140px" }}>
                Preț (lei)
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, price: event.target.value }))
                  }
                />
              </label>
              <label className="input-label" style={{ flex: "1 1 140px" }}>
                Exemplare
                <input
                  className="input"
                  type="number"
                  min="1"
                  value={form.total}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, total: event.target.value }))
                  }
                  required
                />
              </label>
            </div>
            <div className="text-right">
              <button className="btn btn--primary" type="submit">
                Salvează carte
              </button>
            </div>
          </form>
        </section>

        <section className="card">
          <h2>Catalog curent</h2>
          {sortedBooks.length === 0 ? (
            <p className="muted">Nu există cărți în sistem.</p>
          ) : (
            <div className="form-grid">
              {sortedBooks.map((book) => (
                <article key={book.id} className="book-card">
                  <div className="flex-between">
                    <div>
                      <h3 style={{ margin: 0 }}>{book.title}</h3>
                      <p className="muted" style={{ margin: 0 }}>
                        {book.author}
                      </p>
                    </div>
                    <span
                      className={[
                        "tag",
                        book.isActive === false ? "tag--warning" : "tag--success",
                      ]
                        .join(" ")
                        .trim()}
                    >
                      {book.isActive === false ? "Inactiv" : "Activ"}
                    </span>
                  </div>
                  <p className="muted">
                    Stoc: {book.available}/{book.total} — Preț:{" "}
                    {Number(book.price || 0).toFixed(2)} lei
                  </p>
                  <div className="flex">
                    <label className="input-label" style={{ flex: "1 1 110px" }}>
                      Stoc
                      <input
                        className="input"
                        type="number"
                        min="1"
                        value={stockInputs[book.id] ?? 1}
                        onChange={(event) =>
                          setStockInputs((prev) => ({
                            ...prev,
                            [book.id]: event.target.value,
                          }))
                        }
                      />
                    </label>
                    <button
                      className="btn btn--ghost"
                      type="button"
                      onClick={() => handleStock(book.id)}
                    >
                      Adaugă stoc
                    </button>
                  </div>
                  <div className="flex">
                    <label className="input-label" style={{ flex: "1 1 140px" }}>
                      Preț nou
                      <input
                        className="input"
                        type="number"
                        min="0"
                        step="0.01"
                        value={priceInputs[book.id] ?? ""}
                        onChange={(event) =>
                          setPriceInputs((prev) => ({
                            ...prev,
                            [book.id]: event.target.value,
                          }))
                        }
                        placeholder={Number(book.price || 0).toFixed(2)}
                      />
                    </label>
                    <button
                      className="btn btn--ghost"
                      type="button"
                      onClick={() => handlePriceUpdate(book.id)}
                    >
                      Actualizează preț
                    </button>
                  </div>
                  <div className="flex">
                    <button
                      className="btn btn--danger"
                      type="button"
                      onClick={() => toggleActive(book)}
                    >
                      {book.isActive === false ? "Reactivează" : "Dezactivează"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
