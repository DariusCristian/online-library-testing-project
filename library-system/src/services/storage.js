// src/services/storage.js
const hasWindow = () => typeof window !== "undefined";
const hasStorage = () => hasWindow() && typeof window.localStorage !== "undefined";

const CHANNEL = "library:storage";
const BACKUP_PREFIX = "backup:";

const broadcast = (key = null) => {
  if (!hasWindow() || typeof window.dispatchEvent !== "function") return;
  // custom event pentru a sincroniza UI-ul în același tab
  window.dispatchEvent(
    new CustomEvent(CHANNEL, {
      detail: { key, at: Date.now() },
    })
  );
};

export const Storage = {
  get(key, fallback = []) {
    if (!hasStorage()) return fallback;
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
      const backupRaw = localStorage.getItem(`${BACKUP_PREFIX}${key}`);
      if (backupRaw) {
        // restaurăm automat dacă cheia principală a fost ștearsă
        localStorage.setItem(key, backupRaw);
        broadcast(key);
        return JSON.parse(backupRaw);
      }
      return fallback;
    } catch (err) {
      console.warn(`[Storage] Failed to read key "${key}"`, err);
      localStorage.removeItem(key);
      broadcast(key);
      return fallback;
    }
  },
  set(key, value) {
    if (!hasStorage()) return;
    try {
      const payload = JSON.stringify(value);
      localStorage.setItem(key, payload);
      // păstrăm o copie de siguranță în localStorage
      localStorage.setItem(`${BACKUP_PREFIX}${key}`, payload);
      broadcast(key);
    } catch (err) {
      console.error(`[Storage] Failed to write key "${key}"`, err);
    }
  },
  clear() {
    if (!hasStorage()) return;
    localStorage.clear();
    broadcast(null);
  },
};

export function subscribeToStorage(listener) {
  if (!hasWindow()) return () => {};

  const customHandler = (event) => {
    listener(event.detail?.key ?? null);
  };

  const storageHandler = (event) => {
    listener(event.key ?? null);
  };

  window.addEventListener(CHANNEL, customHandler);
  window.addEventListener("storage", storageHandler);

  return () => {
    // curățăm listener-ele pentru a evita scurgeri de memorie
    window.removeEventListener(CHANNEL, customHandler);
    window.removeEventListener("storage", storageHandler);
  };
}

