export function generateUniqueEmail() {
  const timestamp = Date.now();
  return `user${timestamp}@example.com`;
}

export function generateUniqueId() {
  return Date.now();
}

export function registration(name, email, password, confirmPassword) {
  cy.get('input#name').type(name);
  cy.get('input#email').type(email);
  cy.get('input#password').type(password);
  cy.get('input#confirmPassword').type(confirmPassword);
  cy.get('button[type="submit"]').contains('Register').click();
}

export function login(email, password) {
  cy.get('a[href="/login"]').click();
  cy.get('input#email').type(email);
  cy.get('input#password').type(password);
  cy.get('button[type="submit"]').contains('Sign In').click();
}

export function navigateToProfile() {
  cy.get('a#username').click();
  cy.get('a.dropdown-item[href="/profile"]').click();
}

export function updateProfile(name, email) {
  if (name !== undefined) {
    cy.get('input[id="name"]').clear().type(name);
  }
  if (email !== undefined) {
    cy.get('input[id="email"]').clear().type(email);
  }
  cy.get('button[type="submit"]').contains('Update').click();
}

export function addToCart(productPath, qty) {
  cy.visit('http://localhost:3000/');
  cy.get('.row').find(`a[href="${productPath}"]`).first().click();
  cy.get('div.row .col select.form-control')
    .select(qty, { force: true })
    .trigger('change');
  cy.contains('button', 'Add To Cart').click();
}

export function addProductToCart(productName) {
  cy.get(`a:contains(${productName})`)
    .filter(':visible')
    .first()
    .scrollIntoView()
    .click();

  cy.get('button.btn.btn-primary')
    .first()
    .scrollIntoView()
    .then(($btn) => {
      if ($btn.is(':visible')) {
        cy.wrap($btn).click();
      } else {
        cy.log('Can not find "Add To Cart" button.');
        throw new Error('Can not find "Add To Cart" button.');
      }
    });
}

export function verifyShoppingCart(productNumber, qtyList) {
  const price = [];
  let i = 0;
  let totalPrice = 0;
  cy.get('.col-md-8')
    .find('.list-group-item')
    .each(($el) => {
      cy.wrap($el).within(() => {
        cy.get('.col-md-2')
          .eq(1)
          .invoke('text')
          .then((value) => {
            value = value.substring(1, value.length);
            price.push(Number(value));
          });
      });
    })
    .then(() => {
      price.forEach(($el) => {
        cy.log($el);
        totalPrice += $el * qtyList[i];
        i++;
      });
      cy.log(totalPrice);
    });
  cy.get('.col-md-4')
    .find('.list-group-item')
    .eq(0)
    .invoke('text')
    .then((text) => {
      const price = text.match(/\$([0-9,]+(\.[0-9]{2})?)/)[0].replace('$', '');
      return Number(price);
    })
    .then((price) => {
      expect(totalPrice).to.equal(price);
    });

  cy.get('.col-md-4')
    .find('.list-group-item')
    .eq(0)
    .find('h2')
    .invoke('text')
    .then((text) => {
      const quantity = text.match(/\((\d+)\)/)[1];
      expect(quantity).to.equal(productNumber);
    });
}

export function fillInShipping(address, city, postalCode, country) {
  cy.get('#address').type(address);
  cy.get('#city').type(city);
  cy.get('#postalCode').type(postalCode);
  cy.get('#country').type(country);
  cy.contains('button[type="submit"]', 'Continue').click();
}

export function viewOrderHistory() {
  cy.get('a#username').click();
  cy.get('a.dropdown-item[href="/profile"]').click();
  cy.wait(1000);
  cy.get('table, tbody, tr').should('not.be.empty');
}

export function placeAnOrderToView() {
  cy.get('.product-title.card-title').first().scrollIntoView().click();
  cy.wait(1000);
  cy.contains('Add To Cart').click();
  cy.contains('Proceed To Checkout').click();
  cy.get('#address').type('5 nguyen trai');
  cy.get('#city').type('HCM');
  cy.get('#postalCode').type('72000');
  cy.get('#country').type('VN');
  cy.contains('Continue').click();
  cy.contains('Continue').click();
  cy.get('button').contains('Place Order').click();
}

export function getPayPalButton() {
  return cy
    .get('iframe[title="PayPal"]')
    .should('exist')
    .then(($iframe) => {
      const $body = $iframe.contents().find('body');
      cy.wrap($body)
        .find('div[data-funding-source="paypal"]')
        .should('be.visible')
        .click();
    });
}

export function confirmChangePassword(password, confirmPassword) {
  cy.wait(1000);
  cy.get('a#username').click();
  cy.get('a.dropdown-item[href="/profile"]').click();
  cy.get('#password').type(password);
  if (confirmPassword !== undefined) {
    cy.get('#confirmPassword').type(confirmPassword);
  }
  cy.contains('Update').click();
}

export function logout() {
  cy.get('a#username').click({ force: true });
  cy.get('a.dropdown-item').contains('Logout').click();
}

function addDecimals(num) {
  return (Math.round(num * 100) / 100).toFixed(2);
}

export function calcPrices(orderItems) {
  const itemsPrice = orderItems.reduce(
    (acc, item) => acc + (item.price * 100 * item.qty) / 100,
    0
  );

  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const taxPrice = 0.15 * itemsPrice;
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  return {
    itemsPrice: addDecimals(itemsPrice),
    shippingPrice: addDecimals(shippingPrice),
    taxPrice: addDecimals(taxPrice),
    totalPrice: addDecimals(totalPrice),
  };
}
