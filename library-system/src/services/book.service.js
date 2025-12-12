// src/services/books.service.js
import { Storage } from "./storage";
import { HistoryService } from "./history.service";

export const BooksService = {
  list() {
    return Storage.get("books").filter((b) => b.isActive !== false);
  },

  add(book, actorUser) {
    const books = Storage.get("books");
    const newBook = {
      id: Date.now(),
      isbn: book.isbn ?? "",
      title: book.title,
      author: book.author,
      category: book.category ?? "",
      description: book.description ?? "",
      price: Number(book.price ?? 0),
      total: Number(book.total ?? 0),
      available: Number(book.total ?? 0),
      isActive: true,
    };
    books.push(newBook);
    Storage.set("books", books);

    HistoryService.add(actorUser.id, "ADD_BOOK", `Added: ${newBook.title}`, newBook.id);
    return newBook;
  },

  update(bookId, patch, actorUser) {
    const books = Storage.get("books");
    const b = books.find((x) => x.id === bookId);
    if (!b) throw new Error("Book not found");

    Object.assign(b, patch);
    Storage.set("books", books);

    HistoryService.add(actorUser.id, "UPDATE_BOOK", `Updated: ${b.title}`, b.id);
    return b;
  },

  remove(bookId, actorUser) {
    const books = Storage.get("books");
    const b = books.find((x) => x.id === bookId);
    if (!b) throw new Error("Book not found");

    b.isActive = false;
    Storage.set("books", books);

    HistoryService.add(actorUser.id, "DELETE_BOOK", `Deleted: ${b.title}`, b.id);
  },
};
