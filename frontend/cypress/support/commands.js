// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

//Reference:
//https://whattodevnow.medium.com/testing-paypal-checkout-flow-with-cypress-6c0ebd1321ff
/**
 * Returns an iframe content
 */
Cypress.Commands.add('iframe', { prevSubject: 'element' }, ($iframe) => {
  return new Cypress.Promise((resolve) => {
    $iframe.ready(function () {
      resolve($iframe.contents().find('body'));
    });
  });
});

// Used to keep the reference to the popup window
const state = {};

/**
 * Intercepts calls to window.open() to keep a reference to the new window
 */
Cypress.Commands.add('capturePopup', () => {
  cy.window().then((win) => {
    const open = win.open;
    cy.stub(win, 'open').callsFake((...params) => {
      // Capture the reference to the popup
      state.popup = open(...params);
      return state.popup;
    });
  });
});

/**
 * Returns a wrapped body of a captured popup
 */
Cypress.Commands.add('popup', () => {
  const popup = Cypress.$(state.popup.document);
  return cy.wrap(popup.contents().find('body'));
});

/**
 * Clicks on PayPal button and signs in
 */
Cypress.Commands.add('paypalFlow', (email, password) => {
  // Enable popup capture
  cy.capturePopup();
  // Click on the PayPal button inside PayPal's iframe
  cy.get('iframe')
    .iframe()
    .find('div[data-funding-source="paypal"]')
    .click({ multiple: true });
  cy.wait(5000);

  cy.popup().then(($body) => {
    // Check if we need to sign in
    if ($body.find('input#email').length) {
      cy.popup().find('input#email').clear().type(email);
      // Click on the button in case it's a 2-step flow
      cy.popup().find('button:visible').first().click();
      cy.wait(2000);
      cy.popup().find('input#password').clear().type(password);
      cy.popup().find('button#btnLogin').click();
    }
  });
  cy.wait(5000);
});

/**
 * Returns the price shown in PayPal's summary
 */
Cypress.Commands.add('paypalPrice', () => {
  return cy.popup().find('span[data-testid="header-cart-total"]');
});

/**
 * Completes PayPal flow
 */
Cypress.Commands.add('paypalComplete', () => {
  cy.popup().find('ul.charges').should('not.to.be.empty');
  cy.wait(1000);
  cy.popup().find('button#payment-submit-btn').click();
  cy.wait(10000);
});
