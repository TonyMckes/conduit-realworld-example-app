import { faker } from '@faker-js/faker'
import { article, common, loginAPI } from '../e2e/pages'
import { articleAPI } from '../e2e/pages/api/ArticleAPI'

export const setUpSeed = (seedFiles) => {
  cy.exec(`npx -w backend sequelize-cli db:seed:undo:all`).its('code').should('eq', 0)
  seedFiles.forEach((seedFile) => {
    cy.exec(`npx -w backend sequelize-cli db:seed --seed ${seedFile}`).its('code').should('eq', 0)
  })
}

export const getUniqueUserName = () => {
  const date = new Date()
  return `${date.getFullYear()}${date.getMonth() + 1}
    ${date.getDate()}-${date.getHours()}
    ${date.getMinutes()}${date.getSeconds()}-${date.getMilliseconds()}`
}

export const parsedArticleUrl = (title) => title.replace(/\s/g, '-')

export const getNewArticle = () => {
  return {
    title: faker.word.noun(),
    description: faker.lorem.sentence(),
    text: faker.lorem.paragraph(),
    tags: [faker.word.adjective(), faker.word.adjective(), faker.word.adjective()]
  }
}

export const getArticleFieldActions = () => {
  return {
    title: article.inputArticleTitle,
    description: article.inputArticleDescription,
    text: article.inputArticleText
  }
}

export const getArticleFieldSelectors = () => {
  return {
    title: () => article.inputNewArticleTitle,
    description: () => article.inputNewArticleDescription,
    text: () => article.inputNewArticleText,
    tags: () => article.inputNewArticleTags
  }
}

export const getRandomUser = () => {
  return {
    name: faker.internet.userName(),
    email: faker.internet.email(),
    password: faker.internet.password()
  }
}

export const setItemToLS = (key, value) => {
  cy.window().then((win) => {
    cy.log(JSON.stringify(value))
    win.localStorage.setItem(key, JSON.stringify(value))
  })
}

export const getAuthTokenFromLS = (key) => {
  return cy.window().then((win) => {
    const item = JSON.parse(win.localStorage.getItem(key))
    cy.log(item.headers.Authorization)
    return cy.wrap(item.headers.Authorization)
  })
}

export const loginViaApi = (email, password) => {
  common.openPage('/')
  loginAPI.userLogin(email, password)
  common.reloadPage()
}

export const createArticleViaApi = (articleData) => {
  articleAPI.createArticle(articleData)
  common.reloadPage()
}
