import {
  addProductToCart,
  calcPrices,
  fillInShipping,
  login,
  navigateToProfile,
} from '../helper';

//Make sure cart and order list are empty, login data as below before running script
const validPassword = '123456';
const initialEmail = 'john@email.com';

//Payment information (change to your own account)
const paymentAccount = 'proshopbuyer123@gmail.com';
const paymentPassword = '12345678';

// Products information
const airpods = {
  name: 'Airpods Wireless Bluetooth Headphones',
  price: 89.99,
  qty: 1,
};
const iphone = { name: 'iPhone 13 Pro 256GB Memory', price: 599.99, qty: 1 };

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
  cy.get('iframe').iframe().find('div[data-funding-source="paypal"]').click();
  cy.wait(5000);

  cy.popup().then(($body) => {
    // Check if we need to sign in
    if ($body.find('input#email').length) {
      cy.popup().find('input#email').clear().type(email);
      // Click on the button in case it's a 2-step flow
      cy.popup().find('button:visible').first().click();
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

describe('Payment Process Functionality', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('TC-PP-001 -> 008 Valid Payment Process for buying one product (with valid credentials)', () => {
    login(initialEmail, validPassword);
    addProductToCart(airpods.name);

    cy.get('button.btn.btn-primary')
      .contains('Proceed To Checkout')
      .scrollIntoView()
      .then(($btn) => {
        if ($btn.is(':visible')) {
          cy.wrap($btn).click();
        } else {
          cy.log('Can not find "Proceed To Checkout" button.');
          throw new Error('Can not find "Proceed To Checkout" button.');
        }
      });

    cy.url().should('include', '/shipping');
    fillInShipping(
      '21 Truong Cong Dinh, 14, Tan Binh',
      'Ho Chi Minh',
      '78',
      'Vietnam'
    );

    cy.url().should('include', '/payment');
    cy.get('button.btn.btn-primary').contains('Continue').should('be.visible');
    cy.get('button.btn.btn-primary').contains('Continue').click();
    cy.get('button.btn.btn-primary')
      .contains('Place Order')
      .should('be.visible')
      .click();

    let orderId;
    cy.get('h1')
      .invoke('text')
      .then((text) => {
        orderId = text.trim().split(' ')[1];
        cy.log(`OrderID: ${orderId}`);
      });

    cy.paypalFlow(paymentAccount, paymentPassword);
    cy.paypalPrice().should(
      'to.contain',
      `$${calcPrices([airpods]).totalPrice}`
    );
    cy.paypalComplete();
    cy.get('div.alert.alert-success').should('be.visible');

    const today = new Date().toISOString().split('T')[0];
    cy.contains(`Paid on ${today}`).should('be.visible');
    navigateToProfile();
    cy.contains(`${today}`).should('be.visible');
  });

  it('TC-PP-009 Valid Payment Process for buying 2 product (with valid credentials)', () => {
    login(initialEmail, validPassword);
    addProductToCart(airpods.name);
    cy.get('a.navbar-brand').click();
    addProductToCart(iphone.name);

    cy.get('button.btn.btn-primary')
      .contains('Proceed To Checkout')
      .scrollIntoView()
      .then(($btn) => {
        if ($btn.is(':visible')) {
          cy.wrap($btn).click();
        } else {
          cy.log('Can not find "Proceed To Checkout" button.');
          throw new Error('Can not find "Proceed To Checkout" button.');
        }
      });

    cy.url().should('include', '/shipping');

    fillInShipping(
      '21 Truong Cong Dinh, 14, Tan Binh',
      'Ho Chi Minh',
      '78',
      'Vietnam'
    );

    cy.url().should('include', '/payment');

    cy.get('button.btn.btn-primary')
      .contains('Continue')
      .should('be.visible')
      .click();

    cy.get('button.btn.btn-primary')
      .contains('Place Order')
      .should('be.visible')
      .click();

    let orderId;
    cy.get('h1')
      .invoke('text')
      .then((text) => {
        orderId = text.trim().split(' ')[1];
        cy.log(`OrderID: ${orderId}`);
      });

    cy.paypalFlow(paymentAccount, paymentPassword);
    cy.paypalPrice().should(
      'to.contain',
      `$${calcPrices([airpods, iphone]).totalPrice}`
    );
    cy.paypalComplete();
    cy.get('div.alert.alert-success').should('be.visible');

    const today = new Date().toISOString().split('T')[0];
    cy.contains(`Paid on ${today}`).should('be.visible');
    navigateToProfile();
    cy.contains(`${today}`).should('be.visible');
  });

  it('TC-PP-010, TC-PP-012, TC-PP-013', () => {
    login(initialEmail, validPassword);
    addProductToCart(airpods.name);
    cy.get('a.navbar-brand').click();
    addProductToCart(iphone.name);

    cy.get('button.btn.btn-primary')
      .contains('Proceed To Checkout')
      .scrollIntoView()
      .then(($btn) => {
        if ($btn.is(':visible')) {
          cy.wrap($btn).click();
        } else {
          cy.log('Can not find "Proceed To Checkout" button.');
          throw new Error('Can not find "Proceed To Checkout" button.');
        }
      });

    cy.url().should('include', '/shipping');

    fillInShipping(
      '21 Truong Cong Dinh, 14, Tan Binh',
      'Ho Chi Minh',
      '78',
      'Vietnam'
    );

    cy.url().should('include', '/payment');

    cy.get('button.btn.btn-primary').contains('Continue').should('be.visible');
    cy.get('button.btn.btn-primary').contains('Continue').click();

    cy.get('button.btn.btn-primary')
      .contains('Place Order')
      .should('be.visible')
      .click();

    let orderId;
    cy.get('h1')
      .invoke('text')
      .then((text) => {
        orderId = text.trim().split(' ')[1];
        cy.log(`Mã đơn hàng: ${orderId}`);
      });

    cy.capturePopup();
    cy.get('iframe').iframe().find('div[data-funding-source="paypal"]').click();
    cy.wait(5000);

    //Close the popup
    cy.window().then((win) => {
      const close = win.close;
      cy.stub(win, 'close').callsFake((...params) => {
        // Capture the reference to the popup
        state.popup = close(...params);
        return state.popup;
      });
    });

    cy.contains(`Not Paid`).should('be.visible');
  });

  it('TC-PP-011 Payment Process for buying 1 product (with invalid credentials)', () => {
    login(initialEmail, validPassword);
    addProductToCart(airpods.name);
    cy.get('a.navbar-brand').click();
    addProductToCart(iphone.name);

    cy.get('button.btn.btn-primary')
      .contains('Proceed To Checkout')
      .scrollIntoView()
      .then(($btn) => {
        if ($btn.is(':visible')) {
          cy.wrap($btn).click();
        } else {
          cy.log('Can not find "Proceed To Checkout" button.');
          throw new Error('Can not find "Proceed To Checkout" button.');
        }
      });

    cy.url().should('include', '/shipping');

    fillInShipping(
      '21 Truong Cong Dinh, 14, Tan Binh',
      'Ho Chi Minh',
      '78',
      'Vietnam'
    );

    cy.url().should('include', '/payment');

    cy.get('button.btn.btn-primary').contains('Continue').should('be.visible');
    cy.get('button.btn.btn-primary').contains('Continue').click();

    cy.get('button.btn.btn-primary')
      .contains('Place Order')
      .should('be.visible')
      .click();

    let orderId;
    cy.get('h1')
      .invoke('text')
      .then((text) => {
        orderId = text.trim().split(' ')[1];
        cy.log(`Mã đơn hàng: ${orderId}`);
      });

    cy.paypalFlow('john@email.com', paymentPassword);
    cy.contains(`Not Paid`).should('be.visible');
  });
});
