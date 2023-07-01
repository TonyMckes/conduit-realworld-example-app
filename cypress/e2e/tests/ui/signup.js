import { signup } from "../../pages"

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
})
