import { header } from "../index"

class Profile {
    urlProfile = '/#/profile'
    title = '.profile-page h4'
    tabMyArticles = '.articles-toggle ul li:first-child'
    tabFavoriteArticles = '.articles-toggle ul a[href$="/favorites"]'
    articleListLocator = '.article-list'

    verifyProfileUrl() {
        cy.url().should('include', this.urlProfile)
    }

    verifyProfileTitle(name) {
        cy.get(this.title).should('have.text', name)
    }

    verifyTabIsActive(tabLocator) {
        cy.get(tabLocator).find('a').should('have.class', 'active')
    }

    openProfilePage(name) {
        header.clickUserDropdownMenu()
        header.clickUserDropdownMenuProfileItem()
        this.verifyProfileUrl()
        this.verifyProfileTitle(name)
    }
}

export const profile = new Profile()
