class Home {
    emptyArticlesTextLocator = '.home-page .feed-toggle + div'
    emptyArticlesText = 'Articles not available.'

    checkEmptyArticlesText() {
        cy.get(this.emptyArticlesTextLocator).should('have.text', this.emptyArticlesText)
    }
}

export const home = new Home()
