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
