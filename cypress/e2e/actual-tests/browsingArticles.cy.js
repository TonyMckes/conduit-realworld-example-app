/// <reference types="cypress" />

const user = {
  user: {
    username: "tester22",
    password: "password123",
    email: "tester22@testers.com",
  },
};

const user2 = {
  user: {
    username: "tester1",
    password: "password321",
    email: "tester1@testers.com",
  },
};

describe("Conduit testing", () => {
  before(() => {
    let token = "";
    // Clears the database and creates a new user
    cy.request("GET", "http://localhost:3001/api/testing/reset/");
    cy.request("POST", "http://localhost:3001/api/users/", user);

    //Creates another user and posts a blog for that user
    cy.request("POST", "http://localhost:3001/api/users/", user2).then(
      (response) => {
        console.log(response);
        token = response.body.user.token;
        console.log(token);
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
      }
    );
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

    it("Should display articles in the feed", () => {
      cy.contains("Global Feed").click();
      cy.contains("Read more...");
    });

    it("Allows setting blogs as favorite", () => {
      cy.contains("Global Feed").click();
      cy.contains("Read more...").click();

      cy.contains("Favorite").click(); // Favorite a blog

      // Go to own profile
      cy.contains(user.user.username).click();
      cy.contains("Profile").click();
      cy.contains("Favorited Articles").click();

      // Assert that a favorited article is found
      cy.get(".article-preview").should("exist");
    });

    it("Allows following authors", () => {
      cy.contains("Global Feed").click();
      cy.contains("Read more...").click();

      cy.contains("Follow").click(); // Follow an author

      cy.get("button").should("contain", "Unfollow");

      cy.contains("Home").click();

      cy.get(".article-preview").should("exist");
    });
  });
});
