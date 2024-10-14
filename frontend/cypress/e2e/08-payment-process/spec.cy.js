/* eslint-disable no-undef */
//  Đảm bảo danh sách giỏ hàng và đơn hàng đang trống, dữ liệu đăng nhập như dưới trước khi chạy script
const validPassword = '123456';
const initialEmail = 'john@email.com';

// Dữ liệu sản phẩm
const airpods = { name: 'Airpods Wireless Bluetooth Headphones', price: 89.99 };
const iphone = { name: 'iPhone 13 Pro 256GB Memory', price: 599.99 };

// Lệnh tùy chỉnh đăng nhập
Cypress.Commands.add('login', (email, password) => {
  cy.visit('http://localhost:3000/login');
  cy.wait(200);
  cy.get('#email').should('be.visible').clear().type(email);
  cy.get('#password').should('be.visible').clear().type(password);
  cy.get('button').contains('Sign In').click();
});

// Lệnh tùy chỉnh để cuộn đến phần tử hiển thị
Cypress.Commands.add('scrollToVisibleElement', (selector) => {
  cy.get(selector).filter(':visible').first().scrollIntoView(); // Cuộn đến phần tử đầu tiên hiển thị
});
//ham logout
Cypress.Commands.add('logout', () => {
  cy.get('a#username').click();
  cy.get('a.dropdown-item').contains('Logout').click();
});

Cypress.Commands.add('navigateToProfile', () => {
  cy.get('a#username').click();
  cy.get('a.dropdown-item[href="/profile"]').click();
});

// Lệnh tùy chỉnh để thêm sản phẩm vào giỏ hàng
Cypress.Commands.add('addToCart', (productName) => {
  // Tìm và nhấp vào sản phẩm có thể nhìn thấy
  cy.scrollToVisibleElement(`a:contains(${productName})`).click(); // Cuộn đến sản phẩm và nhấp

  // Sau khi nhấn vào sản phẩm, chờ trang tải
  cy.wait(2000); // Thêm khoảng chờ ngắn để đảm bảo trang đã tải xong

  // Sử dụng scrollIntoView() để cuộn đến nút "Add To Cart"
  cy.get('button.btn.btn-primary')
    .first()
    .scrollIntoView()
    .then(($btn) => {
      if ($btn.is(':visible')) {
        cy.wrap($btn).click(); // Nếu nút có sẵn và hiển thị, nhấp vào
      } else {
        cy.log('Nút "Add To Cart" không tìm thấy.'); // Ghi log nếu nút không tìm thấy
        throw new Error('Nút "Add To Cart" không tìm thấy.');
      }
    });
});

Cypress.Commands.add('getPayPalButton', () => {
  // Truy cập iframe PayPal
  cy.get('iframe[title="PayPal"]')
    .should('exist') // Đảm bảo iframe tồn tại
    .then(($iframe) => {
      // Truy cập nội dung của iframe
      const $body = $iframe.contents().find('body');
      cy.wrap($body)
        .find('div[data-funding-source="paypal"]')
        .should('be.visible')
        .click();
    });
});

// TC-PP-001->008 Valid Payment Process for buying one product (with valid credentials)
it('TC-PP-001 -> 008 Valid Payment Process for buying one product (with valid credentials)', () => {
  cy.login(initialEmail, validPassword);
  cy.addToCart(airpods.name);

  // Cuộn đến nút "Proceed to Checkout" và nhấp
  cy.get('button.btn.btn-primary')
    .contains('Proceed To Checkout')
    .scrollIntoView()
    .then(($btn) => {
      if ($btn.is(':visible')) {
        cy.wrap($btn).click(); // Nhấp vào nút nếu nó hiển thị
      } else {
        cy.log('Nút "Proceed To Checkout" không tìm thấy.'); // Ghi log nếu nút không tìm thấy
        throw new Error('Nút "Proceed To Checkout" không tìm thấy.');
      }
    });

  // Kiểm tra URL
  cy.url().should('include', '/shipping');

  // Điền thông tin giao hàng
  cy.get('#address').type('84 Nha cua Thu Ha'); // Điền địa chỉ
  cy.get('#city').type('Ho Chi Minh'); // Điền thành phố
  cy.get('#postalCode').type('78'); // Điền mã bưu điện
  cy.get('#country').type('Vietnam'); // Điền quốc gia

  // Nhấn nút "Continue"
  cy.get('button.btn.btn-primary').contains('Continue').click();

  // Kiểm tra URL để xác nhận chuyển tiếp đến trang thanh toán
  cy.url().should('include', '/payment');

  // Xác nhận thanh toán PayPal
  cy.get('button.btn.btn-primary').contains('Continue').should('be.visible');
  cy.get('button.btn.btn-primary').contains('Continue').click();

  // Kiểm tra nút "Place Order"
  cy.get('button.btn.btn-primary')
    .contains('Place Order')
    .should('be.visible')
    .click();

  //biến lưu lại ID đơn hàng
  let orderId; // Khai báo biến để lưu mã đơn hàng
  cy.get('h1')
    .invoke('text')
    .then((text) => {
      orderId = text.trim().split(' ')[1]; // Tách mã đơn hàng từ chuỗi
      cy.log(`Mã đơn hàng: ${orderId}`); // Ghi log mã đơn hàng ra console
    });
  cy.getPayPalButton().click();
  //khúc này tự đăng nhập thủ công
  cy.wait(60000); //thời gian đăng nhập thủ công + chờ chạy xong thông báo order is paid chỉ tầm 1 phút, chú ý thao tác nhanh
  //về lại trang thanh toán
  const today = new Date().toISOString().split('T')[0]; // Lấy ngày hôm nay ở định dạng YYYY-MM-DD
  cy.contains(`Paid on ${today}`).should('be.visible');
  cy.navigateToProfile();
  cy.contains(`${today}`).should('be.visible');
});

