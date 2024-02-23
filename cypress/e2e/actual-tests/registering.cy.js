/// <reference types="cypress" />
describe('Registering to conduit', () => {
    it('navigates to sign up', () => {
        cy.visit('http://localhost:3000/')

        const username = 'bonbon123';
        const password = 'passbow';
        const email = 'bonbon2@mail.com';

        cy.get('.nav-item').contains('Sign up').click()
        cy.contains('Sign up')

        cy.get('input[name="username"]').type(username)
        cy.get('input[name="email"]').type(email)
        cy.get('input[name="password"]').type(password)

        cy.contains("button", "Sign up").click()

        cy.contains('Your Feed')
    })
})