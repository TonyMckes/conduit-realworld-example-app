/// <reference types="cypress" />
describe('Navbar content', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/#/')
    })
    it('should load all navbar contents correctly', () => {
        //Check for application's brandname
        cy.get('.navbar').get('.container').get('.navbar-brand').contains('conduit');

        //Check for github icon and text visibility
        cy.get('.navbar').find('i.ion-social-github').should('be.visible');
        cy.get('.navbar').find('.nav-link').contains('Source code');

         //Check for home icon and text visibility
        cy.get('.navbar').find('i.ion-compose').should('be.visible');
        cy.get('.navbar').find('.nav-link').contains('Home');

         //Check for login icon and text visibility
        cy.get('.navbar').find('i.ion-log-in').should('be.visible');
        cy.get('.navbar').find('.nav-link').contains('Login');

         //Check for signup link and text visibility
        cy.get('.navbar').find('.nav-link').contains('Sign up');
    })
})

