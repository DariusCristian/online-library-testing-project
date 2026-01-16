import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { categoryLabels, translations } from "./i18n";

const UIContext = createContext(null);

const LANG_KEY = "ui_lang";
const THEME_KEY = "ui_theme";

const readLocal = (key, fallback) => {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ?? fallback;
  } catch {
    return fallback;
  }
};

const writeLocal = (key, value) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, value);
};

const interpolate = (template, vars = {}) =>
  template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? "");

export const UIProvider = ({ children }) => {
  const [lang, setLang] = useState(() => readLocal(LANG_KEY, "ro"));
  const [theme, setTheme] = useState(() => readLocal(THEME_KEY, "light"));

  useEffect(() => {
    writeLocal(LANG_KEY, lang);
  }, [lang]);

  useEffect(() => {
    writeLocal(THEME_KEY, theme);
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = theme;
    }
  }, [theme]);

  const t = useMemo(() => {
    const dict = translations[lang] ?? translations.ro;
    return (key, vars) => {
      const value = dict[key] ?? translations.ro[key] ?? key;
      return interpolate(value, vars);
    };
  }, [lang]);

  const translateCategory = useMemo(() => {
    const map = categoryLabels[lang] ?? categoryLabels.ro;
    return (category) => map[category] ?? category;
  }, [lang]);

  const toggleLang = () => setLang((prev) => (prev === "ro" ? "en" : "ro"));
  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  const value = useMemo(
    () => ({
      lang,
      theme,
      t,
      toggleLang,
      toggleTheme,
      translateCategory,
    }),
    [lang, theme, t, translateCategory]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error("useUI must be used within UIProvider");
  return context;
};
