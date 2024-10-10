/* eslint-disable no-undef */

//Trước khi chạy test file này cần xóa hết đơn hàng
Cypress.Commands.add('login', (email, password) => {
  cy.visit('http://localhost:3000/login');
  cy.get('#email').type(email);
  cy.get('#password').type(password);
  cy.get('button').contains('Sign In').click();
});

Cypress.Commands.add('viewOrderHistory', () => {
  cy.get('a#username').click();
  cy.get('a.dropdown-item[href="/profile"]').click();
  cy.wait(1000);
  cy.get('table, tbody, tr').should('not.be.empty');
});

Cypress.Commands.add('placeAnOrder', () => {
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
});

beforeEach(() => {
  cy.visit('http://localhost:3000');
});

it('Verify view order history with no orders in order history', () => {
  cy.login('john@email.com', '123456');
  cy.get('a#username').click();
  cy.get('a.dropdown-item[href="/profile"]').click();
  cy.get('tbody').should('be.empty');
});

it('Verify view existing and past orders', () => {
  cy.login('john@email.com', '123456');
  cy.placeAnOrder();
  cy.viewOrderHistory();
});

it('Verify viewing order history with delivery status and payment status', () => {
  cy.login('john@email.com', '123456'); // Pre-condition: User is logged in
  cy.get('a#username').click();
  cy.get('a.dropdown-item[href="/profile"]').click();
  // Check delivery status for each order
  cy.get('tbody tr')
    .first()
    .within(() => {
      cy.get('svg').should('have.length', 2);
    });
});

it('Verify view order detail for existing order and past order', () => {
  cy.login('john@email.com', '123456'); // Pre-condition: User is logged in
  cy.get('a#username').click();
  cy.get('a.dropdown-item[href="/profile"]').click();
  cy.get('a').contains('Details').should('be.visible'); // Click on details button
  // Verify order details
  cy.get('tbody tr')
    .first()
    .find('td')
    .first()
    .invoke('text')
    .then((orderId) => {
      cy.request({
        method: 'GET',
        url: `http://localhost:3000/api/orders/${orderId}`,
        headers: {
          cookie:
            'jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NmYzZTM5NDg4NGI4MmJkZWZhZjE4YmEiLCJpYXQiOjE3MjgzODg5MjYsImV4cCI6MTczMDk4MDkyNn0.RHE3j2MXp427c8IFBRTDETNumJ3xoCcElUcKlsOA3Ts',
        },
      }).then((response) => {
        // Kiểm tra status trả về có thành công không
        expect(response.status).to.eq(200);

        // Lưu dữ liệu API nhận được
        const orderData = response.body;
        const productId = orderData.orderItems[0].product;
        cy.log(orderData);

        // Truy cập trang có thông tin order trên giao diện
        cy.visit(`/order/${orderId}`);

        // Kiểm tra các trường trong HTML có khớp với dữ liệu API không
        cy.get('.list-group-item')
          .first()
          .within(() => {
            // Kiểm tra tên
            cy.contains('p', 'Name:').should('contain', orderData.user.name);

            // Kiểm tra email
            cy.contains('p', 'Email:').within(() => {
              cy.get('a').should('contain', orderData.user.email);
            });

            // Kiểm tra địa chỉ
            cy.contains('p', 'Address:').should(
              'contain',
              `${orderData.shippingAddress.address}, ${orderData.shippingAddress.city} ${orderData.shippingAddress.postalCode}, ${orderData.shippingAddress.country}`
            );

            //Kiểm tra trạng thái giao hàng
            if (orderData.isDelivered) {
              cy.get('.alert').should('contain', 'Delivered');
            } else {
              cy.get('.alert').should('contain', 'Not Delivered');
            }

            // Kiểm tra trạng thái thanh toán
            // if (orderData.isPaid) {
            //   cy.get('.alert').should(
            //     'contain',
            //     `Paid on ${new Date(orderData.paidAt).toLocaleDateString()}`
            //   );
            // } else {
            //   cy.get('div[role="alert"]').contains('Not Paid').should('exist').and('be.visible');
            // }
          });

        // Kiểm tra danh sách sản phẩm trong đơn hàng
        // orderData.orderItems.forEach((item, index) => {
        //   cy.get('list-group-item')
        //     .third()
        //     .within(() => {
        //       cy.contains('a', item.name).should('exist');
        //       cy.contains(
        //         '.col-md-4',
        //         `${item.qty} x $${item.price} = $${(item.qty * item.price).toFixed(
        //           2
        //         )}`
        //       ).should('exist');
        //     });
        // });
        cy.log(JSON.stringify(orderData));
        //Kiểm tra tên sản phẩm
        cy.get(`a[href="/product/${productId}"]`).should(
          'have.text',
          orderData.orderItems[0].name
        );

        // Kiểm tra tổng giá trị đơn hàng
        // Verify order summary details
        cy.get('.list-group-item').contains('Items').should('be.visible');

        cy.get('.list-group-item').contains('Tax').should('be.visible');
        cy.get('.list-group-item').contains('Total').should('be.visible');

        cy.get('.list-group-item')
          .contains('Shipping')
          .parent()
          .then(($shipping) => {
            cy.log($shipping.html()); // Log the HTML of the shipping item
          });

        // Verify the values match the orderData
        cy.get('.list-group-item')
          .contains('Items')
          .siblings()
          .contains(`$${orderData.itemsPrice.toFixed(2)}`)
          .should('be.visible');
        cy.contains(`$${orderData.shippingPrice}`).should('be.visible');
        cy.get('.list-group-item')
          .contains('Tax')
          .siblings()
          .contains(`$${orderData.taxPrice}`)
          .should('be.visible');

        cy.get('.list-group-item')
          .contains('Total')
          .siblings()
          .contains(`$${orderData.totalPrice}`)
          .should('be.visible');
      });
    });
});