it('TC-PP-009 Valid Payment Process for buying 2 product (with valid credentials)', () => {
  cy.login(initialEmail, validPassword);
  cy.addToCart(airpods.name);
  cy.get('a.navbar-brand').click();
  cy.addToCart(iphone.name);

  // Cuộn đến nút "Proceed to Checkout" và nhấp
  cy.get('button.btn.btn-primary')
    .contains('Proceed To Checkout')
    .scrollIntoView()
    .then(($btn) => {
      if ($btn.is(':visible')) {
        cy.wrap($btn).click(); // Nhấp vào nút nếu nó hiển thị
      } else {
        cy.log('Nút "Proceed To Checkout" không tìm thấy.'); // Ghi log nếu nút không tìm thấy
        throw new Error('Nút "Proceed To Checkout" không tìm thấy.');
      }
    });

  // Kiểm tra URL
  cy.url().should('include', '/shipping');

  // Điền thông tin giao hàng
  cy.get('#address').type('84 Nha cua Thu Ha'); // Điền địa chỉ
  cy.get('#city').type('Ho Chi Minh'); // Điền thành phố
  cy.get('#postalCode').type('78'); // Điền mã bưu điện
  cy.get('#country').type('Vietnam'); // Điền quốc gia

  // Nhấn nút "Continue"
  cy.get('button.btn.btn-primary').contains('Continue').click();

  // Kiểm tra URL để xác nhận chuyển tiếp đến trang thanh toán
  cy.url().should('include', '/payment');

  // Xác nhận thanh toán PayPal
  cy.get('button.btn.btn-primary').contains('Continue').should('be.visible');
  cy.get('button.btn.btn-primary').contains('Continue').click();

  // Kiểm tra nút "Place Order"
  cy.get('button.btn.btn-primary')
    .contains('Place Order')
    .should('be.visible')
    .click();

  //biến lưu lại ID đơn hàng
  let orderId; // Khai báo biến để lưu mã đơn hàng
  cy.get('h1')
    .invoke('text')
    .then((text) => {
      orderId = text.trim().split(' ')[1]; // Tách mã đơn hàng từ chuỗi
      cy.log(`Mã đơn hàng: ${orderId}`); // Ghi log mã đơn hàng ra console
    });
  cy.getPayPalButton().click();
  //khúc này tự đăng nhập thủ công
  cy.wait(60000); //thời gian đăng nhập thủ công + chờ chạy xong thông báo order is paid chỉ tầm 1 phút, chú ý thao tác nhanh
  //về lại trang thanh toán
  const today = new Date().toISOString().split('T')[0]; // Lấy ngày hôm nay ở định dạng YYYY-MM-DD
  cy.contains(`Paid on ${today}`).should('be.visible');
  cy.navigateToProfile();
  cy.contains(`${today}`).should('be.visible');
});

