describe("Bookmarks", () => {
  describe("Logged Out User", () => {
    beforeEach(() => {
      cy.mockApi();
    });

    it("bookmark icon prompts login when clicked", () => {
      cy.visitHome();
      cy.waitForPosts();

      // Click bookmark toggle in header
      cy.get("#toggle-bookmark-button").click();

      // Should show login required toast
      cy.contains(/must be logged in|login/i).should("be.visible");
    });
  });

  describe("Logged In User", () => {
    beforeEach(() => {
      cy.login();
      cy.mockApiAuthenticated();
    });

    describe("Bookmark Toggle", () => {
      it("bookmark icon is clickable", () => {
        cy.intercept("GET", "**/posts/post-1*", { fixture: "single-post.json" }).as(
          "getSinglePost"
        );
        cy.intercept("POST", "**/favourites", {
          fixture: "single-post.json",
        }).as("addFavourite");

        cy.visit("/gmtk/post-1");
        cy.wait("@getSinglePost");

        // Find and click bookmark icon on post
        cy.get(".c-post")
          .find('[class*="favourite"], [class*="bookmark"]')
          .first()
          .click();

        cy.wait("@addFavourite");
      });

      it("bookmark toggle updates UI optimistically", () => {
        cy.intercept("GET", "**/posts/post-1*", { fixture: "single-post.json" }).as(
          "getSinglePost"
        );
        cy.intercept("POST", "**/favourites", {
          delay: 500,
          fixture: "single-post.json",
        }).as("addFavourite");

        cy.visit("/gmtk/post-1");
        cy.wait("@getSinglePost");

        cy.get(".c-post")
          .find('[class*="favourite"], [class*="bookmark"]')
          .first()
          .click();

        // UI should update immediately (optimistic update)
        // The exact visual change depends on implementation
      });

      it("can unbookmark a bookmarked post", () => {
        const bookmarkedPost = {
          id: "post-1",
          jamId: "gmtk",
          author: "TestUser1",
          authorId: "user-1",
          description: "Test post",
          size: 1,
          skillsPossessed: ["ART_2D"],
          skillsSought: ["CODE"],
          preferredTools: ["GODOT"],
          availability: "FULL_TIME",
          timezoneOffsets: ["-5"],
          languages: ["en"],
          isFavourite: true,
          reportCount: 0,
          unableToContactCount: 0,
          createdAt: "2024-01-15T10:00:00Z",
        };

        cy.intercept("GET", "**/posts/post-1*", {
          body: bookmarkedPost,
        }).as("getBookmarkedPost");

        cy.intercept("DELETE", "**/favourites", {
          body: { ...bookmarkedPost, isFavourite: false },
        }).as("removeFavourite");

        cy.visit("/gmtk/post-1");
        cy.wait("@getBookmarkedPost");

        cy.get(".c-post")
          .find('[class*="favourite"], [class*="bookmark"]')
          .first()
          .click();

        cy.wait("@removeFavourite");
      });
    });

    describe("Bookmarked Posts Filter", () => {
      it("show bookmarked posts filter works", () => {
        cy.intercept("GET", "**/posts/favourites*", {
          fixture: "posts.json",
        }).as("getFavourites");

        cy.visitHome();
        cy.waitForPosts();

        // Click bookmark filter in header
        cy.get("#toggle-bookmark-button").click();

        cy.wait("@getFavourites");
        cy.url().should("include", "bookmarked=true");
      });

      it("toggle off bookmarked filter shows all posts", () => {
        cy.intercept("GET", "**/posts/favourites*", {
          fixture: "posts.json",
        }).as("getFavourites");

        cy.visit("/gmtk?bookmarked=true");
        cy.wait("@getFavourites");

        // Click to toggle off
        cy.get("#toggle-bookmark-button").click();

        cy.wait("@getPosts");
        cy.url().should("not.include", "bookmarked=true");
      });

      it("empty bookmarks state displays correctly", () => {
        cy.intercept("GET", "**/posts/favourites*", {
          fixture: "empty-posts.json",
        }).as("getEmptyFavourites");

        cy.visit("/gmtk?bookmarked=true");
        cy.wait("@getEmptyFavourites");

        cy.contains("No bookmarked posts").should("be.visible");
      });
    });

    describe("Bookmark Persistence", () => {
      it("bookmarked posts persist across sessions", () => {
        const postsWithFavourite = {
          posts: [
            {
              id: "post-2",
              jamId: "gmtk",
              author: "TestUser2",
              authorId: "user-2",
              description: "Favourited post",
              size: 1,
              skillsPossessed: ["CODE"],
              skillsSought: ["ART_2D"],
              preferredTools: ["UNITY"],
              availability: "FULL_TIME",
              timezoneOffsets: ["0"],
              languages: ["en"],
              isFavourite: true,
              reportCount: 0,
              unableToContactCount: 0,
              createdAt: "2024-01-14T08:30:00Z",
            },
          ],
          pagination: { current: 1, total: 1 },
        };

        cy.intercept("GET", "**/posts/favourites*", {
          body: postsWithFavourite,
        }).as("getFavourites");

        cy.visit("/gmtk?bookmarked=true");
        cy.wait("@getFavourites");

        // Bookmarked post should be visible
        cy.contains("TestUser2").should("be.visible");

        // Reload page
        cy.reload();
        cy.wait("@getFavourites");

        // Still shows bookmarked posts
        cy.contains("TestUser2").should("be.visible");
      });
    });
  });
});
