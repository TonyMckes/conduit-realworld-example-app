import { header } from "../index"

class Login {
    loginUrl = '/#/login'
    titleLocator = '.auth-page h1'
    titleText = 'Sign in'
    emailLocator = '.auth-page input[name=email]'
    passwordLocator = '.auth-page input[name=password]'
    loginButtonLocator = '.auth-page button'

    openLoginPage() {
        cy.get(header.loginLocator).click()
        cy.url().should('include', this.loginUrl)
    }

    checkLoginTitle() {
        cy.get(this.titleLocator).should('have.text', this.titleText)
    }

    loginUser(name, email, password) {
        cy.get(this.emailLocator).type(email)
        cy.get(this.passwordLocator).type(password)
        cy.get(this.loginButtonLocator).click()
        cy.get(header.userDropdownLocator).should('contain.text', name)
    }

    logoutUser() {
        cy.get(header.userDropdownLocator).click()
        cy.get(header.logoutLocator).click()
        cy.get(header.loginLocator).should('be.visible')
    }
}

export const login = new Login()
