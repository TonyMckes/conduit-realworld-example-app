class Home {
    urlHome = '/#/'
    textEmptyArticlesLocator = '.home-page .feed-toggle + div'
    textEmptyArticles = 'Articles not available.'

    verifyHomeUrl() {
        cy.url().should('include', this.urlHome)
    }

    checkTextEmptyArticles() {
        cy.get(this.textEmptyArticlesLocator).should('have.text', this.textEmptyArticles)
    }
}

export const home = new Home()
