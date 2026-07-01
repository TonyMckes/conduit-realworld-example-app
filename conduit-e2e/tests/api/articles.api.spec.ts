// Импортируем: test и expect — как и в auth тесте, берём из наших fixtures,
// а не напрямую из playwright. Это даёт нам готовые `api` и `registeredUser`.
import { test, expect } from '@fixtures/test-options';

// makeArticle генерирует случайные данные для статьи (title, description, body, tags)
// чтобы каждый запуск теста не конфликтовал с предыдущим
import { makeArticle } from '@data/user.factory';

// test.describe — группирует тесты по фиче. Имя 'API: Articles' попадёт в отчёт
// и в наш PROGRESS.md (скрипт update-progress.mjs ищет именно эту строку)
test.describe('API: Articles', () => {
  // ─── Тест 1: создание статьи ────────────────────────────────────────────────
  // Структура каждого теста: Arrange → Act → Assert
  //   Arrange  = подготовь данные
  //   Act      = вызови API
  //   Assert   = проверь результат

  test('authenticated user can create an article', async ({ api, registeredUser }) => {
    // ARRANGE
    // makeArticle() вернёт объект вида:
    // { title: 'Lorem ipsum abc12', description: '...', body: '...', tagList: ['word', 'word'] }
    const data = makeArticle();

    // ACT
    // api.createArticle отправляет POST /api/articles
    // registeredUser.token — JWT-токен пользователя, который создаётся в fixture
    // до того как тест начинается (смотри src/fixtures/test-options.ts)
    const article = await api.createArticle(registeredUser.token, data);

    // ASSERT
    // expect(actual).toBe(expected) — строгое равенство (===)
    expect(article.title).toBe(data.title);
    expect(article.description).toBe(data.description);
    expect(article.body).toBe(data.body);
    // slug генерируется сервером из title, нам достаточно проверить что он есть
    expect(article.slug).toBeTruthy();
  });

  // ─── Тест 2: получение статьи по slug ───────────────────────────────────────

  test('anyone can fetch a published article by slug', async ({
    api,
    registeredUser,
  }) => {
    // ARRANGE: создаём статью чтобы получить реальный slug
    const created = await api.createArticle(registeredUser.token, makeArticle());

    // ACT: GET /api/articles/:slug — публичный эндпоинт, токен не нужен
    const fetched = await api.getArticle(created.slug);

    // ASSERT: должна вернуться та же статья
    expect(fetched.slug).toBe(created.slug);
    expect(fetched.title).toBe(created.title);
  });

  // ─── Тест 3: список статей ───────────────────────────────────────────────────

  test('article list returns articles and total count', async ({ api }) => {
    // ACT: GET /api/articles без параметров
    // деструктуризация — вытаскиваем articles и articlesCount из ответа
    const { articles, articlesCount } = await api.listArticles();

    // ASSERT
    // Array.isArray проверяет что articles — массив, а не null/undefined
    expect(Array.isArray(articles)).toBe(true);
    // toBeGreaterThanOrEqual(0) — число >= 0 (БД может быть пустой)
    expect(articlesCount).toBeGreaterThanOrEqual(0);
  });

  // ─── Тест 4: фильтрация по автору ───────────────────────────────────────────

  test('list can be filtered by author', async ({ api, registeredUser }) => {
    // ARRANGE: публикуем статью от имени нашего пользователя
    await api.createArticle(registeredUser.token, makeArticle());

    // ACT: передаём параметр author — сервер вернёт только его статьи
    // listArticles({ author: 'username' }) → GET /api/articles?author=username
    const { articles } = await api.listArticles({ author: registeredUser.username });

    // ASSERT: хотя бы одна статья, и все они от нужного автора
    expect(articles.length).toBeGreaterThan(0);

    // Итерируем по всем статьям и проверяем каждую
    for (const article of articles) {
      expect(article.author.username).toBe(registeredUser.username);
    }
  });

  // ─── Тест 5: удаление статьи ────────────────────────────────────────────────

  test('author can delete their own article', async ({ api, registeredUser }) => {
    // ARRANGE: создаём статью чтобы было что удалять
    const article = await api.createArticle(registeredUser.token, makeArticle());

    // ACT + ASSERT: если сервер вернёт ошибку — метод сам бросит исключение,
    // тест упадёт. Нет исключения = удаление прошло успешно.
    await api.deleteArticle(registeredUser.token, article.slug);
  });
});




