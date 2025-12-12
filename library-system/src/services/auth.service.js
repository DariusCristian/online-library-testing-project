// src/services/auth.service.js
import { Storage } from "./storage";

const SESSION_KEY = "session_user";

export const AuthService = {
  currentUser() {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  login(email, password) {
    const users = Storage.get("users");
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) throw new Error("Email/parolă invalide");
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
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
    sessionStorage.removeItem(SESSION_KEY);
  },
};
