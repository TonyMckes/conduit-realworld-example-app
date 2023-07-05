import { profile } from "../index"

class Header {
    menuSignUpLocator = '.navbar a[href$="register"]'
    menuLoginLocator = '.navbar a[href$="login"]'
    menuNewArticleLocator = '.navbar a[href$="editor"]'
    menuUserDropdownLocator = '.navbar .dropdown'
    itemProfileLocator = '.dropdown-menu a[href*="#/profile"]'
    itemSettingsLocator = '.dropdown-menu a[href*="#/settings"]'
    itemLogoutLocator = '.dropdown-menu a[href$="#/"]'

    clickSignupItem() {
        cy.get(this.menuSignUpLocator).click()
    }

    clickLoginItem() {
        cy.get(this.menuLoginLocator).click()
    }

    clickUserDropdownMenu() {
        cy.get(this.menuUserDropdownLocator).click()
    }

    clickUserDropdownMenuProfileItem() {
        cy.get(this.itemProfileLocator).click()
    }

    clickUserDropdownMenuLogoutItem() {
        cy.get(this.itemLogoutLocator).click()
    }
    // TODO
    clickUserDropdownMenuSettingsItem() {
        cy.get(this.itemSettingsLocator).click()
    }

    openProfilePage(name) {
        this.clickUserDropdownMenu()
        this.clickUserDropdownMenuProfileItem()
        profile.verifyProfileUrl()
        profile.checkProfileTitle(name)
    }

    verifyUserNameIsDisplayed(name, isDisplayed) {
        if (isDisplayed) {
            cy.get(this.menuUserDropdownLocator).should('contain.text', name)
        } else {
            cy.get(this.menuUserDropdownLocator).should('not.exist')
        }
    }

}

export const header = new Header()
