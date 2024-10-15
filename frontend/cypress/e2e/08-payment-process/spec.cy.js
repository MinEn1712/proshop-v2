import '../helper';
import {
  addProductToCart,
  fillInShipping,
  getPayPalButton,
  login,
  navigateToProfile,
} from '../helper';
//Make sure cart and order list are empty, login data as below before running script
const validPassword = '123456';
const initialEmail = 'john@email.com';

// products information
const airpods = { name: 'Airpods Wireless Bluetooth Headphones', price: 89.99 };
const iphone = { name: 'iPhone 13 Pro 256GB Memory', price: 599.99 };

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

    fillInShipping('84 Nha cua Thu Ha', 'Ho Chi Minh', '78', 'Vietnam');

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
    getPayPalButton().click();
    cy.wait(60000); // manual login time + waiting for order is paid notification to finish running only about 1 minute, pay attention to quick operation
    // return to payment page
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

    fillInShipping('84 Nha cua Thu Ha', 'Ho Chi Minh', '78', 'Vietnam');

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
    getPayPalButton().click();

    cy.wait(60000); // manual login time + waiting for order is paid notification to finish running only about 1 minute, pay attention to quick operation
    // return to payment page
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

    fillInShipping('84 Nha cua Thu Ha', 'Ho Chi Minh', '78', 'Vietnam');

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
    getPayPalButton().click();
    cy.wait(15000); //Paypal login box appears, close the box within 1-2 seconds (press the x button on the box) to cancel payment and wait for the popup to finish
    //return to the payment page
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

    fillInShipping('84 Nha cua Thu Ha', 'Ho Chi Minh', '78', 'Vietnam');

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
    getPayPalButton().click();
    cy.wait(20000);
    //Paypal login box appears, logout (if needed) and enter invalid Paypal credentials, verify error message and cancel
    //return to payment page
    cy.contains(`Not Paid`).should('be.visible');
  });
});
