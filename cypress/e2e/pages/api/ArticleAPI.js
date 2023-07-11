import 'cypress-plugin-api'
import { getAuthTokenFromLS } from '../../../support/utils'

class ArticleAPI {
  createArticle(article) {
    getAuthTokenFromLS('loggedUser').then((token) => {
      return cy
        .api({
          method: 'POST',
          url: `http://localhost:3000/api/articles`,
          headers: {
            Authorization: token
          },
          body: {
            article: {
              title: article.title,
              body: article.text,
              description: article.description,
              tagList: article.tags
            }
          }
        })
        .then((response) => {
          expect(response.status).to.equal(201)
          cy.log('ARTICLE TITLE: ', article.title)
        })
    })
  }

  deleteArticle(article) {
    getAuthTokenFromLS('loggedUser').then((token) => {
      return cy
        .api({
          method: 'DELETE',
          url: `http://localhost:3000/api/articles/${article.title}`,
          headers: {
            Authorization: token
          }
        })
        .then((response) => {
          expect(response.status).to.equal(200)
          expect(response.body.message.body[0]).to.equal('Article deleted successfully')
          cy.log('ARTICLE TITLE: ', article.title)
        })
    })
  }

  getArticlesCount(userName) {
    getAuthTokenFromLS('loggedUser').then((token) => {
      return cy
        .api({
          method: 'GET',
          url: `http://localhost:3000/api/articles?author=${userName}`,
          headers: {
            Authorization: token
          }
        })
        .then((response) => {
          expect(response.status).to.equal(200)
          console.log(response.body)
          console.log('ARTICLE COUNTS VALUE - API.GET_ARTICLES', response.body.articlesCount)
          return response.body.articlesCount
        })
    })
  }
}

export const articleAPI = new ArticleAPI()
