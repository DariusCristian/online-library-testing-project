// src/services/cart.service.js
import { Storage } from "./storage";

const LOAN_CART_KEY = "loan_cart";
const PURCHASE_CART_KEY = "purchase_cart";

const read = (key) => Storage.get(key, []);
const write = (key, value) => Storage.set(key, value);

export const CartService = {
  loanItems() {
    return read(LOAN_CART_KEY);
  },
  addLoan(bookId) {
    const cart = read(LOAN_CART_KEY);
    if (!cart.some((item) => item.bookId === bookId)) {
      // păstrăm doar un exemplar per titlu în coșul de împrumut
      cart.push({ id: Date.now(), bookId });
      write(LOAN_CART_KEY, cart);
    }
    return cart;
  },
  removeLoan(itemId) {
    const cart = read(LOAN_CART_KEY).filter((item) => item.id !== itemId);
    write(LOAN_CART_KEY, cart);
    return cart;
  },
  clearLoanCart() {
    write(LOAN_CART_KEY, []);
  },

  purchaseItems() {
    return read(PURCHASE_CART_KEY);
  },
  addPurchase(bookId, qty = 1) {
    qty = Number(qty);
    if (Number.isNaN(qty) || qty < 1) qty = 1;
    const cart = read(PURCHASE_CART_KEY);

    const existing = cart.find((item) => item.bookId === bookId);
    if (existing) {
      // cumulăm cantitățile pentru același titlu
      existing.qty += qty;
    } else {
      cart.push({ id: Date.now(), bookId, qty });
    }
    write(PURCHASE_CART_KEY, cart);
    return cart;
  },
  updatePurchase(itemId, qty) {
    qty = Number(qty);
    const cart = read(PURCHASE_CART_KEY);
    const item = cart.find((entry) => entry.id === itemId);
    if (!item) return cart;
    if (Number.isNaN(qty) || qty < 1) {
      item.qty = 1;
    } else {
      item.qty = qty;
    }
    write(PURCHASE_CART_KEY, cart);
    return cart;
  },
  removePurchase(itemId) {
    const cart = read(PURCHASE_CART_KEY).filter((item) => item.id !== itemId);
    write(PURCHASE_CART_KEY, cart);
    return cart;
  },
  clearPurchaseCart() {
    write(PURCHASE_CART_KEY, []);
  },
};
