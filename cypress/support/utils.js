import { faker } from '@faker-js/faker'
import {common, loginAPI} from "../e2e/pages";
import {email, password} from "../fixtures/api/userApi.json";

export const setUpSeed = () => {
    cy.exec('npx -w backend sequelize-cli db:seed:undo:all')
        .its('code').should('eq', 0)
    cy.exec('npx -w backend sequelize-cli db:seed:all')
        .its('code').should('eq', 0)
}

export const getUniqueUserName = () => {
    const date = new Date()
    return `${date.getFullYear()}${date.getMonth() + 1}
    ${date.getDate()}-${date.getHours()}
    ${date.getMinutes()}${date.getSeconds()}-${date.getMilliseconds()}`
}

export const parsedArticleUrl = (title) => title.replace(/\s/g, '-')

export const getArticleObj = () => {
    return {
        title: faker.word.noun(),
        description: faker.lorem.sentence(),
        text: faker.lorem.paragraph(),
        tags: [
            faker.word.adjective(),
            faker.word.adjective(),
            faker.word.adjective()
            ]
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
