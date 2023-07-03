import { header } from "../../pages"
import { convertStringToArray, parsedArticleUrl } from "../../../support/utils"

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

    openNewArticlePage() {
        cy.get(header.newArticleLocator).click()
        cy.url().should('include', this.newArticleUrl)
    }

    addNewArticle(title, description, text, tags) {
        const parsedUrl = parsedArticleUrl(title.toLowerCase())
        const arrayFromTags = convertStringToArray(tags)

        cy.get(this.inputNewArticleTitleLoc).type(title)
        cy.get(this.inputNewArticleDescriptionLoc).type(description)
        cy.get(this.inputNewArticleTextLoc).type(text)
        cy.get(this.inputNewArticleTagsLoc).type(tags)
        cy.get(this.btnNewArticlePublishLoc).click()

        cy.url().should('include', `${this.articleUrl}${parsedUrl}`)
        cy.get(this.articleTitleLoc).should('have.text', title)
        cy.get(this.articleTextLoc).should('have.text', text)
        cy.get(`${this.articleTagsListLoc} li`).each((tag) => {
            const tagText = tag.text()
            expect(arrayFromTags).to.include(tagText)
        })
    }
}

export const article = new Article()
