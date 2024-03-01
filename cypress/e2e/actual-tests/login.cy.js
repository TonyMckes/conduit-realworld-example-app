/// <reference types="cypress" />
describe('Log in', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/#/')
    })
    it('attempt log in', () => {
        cy.get('.nav-item').contains('Login').click()

        const email = 'bonbon2@mail.com';
        const password = 'passbow';

        cy.contains('Sign in')

        cy.get('input[name="email"]').type(email)
        cy.get('input[name="password"]').type(password)

        cy.contains("button", "Login").click()
        cy.contains('Your Feed')
    })
})