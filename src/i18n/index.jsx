import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import updateLocale from "dayjs/plugin/updateLocale";
import "dayjs/locale/sr";
import "dayjs/locale/en-gb";
import { messages } from "./messages";

// dayjs ships Serbian in the ekavian variant ("pre 5 sati"); the app is written in ijekavian.
dayjs.extend(updateLocale);
dayjs.updateLocale("sr", {
  relativeTime: { ...dayjs.Ls.sr.relativeTime, future: "za %s", past: "prije %s" },
});

export const LANGUAGES = [
  { code: "sr", label: "Srpski", short: "SR", dayjs: "sr", country: "RS" },
  { code: "en", label: "English", short: "EN", dayjs: "en-gb", country: "GB" },
];

const STORAGE_KEY = "incident-alert.language";

function initialLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (LANGUAGES.some((l) => l.code === saved)) return saved;
  } catch {
    // Storage can be blocked; fall back to the browser language.
  }
  // Serbian, Bosnian, Croatian and Montenegrin speakers get Serbian (Latin script).
  return /^(sr|bs|hr|cnr|sh)\b/i.test(globalThis.navigator?.language ?? "") ? "sr" : "en";
}

// The current language for code that runs outside React (e.g. turning API errors into text).
let current = initialLanguage();

function lookup(language, key) {
  return key.split(".").reduce((node, part) => node?.[part], messages[language]);
}

function format(text, vars) {
  return text.replace(/\{(\w+)\}/g, (_, name) => (vars?.[name] ?? `{${name}}`));
}

/**
 * Translates a key such as "report.title". Values like { n } fill "{n}" placeholders.
 * When the entry is an object of plural forms ({ one, few, other }), `vars.n` picks the form.
 */
export function translate(key, vars, language = current) {
  let entry = lookup(language, key) ?? lookup("en", key);
  if (entry && typeof entry === "object" && vars?.n !== undefined) {
    const form = new Intl.PluralRules(language === "sr" ? "sr-Latn" : "en").select(vars.n);
    entry = entry[form] ?? entry.other;
  }
  return typeof entry === "string" ? format(entry, vars) : key;
}

const I18nContext = createContext({ language: current, setLanguage: () => {}, t: translate });

export function I18nProvider({ children, language: forced }) {
  const [language, setLanguageState] = useState(forced ?? current);

  const setLanguage = useCallback((code) => {
    setLanguageState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // Not remembered, but the switch still works for this visit.
    }
  }, []);

  current = language;
  const info = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[1];

  useEffect(() => {
    dayjs.locale(info.dayjs);
    document.documentElement.lang = language;
  }, [info, language]);

  // dayjs is global, so it is set during render too: the first paint already uses the right language.
  if (dayjs.locale() !== info.dayjs) dayjs.locale(info.dayjs);

  const value = useMemo(
    () => ({ language, info, setLanguage, t: (key, vars) => translate(key, vars, language) }),
    [language, info, setLanguage],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
export const useT = () => useContext(I18nContext).t;
