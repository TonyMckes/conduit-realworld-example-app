class Home {
    urlHome = '/#/'
    textEmptyArticlesLocator = '.home-page .feed-toggle + div'
    textEmptyArticles = 'Articles not available.'

    checkTextEmptyArticles() {
        cy.get(this.textEmptyArticlesLocator).should('have.text', this.textEmptyArticles)
    }
}

export const home = new Home()
