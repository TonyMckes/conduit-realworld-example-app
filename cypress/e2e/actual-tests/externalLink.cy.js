/// <reference types="cypress" />
describe('External link test', () => {
    it('should have a correct href', () => {
        cy.visit('http://localhost:3000');
        cy.get('a.nav-link')
           .should('have.attr', 'href')
           .and('equal', 'https://github.com/TonyMckes/conduit-realworld-example-app') 
    })
})