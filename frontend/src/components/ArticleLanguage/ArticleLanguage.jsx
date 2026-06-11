const LANGUAGE_MAP = {
  zh: { label: "中文", icon: "🇨🇳" },
  en: { label: "English", icon: "🇺🇸" },
};

function ArticleLanguage({ language }) {
  if (!language) return null;

  const langInfo = LANGUAGE_MAP[language] || {
    label: language,
    icon: "\uD83C\uDF10",
  };

  return (
    <div className="article-language">
      <span className="article-language-icon">{langInfo.icon}</span>
      <span className="article-language-label">{langInfo.label}</span>
    </div>
  );
}

export default ArticleLanguage;
