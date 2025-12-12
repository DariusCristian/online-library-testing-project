// enum roles utilizatori
export const Roles = Object.freeze({
  ADMIN: "ADMIN",
  USER: "USER",
});

// status-uri posibile pentru împrumuturi
export const LoanStatus = Object.freeze({
  BORROWED: "BORROWED",
  RETURNED: "RETURNED",
});

// tipuri de evenimente în istoric (folosite și în UI)
export const HistoryTypes = Object.freeze({
  BORROW: "BORROW",
  RETURN: "RETURN",
  BUY: "BUY",
  BUY_STOCK: "BUY_STOCK",
  ADD_BOOK: "ADD_BOOK",
  UPDATE_BOOK: "UPDATE_BOOK",
  DELETE_BOOK: "DELETE_BOOK",
});

export const LoanStatusLabels = Object.freeze({
  [LoanStatus.BORROWED]: "Împrumutat",
  [LoanStatus.RETURNED]: "Returnat",
});

export const HistoryTypeLabels = Object.freeze({
  [HistoryTypes.BORROW]: "Împrumut",
  [HistoryTypes.RETURN]: "Returnare",
  [HistoryTypes.BUY]: "Cumpărare",
  [HistoryTypes.BUY_STOCK]: "Stoc magazie",
  [HistoryTypes.ADD_BOOK]: "Carte adăugată",
  [HistoryTypes.UPDATE_BOOK]: "Carte actualizată",
  [HistoryTypes.DELETE_BOOK]: "Carte dezactivată",
});

// legăm fiecare eveniment de un stil pentru badge-uri
export const HistoryTypeEmphasis = Object.freeze({
  [HistoryTypes.BORROW]: "tag--success",
  [HistoryTypes.RETURN]: "tag--success",
  [HistoryTypes.BUY]: "tag--success",
  [HistoryTypes.BUY_STOCK]: "tag--success",
  [HistoryTypes.ADD_BOOK]: "tag--success",
  [HistoryTypes.UPDATE_BOOK]: "tag",
  [HistoryTypes.DELETE_BOOK]: "tag--warning",
});
