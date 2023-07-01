import { header } from "../index"

class Login {
    loginUrl = '/#/login'
    titleLocator = '.auth-page h1'
    titleText = 'Sign in'
    emailLocator = '.auth-page input[name=email]'
    passwordLocator = '.auth-page input[name=password]'
    loginButtonLocator = '.auth-page button'

    openLoginPage() {
        cy.log('OPEN LOGIN PAGE')
        cy.get(header.loginLocator).click()
        cy.url().should('include', this.loginUrl)
    }

    checkLoginTitle() {
        cy.log('CHECK LOGIN TITLE EXISTS')
        cy.get(this.titleLocator).should('have.text', this.titleText)
    }

    loginUser(name, email, password) {
        cy.log('LOGIN USER')
        cy.get(this.emailLocator).type(email)
        cy.get(this.passwordLocator).type(password)
        cy.get(this.loginButtonLocator).click()
        cy.get(header.userDropdownLocator).should('contain.text', name)
    }
}

export const login = new Login()
