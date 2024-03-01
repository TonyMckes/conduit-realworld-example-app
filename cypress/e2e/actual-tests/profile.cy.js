/// <reference types="cypress" />

const user = {
    user: {
      username: "bonbon123",
      password: "passbow",
      email: 'bonbon2@mail.com',
    },
  };

describe('Checking profile info', () => {
    before(() => {
        cy.visit('http://localhost:3000/#/')

        cy.request("GET", "http://localhost:3001/api/testing/reset/");
        cy.request("POST", "http://localhost:3001/api/users/", user);
    })
    beforeEach(() => {

        cy.visit("http://localhost:3000/");
        // Log in before each test
        cy.get(".nav-item").contains("Login").click();
  
        const email = user.user.email;
        const password = user.user.password;
  
        cy.contains("Sign in");
  
        cy.get('input[name="email"]').type(email);
        cy.get('input[name="password"]').type(password);
  
        cy.contains("button", "Login").click();
        cy.contains("Your Feed");
    })

    it('Allows the user to change their profile info and pfp', () => {
            
            cy.get('.nav-item').contains('bonbon123').click();
            cy.get('.nav-item').contains('Profile').click();
            cy.get('.btn').contains('Edit Profile Settings').click();
            cy.get('input[name="image"]').type('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQy9GPGrkRpyaaY8z2FAFk1AiFpxY7wxSq6XAdRr2eEEeKNSlMM4VNyp1tFxbT3k6oEijQ&usqp=CAU');
            cy.get('textarea[name="bio"]').type('Hi! My name is Bonbon!');
            cy.get('button').contains('Update Settings').click();
            cy.get('.nav-item').contains('bonbon123').click();
            cy.get('.nav-item').contains('Profile').click();

            cy.contains('Hi! My name is Bonbon!');
    })
})
