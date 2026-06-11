import Markdown from "markdown-to-jsx";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import ArticleMeta from "../../components/ArticleMeta";
import ArticlesButtons from "../../components/ArticlesButtons";
import ArticleTags from "../../components/ArticleTags";
import ArticleLanguage from "../../components/ArticleLanguage";
import BannerContainer from "../../components/BannerContainer";
import { useAuth } from "../../context/AuthContext";
import { useI18n } from "../../context/I18nContext";
import useTranslation from "../../hooks/useTranslation";
import getArticle from "../../services/getArticle";
import readingTimeCalculator from "../../helpers/readingTimeCalculator";
import wordCounter from "../../helpers/wordCounter";
import characterCounter from "../../helpers/characterCounter";

const DEFAULT_COVER = "/images/default-cover.svg";

function ArticleCoverImage({ coverImage }) {
  const [imgError, setImgError] = useState(false);

  if (!coverImage || imgError) {
    return (
      <div className="cover-image-container cover-image-placeholder article-cover">
        <img src={DEFAULT_COVER} alt="" className="cover-image" />
      </div>
    );
  }

  return (
    <div className="cover-image-container article-cover">
      <img
        src={coverImage}
        alt="Cover"
        className="cover-image"
        loading="lazy"
        onError={() => setImgError(true)}
      />
    </div>
  );
}

function Article() {
  const { state } = useLocation();
  const [article, setArticle] = useState(state || {});
  const [loading, setLoading] = useState(false);
  const { title, body, tagList, createdAt, author, availableLanguages, coverImage, language } =
    article || {};
  const { headers, isAuth } = useAuth();
  const { setLanguage } = useI18n();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { slug } = useParams();

  const [readingInfo, setReadingInfo] = useState(null);

  const currentLang = language || "zh";
  const hasEnVersion = availableLanguages?.includes("en");

  useEffect(() => {
    if (state) return;

    setLoading(true);
    getArticle({ slug, headers })
      .then((data) => {
        setArticle(data);
        if (data.language) setLanguage(data.language);
      })
      .catch((error) => {
        console.error(error);
        navigate("/not-found", { replace: true });
      })
      .finally(() => setLoading(false));
  }, [isAuth, slug, headers, state, navigate, setLanguage]);

  useEffect(() => {
    if (!body) {
      setReadingInfo(null);
      return;
    }
    const timer = setTimeout(() => {
      setReadingInfo({
        wordCount: wordCounter(body),
        charCount: characterCounter(body),
        readingTime: readingTimeCalculator(body),
      });
    }, 0);
    return () => clearTimeout(timer);
  }, [body]);

  const toggleLanguage = () => {
    const targetLang = currentLang === "zh" ? "en" : "zh";
    setLoading(true);
    setLanguage(targetLang);
    getArticle({ slug, headers, lang: targetLang })
      .then((data) => {
        setArticle(data);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="article-page">
      <BannerContainer>
        <ArticleCoverImage coverImage={coverImage} />
        <h1>{title}</h1>
        <ArticleMeta author={author} createdAt={createdAt}>
          <ArticlesButtons article={article} setArticle={setArticle} />
        </ArticleMeta>
      </BannerContainer>

      <div className="container page">
        <div className="row article-content">
          <div className="col-md-12">
            {loading && (
              <div className="language-toggle-area">
                <span className="language-toggle-loading">{t("common.loading")}</span>
              </div>
            )}
            {body && !loading && (
              <Markdown options={{ forceBlock: true }}>{body}</Markdown>
            )}
            {readingInfo && (
              <div className="reading-time-area">
                <span className="reading-time-info">
                  {readingInfo.charCount} {t("article.characters")} · {readingInfo.readingTime}
                </span>
              </div>
            )}
            <ArticleTags tagList={tagList} />
          </div>
        </div>

        {hasEnVersion && (
          <div className="language-toggle-area">
            <button
              className="btn btn-sm btn-outline-primary language-toggle-btn"
              onClick={toggleLanguage}
              disabled={loading}
            >
              {currentLang === "zh" ? t("article.english_version") : t("article.chinese_version")}
            </button>
          </div>
        )}

        <div className="article-language-area">
          <ArticleLanguage language={currentLang} />
        </div>

        <hr />

        <div className="article-actions">
          <ArticleMeta author={author} createdAt={createdAt}>
            <ArticlesButtons article={article} setArticle={setArticle} />
          </ArticleMeta>
        </div>

        <Outlet />
      </div>
    </div>
  );
}

export default Article;
