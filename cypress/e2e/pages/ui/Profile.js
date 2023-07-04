class Profile {
    profileUrl = '/#/profile'
    profileTitleLocator = '.profile-page h4'
    myArticlesTabLocator = '.articles-toggle ul li:first-child'
    favoriteArticlesTabLocator = '.articles-toggle ul a[href$="/favorites"]'
    articleListLocator = '.article-list'

    checkProfileTitle(name) {
        cy.get(this.profileTitleLocator).should('have.text', name)
    }
}

export const profile = new Profile()
