import 'cypress-plugin-api'
import { getAuthTokenFromLS } from "../../../support/utils"

class ArticleAPI {
    createArticle(article) {
        getAuthTokenFromLS('loggedUser').then((token) => {
            return cy.api({
                method: 'POST',
                url: `http://localhost:3000/api/articles`,
                headers: {
                    'Authorization': token
                },
                body: {
                    article: {
                        title: article.title,
                        body: article.text,
                        description: article.description,
                        tagList: article.tags
                    }
                }
            }).then((response) => {
                expect(response.status).to.equal(201)
                cy.log('Article title: ', article.title)
            })
        })
    }

    getArticlesCount(userName) {
        getAuthTokenFromLS('loggedUser').then((token) => {
            return cy.api({
                method: 'GET',
                url: `http://localhost:3000/api/articles?author=${userName}`,
                headers: {
                    'Authorization': token
                }
            }).then((response) => {
                expect(response.status).to.equal(200)
                console.log(response.body)
                return response.body.articlesCount
            })
        })
    }
}

export const articleAPI = new ArticleAPI()
