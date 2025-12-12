// src/services/purchases.service.js
import { Storage } from "./storage";
import { HistoryService } from "./history.service";

export const PurchasesService = {
  buy(bookId, user, qty = 1) {
    qty = Number(qty);
    if (qty < 1) throw new Error("Cantitate invalidă");

    const books = Storage.get("books");
    const book = books.find((b) => b.id === bookId && b.isActive !== false);
    if (!book) throw new Error("Cartea nu există");
    if (book.available < qty) throw new Error("Stoc insuficient");

    const amount = (Number(book.price) || 0) * qty;

    book.available -= qty;
    book.total -= qty;

    Storage.set("books", books);

    HistoryService.add(user.id, "BUY", `Bought: ${book.title} x${qty}`, bookId, qty, amount);
  },

  // pentru “biblioteca cumpără stoc” (admin)
  addStock(bookId, admin, qty = 1) {
    if (admin.role !== "ADMIN") throw new Error("Admin only");
    qty = Number(qty);
    if (qty < 1) throw new Error("Cantitate invalidă");

    const books = Storage.get("books");
    const book = books.find((b) => b.id === bookId);
    if (!book) throw new Error("Cartea nu există");

    book.total += qty;
    book.available += qty;

    Storage.set("books", books);
    HistoryService.add(admin.id, "BUY_STOCK", `Stock added: ${book.title} x${qty}`, bookId, qty);
  },
};
