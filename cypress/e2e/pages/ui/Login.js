import { header, home } from "../index"

class Login {
    urlLogin = '/#/login'
    titleLocator = '.auth-page h1'
    titleText = 'Sign in'
    inputEmailLocator = '.auth-page input[name=email]'
    inputPasswordLocator = '.auth-page input[name=password]'
    loginButtonLocator = '.auth-page button'

    openLoginPage() {
        cy.get(header.menuLoginLocator).click()
        cy.url().should('include', this.urlLogin)
    }

    checkLoginTitle() {
        cy.get(this.titleLocator).should('have.text', this.titleText)
    }

    loginUser(name, email, password) {
        cy.get(this.inputEmailLocator).type(email)
        cy.get(this.inputPasswordLocator).type(password)
        cy.get(this.loginButtonLocator).click()
        cy.url().should('include', home.urlHome)
        cy.get(header.menuUserDropdownLocator).should('contain.text', name)
    }

    logoutUser() {
        cy.get(header.menuUserDropdownLocator).click()
        cy.get(header.itemLogoutLocator).click()
        cy.get(header.menuLoginLocator).should('be.visible')
    }
}

export const login = new Login()
