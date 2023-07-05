import { header, home } from "../index"

class Signup {
    urlSignup = '/#/register'
    titleLocator = '.auth-page h1'
    titleText = 'Sign up'
    inputUsernameLocator = '.auth-page input[name=username]'
    inputEmailLocator = '.auth-page input[name=email]'
    inputPasswordLocator = '.auth-page input[name=password]'
    buttonSignupLocator = '.auth-page button'
    linkSignInToYourAccountLocator = '.auth-page a[href$="/login"]'

    verifySignupUrl() {
        cy.url().should('include', this.urlSignup)
    }
    
    verifySignupTitle() {
        cy.get(this.titleLocator).should('have.text', this.titleText)
    }

    verifySignupPageIsOpened() {
        this.verifySignupUrl()
        this.verifySignupTitle()
    }

    inputUserName(name) {
        cy.get(this.inputUsernameLocator).type(name)
    }

    inputUserEmail(email) {
        cy.get(this.inputEmailLocator).type(email)
    }

    inputUserPassword(password) {
        cy.get(this.inputPasswordLocator).type(password)
    }

    clickSignUpButton() {
        cy.get(this.buttonSignupLocator).click()
    }

    clickSignInToYourAccount() {
        cy.get(this.linkSignInToYourAccountLocator).click()
    }

    openSignupPage() {
        header.clickSignupItem()
        this.verifySignupPageIsOpened()
    }

    registerUser(name, email, password) {
        this.inputUserName(name)
        this.inputUserEmail(email)
        this.inputUserPassword(password)
        this.clickSignUpButton()
        home.verifyHomeUrl()
        header.verifyUserNameIsDisplayed(name, true)
    }
}

export const signup = new Signup()
