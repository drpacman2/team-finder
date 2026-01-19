/// <reference types="cypress" />

export interface PostFormData {
  description?: string;
  itchAccountIds?: string;
  skillsPossessed?: string[];
  skillsSought?: string[];
  languages?: string[];
  preferredTools?: string[];
  timezoneOffsets?: string[];
  size?: number;
}

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Simulate login by setting auth token in localStorage
       * @param token - Optional auth token (defaults to mock token)
       */
      login(token?: string): Chainable<void>;

      /**
       * Log out by clearing auth token from localStorage
       */
      logout(): Chainable<void>;

      /**
       * Set up common API mocks (unauthenticated state)
       */
      mockApi(): Chainable<void>;

      /**
       * Set up API mocks with authenticated user
       */
      mockApiAuthenticated(): Chainable<void>;

      /**
       * Navigate to jam home page
       * @param jamId - Optional jam ID (defaults to 'gmtk')
       */
      visitHome(jamId?: string): Chainable<void>;

      /**
       * Fill the post creation/edit form
       * @param data - Form field data
       */
      fillPostForm(data: PostFormData): Chainable<void>;

      /**
       * Select an option in a react-select dropdown
       * @param selector - CSS selector for the select field
       * @param value - The option value to select
       */
      selectOption(selector: string, value: string): Chainable<void>;

      /**
       * Wait for posts to load on the page
       */
      waitForPosts(): Chainable<void>;
    }
  }
}

export {};
