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

      //Posts an article for testing
      cy.request({
        method: "POST",
        url: "http://localhost:3001/api/articles/",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: {
          article: {
            title: "Test article title",
            description: "We're testing :)",
            body: "Here's some text",
            tagList: ["tag", "tags"],
          },
        },
      });
    });
  
  
    describe("When logged in", () => {
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
      });

      // Check that the test article got postes
      it("Should display articles in the feed", () => {
        cy.contains("Global Feed").click();
        cy.contains("Read more...");
      });
  
      // Test deleting the test article
      it("Delete article", () => {
        cy.contains("Global Feed").click();
        cy.contains("Test title").click();
        cy.get(".nav-item").contains("Delete Article").click(); // Delete an article
      });
  
      //it("Add a comment", () => {
      //  cy.contains("conduit");
      //});

    });
  });
  