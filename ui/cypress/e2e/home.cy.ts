describe("Home Page", () => {
  beforeEach(() => {
    cy.mockApi();
  });

  describe("Post Display", () => {
    it("displays post tiles with correct content", () => {
      cy.visitHome();
      cy.waitForPosts();

      cy.get(".c-post-tiles").should("exist");
      cy.get(".c-post-tiles").children().should("have.length.greaterThan", 0);

      // Check first post has expected content
      cy.get(".c-post-tiles")
        .children()
        .first()
        .within(() => {
          cy.contains("TestUser1").should("exist");
        });
    });

    it("shows loading state", () => {
      cy.intercept("GET", "**/posts?*", {
        delay: 2000,
        fixture: "posts.json",
      }).as("getPostsDelayed");

      cy.visitHome();
      cy.contains("Loading, please wait...").should("be.visible");
    });

    it("shows empty state when no posts", () => {
      cy.intercept("GET", "**/posts?*", { fixture: "empty-posts.json" }).as(
        "getEmptyPosts"
      );

      cy.visitHome();
      cy.wait("@getEmptyPosts");
      cy.contains("No posts available.").should("be.visible");
    });
  });

  describe("Pagination", () => {
    it("shows pagination controls", () => {
      cy.visitHome();
      cy.waitForPosts();

      // Check pagination buttons exist
      cy.contains("button", /Page \d/).should("exist");
    });

    it("navigates between pages", () => {
      cy.visitHome();
      cy.waitForPosts();

      // Click next page button
      cy.contains("button", "Page 2").click();

      // URL should update with page parameter
      cy.url().should("include", "page=2");
    });

    it("disables previous button on first page", () => {
      cy.visitHome();
      cy.waitForPosts();

      // Previous button should be disabled on page 1
      cy.get("button").contains("Page 1").should("be.disabled");
    });
  });

  describe("Header", () => {
    it("displays header correctly", () => {
      cy.visitHome();
      cy.get(".c-header").should("exist");
    });

    it("shows login button when logged out", () => {
      cy.visitHome();
      cy.get("#login-button").should("exist").and("contain", "Login");
    });

    it("shows About link", () => {
      cy.visitHome();
      cy.contains("About").should("exist");
    });

    it("logo links to home", () => {
      cy.visitHome();
      cy.get(".c-header").find('a[href="/gmtk"]').should("exist");
    });
  });

  describe("Navigation", () => {
    it("navigates to post detail when clicking a post tile", () => {
      cy.intercept("GET", "**/posts/post-1*", { fixture: "single-post.json" }).as(
        "getSinglePost"
      );

      cy.visitHome();
      cy.waitForPosts();

      cy.get(".c-post-tiles").children().first().click();

      cy.url().should("include", "/gmtk/post-1");
    });
  });
});
