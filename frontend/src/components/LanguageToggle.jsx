import { useTranslation } from "react-i18next";

function LanguageToggle() {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("smart-grocery-language", lang);
    }
  };

  return (
    <div className="language-toggle" aria-label={t("labels.language")}>
      <button
        type="button"
        className={i18n.language === "en" ? "active" : ""}
        onClick={() => changeLanguage("en")}
      >
        EN
      </button>
      <button
        type="button"
        className={i18n.language === "te" ? "active" : ""}
        onClick={() => changeLanguage("te")}
      >
        తెలుగు
      </button>
    </div>
  );
}

export default LanguageToggle;
