/// <reference types="cypress" />

// Auth token key used by the application
const AUTH_TOKEN_KEY = "team_finder_auth";

// Custom command to simulate login by setting auth token
Cypress.Commands.add("login", (token?: string) => {
  const authToken = token ?? "mock-auth-token-for-testing";
  window.localStorage.setItem(AUTH_TOKEN_KEY, authToken);
});

// Custom command to log out by clearing auth token
Cypress.Commands.add("logout", () => {
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
});

// Custom command to set up common API mocks
Cypress.Commands.add("mockApi", () => {
  // Mock userinfo endpoint - logged out by default
  cy.intercept("GET", "**/userinfo", {
    statusCode: 401,
    body: { error: "Unauthorized" },
  }).as("getUserInfo");

  // Mock posts endpoint with fixture data
  cy.intercept("GET", "**/posts?*", { fixture: "posts.json" }).as("getPosts");

  // Mock favourites endpoint
  cy.intercept("GET", "**/posts/favourites?*", { fixture: "posts.json" }).as(
    "getFavourites"
  );

  // Mock single post endpoint
  cy.intercept("GET", "**/posts/*", { fixture: "posts.json" }).as("getPost");
});

// Custom command to mock API with authenticated user
Cypress.Commands.add("mockApiAuthenticated", () => {
  cy.mockApi();

  // Override userinfo to return authenticated user
  cy.intercept("GET", "**/userinfo", { fixture: "user.json" }).as("getUserInfo");
});

// Custom command to navigate to jam home page
Cypress.Commands.add("visitHome", (jamId?: string) => {
  const id = jamId ?? "gmtk";
  cy.visit(`/${id}`);
});

// Custom command to fill the post form
Cypress.Commands.add("fillPostForm", (data) => {
  if (data.description) {
    cy.get('textarea[name="description"]').clear().type(data.description);
  }

  if (data.itchAccountIds) {
    cy.get('input[name="itchAccountIds"]').clear().type(data.itchAccountIds);
  }

  // Multi-select fields use react-select
  if (data.skillsPossessed) {
    data.skillsPossessed.forEach((skill) => {
      cy.selectOption('[name="skillsPossessed"]', skill);
    });
  }

  if (data.skillsSought) {
    data.skillsSought.forEach((skill) => {
      cy.selectOption('[name="skillsSought"]', skill);
    });
  }

  if (data.languages) {
    data.languages.forEach((lang) => {
      cy.selectOption('[name="languages"]', lang);
    });
  }

  if (data.preferredTools) {
    data.preferredTools.forEach((tool) => {
      cy.selectOption('[name="preferredTools"]', tool);
    });
  }

  if (data.timezoneOffsets) {
    data.timezoneOffsets.forEach((tz) => {
      cy.selectOption('[name="timezoneOffsets"]', tz);
    });
  }

  if (data.size) {
    cy.selectOption('[name="size"]', data.size.toString());
  }
});

// Custom command to select an option in react-select
Cypress.Commands.add(
  "selectOption",
  (selector: string, value: string) => {
    cy.get(selector)
      .closest(".c-dropdown")
      .find('[class*="-control"]')
      .click();
    cy.get('[class*="-menu"]').contains(value).click();
  }
);

// Custom command to wait for page load with posts
Cypress.Commands.add("waitForPosts", () => {
  cy.wait("@getPosts");
  cy.get("#posts-wrapper").should("exist");
});
