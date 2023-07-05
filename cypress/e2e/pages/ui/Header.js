import { profile } from "../index"

class Header {
    menuSignUpLocator = '.navbar a[href$="register"]'
    menuLoginLocator = '.navbar a[href$="login"]'
    menuNewArticleLocator = '.navbar a[href$="editor"]'
    menuUserDropdownLocator = '.navbar .dropdown'
    itemProfileLocator = '.dropdown-menu a[href*="#/profile"]'
    itemLogoutLocator = '.dropdown-menu a[href$="#/"]'

    openProfilePage(name) {
        cy.get(this.menuUserDropdownLocator).click()
        cy.get(this.itemProfileLocator).click()
        cy.url().should('include', profile.urlProfile)
        profile.checkProfileTitle(name)
    }
}

export const header = new Header()
