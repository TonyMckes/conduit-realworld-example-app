import {common, article, loginAPI} from "../../pages"
import { name, email, password } from '../../../fixtures/ui/user.json'
import { title, description, text, tags } from '../../../fixtures/ui/article.json'

describe('Sign up - sign in suite', () => {
    before(() => {
        cy.exec('npx -w backend sequelize-cli db:seed:undo:all')
            .its('code').should('eq', 0)
        cy.exec('npx -w backend sequelize-cli db:seed:all')
            .its('code').should('eq', 0)
        loginAPI.userRegister(name, email, password) // why we need register a new user???
    })

    beforeEach(() => {
        common.openPage('/')
        loginAPI.userLogin(email, password)
        common.reloadPage()
    })

    it.only('Should create article', () => {
        article.openNewArticlePage()
        article.addNewArticle(title,description,text,tags)
    })

    it('Should delete article', () => {

    })

    it('Should edit article', () => {

    })
})
