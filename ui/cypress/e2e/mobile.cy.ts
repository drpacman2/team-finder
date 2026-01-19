describe("Mobile Responsiveness", () => {
  const mobileViewport = { width: 375, height: 667 }; // iPhone SE
  const tabletViewport = { width: 768, height: 1024 }; // iPad

  beforeEach(() => {
    cy.mockApi();
  });

  describe("Mobile Layout", () => {
    beforeEach(() => {
      cy.viewport(mobileViewport.width, mobileViewport.height);
    });

    it("header displays correctly on mobile", () => {
      cy.visitHome();
      cy.get(".c-header").should("be.visible");
    });

    it("logo is visible on mobile", () => {
      cy.visitHome();
      cy.get(".c-header").find("img").should("be.visible");
    });

    it("post tiles display correctly on mobile", () => {
      cy.visitHome();
      cy.waitForPosts();

      cy.get(".c-post-tiles").should("be.visible");
      cy.get(".c-post-tiles").children().should("have.length.greaterThan", 0);
    });

    it("pagination shows simplified view on mobile", () => {
      cy.visitHome();
      cy.waitForPosts();

      // Mobile should show page number text instead of full buttons
      cy.contains(/Page \d/).should("be.visible");
    });
  });

  describe("Mobile Navigation", () => {
    beforeEach(() => {
      cy.viewport(mobileViewport.width, mobileViewport.height);
    });

    it("mobile header buttons are accessible", () => {
      cy.visitHome();

      // Login button should be visible
      cy.get("#login-button").should("be.visible");

      // Bookmark toggle should be visible
      cy.get("#toggle-bookmark-button").should("be.visible");
    });

    it("can navigate to create post on mobile", () => {
      cy.login();
      cy.mockApiAuthenticated();
      cy.intercept("GET", "**/my-post*", {
        statusCode: 404,
        body: { error: "Not found" },
      }).as("getMyPost");

      cy.visitHome();
      cy.wait("@getUserInfo");

      // Find and click create post link
      cy.contains(/create|edit/i).click();

      cy.url().should("include", "/my-post");
    });
  });

  describe("Mobile Search Form", () => {
    beforeEach(() => {
      cy.viewport(mobileViewport.width, mobileViewport.height);
    });

    it("search form is usable on mobile", () => {
      cy.visitHome();
      cy.waitForPosts();

      // Search input should be accessible
      cy.get('input[type="search"], input[placeholder*="earch"]').should("exist");
    });

    it("filter dropdowns work on mobile", () => {
      cy.visitHome();
      cy.waitForPosts();

      // Skills filter should be usable
      cy.get('[class*="-control"]').first().should("exist");
    });
  });

  describe("Mobile Post Detail", () => {
    beforeEach(() => {
      cy.viewport(mobileViewport.width, mobileViewport.height);
      cy.intercept("GET", "**/posts/post-1*", { fixture: "single-post.json" }).as(
        "getSinglePost"
      );
    });

    it("post detail page displays correctly on mobile", () => {
      cy.visit("/gmtk/post-1");
      cy.wait("@getSinglePost");

      cy.get(".c-post").should("be.visible");
      cy.contains("TestUser1").should("be.visible");
    });

    it("back navigation works on mobile", () => {
      cy.visitHome();
      cy.waitForPosts();

      cy.get(".c-post-tiles").children().first().click();
      cy.wait("@getSinglePost");

      cy.contains("Back").click();
      cy.url().should("include", "/gmtk");
    });
  });

  describe("Mobile Forms", () => {
    beforeEach(() => {
      cy.viewport(mobileViewport.width, mobileViewport.height);
      cy.login();
      cy.mockApiAuthenticated();
      cy.intercept("GET", "**/my-post*", {
        statusCode: 404,
        body: { error: "Not found" },
      }).as("getMyPost");
    });

    it("post form is usable on mobile viewport", () => {
      cy.visit("/gmtk/my-post");
      cy.wait("@getUserInfo");

      // Form fields should be visible and interactive
      cy.get('textarea[name="description"]').should("be.visible");
      cy.get('input[name="itchAccountIds"]').should("be.visible");

      // Can type in fields
      cy.get('textarea[name="description"]').type("Mobile test");
      cy.get('textarea[name="description"]').should("contain.value", "Mobile test");
    });

    it("submit button is accessible on mobile", () => {
      cy.visit("/gmtk/my-post");
      cy.wait("@getUserInfo");

      cy.contains("button", "Create Post").should("be.visible");
    });

    it("dropdowns work on mobile", () => {
      cy.visit("/gmtk/my-post");
      cy.wait("@getUserInfo");

      // Click a dropdown
      cy.contains("label", /skills.*have/i)
        .parent()
        .find('[class*="-control"]')
        .click();

      // Menu should appear
      cy.get('[class*="-menu"]').should("be.visible");
    });
  });

  describe("Tablet Layout", () => {
    beforeEach(() => {
      cy.viewport(tabletViewport.width, tabletViewport.height);
    });

    it("displays correctly on tablet", () => {
      cy.visitHome();
      cy.waitForPosts();

      cy.get(".c-header").should("be.visible");
      cy.get(".c-post-tiles").should("be.visible");
    });

    it("navigation elements visible on tablet", () => {
      cy.visitHome();

      cy.get("#login-button").should("be.visible");
      cy.contains("About").should("be.visible");
    });
  });

  describe("Touch Interactions", () => {
    beforeEach(() => {
      cy.viewport(mobileViewport.width, mobileViewport.height);
    });

    it("post tiles are tappable", () => {
      cy.intercept("GET", "**/posts/post-1*", { fixture: "single-post.json" }).as(
        "getSinglePost"
      );

      cy.visitHome();
      cy.waitForPosts();

      // Tap on first post tile
      cy.get(".c-post-tiles").children().first().click();

      cy.url().should("match", /\/gmtk\/post-/);
    });

    it("buttons respond to touch", () => {
      cy.visitHome();

      cy.get("#login-button").click();
      // Button should be clickable (actual OAuth redirect won't happen in test)
    });

    it("scroll works on post list", () => {
      cy.visitHome();
      cy.waitForPosts();

      // Scroll down
      cy.get("#posts-wrapper").scrollTo("bottom");
    });
  });
});
