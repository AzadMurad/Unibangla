import { Language, translations } from "@/constants/translations";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type TranslateParams = Record<string, string | number>;

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: TranslateParams) => string;
};

const LANGUAGE_STORAGE_KEY = "unibangla_language";

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function interpolate(template: string, params?: TranslateParams) {
  if (!params) {
    return template;
  }

  return Object.entries(params).reduce((result, [key, value]) => {
    return result.replace(new RegExp(`\\{${key}\\}`, "g"), String(value));
  }, template);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;
      if (savedLanguage === "en" || savedLanguage === "bn") {
        setLanguageState(savedLanguage);
      }
    } catch (error) {
      console.error("Failed to restore language preference:", error);
    }
  }, []);

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    } catch (error) {
      console.error("Failed to persist language preference:", error);
    }
  };

  const value = useMemo<LanguageContextValue>(() => {
    return {
      language,
      setLanguage,
      t: (key: string, params?: TranslateParams) => {
        const table = translations[language];
        const fallback = translations.en;
        const text = table[key] ?? fallback[key] ?? key;
        return interpolate(text, params);
      },
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
