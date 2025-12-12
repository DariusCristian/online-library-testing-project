// src/services/history.service.js
import { Storage } from "./storage";

export const HistoryService = {
  add(userId, type, details, bookId = null, qty = 1, amount = null) {
    const history = Storage.get("history");
    history.push({
      id: Date.now(),
      userId,
      type,
      details,
      bookId,
      qty,
      amount,
      at: new Date().toISOString(),
    });
    Storage.set("history", history);
  },

  forUser(userId) {
    return Storage.get("history").filter((h) => h.userId === userId).reverse();
  },
};
