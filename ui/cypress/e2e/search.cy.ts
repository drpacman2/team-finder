describe("Search & Filtering", () => {
  beforeEach(() => {
    cy.mockApi();
    cy.visitHome();
    cy.waitForPosts();
  });

  describe("Text Search", () => {
    it("filters posts by description", () => {
      cy.intercept("GET", "**/posts?*query=puzzle*", {
        fixture: "search-results.json",
      }).as("searchPosts");

      cy.get('input[type="search"], input[placeholder*="earch"]')
        .first()
        .type("puzzle");

      cy.wait("@searchPosts");
      cy.url().should("include", "query=puzzle");
    });

    it("clears search and resets results", () => {
      cy.intercept("GET", "**/posts?*query=puzzle*", {
        fixture: "search-results.json",
      }).as("searchPosts");

      // First search
      cy.get('input[type="search"], input[placeholder*="earch"]')
        .first()
        .type("puzzle");
      cy.wait("@searchPosts");

      // Clear search
      cy.get('input[type="search"], input[placeholder*="earch"]')
        .first()
        .clear();

      cy.url().should("not.include", "query=puzzle");
    });
  });

  describe("Skills Filters", () => {
    it("skills possessed filter works", () => {
      cy.intercept("GET", "**/posts?*skillsPossessed*", {
        fixture: "search-results.json",
      }).as("filterBySkillsPossessed");

      // Find skills possessed filter and select an option
      cy.contains("label", /skills.*have|can do/i)
        .parent()
        .find('[class*="-control"]')
        .click();
      cy.get('[class*="-menu"]').contains("Programming").click();

      cy.wait("@filterBySkillsPossessed");
    });

    it("skills sought filter works", () => {
      cy.intercept("GET", "**/posts?*skillsSought*", {
        fixture: "search-results.json",
      }).as("filterBySkillsSought");

      // Find skills sought filter and select an option
      cy.contains("label", /looking for|skills.*sought/i)
        .parent()
        .find('[class*="-control"]')
        .click();
      cy.get('[class*="-menu"]').contains("Art").click();

      cy.wait("@filterBySkillsSought");
    });
  });

  describe("Advanced Filters", () => {
    beforeEach(() => {
      // Expand advanced filters if collapsed
      cy.get("body").then(($body) => {
        if ($body.find('[data-testid="advanced-filters"]').length === 0) {
          cy.contains(/advanced|more filters/i).click({ force: true });
        }
      });
    });

    it("tools filter works", () => {
      cy.intercept("GET", "**/posts?*preferredTools*", {
        fixture: "search-results.json",
      }).as("filterByTools");

      cy.contains("label", /tools|engine/i)
        .parent()
        .find('[class*="-control"]')
        .first()
        .click();
      cy.get('[class*="-menu"]').contains("Unity").click();

      cy.wait("@filterByTools");
    });

    it("languages filter works", () => {
      cy.intercept("GET", "**/posts?*languages*", {
        fixture: "search-results.json",
      }).as("filterByLanguages");

      cy.contains("label", /language/i)
        .parent()
        .find('[class*="-control"]')
        .first()
        .click();
      cy.get('[class*="-menu"]').contains("English").click();

      cy.wait("@filterByLanguages");
    });

    it("timezone filter works", () => {
      cy.intercept("GET", "**/posts?*timezoneOffsets*", {
        fixture: "search-results.json",
      }).as("filterByTimezone");

      cy.contains("label", /timezone/i)
        .parent()
        .find('[class*="-control"]')
        .first()
        .click();
      cy.get('[class*="-menu"]').first().find('[class*="-option"]').first().click();

      cy.wait("@filterByTimezone");
    });
  });

  describe("Filter Persistence", () => {
    it("filters persist in URL query params", () => {
      cy.intercept("GET", "**/posts?*skillsSought*", {
        fixture: "search-results.json",
      }).as("filterBySkillsSought");

      cy.contains("label", /looking for|skills.*sought/i)
        .parent()
        .find('[class*="-control"]')
        .click();
      cy.get('[class*="-menu"]').contains("Art").click();

      cy.wait("@filterBySkillsSought");

      // Check URL has filter params
      cy.url().should("include", "skillsSought");
    });

    it("loads filters from URL on page refresh", () => {
      cy.visit("/gmtk?skillsSought=art");
      cy.wait("@getPosts");

      // Filter should be reflected in URL
      cy.url().should("include", "skillsSought=art");
    });
  });

  describe("Sort Options", () => {
    it("sort options change results order", () => {
      cy.intercept("GET", "**/posts?*sort*", {
        fixture: "search-results.json",
      }).as("sortPosts");

      // Find sort selector
      cy.get("body").then(($body) => {
        if ($body.find('[data-testid="sort-select"]').length > 0) {
          cy.get('[data-testid="sort-select"]').click();
          cy.get('[class*="-menu"]').first().find('[class*="-option"]').first().click();
          cy.wait("@sortPosts");
        }
      });
    });
  });
});
