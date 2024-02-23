/// <reference types="cypress" />
describe('Adding article', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/#/')
        cy.get('.nav-item').contains('Login').click()

        const email = 'bonbon2@mail.com';
        const password = 'passbow';

        cy.get('input[name="email"]').type(email)
        cy.get('input[name="password"]').type(password)

        cy.contains("button", "Login").click()
    })
    it('write article', () => {

        cy.get('.nav-item').contains('New Article').click()
        const title = 'My first article';
        const description = 'And how everything is always hard at the beginning'
        const content = 'In both life and testing, beginnings can often be tear-inducing.'
        const tags = 'beginnings';

        cy.get('input[placeholder="Article Title"]').type(title);
        cy.get('input[name="description"]').type(description);
        cy.get('textarea[name="body"]').type(content);
        cy.get('input[name="tags"').type(tags);

        cy.contains("button", "Publish Article").click()
    })
})