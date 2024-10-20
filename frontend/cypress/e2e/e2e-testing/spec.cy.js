import {
  calcPrices,
  fillInShipping,
  generateUniqueEmail,
  registration,
} from '../helper';

const newUser = {
  name: 'Minh Anh',
  email: generateUniqueEmail(),
  password: 'MinhAnh123!',
};

const updatedInfo = {
  name: 'Tran Minh Anh',
  email: generateUniqueEmail(),
  password: 'MinhAnh1234!',
};

const adminUser = {
  name: 'Admin User',
  email: 'admin@email.com',
  password: '123456',
};

const updatedInfoByAdmin = {
  name: 'Tran Anh',
  email: generateUniqueEmail(),
};

//Payment information (change to your own account)
const paymentAccount = 'proshopbuyer123@gmail.com';
const paymentPassword = '12345678';

// const updatedProductInfo = {
//   name: 'Laptop',
//   price: '1000',
//   image: 'https://picsum.photos/id/1/200',
//   brand: 'Apple',
//   category: 'Electronics',
//   countInStock: '15',
//   description: 'Best laptop ever',
// };

const productId = '670b4e1b651b975306c4fe8f';
const product = {
  name: 'Airpods Wireless Bluetooth Headphones',
  price: 89.99,
  qty: 2,
};

