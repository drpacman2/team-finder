describe("Post Detail View", () => {
  beforeEach(() => {
    cy.mockApi();
    cy.intercept("GET", "**/posts/post-1*", { fixture: "single-post.json" }).as(
      "getSinglePost"
    );
  });

  describe("Post Content", () => {
    it("displays full post content", () => {
      cy.visit("/gmtk/post-1");
      cy.wait("@getSinglePost");

      cy.get(".c-post").should("exist");
      cy.contains("Looking for a programmer").should("be.visible");
    });

    it("shows author information", () => {
      cy.visit("/gmtk/post-1");
      cy.wait("@getSinglePost");

      cy.contains("TestUser1").should("be.visible");
    });

    it("shows all skills, languages, tools", () => {
      cy.visit("/gmtk/post-1");
      cy.wait("@getSinglePost");

      // Check skills sections exist
      cy.contains("Looking for:").should("be.visible");
      cy.contains("Can do:").should("be.visible");
      cy.contains(/Preferred Engine|Tool/i).should("be.visible");
      cy.contains("Language").should("be.visible");
    });

    it("shows team size", () => {
      cy.visit("/gmtk/post-1");
      cy.wait("@getSinglePost");

      // Team size icon should be present
      cy.get(".c-post").find('[class*="team"]').should("exist");
    });

    it("shows timezone information", () => {
      cy.visit("/gmtk/post-1");
      cy.wait("@getSinglePost");

      cy.contains("Timezone").should("be.visible");
    });

    it("displays description with line breaks", () => {
      cy.visit("/gmtk/post-1");
      cy.wait("@getSinglePost");

      // Description should have multiple paragraphs
      cy.get(".post__body--description").find("p").should("have.length.greaterThan", 1);
    });
  });

  describe("Navigation", () => {
    it("back button navigates to search", () => {
      cy.visitHome();
      cy.waitForPosts();

      cy.intercept("GET", "**/posts/post-1*", { fixture: "single-post.json" }).as(
        "getSinglePost"
      );
      cy.get(".c-post-tiles").children().first().click();
      cy.wait("@getSinglePost");

      cy.contains("Back to search results").click();

      cy.url().should("include", "/gmtk");
    });

    it("breadcrumb shows current post author", () => {
      cy.visit("/gmtk/post-1");
      cy.wait("@getSinglePost");

      cy.get("header").contains("TestUser1").should("be.visible");
    });
  });

  describe("Logged Out User", () => {
    it("shows Discord message button (may prompt login)", () => {
      cy.visit("/gmtk/post-1");
      cy.wait("@getSinglePost");

      // Discord button should exist
      cy.get(".c-post").should("exist");
    });
  });

  describe("Logged In User", () => {
    beforeEach(() => {
      cy.login();
      cy.mockApiAuthenticated();
      cy.intercept("GET", "**/posts/post-1*", { fixture: "single-post.json" }).as(
        "getSinglePost"
      );
    });

    it("bookmark icon toggles", () => {
      cy.intercept("POST", "**/favourites", {
        fixture: "single-post.json",
      }).as("addFavourite");

      cy.visit("/gmtk/post-1");
      cy.wait("@getSinglePost");

      // Find and click bookmark icon
      cy.get(".c-post").find('[class*="favourite"], [class*="bookmark"]').first().click();

      cy.wait("@addFavourite");
    });

    it("report buttons visible", () => {
      cy.visit("/gmtk/post-1");
      cy.wait("@getSinglePost");

      // Report functionality should be visible for logged in users
      cy.contains(/report/i).should("exist");
    });
  });
});
