import { common, article, loginAPI, header, home } from '../../pages'
import { name, email, password } from '../../../fixtures/api/userApi.json'
import { getArticleObj, setUpSeed } from "../../../support/utils"
import { articleAPI } from "../../pages/api/ArticleAPI"

describe('Sign up - sign in suite', () => {
    before(() => {
        setUpSeed()
    })

    describe('Should create article', () => {
        const { title, description, text, tags } = getArticleObj()

        beforeEach(() => {
            common.openPage('/')
            loginAPI.userLogin(email, password)
            common.reloadPage()
        })

        it('Should create article', () => {
            article.openNewArticlePage()
            article.addNewArticle(title,description,text,tags)
        })
    })

    describe('Should delete article', () => {
        const newArticle = getArticleObj()

        beforeEach(() => {
            common.openPage('/')
            loginAPI.userLogin(email, password)
            common.reloadPage()
            articleAPI.createArticle(newArticle)
            common.reloadPage()
        })

        it.only('Should delete article', () => {
            header.openProfilePage(name)
            article.checkIsArticleExists(newArticle.title, true)
            article.deleteArticle(newArticle.title)
            home.checkTextEmptyArticles()
            header.openProfilePage(name)
            article.checkIsArticleExists(newArticle.title, false)
        })

        it('Should delete article and check article counts', () => {
            cy.intercept('GET', `**/articles?author=${name}*`).as('getArticles')
            let articlesCount = 0

            header.openProfilePage(name)
            article.checkIsArticleExists(newArticle.title, true)
            cy.wait('@getArticles').then(({response}) => {
                expect(response.statusCode).to.eq(200)
                articlesCount = response.body.articlesCount
                cy.log('Article counts variable value', articlesCount)
            })
            article.deleteArticle(newArticle.title)
            header.openProfilePage(name)
            article.checkIsArticleExists(newArticle.title, false)
            //
            // cy.then(() => {
            //     return articleAPI.getArticlesCount(name)
            // }).then(newArticleCount => {
            //     expect(newArticleCount).to.eq(articlesCount - 1)
            // })
            // home.checkTextEmptyArticles()
        })
    })

    describe('Should edit article', () => {
        const newArticle = getArticleObj()

        beforeEach(() => {
            common.openPage('/')
            loginAPI.userLogin(email, password)
            common.reloadPage()
            articleAPI.createArticle(newArticle)
            common.reloadPage()
        })

        it.skip('Should delete article', () => {
            header.openProfilePage(name)
            article.editArticle(newArticle.title)
        })
    })
})
