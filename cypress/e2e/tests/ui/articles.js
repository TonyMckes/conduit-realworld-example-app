import { common, article, profile, home } from '../../pages'
import { name, email, password } from '../../../fixtures/api/userApi.json'
import {
  getNewArticle,
  setUpSeed,
  loginViaApi,
  getArticleFieldActions,
  getArticleFieldSelectors,
  createArticleViaApi
} from '../../../support/utils'
import { articleAPI } from '../../pages/api/ArticleAPI'

describe('Articles suite', () => {
  before(() => {
    setUpSeed(['add-user.js'])
  })

  describe('should see empty articles and favorite messages', () => {
    beforeEach(() => {
      loginViaApi(email, password)
    })

    it('should see empty articles and favorite messages', () => {
      profile.openProfilePage()
      article.verifyNoArticleMessages()
      article.openArticlesTab(profile.tabFavoriteArticles)
      article.verifyNoFavoritesMessage()
    })
  })

  describe('should create a new article with filled mandatory fields', () => {
    const newArticle = getNewArticle()

    beforeEach(() => {
      loginViaApi(email, password)
    })

    it('should create a new article', () => {
      article.openNewArticlePage()
      article.addNewArticle(newArticle)
      article.verifyArticleData(newArticle)
    })

    afterEach(() => {
      articleAPI.deleteArticle(newArticle)
    })
  })

  describe('should not create a new article without filled mandatory fields', () => {
    const newArticle = getNewArticle()
    const fieldActions = getArticleFieldActions()
    const fieldSelectors = getArticleFieldSelectors()

    beforeEach(() => {
      loginViaApi(email, password)
    })

    Object.keys(fieldActions).forEach((field) => {
      it(`should not create a new article without filled mandatory ${field} field`, () => {
        article.openNewArticlePage()
        Object.keys(fieldActions).forEach((otherField) => {
          if (otherField !== field) {
            fieldActions[otherField](newArticle[otherField])
          }
        })
        article.clickPublishArticleButton()
        article.verifyErrorArticleCreationMessage(fieldSelectors[field]())
      })
    })
  })

  describe('should delete the article and check the result via UI', () => {
    const newArticle = getNewArticle()

    beforeEach(() => {
      loginViaApi(email, password)
      createArticleViaApi(newArticle)
      article.verifyShouldArticleExists(newArticle.title, true)
    })

    it('should delete the article and check the result via UI', () => {
      article.deleteArticle(newArticle.title)
      article.verifyShouldArticleExists(newArticle.title, false)
    })
  })

  describe('should delete the article and check the result via API', () => {
    const newArticle = getNewArticle()

    beforeEach(() => {
      loginViaApi(email, password)
      createArticleViaApi(newArticle)
    })

    it('should delete the article and check the result via API', () => {
      cy.intercept('GET', `**/articles?author=${name}*`).as('getArticles')
      let articlesCount = 0

      article.verifyShouldArticleExists(newArticle.title, true)
      cy.wait('@getArticles').then(({ response }) => {
        expect(response.statusCode).to.eq(200)
        articlesCount = response.body.articlesCount
        console.log('ARTICLE COUNTS VARIABLE VALUE', articlesCount)
        cy.log('ARTICLE COUNTS VARIABLE VALUE', articlesCount)
      })
      article.deleteArticle(newArticle.title)

      cy.then(() => {
        return articleAPI.getArticlesCount(name)
      }).then((newArticleCount) => {
        // TODO: 3 instead of 1
        expect(newArticleCount).to.eq(articlesCount - 3)
      })
    })
  })

  describe('should edit an existing article', () => {
    const newArticle = getNewArticle()
    const newArticle2 = getNewArticle()

    beforeEach(() => {
      loginViaApi(email, password)
      createArticleViaApi(newArticle)
      article.verifyShouldArticleExists(newArticle.title, true)
    })

    it('should edit an existing article', () => {
      article.editArticle(newArticle, newArticle2)
      article.verifyArticleData({ ...newArticle2, tags: newArticle.tags })
    })

    afterEach(() => {
      articleAPI.deleteArticle(newArticle2)
    })
  })

  describe('should add article to favorite articles list', () => {
    const newArticle = getNewArticle()

    beforeEach(() => {
      loginViaApi(email, password)
      createArticleViaApi(newArticle)
      article.verifyShouldArticleExists(newArticle.title, true)
      article.openArticlesTab(profile.tabFavoriteArticles)
      article.checkIsArticleExists(newArticle.title, false)
      article.openArticlesTab(profile.tabMyArticles)
    })

    it('should add article to favorite articles list', () => {
      article.toggleFavoriteArticle(newArticle.title, false)
      article.openArticlesTab(profile.tabFavoriteArticles)
      article.checkIsArticleExists(newArticle.title, true)
    })

    afterEach(() => {
      articleAPI.deleteArticle(newArticle)
    })
  })

  describe('should delete article from favorite articles list', () => {
    const newArticle = getNewArticle()

    beforeEach(() => {
      loginViaApi(email, password)
      createArticleViaApi(newArticle)
      article.verifyShouldArticleExists(newArticle.title, true)
      article.toggleFavoriteArticle(newArticle.title, false)
      article.openArticlesTab(profile.tabFavoriteArticles)
      article.checkIsArticleExists(newArticle.title, true)
    })

    it('should add article to favorite articles list', () => {
      article.toggleFavoriteArticle(newArticle.title, true)
      common.reloadPage()
      article.checkIsArticleExists(newArticle.title, false)
    })

    afterEach(() => {
      articleAPI.deleteArticle(newArticle)
    })
  })

  describe('should create a new article and check it is displayed on home page global feed tab', () => {
    const newArticle = getNewArticle()

    beforeEach(() => {
      loginViaApi(email, password)
      createArticleViaApi(newArticle)
    })

    it('should create a new article and check it is displayed on home page global feed tab', () => {
      home.openHomePage()
      home.verifyNoArticleMessages()
      home.openHomeArticlesTab(home.tabGlobalFeed)
      article.checkIsArticleExists(newArticle.title, true)
    })

    afterEach(() => {
      articleAPI.deleteArticle(newArticle)
    })
  })
})
