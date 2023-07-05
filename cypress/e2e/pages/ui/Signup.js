import { header, home } from "../index"

class Signup {
    urlSignup = '/#/register'
    titleLocator = '.auth-page h1'
    titleText = 'Sign up'
    inputUsernameLocator = '.auth-page input[name=username]'
    inputEmailLocator = '.auth-page input[name=email]'
    inputPasswordLocator = '.auth-page input[name=password]'
    btnSignupLocator = '.auth-page button'

    openSignupPage() {
        cy.get(header.menuSignUpLocator).click()
        cy.url().should('include', this.urlSignup)
    }
    
    checkSignupTitle() {
        cy.get(this.titleLocator).should('have.text', this.titleText)
    }

    registerUser(name, email, password) {
        cy.get(this.inputUsernameLocator).type(name)
        cy.get(this.inputEmailLocator).type(email)
        cy.get(this.inputPasswordLocator).type(password)
        cy.get(this.btnSignupLocator).click()
        cy.url().should('include', home.urlHome)
        cy.get(header.menuUserDropdownLocator).should('contain.text', name)
    }
}

export const signup = new Signup()
