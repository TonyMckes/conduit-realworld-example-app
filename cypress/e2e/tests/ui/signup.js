import { signup } from "../../pages"
import {login} from "../../pages/ui/Login";

describe('Sign up', () => {

    before(() => {
        cy.exec('npx -w backend sequelize-cli db:seed:undo:all')
            .its('code').should('eq', 0)
        cy.exec('npx -w backend sequelize-cli db:seed:all')
            .its('code').should('eq', 0)
    })

    beforeEach(() => {
        cy.visit('/')
    })

    it('Should do register user', () => {
        signup.openSignupPage()
        signup.checkSignupTitle()
        signup.registerUser('test', 'test@test.com', 'xyzXYZ123_')
    })

    it('Should do login user',  () => {
        login.openLoginPage()
        login.checkLoginTitle()
        login.loginUser('test', 'test@test.com', 'xyzXYZ123_')
    })
})
