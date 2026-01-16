// src/services/auth.service.js
import { Storage } from "./storage";

const SESSION_KEY = "session_user";

const hasStorage = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const readSession = () => {
  if (!hasStorage()) return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    window.localStorage.removeItem(SESSION_KEY);
    return null;
  }
};

const writeSession = (value) => {
  if (!hasStorage()) return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(value));
};

const clearSession = () => {
  if (!hasStorage()) return;
  window.localStorage.removeItem(SESSION_KEY);
};

export const AuthService = {
  currentUser() {
    return readSession();
  },

  login(email, password) {
    const users = Storage.get("users");
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) throw new Error("Email/parolă invalide");
    writeSession(user);
    return user;
  },

  register(email, password) {
    const users = Storage.get("users");
    if (users.some((u) => u.email === email)) throw new Error("Email deja folosit");

    const newUser = { id: Date.now(), email, password, role: "USER" };
    users.push(newUser);
    Storage.set("users", users);
  },

  logout() {
    clearSession();
  },
};
