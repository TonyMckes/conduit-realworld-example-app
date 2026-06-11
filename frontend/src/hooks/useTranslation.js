import { useI18n } from "../context/I18nContext";
import zh from "../locales/zh.json";
import en from "../locales/en.json";

const locales = { zh, en };

function useTranslation() {
  const { language } = useI18n();

  function t(key, fallback) {
    const locale = locales[language] || locales.zh;
    return locale[key] ?? fallback ?? key;
  }

  return { t, language };
}

export default useTranslation;
