import { calcPrices, fillInShipping } from '../helper';

// Định nghĩa lệnh login tùy chỉnh
Cypress.Commands.add('login', (email, password) => {
  cy.visit('http://localhost:3000/login'); // Điều hướng tới trang login
  cy.get('#email').type(email); // Nhập email
  cy.get('#password').type(password); // Nhập mật khẩu
  cy.get('button').contains('Sign In').click(); // Nhấn nút đăng nhập
});

const paymentAccount = 'proshopbuyer123@gmail.com';
const paymentPassword = '12345678';
const product = {
  name: 'Airpods Wireless Bluetooth Headphones',
  price: 89.99,
  qty: 2,
};

// Test case TC-MD-001: Xem các đơn hàng đã đánh dấu là đã giao đối với đơn hàng đã thanh toán
describe('TC-MD-001: View marked orders as delivered for a paid order', () => {
  it('Should display tick icon for delivered orders', () => {
    cy.login('user1729101456084@example.com', 'MinhAnh1234!'); // Gọi hàm login
    cy.get('a#username').click(); // Click vào tên người dùng
    cy.get('a.dropdown-item[href="/profile"]').click(); // Chuyển tới trang profile

    // Đảm bảo bảng có hàng
    cy.get('table tbody tr').should('have.length.greaterThan', 0);

    // Kiểm tra cột thứ 5 chứa định dạng ngày tháng năm
    cy.get('table tbody tr')
      .eq(1)
      .find('td')
      .eq(3)
      .invoke('text')
      .should('match', /^\d{4}-\d{2}-\d{2}$/);
    cy.get('table tbody tr')
      .eq(1)
      .find('td')
      .eq(4)
      .invoke('text')
      .should('match', /^\d{4}-\d{2}-\d{2}$/);
  });
});

// Test case TC-MD-002: View marked orders as not delivered for an unpaid order
describe('TC-MD-002: View marked orders as not delivered for an unpaid order', () => {
  it('Should display non-date values for unpaid orders in both 4th and 5th columns', () => {
    cy.login('user1729101456084@example.com', 'MinhAnh1234!'); // Gọi hàm login
    cy.get('a#username').click();
    cy.get('a.dropdown-item[href="/profile"]').click();
    // Kiểm tra thẻ <td> thứ 4 (0-indexed, cột thứ 5) không có định dạng ngày tháng
    cy.get('table tbody tr')
      .eq(9)
      .find('td')
      .eq(3)
      .invoke('text')
      .should('not.match', /^\d{4}-\d{2}-\d{2}$/); // Không khớp với định dạng YYYY-MM-DD
    // Kiểm tra thẻ <td> thứ 5 (0-indexed, cột thứ 6) không có định dạng ngày tháng
    cy.get('table tbody tr')
      .eq(9)
      .find('td')
      .eq(4)
      .invoke('text')
      .should('not.match', /^\d{4}-\d{2}-\d{2}$/); // Không khớp với định dạng YYYY-MM-DD
  });
});

//
// // Test case TC-MD-003: View mixed list of delivered and undelivered orders
// describe('TC-MD-003: View mixed list of delivered and undelivered orders', () => {
//   it('Should display tick for delivered and X for undelivered orders', () => {
//     cy.login('john@email.com', '123456');
//     cy.visit('/profile');
//     cy.get('.order-status-delivered').should('contain', '✔'); // Verify delivered orders display tick icon
//     cy.get('.order-status-undelivered').should('contain', '✘'); // Verify undelivered orders display X icon
//   });
// });
//
// // Test case TC-MD-004: Marked orders cannot change delivery status
describe('TC-MD-004: Marked orders cannot change delivery status', () => {
  it('Should not allow changing delivery status for delivered orders', () => {
    cy.login('admin@email.com', '123456');
    cy.get('a#username').click();
    cy.get('a#adminmenu').click();
    cy.get('a.dropdown-item[href="/admin/orderlist"]').click();
    cy.get('tr:nth-child(12) a')
      .contains('Details')
      .should('be.visible')
      .click();
    // cy.get('button.btn.btn-block.btn.btn-primary').contains('Mark As Delivered').click();
    cy.get('button.btn.btn-block.btn.btn-primary').should('not.exist');
  });
});
// // Test case TC-MD-005: Mark order as successfully delivered
describe('TC-MD-005: Mark order as successfully delivered', () => {
  it('Should allow admin to mark order as delivered', () => {
    cy.login('user1729101456084@example.com', 'MinhAnh1234!');
    cy.contains('h1', 'Latest Products').scrollIntoView();

    cy.get(`a:contains(${product.name})`)
      .filter(':visible')
      .first()
      .scrollIntoView()
      .click();

    cy.get('div.row .col select.form-control').select('2');
    cy.contains('button', 'Add To Cart').click();
    cy.get('span.badge.rounded-pill.bg-success').should('exist');
    cy.get('span.badge.rounded-pill.bg-success').should('have.text', '2');

    cy.get('a[href="/cart"]').click();
    cy.get('.list-group-item').should('exist');

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

    cy.paypalFlow(paymentAccount, paymentPassword);
    cy.paypalPrice().should(
      'to.contain',
      `$${calcPrices([product]).totalPrice}`
    );
    cy.paypalComplete();
    cy.get('div.alert.alert-success').should('be.visible');

    cy.get('a#username').click({ force: true });
    cy.get('a').contains('Logout').click();
    cy.url().should('include', '/login');

    cy.login('admin@email.com', '123456');
    cy.get('a#username').click();
    cy.get('a#adminmenu').click();
    cy.get('a.dropdown-item[href="/admin/orderlist"]').click();
    cy.get('td').find('a').last().click();
    cy.get('button.btn.btn-block.btn.btn-primary')
      .contains('Mark As Delivered')
      .click();
    cy.get('button.btn.btn-block.btn.btn-primary').should('not.exist');
  });
});
// Test case TC-MD-006: Only admin can mark orders as delivered
describe('TC-MD-006: Only admin can mark orders as delivered', () => {
  it('Should not allow regular users to mark orders as delivered', () => {
    cy.login('user1729101456084@example.com', 'MinhAnh1234!'); // Gọi hàm login
    cy.get('a#username').click();
    cy.get('a.dropdown-item[href="/profile"]').click();
    cy.get('button.btn.btn-block.btn.btn-primary').should('not.exist');
  });
});
