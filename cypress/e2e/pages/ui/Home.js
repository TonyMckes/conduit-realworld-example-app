import { header } from '../index'

class Home {
  urlHome = '/#/'
  tabYourFeed = '.home-page .nav li:nth-child(1) button'
  tabGlobalFeed = '.home-page .nav li:nth-child(2) button'
  tabTag = '.home-page .nav li:nth-child(3) button'
  articleListItem = '.article-preview'
  noArticlesMessageT = 'Articles not available.'
  tagButton = '.sidebar .tag-list button'

  verifyHomeUrl() {
    cy.url().should('include', this.urlHome)
  }

  verifyNoArticleMessages = () => {
    cy.get(this.articleListItem).should('contain.text', this.noArticlesMessageT)
  }

  verifyTabIsActive = (tabLocator) => {
    cy.get(tabLocator).should('have.class', 'active')
  }

  clickArticlesTab = (tabLocator) => {
    cy.get(tabLocator).click()
  }

  openHomeArticlesTab = (tabLocator) => {
    this.clickArticlesTab(tabLocator)
    this.verifyTabIsActive(tabLocator)
  }

  openHomePage = () => {
    header.clickHomeItem()
    this.verifyHomeUrl()
  }
}

export const home = new Home()
