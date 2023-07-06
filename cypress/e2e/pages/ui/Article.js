import {header, home, profile} from "../../pages"
import { parsedArticleUrl } from "../../../support/utils"

class Article {
    newArticleUrl = '/#/editor'
    articleUrl = '/#/article/'
    inputNewArticleTitle = '.editor-page form input[name="title"]'
    inputNewArticleDescription = '.editor-page form input[name="description"]'
    inputNewArticleText = '.editor-page form textarea[name="body"]'
    inputNewArticleTags = '.editor-page form input[name="tags"]'
    buttonNewArticlePublish = '.editor-page form button[type="submit"]'
    articleTitle = '.article-page h1'
    articleText = '.article-page .article-content p'
    articleTagsList = '.article-page .tag-list'
    articleListItem = '.article-preview'
    articleListItemLink = '.preview-link'
    buttonDeleteArticle = '.article-actions button i.ion-trash-a'
    buttonEditArticle = '.article-actions button a[href$="/editor/evil"]'

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

    verifyArticleTags= (tags) => {
        cy.get(this.articleTagsList).find('li').each((tag) => {
            const tagText = tag.text()
            expect(tags).to.include(tagText)
        })
    }

    verifyArticleData = (title, description, text, tags) => {
        this.verifyArticleUrl(title)
        this.verifyArticleTitle(title)
        this.verifyArticleText(text)
        this.verifyArticleTags(tags)
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

    inputArticleTitle = (title) => {
        cy.get(this.inputNewArticleTitle).type(title)
    }

    inputArticleDescription = (description) => {
        cy.get(this.inputNewArticleDescription).type(description)
    }

    inputArticleText = (text) => {
        cy.get(this.inputNewArticleText).type(text)
    }

    inputArticleTags = (tags) => {
        for (const tag of tags) {
            cy.get(this.inputNewArticleTags).type(`${tag},`)
        }
    }

    clickPublishArticleButton = () => {
        cy.get(this.buttonNewArticlePublish).click()
    }

    clickSpecificArticle = (title) => {
        cy.get(this.articleListItemLink).contains(title).click()
    }

    clickDeleteArticleButton = () => {
        cy.get(this.buttonDeleteArticle).click()
    }
    // TODO: need to use to further tests
    clickEditArticleButton = () => {
        cy.get(this.buttonEditArticle).click()
    }

    selectArticleByTitle = (title) => {
        this.clickSpecificArticle(title)
        this.verifyArticleUrl(title)
    }

    openNewArticlePage= () => {
        header.clickNewArticleItem()
        this.verifyNewArticlePageUrl()
    }

    openMyArticlesTab = (name) => {
        profile.openProfilePage(name)
        profile.verifyTabIsActive(profile.tabMyArticles)
    }

    addNewArticle = (title, description, text, tags) => {
        this.inputArticleTitle(title)
        this.inputArticleDescription(description)
        this.inputArticleText(text)
        this.inputArticleTags(tags)
        this.clickPublishArticleButton()
    }

    deleteArticle = (title) => {
        this.selectArticleByTitle(title)
        this.clickDeleteArticleButton()
        cy.on('window:confirm', () => true)
        home.checkTextEmptyArticles()
    }

    checkIsArticleExists= (title, isExists) => {
        cy.log('Article title: ', title)
        if (isExists) {
            cy.get(this.articleListItem)
                .contains(title)
                .should('be.visible')
        } else {
            cy.get('body')
                .then((body) => {
                    if (body.find(this.articleListItem).length > 0) {
                        cy.get(this.articleListItem)
                            .contains(title)
                            .should('not.exist')
                    }
                })
        }
    }

    // editArticle = (title) => {
    //     const parsedUrl = parsedArticleUrl(title.toLowerCase())
    //
    //     cy.get(this.articleListItem).should('have.length', 1)
    // }
}

export const article = new Article()
