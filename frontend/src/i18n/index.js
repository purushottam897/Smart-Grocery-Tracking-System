import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./en.json";
import te from "./te.json";

const savedLanguage =
  typeof window !== "undefined" ? window.localStorage.getItem("smart-grocery-language") || "en" : "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    te: { translation: te }
  },
  lng: savedLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
