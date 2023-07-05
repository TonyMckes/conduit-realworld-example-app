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
            })
        })
    }
}

export const articleAPI = new ArticleAPI()