const demoBooks = [
  // Fictiune
  {
    id: 2001,
    isbn: "978-973-46-0101-0",
    title: "Marea în noapte",
    author: "Ioana Ioniță",
    category: "Fictiune",
    description: "O saga de familie desfășurată pe trei generații.",
    price: 42,
    total: 6,
    available: 6,
    isActive: true,
  },
  {
    id: 2002,
    isbn: "978-606-40-1102-1",
    title: "Cei fără chip",
    author: "Dan Pavel",
    category: "Fictiune",
    description: "Thriller psihologic în Bucureștiul contemporan.",
    price: 36,
    total: 5,
    available: 5,
    isActive: true,
  },
  {
    id: 2003,
    isbn: "978-973-50-2210-5",
    title: "Orașe din hârtie",
    author: "Andreea Petrescu",
    category: "Fictiune",
    description: "Poveste despre prietenie și descoperire de sine.",
    price: 39,
    total: 4,
    available: 4,
    isActive: true,
  },
  {
    id: 2004,
    isbn: "978-606-97-1211-8",
    title: "Ultimul tren spre nord",
    author: "Mircea Ispas",
    category: "Fictiune",
    description: "Roman istoric despre speranță și supraviețuire.",
    price: 41,
    total: 5,
    available: 5,
    isActive: true,
  },
  {
    id: 2005,
    isbn: "978-973-46-9910-0",
    title: "Pădurea albă",
    author: "Marina Popescu",
    category: "Fictiune",
    description: "Un basm modern plin de simbolism și mister.",
    price: 34,
    total: 3,
    available: 3,
    isActive: true,
  },

  // Non-fictiune
  {
    id: 2101,
    isbn: "978-606-33-9001-2",
    title: "Viața organizată",
    author: "Raluca Marinescu",
    category: "Non-fictiune",
    description: "Ghid practic de productivitate pentru oameni ocupați.",
    price: 45,
    total: 4,
    available: 4,
    isActive: true,
  },
  {
    id: 2102,
    isbn: "978-973-34-6002-8",
    title: "România ascunsă",
    author: "Sorin Dumitrescu",
    category: "Non-fictiune",
    description: "Reportaje și povești din colțuri uitate ale țării.",
    price: 40,
    total: 3,
    available: 3,
    isActive: true,
  },
  {
    id: 2103,
    isbn: "978-606-71-1030-9",
    title: "Puterea deciziilor mici",
    author: "Oana Drăghici",
    category: "Non-fictiune",
    description: "Cum îți modelezi viața prin micro-obiceiuri.",
    price: 37,
    total: 5,
    available: 5,
    isActive: true,
  },

  // Stintifice
  {
    id: 2201,
    isbn: "978-606-11-2201-5",
    title: "Universul pe înțelesul tuturor",
    author: "Alexandru Damian",
    category: "Stintifice",
    description: "Ghid ilustrat despre fizica modernă.",
    price: 55,
    total: 6,
    available: 6,
    isActive: true,
  },
  {
    id: 2202,
    isbn: "978-973-50-3302-5",
    title: "Matematica ideilor frumoase",
    author: "Elena Diaconu",
    category: "Stintifice",
    description: "Eseuri despre teoreme celebre explicate simplu.",
    price: 48,
    total: 4,
    available: 4,
    isActive: true,
  },
  {
    id: 2203,
    isbn: "978-606-06-1234-3",
    title: "Biologia viitorului",
    author: "Cornel Mihăilescu",
    category: "Stintifice",
    description: "Descoperiri recente despre genetică și evoluție.",
    price: 52,
    total: 5,
    available: 5,
    isActive: true,
  },
  {
    id: 2204,
    isbn: "978-606-77-4555-6",
    title: "Inteligență artificială pentru curioși",
    author: "Teodora Mureșan",
    category: "Stintifice",
    description: "Introducere accesibilă în conceptele AI.",
    price: 46,
    total: 5,
    available: 5,
    isActive: true,
  },

  // Business
  {
    id: 2301,
    isbn: "978-606-40-3301-2",
    title: "Strategii în vremuri incerte",
    author: "Cristian Barbu",
    category: "Business",
    description: "Cum scalezi afaceri în condiții volatile.",
    price: 58,
    total: 5,
    available: 5,
    isActive: true,
  },
  {
    id: 2302,
    isbn: "978-973-50-1188-7",
    title: "Leadership lucid",
    author: "Ana Antonescu",
    category: "Business",
    description: "Tehnici de management empatic și performant.",
    price: 47,
    total: 4,
    available: 4,
    isActive: true,
  },
  {
    id: 2303,
    isbn: "978-606-87-5500-3",
    title: "Marketing fără fum și oglinzi",
    author: "Paul Radu",
    category: "Business",
    description: "Campanii digitale centrate pe clienți reali.",
    price: 44,
    total: 3,
    available: 3,
    isActive: true,
  },
  {
    id: 2304,
    isbn: "978-973-34-7890-5",
    title: "Start-up în 90 de zile",
    author: "Silvia Gherman",
    category: "Business",
    description: "Plan pas cu pas pentru lansarea unui produs.",
    price: 43,
    total: 4,
    available: 4,
    isActive: true,
  },

  // Dezvoltare personala
  {
    id: 2401,
    isbn: "978-606-33-4101-9",
    title: "Mic dejun cu intenții",
    author: "Irina Marin",
    category: "Dezvoltare personala",
    description: "Ritualuri matinale pentru claritate mentală.",
    price: 35,
    total: 5,
    available: 5,
    isActive: true,
  },
  {
    id: 2402,
    isbn: "978-973-50-6677-1",
    title: "Curajul de a spune nu",
    author: "Laura Banu",
    category: "Dezvoltare personala",
    description: "Cum setezi limite sănătoase în relații.",
    price: 33,
    total: 4,
    available: 4,
    isActive: true,
  },
  {
    id: 2403,
    isbn: "978-606-84-1450-2",
    title: "Respiră, recunoaște, reușește",
    author: "Gabriel Stănescu",
    category: "Dezvoltare personala",
    description: "Tehnici scurte de mindfulness pentru zile aglomerate.",
    price: 29,
    total: 6,
    available: 6,
    isActive: true,
  },
  {
    id: 2404,
    isbn: "978-973-62-3333-4",
    title: "Jurnalul recunoștinței",
    author: "Mara Florescu",
    category: "Dezvoltare personala",
    description: "Program ghidat de 30 de zile pentru stare de bine.",
    price: 27,
    total: 3,
    available: 3,
    isActive: true,
  },

  // Religie
  {
    id: 2501,
    isbn: "978-973-77-1111-6",
    title: "Cărarea rugăciunii",
    author: "Nicolae Bordeianu",
    category: "Religie",
    description: "Reflecții ortodoxe despre viața interioară.",
    price: 32,
    total: 4,
    available: 4,
    isActive: true,
  },
  {
    id: 2502,
    isbn: "978-606-44-2010-8",
    title: "Parabole pentru copii mari",
    author: "Maria Lupu",
    category: "Religie",
    description: "Povești scurte cu tâlc spiritual contemporan.",
    price: 28,
    total: 3,
    available: 3,
    isActive: true,
  },
  {
    id: 2503,
    isbn: "978-973-64-8787-9",
    title: "Pelerinaj către liniște",
    author: "Teofil Roman",
    category: "Religie",
    description: "Jurnal de călătorie la mănăstiri din țară.",
    price: 34,
    total: 5,
    available: 5,
    isActive: true,
  },

  // Istorie
  {
    id: 2601,
    isbn: "978-606-86-6101-3",
    title: "Dacii după romani",
    author: "Victor Nedelcu",
    category: "Istorie",
    description: "Perspective arheologice moderne.",
    price: 53,
    total: 6,
    available: 6,
    isActive: true,
  },
  {
    id: 2602,
    isbn: "978-973-60-5555-2",
    title: "Monarhia română în documente",
    author: "Elisabeta Todea",
    category: "Istorie",
    description: "Colecție comentată de scrisori și tratate.",
    price: 49,
    total: 4,
    available: 4,
    isActive: true,
  },
  {
    id: 2603,
    isbn: "978-606-07-7171-6",
    title: "Europa între imperii",
    author: "Radu Petre",
    category: "Istorie",
    description: "Secolele XVIII-XIX privite prin prisma alianțelor.",
    price: 56,
    total: 5,
    available: 5,
    isActive: true,
  },
  {
    id: 2604,
    isbn: "978-973-50-8989-3",
    title: "Memorii din tranșee",
    author: "Ștefan Maniu",
    category: "Istorie",
    description: "Relatări directe din Primul Război Mondial.",
    price: 44,
    total: 3,
    available: 3,
    isActive: true,
  },

  // Bibliografii
  {
    id: 2701,
    isbn: "978-606-70-1234-7",
    title: "Tudor Arghezi – o viață în cuvinte",
    author: "Mihaela Dinescu",
    category: "Bibliografii",
    description: "Biografie literară bazată pe arhive și scrisori.",
    price: 40,
    total: 4,
    available: 4,
    isActive: true,
  },
  {
    id: 2702,
    isbn: "978-973-45-7788-1",
    title: "Inventatorii secolului XX",
    author: "Claudiu Mihai",
    category: "Bibliografii",
    description: "Profiluri scurte ale inovatorilor care au schimbat lumea.",
    price: 46,
    total: 5,
    available: 5,
    isActive: true,
  },
  {
    id: 2703,
    isbn: "978-606-95-6677-4",
    title: "Regine și regate",
    author: "Sorina Oprea",
    category: "Bibliografii",
    description: "Portrete ale unor femei remarcabile din istorie.",
    price: 38,
    total: 3,
    available: 3,
    isActive: true,
  },

  // Economie
  {
    id: 2801,
    isbn: "978-973-53-2001-9",
    title: "Economia circulară explicată",
    author: "Anca Vasile",
    category: "Economie",
    description: "Modele de afaceri pentru un viitor sustenabil.",
    price: 45,
    total: 4,
    available: 4,
    isActive: true,
  },
  {
    id: 2802,
    isbn: "978-606-40-7890-4",
    title: "Finanțe personale fără stres",
    author: "Lucian Onuțu",
    category: "Economie",
    description: "Strategii simple de bugetare și investiții.",
    price: 37,
    total: 6,
    available: 6,
    isActive: true,
  },
  {
    id: 2803,
    isbn: "978-973-60-4545-4",
    title: "Crizele care ne schimbă",
    author: "Ovidiu Rusu",
    category: "Economie",
    description: "Analiză a recesiunilor majore și lecțiile lor.",
    price: 52,
    total: 5,
    available: 5,
    isActive: true,
  },
  {
    id: 2804,
    isbn: "978-606-89-5505-6",
    title: "Macroeconomie vizuală",
    author: "Laura Iacob",
    category: "Economie",
    description: "Diagrame și infografice pentru concepte-cheie.",
    price: 50,
    total: 4,
    available: 4,
    isActive: true,
  },
];

export function seed() {
  if (!hasStorage()) return;
  const users = Storage.get("users", null);
  if (!users) {
    Storage.set("users", [
      { id: 1, email: "admin@local", password: "admin123", role: "ADMIN" },
    ]);
  }
  if (!localStorage.getItem("books")) Storage.set("books", demoBooks);
  if (!localStorage.getItem("loans")) Storage.set("loans", []);
  if (!localStorage.getItem("history")) Storage.set("history", []);
  if (!localStorage.getItem("loan_cart")) Storage.set("loan_cart", []);
  if (!localStorage.getItem("purchase_cart")) Storage.set("purchase_cart", []);
}
