/// <reference types="cypress" />

const user = {
  user: {
    username: "tester22",
    password: "password123",
    email: "tester22@testers.com",
  },
};

describe("Conduit testing", () => {
  beforeEach(() => {
    // Clears the database and creates a new user
    cy.request("GET", "http://localhost:3001/api/testing/reset/");
    cy.request("POST", "http://localhost:3001/api/users/", user);
    cy.visit("http://localhost:3000");
  });

  it("Test some case when not logged in", () => {
    cy.contains("conduit");
  });

  describe("When logged in", () => {
    beforeEach(() => {
      // Log in before each test
      cy.get(".nav-item").contains("Login").click();

      const email = user.user.email;
      const password = user.user.password;

      cy.contains("Sign in");

      cy.get('input[name="email"]').type(email);
      cy.get('input[name="password"]').type(password);

      cy.contains("button", "Login").click();
      cy.contains("Your Feed");
    });

    it("Test some case", () => {
      cy.contains("conduit");
    });

    it("Test something else", () => {
      cy.contains("conduit");
    });
  });
});
