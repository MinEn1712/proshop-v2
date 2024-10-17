import {
  login,
  placeAnOrderToView,
  registration,
  viewOrderHistory,
} from '../helper';

const email = 'dao@gmail.com';
let cookieValue = '';
beforeEach(() => {
  cy.visit('http://localhost:3000');
});
describe('View order history', () => {
  it('Verify view order history with no orders in order history', () => {
  
    //Call api log in to get cookie
    cy.request({
      method: 'POST',
      url: 'http://localhost:5000/api/users/',
      body: {
        name: 'Dao',
        email: email,
        password: '123456',
      },
    }).then((response) => {
      const setCookieHeader = response.headers['set-cookie'];
    
      if (setCookieHeader && setCookieHeader.length > 0) {
        // Extract the JWT part from the cookie string
        const jwtCookie = setCookieHeader[0];
         cookieValue = jwtCookie.split(';')[0]; // Get only the part before the first semicolon
        cy.log('Captured JWT:', cookieValue);
      } else {
        cy.log('Set-Cookie header is missing or empty.');
      }
      
    });
    login(email, 123456)
    cy.get('a[href="/login"]').click();
    cy.get('a#username').click();
    cy.get('a.dropdown-item[href="/profile"]').click();
    cy.get('tbody').should('be.empty');
    
  });
  
  it('Verify view existing and past orders', () => {
    login(email, '123456');
    placeAnOrderToView();
    viewOrderHistory();
  });
  
  it('Verify viewing order history with delivery status and payment status', () => {
    login(email, '123456'); // Pre-condition: User is logged in
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
    login(email, '123456'); // Pre-condition: User is logged in
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
            cookie: cookieValue,
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
            });
  
          // Kiểm tra trạng thái thanh toán
          cy.get('.list-group-item')
            .eq(1)
            .within(() => {
              cy.contains('h2', 'Payment Method');
              cy.get('p').eq(0).should('have.text', 'Method: PayPal');
              cy.contains('div[role="alert"]', 'Not Paid');
            });
  
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
});


