import { header } from "../index"

class Signup {
    signupUrl = '/#/register'
    titleLocator = '.auth-page h1'
    titleText = 'Sign up'
    usernameLocator = '.auth-page input[name=username]'
    emailLocator = '.auth-page input[name=email]'
    passwordLocator = '.auth-page input[name=password]'
    signupButtonLocator = '.auth-page button'

    openSignupPage() {
        cy.log('OPEN SIGNUP PAGE')
        cy.get(header.signUpLocator).click()
        cy.url().should('include', this.signupUrl)
    }
    
    checkSignupTitle() {
        cy.log('CHECK SIGNUP TITLE EXISTS')
        cy.get(this.titleLocator).should('have.text', this.titleText)
    }

    registerUser(name, email, password) {
        cy.log('REGISTER NEW USER')
        cy.get(this.usernameLocator).type(name)
        cy.get(this.emailLocator).type(email)
        cy.get(this.passwordLocator).type(password)
        cy.get(this.signupButtonLocator).click()
        cy.get(header.userDropdownLocator).should('contain.text', name)
    }
}

export const signup = new Signup()
