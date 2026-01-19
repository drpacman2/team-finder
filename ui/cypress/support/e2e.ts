// Cypress E2E Support File
// This file is processed and loaded automatically before test files.

import "./commands";
import "@testing-library/cypress/add-commands";

// Hide fetch/XHR requests from command log for cleaner output
const app = window.top;
if (app && !app.document.head.querySelector("[data-hide-command-log-request]")) {
  const style = app.document.createElement("style");
  style.innerHTML =
    ".command-name-request, .command-name-xhr { display: none }";
  style.setAttribute("data-hide-command-log-request", "");
  app.document.head.appendChild(style);
}

// Prevent TypeScript errors when accessing window properties
declare global {
  interface Window {
    // Add any window properties used in tests here
  }
}
