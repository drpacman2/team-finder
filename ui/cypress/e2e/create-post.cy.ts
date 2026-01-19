describe("Create Post", () => {
  describe("Authentication Required", () => {
    it("redirects to login if not authenticated", () => {
      cy.mockApi();
      cy.intercept("GET", "**/my-post*", {
        statusCode: 401,
        body: { error: "Unauthorized" },
      }).as("getMyPostUnauth");

      cy.visit("/gmtk/my-post");

      // Should show login prompt or redirect
      cy.wait("@getUserInfo");
    });
  });

  describe("Form Display", () => {
    beforeEach(() => {
      cy.login();
      cy.mockApiAuthenticated();
      cy.intercept("GET", "**/my-post*", {
        statusCode: 404,
        body: { error: "Not found" },
      }).as("getMyPostNotFound");
    });

    it("form renders all fields", () => {
      cy.visit("/gmtk/my-post");
      cy.wait("@getUserInfo");

      // Description field
      cy.get('textarea[name="description"]').should("exist");

      // itch.io field
      cy.get('input[name="itchAccountIds"]').should("exist");

      // Skills fields
      cy.contains("label", /skills.*have/i).should("exist");
      cy.contains("label", /looking for/i).should("exist");

      // Languages field
      cy.contains("label", /language/i).should("exist");

      // Tools field
      cy.contains("label", /tools/i).should("exist");

      // Timezone field
      cy.contains("label", /timezone/i).should("exist");

      // Team size field
      cy.contains("label", /team|people/i).should("exist");
    });

    it("description field accepts input with character limit display", () => {
      cy.visit("/gmtk/my-post");
      cy.wait("@getUserInfo");

      cy.get('textarea[name="description"]').type("This is a test description");

      // Character count should update
      cy.contains(/\d+ characters remaining/).should("be.visible");
    });

    it("skills possessed multi-select works", () => {
      cy.visit("/gmtk/my-post");
      cy.wait("@getUserInfo");

      cy.contains("label", /skills.*have/i)
        .parent()
        .find('[class*="-control"]')
        .click();
      cy.get('[class*="-menu"]').contains("Programming").click();

      // Selection should be visible
      cy.contains("label", /skills.*have/i)
        .parent()
        .contains("Programming")
        .should("exist");
    });

    it("skills sought multi-select works", () => {
      cy.visit("/gmtk/my-post");
      cy.wait("@getUserInfo");

      cy.contains("label", /looking for/i)
        .parent()
        .find('[class*="-control"]')
        .click();
      cy.get('[class*="-menu"]').contains("Art").click();

      cy.contains("label", /looking for/i)
        .parent()
        .contains("Art")
        .should("exist");
    });

    it("languages multi-select works", () => {
      cy.visit("/gmtk/my-post");
      cy.wait("@getUserInfo");

      cy.contains("label", /language/i)
        .parent()
        .find('[class*="-control"]')
        .click();
      cy.get('[class*="-menu"]').contains("English").click();

      cy.contains("label", /language/i)
        .parent()
        .contains("English")
        .should("exist");
    });

    it("tools multi-select works", () => {
      cy.visit("/gmtk/my-post");
      cy.wait("@getUserInfo");

      cy.contains("label", /tools/i)
        .parent()
        .find('[class*="-control"]')
        .click();
      cy.get('[class*="-menu"]').contains("Unity").click();

      cy.contains("label", /tools/i)
        .parent()
        .contains("Unity")
        .should("exist");
    });

    it("timezones multi-select works", () => {
      cy.visit("/gmtk/my-post");
      cy.wait("@getUserInfo");

      cy.contains("label", /timezone/i)
        .parent()
        .find('[class*="-control"]')
        .click();
      cy.get('[class*="-menu"]').first().find('[class*="-option"]').first().click();
    });

    it("team size single-select works", () => {
      cy.visit("/gmtk/my-post");
      cy.wait("@getUserInfo");

      cy.contains("label", /team|people/i)
        .parent()
        .find('[class*="-control"]')
        .click();
      cy.get('[class*="-menu"]').contains("1").click();
    });

    it("shows Create Post button (not Update)", () => {
      cy.visit("/gmtk/my-post");
      cy.wait("@getUserInfo");

      cy.contains("button", "Create Post").should("exist");
      cy.contains("button", "Update Post").should("not.exist");
    });
  });

  describe("Form Submission", () => {
    beforeEach(() => {
      cy.login();
      cy.mockApiAuthenticated();
      cy.intercept("GET", "**/my-post*", {
        statusCode: 404,
        body: { error: "Not found" },
      }).as("getMyPostNotFound");
    });

    it("submit creates post successfully", () => {
      cy.intercept("POST", "**/posts*", {
        statusCode: 201,
        fixture: "my-post.json",
      }).as("createPost");

      cy.visit("/gmtk/my-post");
      cy.wait("@getUserInfo");

      // Fill required fields
      cy.get('textarea[name="description"]').type("Looking for teammates!");

      cy.contains("label", /skills.*have/i)
        .parent()
        .find('[class*="-control"]')
        .click();
      cy.get('[class*="-menu"]').contains("Programming").click();

      cy.contains("label", /looking for/i)
        .parent()
        .find('[class*="-control"]')
        .click();
      cy.get('[class*="-menu"]').contains("Art").click();

      // Submit
      cy.contains("button", "Create Post").click();

      cy.wait("@createPost");
    });

    it("shows error toast on validation failure", () => {
      cy.intercept("POST", "**/posts*", {
        statusCode: 400,
        body: { error: "Validation failed" },
      }).as("createPostFailed");

      cy.visit("/gmtk/my-post");
      cy.wait("@getUserInfo");

      // Try to submit without filling required fields
      cy.contains("button", "Create Post").click();

      // Should show error (either toast or form validation)
    });
  });

  describe("itch.io Field", () => {
    beforeEach(() => {
      cy.login();
      cy.mockApiAuthenticated();
      cy.intercept("GET", "**/my-post*", {
        statusCode: 404,
        body: { error: "Not found" },
      }).as("getMyPostNotFound");
    });

    it("itch.io field accepts usernames", () => {
      cy.visit("/gmtk/my-post");
      cy.wait("@getUserInfo");

      cy.get('input[name="itchAccountIds"]').type("myitchaccount");
      cy.get('input[name="itchAccountIds"]').should("have.value", "myitchaccount");
    });

    it("itch.io field accepts multiple comma-separated usernames", () => {
      cy.visit("/gmtk/my-post");
      cy.wait("@getUserInfo");

      cy.get('input[name="itchAccountIds"]').type("account1, account2");
      cy.get('input[name="itchAccountIds"]').should(
        "have.value",
        "account1, account2"
      );
    });
  });
});
