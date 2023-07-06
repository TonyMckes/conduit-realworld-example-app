import { common, article, loginAPI } from '../../pages'
import { name, email, password } from '../../../fixtures/api/userApi.json'
import { getArticleObj, setUpSeed } from "../../../support/utils"
import { articleAPI } from "../../pages/api/ArticleAPI"

describe('Articles suite', () => {
    before(() => {
        setUpSeed()
    })

    describe('should create a new article with filled mandatory fields', () => {
        const { title, description, text, tags } = getArticleObj()

        beforeEach(() => {
            common.openPage('/')
            loginAPI.userLogin(email, password)
            common.reloadPage()
        })

        it('should create a new article', () => {
            article.openNewArticlePage()
            article.addNewArticle(title,description,text,tags)
            article.verifyArticleData(title, description, text, tags)
        })
    })

    describe('should not create a new article without filled mandatory fields', () => {
        const articleObj = getArticleObj()
        const fieldActions = {
            title: article.inputArticleTitle,
            description: article.inputArticleDescription,
            text: article.inputArticleText
        }
        const fieldSelectors = {
            title: () => article.inputNewArticleTitle,
            description: () => article.inputNewArticleDescription,
            text: () => article.inputNewArticleText,
            tags: () => article.inputNewArticleTags
        }

        beforeEach(() => {
            common.openPage('/')
            loginAPI.userLogin(email, password)
            common.reloadPage()
        })

        Object.keys(fieldActions).forEach((field) => {
            it(`should not create a new article without filled mandatory ${field} field`, () => {
                article.openNewArticlePage()
                Object.keys(fieldActions).forEach((otherField) => {
                    if (otherField !== field) {
                        fieldActions[otherField](articleObj[otherField])
                    }
                })
                article.clickPublishArticleButton()
                article.verifyErrorArticleCreationMessage(fieldSelectors[field]())
            })
        })
    })

    describe('should delete the article and check the result via UI', () => { // the test takes 7 second
        const newArticle = getArticleObj()

        beforeEach(() => {
            common.openPage('/')
            loginAPI.userLogin(email, password)
            common.reloadPage()
            articleAPI.createArticle(newArticle)
            common.reloadPage()
            article.openMyArticlesTab(name)
            article.checkIsArticleExists(newArticle.title, true)
        })

        it('should delete the article and check the result via UI', () => {
            article.deleteArticle(newArticle.title)
            article.openMyArticlesTab(name)
            article.checkIsArticleExists(newArticle.title, false)
        })
    })

    describe('should delete the article and check the result via API', () => { // the test takes 8 second and fails
        const newArticle = getArticleObj()

        beforeEach(() => {
            common.openPage('/')
            loginAPI.userLogin(email, password)
            common.reloadPage()
            articleAPI.createArticle(newArticle)
            common.reloadPage()
        })

        it.only('should delete the article and check the result via API', () => {
            cy.intercept('GET', `**/articles?author=${name}*`).as('getArticles')
            let articlesCount = 0

            article.openMyArticlesTab(name)
            article.checkIsArticleExists(newArticle.title, true)
            cy.wait('@getArticles').then(({response}) => {
                expect(response.statusCode).to.eq(200)
                articlesCount = response.body.articlesCount
                console.log('ARTICLE COUNTS VARIABLE VALUE', articlesCount)
                cy.log('ARTICLE COUNTS VARIABLE VALUE', articlesCount)
            })
            article.deleteArticle(newArticle.title)

            cy.then(() => {
                return articleAPI.getArticlesCount(name)
            }).then(newArticleCount => {
                expect(newArticleCount).to.eq(articlesCount - 1)
            })
        })
    })

    // describe('Should edit article', () => {
    //     const newArticle = getArticleObj()
    //
    //     beforeEach(() => {
    //         common.openPage('/')
    //         loginAPI.userLogin(email, password)
    //         common.reloadPage()
    //         articleAPI.createArticle(newArticle)
    //         common.reloadPage()
    //     })
    //
    //     it.skip('Should delete article', () => {
    //         header.openProfilePage(name)
    //         article.editArticle(newArticle.title)
    //     })
    // })
})
