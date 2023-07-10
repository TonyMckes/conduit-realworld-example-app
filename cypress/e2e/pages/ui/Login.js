import { header, home } from '../index'

class Login {
  urlLogin = '/#/login'
  titleLocator = '.auth-page h1'
  titleText = 'Sign in'
  inputEmailLocator = '.auth-page input[name=email]'
  inputPasswordLocator = '.auth-page input[name=password]'
  loginButtonLocator = '.auth-page button'
  errorAuthMessageLocator = '.auth-page .error-messages li'
  errorAuthMessageText = 'Email not found sign in first'
  linkNeedAnAccountLocator = '.auth-page a[href$="/register"]'

  verifyLoginUrl() {
    cy.url().should('include', this.urlLogin)
  }

  verifyLoginTitle() {
    cy.get(this.titleLocator).should('have.text', this.titleText)
  }

  verifyErrorAuthMessage() {
    cy.get(this.errorAuthMessageLocator).should('have.text', this.errorAuthMessageText)
  }

  verifyLoginPageIsOpened() {
    this.verifyLoginUrl()
    this.verifyLoginTitle()
  }

  inputUserEmail(email) {
    cy.get(this.inputEmailLocator).type(email)
  }

  inputUserPassword(password) {
    cy.get(this.inputPasswordLocator).type(password)
  }

  clickLoginButton() {
    cy.get(this.loginButtonLocator).click()
  }

  clickNeedAnAccount() {
    cy.get(this.linkNeedAnAccountLocator).click()
  }

  openLoginPage() {
    header.clickLoginItem()
    this.verifyLoginPageIsOpened()
  }

  fillLoginFormAndSubmit(name, email, password) {
    this.inputUserEmail(email)
    this.inputUserPassword(password)
    this.clickLoginButton()
  }

  loginUser(name, email, password) {
    this.fillLoginFormAndSubmit(name, email, password)
    home.verifyHomeUrl()
    header.verifyUserNameIsDisplayed(name, true)
  }

  logoutUser(userName) {
    header.clickUserDropdownMenu()
    header.clickUserDropdownMenuLogoutItem()
    header.verifyUserNameIsDisplayed(userName, false)
  }
}

export const login = new Login()
