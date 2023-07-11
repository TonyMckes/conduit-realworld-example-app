import { header, home, profile } from '../../pages'
import { parsedArticleUrl } from '../../../support/utils'

class Article {
  newArticleUrl = '/#/editor'
  articleUrl = '/#/article/'
  inputNewArticleTitle = '.editor-page form input[name="title"]'
  inputNewArticleDescription = '.editor-page form input[name="description"]'
  inputNewArticleText = '.editor-page form textarea[name="body"]'
  inputNewArticleTags = '.editor-page form input[name="tags"]'
  buttonNewArticlePublish = '.editor-page form button[type="submit"]'
  buttonNewArticlePublishT = 'Publish Article'
  buttonUpdateArticleT = 'Update Article'
  articleTitle = '.article-page h1'
  articleText = '.article-page .article-content p'
  articleTagsList = '.article-page .tag-list'
  articleListItem = '.article-preview'
  articleListItemLink = '.preview-link'
  buttonDeleteArticle = '.article-actions button i.ion-trash-a'
  buttonEditArticle = '.article-actions button a[href*="/editor/"]'
  buttonArticleLike = '.article-meta button'
  noFavoritesMessageT = `doesn't have favorites`
  noArticlesMessageT = `doesn't have articles`

  verifyNewArticlePageUrl = () => {
    cy.url().should('include', this.newArticleUrl)
  }

  verifyArticleUrl = (title) => {
    const parsedUrl = parsedArticleUrl(title.toLowerCase())
    cy.url().should('include', `${this.articleUrl}${parsedUrl}`)
  }

  verifyArticleTitle = (title) => {
    cy.get(this.articleTitle).should('have.text', title)
  }

  verifyArticleText = (text) => {
    cy.get(this.articleText).should('have.text', text)
  }

  verifyArticleTags = (tags) => {
    cy.get(this.articleTagsList)
      .find('li')
      .each((tag) => {
        const tagText = tag.text()
        expect(tags).to.include(tagText)
      })
  }

  verifyArticleData = (articleData) => {
    this.verifyArticleUrl(articleData.title)
    this.verifyArticleTitle(articleData.title)
    this.verifyArticleText(articleData.text)
    this.verifyArticleTags(articleData.tags)
  }

  verifyShouldArticleExists = (articleTitle, is) => {
    this.openProfilePageMyArticlesTab()
    this.checkIsArticleExists(articleTitle, is)
  }

  verifyErrorArticleCreationMessage = (fieldLocator) => {
    cy.get(fieldLocator).then(($input) => {
      $input[0].addEventListener('invalid', (e) => {
        e.preventDefault()
        e.target.setCustomValidity('Please fill in this field.')
      })
    })
    cy.get(`${fieldLocator}:invalid`).should('have.length', 1)
    this.verifyNewArticlePageUrl()
  }

  verifyNoFavoritesMessage = () => {
    cy.get(this.articleListItem).should('contain.text', this.noFavoritesMessageT)
  }

  verifyNoArticleMessages = () => {
    cy.get(this.articleListItem).should('contain.text', this.noArticlesMessageT)
  }

  inputArticleTitle = (title) => {
    cy.get(this.inputNewArticleTitle).clear().type(title)
  }

  inputArticleDescription = (description) => {
    cy.get(this.inputNewArticleDescription).clear().type(description)
  }

  inputArticleText = (text) => {
    cy.get(this.inputNewArticleText).clear().type(text)
  }

  inputArticleTags = (tags) => {
    cy.get(this.inputNewArticleTags).clear()
    for (const tag of tags) {
      cy.get(this.inputNewArticleTags).type(`${tag},`)
    }
  }

  clickPublishArticleButton = () => {
    cy.get(this.buttonNewArticlePublish).should('have.text', this.buttonNewArticlePublishT).click()
  }

  clickUpdateArticleButton = () => {
    cy.get(this.buttonNewArticlePublish).should('have.text', this.buttonUpdateArticleT).click()
  }

  clickSpecificArticle = (title) => {
    cy.get(this.articleListItemLink).contains(title).click()
  }

  clickDeleteArticleButton = () => {
    cy.get(this.buttonDeleteArticle).click()
  }

  clickEditArticleButton = () => {
    cy.get(this.buttonEditArticle).click()
  }

  clickArticleLikeButton = () => {
    cy.get(this.buttonArticleLike).click({ force: true })
  }

  selectArticleByTitle = (title) => {
    this.clickSpecificArticle(title)
    this.verifyArticleUrl(title)
  }

  openNewArticlePage = () => {
    header.clickNewArticleItem()
    this.verifyNewArticlePageUrl()
  }

  openProfilePageMyArticlesTab = () => {
    profile.openProfilePage()
    profile.verifyTabIsActive(profile.tabMyArticles)
  }

  openArticlesTab = (tabLocator) => {
    profile.clickArticlesTab(tabLocator)
    profile.verifyTabIsActive(tabLocator)
  }

  addNewArticle = (articleData) => {
    this.inputArticleTitle(articleData.title)
    this.inputArticleDescription(articleData.description)
    this.inputArticleText(articleData.text)
    this.inputArticleTags(articleData.tags)
    this.clickPublishArticleButton()
  }

  deleteArticle = (title) => {
    this.selectArticleByTitle(title)
    this.clickDeleteArticleButton()
    cy.on('window:confirm', () => true)
    home.checkTextEmptyArticles()
  }

  editArticle = (currentArticle, newArticle) => {
    this.selectArticleByTitle(currentArticle.title)
    this.clickEditArticleButton()
    this.inputArticleTitle(newArticle.title)
    this.inputArticleDescription(newArticle.description)
    this.inputArticleText(newArticle.text)
    this.clickUpdateArticleButton()
  }

  toggleFavoriteArticle = (title, isAlreadyFavorite) => {
    cy.contains(this.articleListItem, title).within(() => {
      this.checkIsArticleAlreadyFavorite(isAlreadyFavorite)
      this.clickArticleLikeButton()
    })
  }

  checkIsArticleAlreadyFavorite = (isAlreadyFavorite) => {
    const condition = isAlreadyFavorite ? 'have.class' : 'not.have.class'
    cy.get(this.buttonArticleLike).should(condition, 'active')
  }

  checkIsArticleExists = (title, isExists) => {
    cy.log(title)
    cy.log('Article title: ', title)
    if (isExists) {
      cy.get(this.articleListItem).contains(title).should('be.visible')
    } else {
      cy.get('body').then((body) => {
        if (body.find(this.articleListItem).length > 0) {
          cy.get(this.articleListItem).contains(title).should('not.exist')
        }
      })
    }
  }
}

export const article = new Article()