//TC-PP-010 -> Cancel Payment Process for buying 1 product and TC-PP-012 ->Insufficient funds in PayPal account and TC-PP-013 -> Verify partial payment
it('TC-PP-010, TC-PP-012, TC-PP-013', () => {
  cy.login(initialEmail, validPassword);
  cy.addToCart(airpods.name);
  cy.get('a.navbar-brand').click();
  cy.addToCart(iphone.name);

  // Cuộn đến nút "Proceed to Checkout" và nhấp
  cy.get('button.btn.btn-primary')
    .contains('Proceed To Checkout')
    .scrollIntoView()
    .then(($btn) => {
      if ($btn.is(':visible')) {
        cy.wrap($btn).click(); // Nhấp vào nút nếu nó hiển thị
      } else {
        cy.log('Nút "Proceed To Checkout" không tìm thấy.'); // Ghi log nếu nút không tìm thấy
        throw new Error('Nút "Proceed To Checkout" không tìm thấy.');
      }
    });

  // Kiểm tra URL
  cy.url().should('include', '/shipping');

  // Điền thông tin giao hàng
  cy.get('#address').type('84 Nha cua Thu Ha'); // Điền địa chỉ
  cy.get('#city').type('Ho Chi Minh'); // Điền thành phố
  cy.get('#postalCode').type('78'); // Điền mã bưu điện
  cy.get('#country').type('Vietnam'); // Điền quốc gia

  // Nhấn nút "Continue"
  cy.get('button.btn.btn-primary').contains('Continue').click();

  // Kiểm tra URL để xác nhận chuyển tiếp đến trang thanh toán
  cy.url().should('include', '/payment');

  // Xác nhận thanh toán PayPal
  cy.get('button.btn.btn-primary').contains('Continue').should('be.visible');
  cy.get('button.btn.btn-primary').contains('Continue').click();

  // Kiểm tra nút "Place Order"
  cy.get('button.btn.btn-primary')
    .contains('Place Order')
    .should('be.visible')
    .click();

  //biến lưu lại ID đơn hàng
  let orderId; // Khai báo biến để lưu mã đơn hàng
  cy.get('h1')
    .invoke('text')
    .then((text) => {
      orderId = text.trim().split(' ')[1]; // Tách mã đơn hàng từ chuỗi
      cy.log(`Mã đơn hàng: ${orderId}`); // Ghi log mã đơn hàng ra console
    });
  cy.getPayPalButton().click();
  //khúc này tự đăng nhập thủ công
  cy.wait(15000); //Khung đăng nhập Paypal xuất hiện, thực hiện tắt Khung ngay trong 1-2s (nhấn nút x trên khung) để cancel payment và chờ cho popup chạy hết
  //về lại trang thyanh toán
  cy.contains(`Not Paid`).should('be.visible');
});

//TC-PP-011 Payment Process for buying 1 product (with invalid credentials)
it('TC-PP-011 Payment Process for buying 1 product (with invalid credentials)', () => {
  cy.login(initialEmail, validPassword);
  cy.addToCart(airpods.name);
  cy.get('a.navbar-brand').click();
  cy.addToCart(iphone.name);

  // Cuộn đến nút "Proceed to Checkout" và nhấp
  cy.get('button.btn.btn-primary')
    .contains('Proceed To Checkout')
    .scrollIntoView()
    .then(($btn) => {
      if ($btn.is(':visible')) {
        cy.wrap($btn).click(); // Nhấp vào nút nếu nó hiển thị
      } else {
        cy.log('Nút "Proceed To Checkout" không tìm thấy.'); // Ghi log nếu nút không tìm thấy
        throw new Error('Nút "Proceed To Checkout" không tìm thấy.');
      }
    });

  // Kiểm tra URL
  cy.url().should('include', '/shipping');

  // Điền thông tin giao hàng
  cy.get('#address').type('84 Nha cua Thu Ha'); // Điền địa chỉ
  cy.get('#city').type('Ho Chi Minh'); // Điền thành phố
  cy.get('#postalCode').type('78'); // Điền mã bưu điện
  cy.get('#country').type('Vietnam'); // Điền quốc gia

  // Nhấn nút "Continue"
  cy.get('button.btn.btn-primary').contains('Continue').click();

  // Kiểm tra URL để xác nhận chuyển tiếp đến trang thanh toán
  cy.url().should('include', '/payment');

  // Xác nhận thanh toán PayPal
  cy.get('button.btn.btn-primary').contains('Continue').should('be.visible');
  cy.get('button.btn.btn-primary').contains('Continue').click();

  // Kiểm tra nút "Place Order"
  cy.get('button.btn.btn-primary')
    .contains('Place Order')
    .should('be.visible')
    .click();

  //biến lưu lại ID đơn hàng
  let orderId; // Khai báo biến để lưu mã đơn hàng
  cy.get('h1')
    .invoke('text')
    .then((text) => {
      orderId = text.trim().split(' ')[1]; // Tách mã đơn hàng từ chuỗi
      cy.log(`Mã đơn hàng: ${orderId}`); // Ghi log mã đơn hàng ra console
    });
  cy.getPayPalButton().click();
  //khúc này tự đăng nhập thủ công
  cy.wait(20000); //Khung đăng nhập Paypal xuất hiện, thực hiện logout (nếu cần) và nhập vào invalid credentials Paypal, verify thông báo lỗi và cancel
  //về lại trang thanh toán
  cy.contains(`Not Paid`).should('be.visible');
});
