class Profile {
    urlProfile = '/#/profile'
    titleLocator = '.profile-page h4'
    tabMyArticlesLocator = '.articles-toggle ul li:first-child'
    tabFavoriteArticlesLocator = '.articles-toggle ul a[href$="/favorites"]'
    articleListLocator = '.article-list'

    verifyProfileUrl() {
        cy.url().should('include', this.urlProfile)
    }

    checkProfileTitle(name) {
        cy.get(this.titleLocator).should('have.text', name)
    }
}

export const profile = new Profile()
