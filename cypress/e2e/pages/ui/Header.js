import { profile } from "../index"

class Header {
    signUpLocator = '.navbar a[href$="register"]'
    loginLocator = '.navbar a[href$="login"]'
    userDropdownLocator = '.navbar .dropdown'
    logoutLocator = '.dropdown-menu a[href$="#/"]'
    newArticleLocator = '.navbar a[href$="editor"]'
    profileLocator = '.dropdown-menu a[href*="#/profile"]'

    openProfilePage(name) {
        cy.get(this.userDropdownLocator).click()
        cy.get(this.profileLocator).click()
        cy.url().should('include', profile.profileUrl)
        profile.checkProfileTitle(name)
    }
}

export const header = new Header()
