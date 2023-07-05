import { header } from "../../pages"
import { parsedArticleUrl } from "../../../support/utils"

class Article {
    newArticleUrl = '/#/editor'
    articleUrl = '/#/article/'
    inputNewArticleTitleLoc = '.editor-page form input[name="title"]'
    inputNewArticleDescriptionLoc = '.editor-page form input[name="description"]'
    inputNewArticleTextLoc = '.editor-page form textarea[name="body"]'
    inputNewArticleTagsLoc = '.editor-page form input[name="tags"]'
    btnNewArticlePublishLoc = '.editor-page form button[type="submit"]'
    articleTitleLoc = '.article-page h1'
    articleTextLoc = '.article-page .article-content p'
    articleTagsListLoc = '.article-page .tag-list'
    articleListItemLocator = '.article-preview'
    articleListItemLinkLocator = '.preview-link'
    buttonDeleteArticleLocator = '.article-actions button i.ion-trash-a'


    openNewArticlePage() {
        cy.get(header.menuNewArticleLocator).click()
        cy.url().should('include', this.newArticleUrl)
    }

    addNewArticle(title, description, text, tags) {
        const parsedUrl = parsedArticleUrl(title.toLowerCase())

        cy.get(this.inputNewArticleTitleLoc).type(title)
        cy.get(this.inputNewArticleDescriptionLoc).type(description)
        cy.get(this.inputNewArticleTextLoc).type(text)
        for (const tag of tags) {
            cy.get(this.inputNewArticleTagsLoc).type(`${tag},`)
        }
        cy.get(this.btnNewArticlePublishLoc).click()

        cy.url().should('include', `${this.articleUrl}${parsedUrl}`)
        cy.get(this.articleTitleLoc).should('have.text', title)
        cy.get(this.articleTextLoc).should('have.text', text)
        cy.get(`${this.articleTagsListLoc} li`).each((tag) => {
            const tagText = tag.text()
            expect(tags).to.include(tagText)
        })
    }

    deleteArticle(title) {
        const parsedUrl = parsedArticleUrl(title.toLowerCase())

        cy.get(this.articleListItemLocator).should('have.length', 1)
        cy.get(this.articleListItemLinkLocator).contains(title).click()
        cy.url().should('include', `${this.articleUrl}${parsedUrl}`)

        cy.get(this.buttonDeleteArticleLocator).click()
        cy.on('window:confirm', () => true)

    }
}

export const article = new Article()
