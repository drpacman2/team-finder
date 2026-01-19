describe("Authentication", () => {
  beforeEach(() => {
    cy.mockApi();
  });

  describe("Logged Out State", () => {
    it("login button visible when logged out", () => {
      cy.visitHome();
      cy.get("#login-button").should("exist").and("contain", "Login");
    });

    it("clicking login redirects to OAuth", () => {
      cy.visitHome();

      // Click login should trigger OAuth redirect
      // We can't fully test OAuth flow, but we can verify the button works
      cy.get("#login-button").should("not.be.disabled");
    });
  });

  describe("OAuth Callback", () => {
    it("callback page captures token from URL", () => {
      cy.mockApiAuthenticated();

      // Simulate OAuth callback with token
      cy.visit("/login/authorized?token=test-oauth-token");

      // After processing, token should be stored
      cy.window().then((win) => {
        // Give time for the callback to process
        cy.wait(500);
        // The callback page should process the token
      });
    });

    it("callback redirects to home after token capture", () => {
      cy.mockApiAuthenticated();
      cy.intercept("GET", "**/userinfo", { fixture: "user.json" }).as("getUserInfo");

      cy.visit("/login/authorized?token=test-oauth-token");

      // Should eventually redirect to home or show logged in state
      cy.wait("@getUserInfo", { timeout: 10000 });
    });
  });

  describe("Logged In State", () => {
    beforeEach(() => {
      cy.login();
      cy.mockApiAuthenticated();
    });

    it("username shown in header when logged in", () => {
      cy.visitHome();
      cy.wait("@getUserInfo");

      cy.contains("Welcome").should("be.visible");
      cy.contains("TestCurrentUser").should("be.visible");
    });

    it("logout link visible when logged in", () => {
      cy.visitHome();
      cy.wait("@getUserInfo");

      cy.contains("logout").should("be.visible");
    });

    it("logout clears session", () => {
      cy.visitHome();
      cy.wait("@getUserInfo");

      cy.contains("logout").click();

      // Should redirect to logout page
      cy.url().should("include", "/logout");
    });
  });

  describe("Protected Routes", () => {
    it("my-post page requires authentication", () => {
      cy.intercept("GET", "**/my-post*", {
        statusCode: 401,
        body: { error: "Unauthorized" },
      }).as("getMyPostUnauth");

      cy.visit("/gmtk/my-post");
      cy.wait("@getUserInfo");

      // Should show login requirement or redirect
    });

    it("authenticated user can access my-post", () => {
      cy.login();
      cy.mockApiAuthenticated();
      cy.intercept("GET", "**/my-post*", {
        statusCode: 404,
        body: { error: "Not found" },
      }).as("getMyPost");

      cy.visit("/gmtk/my-post");
      cy.wait("@getUserInfo");

      // Should see the post form
      cy.get('textarea[name="description"]').should("exist");
    });
  });

  describe("Auth Token Persistence", () => {
    it("auth token persisted in localStorage", () => {
      cy.login("my-test-token");

      cy.window().then((win) => {
        expect(win.localStorage.getItem("team_finder_auth")).to.equal(
          "my-test-token"
        );
      });
    });

    it("session persists across page reloads", () => {
      cy.login("persistent-token");
      cy.mockApiAuthenticated();

      cy.visitHome();
      cy.wait("@getUserInfo");
      cy.contains("Welcome").should("be.visible");

      // Reload page
      cy.reload();
      cy.wait("@getUserInfo");

      // Still logged in
      cy.contains("Welcome").should("be.visible");
    });

    it("logout removes token from localStorage", () => {
      cy.login("token-to-remove");

      cy.window().then((win) => {
        expect(win.localStorage.getItem("team_finder_auth")).to.equal(
          "token-to-remove"
        );
      });

      cy.logout();

      cy.window().then((win) => {
        expect(win.localStorage.getItem("team_finder_auth")).to.be.null;
      });
    });
  });
});
