// src/services/loans.service.js
import { Storage } from "./storage";
import { HistoryService } from "./history.service";

export const LoansService = {
  borrow(bookId, user) {
    const books = Storage.get("books");
    const loans = Storage.get("loans");
    const book = books.find((b) => b.id === bookId && b.isActive !== false);
    if (!book) throw new Error("Cartea nu există");
    if (book.available < 1) throw new Error("Nu există exemplare disponibile");

    book.available -= 1;

    loans.push({
      id: Date.now(),
      userId: user.id,
      bookId,
      loanDate: new Date().toISOString(),
      returnDate: null,
      status: "BORROWED",
    });

    Storage.set("books", books);
    Storage.set("loans", loans);

    HistoryService.add(user.id, "BORROW", `Borrowed: ${book.title}`, bookId);
  },

  returnLoan(loanId, user) {
    const books = Storage.get("books");
    const loans = Storage.get("loans");
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) throw new Error("Împrumut inexistent");
    if (loan.userId !== user.id) throw new Error("Nu ai acces");
    if (loan.status !== "BORROWED") throw new Error("Nu e activ");

    const book = books.find((b) => b.id === loan.bookId);
    if (book) book.available += 1;

    loan.status = "RETURNED";
    loan.returnDate = new Date().toISOString();

    Storage.set("books", books);
    Storage.set("loans", loans);

    HistoryService.add(user.id, "RETURN", `Returned loan`, loan.bookId);
  },

  myLoans(userId) {
    return Storage.get("loans").filter((l) => l.userId === userId).reverse();
  },
};
