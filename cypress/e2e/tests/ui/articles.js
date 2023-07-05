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

        it('Should delete article', () => {
            header.openProfilePage(name)
            article.deleteArticle(newArticle.title)
            home.checkTextEmptyArticles()
        })
    })

    describe('Should edit article', () => {})
})