describe('E2E Testing', () => {
  it('Should run successfully', () => {
    //USER FLOW 1
    //Account registration
    cy.visit('http://localhost:3000/register');
    registration(
      newUser.name,
      newUser.email,
      newUser.password,
      newUser.password
    );
    cy.get('a#username').should('have.text', newUser.name);

    //View profile
    cy.get('a#username').click();
    cy.get('a[href="/profile"]').click({ force: true });
    cy.get('input#name').should('have.value', newUser.name);
    cy.get('input#email').should('have.value', newUser.email);

    //Edit profile
    cy.get('a#username').click();
    cy.get('a[href="/profile"]').click({ force: true });
    cy.get('input#name').clear().type(updatedInfo.name);
    cy.get('input#email').clear().type(updatedInfo.email);
    cy.get('button[type="submit"]').contains('Update').click();
    cy.get('input#name').should('have.value', updatedInfo.name);
    cy.get('input#email').should('have.value', updatedInfo.email);

    //Change password
    cy.get('a#username').click();
    cy.get('a[href="/profile"]').click({ force: true });
    cy.get('#password').type(updatedInfo.password);
    cy.get('#confirmPassword').type(updatedInfo.password);
    cy.contains('Update').click();
    cy.get('.Toastify__toast').should(
      'have.text',
      'Profile updated successfully'
    );
    cy.wait(5000);

    //Logout
    cy.get('a#username').click({ force: true });
    cy.get('a').contains('Logout').click();
    cy.url().should('include', '/login');

    //Login
    cy.get('input#email').type(updatedInfo.email);
    cy.get('input#password').type(updatedInfo.password);
    cy.get('button[type="submit"]').contains('Sign In').click();
    cy.get('a#username').should('have.text', updatedInfo.name);

    //View products
    cy.contains('h1', 'Latest Products').scrollIntoView();

    //View product details
    cy.get(`a:contains(${product.name})`)
      .filter(':visible')
      .first()
      .scrollIntoView()
      .click();

    //Add product to cart
    cy.get('div.row .col select.form-control').select('2');
    cy.contains('button', 'Add To Cart').click();
    cy.get('span.badge.rounded-pill.bg-success').should('exist');
    cy.get('span.badge.rounded-pill.bg-success').should('have.text', '2');

    //View cart
    cy.get('a[href="/cart"]').click();
    cy.get('.list-group-item').should('exist');

    //Place order
    cy.get('.col-md-4')
      .find('.list-group-item')
      .eq(1)
      .within(() => {
        cy.contains('button', 'Proceed To Checkout').click();
      });
    fillInShipping('227 Nguyen Van Cu', 'TPHCM', '70000', 'Vietnam');
    cy.contains('button[type="submit"]', 'Continue').click();
    cy.contains('button', 'Place Order').click();
    cy.wait(2000);

    //Payment process
    cy.paypalFlow(paymentAccount, paymentPassword);
    cy.paypalPrice().should(
      'to.contain',
      `$${calcPrices([product]).totalPrice}`
    );
    cy.paypalComplete();
    cy.get('div.alert.alert-success').should('be.visible');

    //View order history
    cy.get('a#username').click();
    cy.get('a.dropdown-item[href="/profile"]').click();
    cy.wait(1000);
    cy.get('table, tbody, tr').should('not.be.empty');

    //View past order details
    cy.get('a').contains('Details').click();
    cy.get('div[role="alert"]').contains('Not Delivered').should('exist');
    cy.wait(1000);

    //Logout
    cy.get('a#username').click({ force: true });
    cy.get('a').contains('Logout').click();
    cy.url().should('include', '/login');

    //ADMIN FLOW
    //Login
    cy.get('input#email').type(adminUser.email);
    cy.get('input#password').type(adminUser.password);
    cy.get('button[type="submit"]').contains('Sign In').click();
    cy.get('a#username').should('have.text', adminUser.name);

    //View profile
    cy.get('a#username').click();
    cy.get('a[href="/profile"]').click({ force: true });
    cy.get('input#name').should('have.value', adminUser.name);
    cy.get('input#email').should('have.value', adminUser.email);

    // //View user list
    // cy.get('a#adminmenu').click();
    // cy.get('a').contains('Users').click();
    // cy.url().should('include', '/admin/userlist');

    // //View user details
    // cy.get('td').find('a').last().click();
    // cy.get('h1').contains('Edit User').should('exist');

    // //Edit user details
    // cy.get('input#name').clear().type(updatedInfoByAdmin.name);
    // cy.get('input#email').clear().type(updatedInfoByAdmin.email);
    // cy.get('button[type="submit"]').contains('Update').click();
    // cy.get('input#name').should('have.value', updatedInfoByAdmin.name);
    // cy.get('input#email').should('have.value', updatedInfoByAdmin.email);

    // //View product list
    // cy.get('a#adminmenu').click({ force: true });
    // cy.get('a').contains('Products').click({ force: true });
    // cy.url().should('include', '/admin/productlist');

    // //View product details
    // cy.get('td')
    //   .find(`a[href="/admin/product/${productId}/edit"]`)
    //   .first()
    //   .click();
    // cy.url().should('include', `/admin/product/${productId}/edit`);

    // //Edit product details
    // cy.get('input#name').clear().type(updatedProductInfo.name);
    // cy.get('input#price').clear().type(updatedProductInfo.price);
    // cy.get('input#image[type="text"]').clear().type(updatedProductInfo.image);
    // cy.get('input#brand').clear().type(updatedProductInfo.brand);
    // cy.get('input#category').clear().type(updatedProductInfo.category);
    // cy.get('input#countInStock').clear().type(updatedProductInfo.countInStock);
    // cy.get('input#description').clear().type(updatedProductInfo.description);
    // cy.get('button[type="submit"]').contains('Update').click();
    // cy.get('input#name').should('have.value', updatedProductInfo.name);
    // cy.get('input#price').should('have.value', updatedProductInfo.price);
    // cy.get('input#image').should('have.value', updatedProductInfo.image);
    // cy.get('input#brand').should('have.value', updatedProductInfo.brand);
    // cy.get('input#category').should('have.value', updatedProductInfo.category);
    // cy.get('input#countInStock').should(
    //   'have.value',
    //   updatedProductInfo.countInStock
    // );
    // cy.get('input#description').should(
    //   'have.value',
    //   updatedProductInfo.description
    // );

    //View order list
    cy.get('a#adminmenu').click({ force: true });
    cy.get('a').contains('Orders').click({ force: true });
    cy.url().should('include', '/admin/orderlist');

    //View order details
    cy.get('td').find('a').last().click();

    //Mark order as delivered
    cy.get('button').contains('Mark As Delivered').click();
    cy.get('div[role="alert"]').contains('Delivered on').should('exist');

    //Logout
    cy.get('a#username').click({ force: true });
    cy.get('a').contains('Logout').click();
    cy.url().should('include', '/login');

    //USER FLOW 2
    //Login
    cy.get('input#email').type(updatedInfo.email);
    cy.get('input#password').type(updatedInfo.password);
    cy.get('button[type="submit"]').contains('Sign In').click();
    cy.get('a#username').should('have.text', updatedInfo.name);

    //View order history
    cy.get('a#username').click();
    cy.get('a.dropdown-item[href="/profile"]').click();
    cy.wait(1000);
    cy.get('table, tbody, tr').should('not.be.empty');
    cy.get('a').contains('Details').click();
    cy.get('div[role="alert"]').contains('Delivered on').should('exist');
    cy.get('div[role="alert"]').contains('Paid on').should('exist');
    cy.wait(1000);
  });
});
