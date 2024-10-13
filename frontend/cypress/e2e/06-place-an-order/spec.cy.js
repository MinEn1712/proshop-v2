import {
  addToCart,
  fillInShipping,
  login,
  verifyShoppingCart,
} from '../helper';

describe('Place Order Function', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/');
  });

  it('Verify successfull adding products to cart', () => {
    login('test@gmail.com', '123456');

    cy.get('.row')
      .find('a[href="/product/66f39d68d3e4433c7c7fc952"]')
      .first()
      .click();
    cy.get('div.row .col select.form-control').select('5');
    cy.contains('button', 'Add To Cart').click();
    cy.get('span.badge.rounded-pill.bg-success').should('exist');
    cy.get('span.badge.rounded-pill.bg-success').should('have.text', '5');
  });

  it('Verify unsuccessful adding products to cart when Qty equal 0', () => {
    login('test@gmail.com', '123456');

    cy.get('.row')
      .find('a[href="/product/66f39d68d3e4433c7c7fc952"]')
      .first()
      .click();
    cy.get('div.row .col select.form-control')
      .find('option[value="0"]')
      .should('not.exist');
  });

  // use order that has zero countinstock
  it('Verify can not add products to cart when status is not in stock', () => {
    login('test@gmail.com', '123456');
    cy.get('.row')
      .find('a[href="/product/66f39d68d3e4433c7c7fc957"]')
      .first()
      .click();
    cy.contains('button', 'Add To Cart').should('be.disabled');
    cy.get('div.row .col select.form-control').should('not.be.exist');
  });

  it('Verify seeing products in the cart', () => {
    login('test@gmail.com', '123456');
    cy.wait(1000);
    addToCart('/product/66f39d68d3e4433c7c7fc955', '5');
    addToCart('/product/66f39d68d3e4433c7c7fc952', '5');

    cy.wait(1000);
    cy.get('a[href="/cart"]').click();
    const price = [];

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
          totalPrice += $el * 5;
        });
        cy.log(totalPrice);
      });
    cy.get('.col-md-4')
      .find('.list-group-item')
      .eq(0)
      .invoke('text')
      .then((text) => {
        const price = text
          .match(/\$([0-9,]+(\.[0-9]{2})?)/)[0]
          .replace('$', '');
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
        expect(quantity).to.equal('10');
      });
  });

  it('Verify changing successfully the number of quantity of the products in cart', () => {
    login('test@gmail.com', '123456');
    cy.wait(1000);
    addToCart('/product/66f39d68d3e4433c7c7fc955', '5');
    addToCart('/product/66f39d68d3e4433c7c7fc952', '5');

    cy.wait(1000);
    cy.get('a[href="/cart"]').click();
    cy.get('.col-md-8')
      .find('.list-group-item')
      .eq(0)
      .within(() => {
        cy.get('.col-md-2').eq(2).find('.form-control').select('8');
      });

    cy.reload();
    cy.wait(1000);
    const qty = [8, 5];
    verifyShoppingCart('13', qty);
  });

  it('Verify changing unsuccessfully the number of quanity of the products in cart when it is 0', () => {
    login('test@gmail.com', '123456');
    cy.wait(1000);
    addToCart('/product/66f39d68d3e4433c7c7fc955', '5');
    addToCart('/product/66f39d68d3e4433c7c7fc952', '5');

    cy.wait(1000);
    cy.get('a[href="/cart"]').click();
    cy.get('.col-md-8')
      .find('.list-group-item')
      .eq(0)
      .within(() => {
        cy.get('.col-md-2')
          .eq(2)
          .find('.form-control')
          .find('option[value="0"]')
          .should('not.exist');
      });
  });

  it('Verify deleting the products out of the shopping cart', () => {
    login('test@gmail.com', '123456');
    cy.wait(1000);
    addToCart('/product/66f39d68d3e4433c7c7fc955', '5');
    addToCart('/product/66f39d68d3e4433c7c7fc952', '5');

    cy.wait(1000);
    cy.get('a[href="/cart"]').click();
    cy.get('.col-md-8')
      .find('.list-group-item')
      .eq(0)
      .within(() => {
        cy.get('.col-md-2').eq(3).click();
      });

    verifyShoppingCart('5', [5, 5]);
  });

  it('Verify direct successfully to the order summary page', () => {
    login('test@gmail.com', '123456');
    cy.wait(1000);
    addToCart('/product/66f39d68d3e4433c7c7fc955', '5');
    addToCart('/product/66f39d68d3e4433c7c7fc952', '5');

    cy.wait(1000);
    cy.get('a[href="/cart"]').click();
    cy.get('.col-md-4')
      .find('.list-group-item')
      .eq(1)
      .within(() => {
        cy.contains('button', 'Proceed To Checkout').click();
      });

    fillInShipping('123 NVC', 'TPHCM', '01000', 'VN');
    cy.contains('button[type="submit"]', 'Continue').click();

    let itemPrice = 0;
    let tax = 0;
    cy.get('.card').within(() => {
      cy.get('.list-group-item')
        .contains('Items')
        .parent()
        .find('.col')
        .eq(1)
        .invoke('text')
        .then((itemsValue) => {
          itemPrice = itemsValue.substring(1, itemsValue.length);
          expect(itemPrice).to.equal('2449.90');
        });

      cy.get('.list-group-item')
        .contains('Tax')
        .parent()
        .find('.col')
        .eq(1)
        .invoke('text')
        .then((taxValue) => {
          tax = taxValue.substring(1, taxValue.length);
          cy.log(tax);
        });
      cy.get('.list-group-item')
        .contains('Total')
        .parent()
        .find('.col')
        .eq(1)
        .invoke('text')
        .then((totalValue) => {
          const totalPrice = totalValue.trim().replace('$', '');
          return totalPrice;
        })
        .then((totalPrice) => {
          // cy.log(Number(itemPrice));
          // cy.log((Number(itemPrice) + Number(tax)).toFixed(2));
          expect(totalPrice).to.equal(
            (Number(tax) + Number(itemPrice)).toFixed(2)
          );
        });
    });
    cy.get('.row')
      .find('.col-md-8')
      .eq(0)
      .within(() => {
        cy.get('.list-group-item')
          .eq(0)
          .find('p')
          .invoke('text')
          .then((value) => {
            expect(value).to.equal('Address:123 NVC, TPHCM 01000, VN');
          });
        const listProduct = [
          'Sony Playstation 5',
          'Airpods Wireless Bluetooth Headphones',
        ];
        const listPrice = ['5 x $399.99 = $1999.95', '5 x $89.99 = $449.95'];
        let i = 0;
        cy.get('.list-group-item')
          .eq(2)
          .within(() => {
            cy.get('.row').each(($el) => {
              cy.wrap($el)
                .find('.col')
                .invoke('text')
                .then((value) => {
                  expect(value).to.equal(listProduct[i]);
                  i++;
                });
              i = 0;
              cy.wrap($el)
                .find('.col-md-4')
                .invoke('text')
                .then((value) => {
                  expect(value).to.equal(listPrice[i]);
                  i++;
                });
            });
          });
      });
  });

  it('Verify successfully place order', () => {
    login('test@gmail.com', '123456');
    cy.wait(1000);
    addToCart('/product/66f39d68d3e4433c7c7fc955', '5');
    addToCart('/product/66f39d68d3e4433c7c7fc952', '5');

    cy.wait(1000);
    cy.get('a[href="/cart"]').click();
    cy.get('.col-md-4')
      .find('.list-group-item')
      .eq(1)
      .within(() => {
        cy.contains('button', 'Proceed To Checkout').click();
      });

    fillInShipping('123 NVC', 'TPHCM', '01000', 'VN');
    cy.contains('button[type="submit"]', 'Continue').click();

    let itemPrice = 0;
    let tax = 0;
    cy.get('.card').within(() => {
      cy.get('.list-group-item')
        .contains('Items')
        .parent()
        .find('.col')
        .eq(1)
        .invoke('text')
        .then((itemsValue) => {
          itemPrice = itemsValue.substring(1, itemsValue.length);
          expect(itemPrice).to.equal('2449.90');
        });

      cy.get('.list-group-item')
        .contains('Tax')
        .parent()
        .find('.col')
        .eq(1)
        .invoke('text')
        .then((taxValue) => {
          tax = taxValue.substring(1, taxValue.length);
          cy.log(tax);
        });
      cy.get('.list-group-item')
        .contains('Total')
        .parent()
        .find('.col')
        .eq(1)
        .invoke('text')
        .then((totalValue) => {
          const totalPrice = totalValue.trim().replace('$', '');
          return totalPrice;
        })
        .then((totalPrice) => {
          // cy.log(Number(itemPrice));
          // cy.log((Number(itemPrice) + Number(tax)).toFixed(2));
          expect(totalPrice).to.equal(
            (Number(tax) + Number(itemPrice)).toFixed(2)
          );
        });
    });
    const listProduct = [
      'Sony Playstation 5',
      'Airpods Wireless Bluetooth Headphones',
    ];
    const listPrice = ['5 x $399.99 = $1999.95', '5 x $89.99 = $449.95'];
    cy.get('.row')
      .find('.col-md-8')
      .eq(0)
      .within(() => {
        cy.get('.list-group-item')
          .eq(0)
          .find('p')
          .invoke('text')
          .then((value) => {
            expect(value).to.equal('Address:123 NVC, TPHCM 01000, VN');
          });

        let i = 0;
        cy.get('.list-group-item')
          .eq(2)
          .within(() => {
            cy.get('.row').each(($el) => {
              cy.wrap($el)
                .find('.col')
                .invoke('text')
                .then((value) => {
                  expect(value).to.equal(listProduct[i]);
                });

              cy.wrap($el)
                .find('.col-md-4')
                .invoke('text')
                .then((value) => {
                  expect(value).to.equal(listPrice[i]);
                  i++;
                });
            });
          });
      });
    cy.contains('button', 'Place Order').click();
    cy.get('span.badge.rounded-pill.bg-success').should('not.exist');
    cy.get('h1')
      .invoke('text')
      .then((value) => {
        value = value.substring(0, 5);
        expect(value).to.equal('Order');
      });

    cy.get('.list-group-item')
      .eq(0)
      .within(() => {
        cy.contains('h2', 'Shipping');
        cy.get('p').eq(0).should('have.text', 'Name:  test');
        cy.get('p').eq(1).should('have.text', 'Email:  test@gmail.com');
        cy.get('p')
          .eq(2)
          .should('have.text', 'Address:123 NVC, TPHCM 01000, VN');
        cy.contains('div[role="alert"]', 'Not Delivered');
      });
    cy.get('.list-group-item')
      .eq(1)
      .within(() => {
        cy.contains('h2', 'Payment Method');
        cy.get('p').eq(0).should('have.text', 'Method: PayPal');
        // cy.get('p').eq(1).should('have.text', 'Email:  test@gmail.com')
        // cy.get('p').eq(2).should('have.text', "Address:123 NVC, TPHCM 01000, VN")
        cy.contains('div[role="alert"]', 'Not Paid');
      });
    let i = 0;
    cy.get('.list-group-item')
      .eq(2)
      .within(() => {
        cy.contains('h2', 'Order Items');
        cy.get('.row').each(($el) => {
          cy.wrap($el)
            .find('.col')
            .invoke('text')
            .then((value) => {
              expect(value).to.equal(listProduct[i]);
            });
          cy.wrap($el)
            .find('.col-md-4')
            .invoke('text')
            .then((value) => {
              expect(value).to.equal(listPrice[i]);
              i++;
            });
        });
      });

    itemPrice = 0;
    tax = 0;
    cy.get('.card').within(() => {
      cy.get('.list-group-item')
        .contains('Items')
        .parent()
        .find('.col')
        .eq(1)
        .invoke('text')
        .then((itemsValue) => {
          itemPrice = itemsValue.substring(1, itemsValue.length);
          expect(itemPrice).to.equal('2449.9');
        });

      cy.get('.list-group-item')
        .contains('Tax')
        .parent()
        .find('.col')
        .eq(1)
        .invoke('text')
        .then((taxValue) => {
          tax = taxValue.substring(1, taxValue.length);
          cy.log(tax);
        });
      cy.get('.list-group-item')
        .contains('Total')
        .parent()
        .find('.col')
        .eq(1)
        .invoke('text')
        .then((totalValue) => {
          const totalPrice = totalValue.trim().replace('$', '');
          return totalPrice;
        })
        .then((totalPrice) => {
          // cy.log(Number(itemPrice));
          // cy.log((Number(itemPrice) + Number(tax)).toFixed(2));
          expect(totalPrice).to.equal(
            (Number(tax) + Number(itemPrice)).toFixed(2)
          );
        });
    });
  });

  it('Verify cannot direct to payment method when missing field shipping', () => {
    login('test@gmail.com', '123456');
    cy.wait(1000);
    addToCart('/product/66f39d68d3e4433c7c7fc955', '5');
    addToCart('/product/66f39d68d3e4433c7c7fc952', '5');

    cy.wait(1000);
    cy.get('a[href="/cart"]').click();
    cy.get('.col-md-4')
      .find('.list-group-item')
      .eq(1)
      .within(() => {
        cy.contains('button', 'Proceed To Checkout').click();
      });

    cy.contains('button[type="submit"]', 'Continue').click();
    cy.url().should('eq', 'http://localhost:3000/shipping');
  });

  it('Verify cannot proceed to checkout showed when the cart is empty', () => {
    login('test@gmail.com', '123456');
    cy.wait(1000);
    cy.get('a[href="/cart"]').click();
    cy.get('.col-md-4')
      .find('.list-group-item')
      .eq(1)
      .within(() => {
        cy.contains('button', 'Proceed To Checkout').should('be.disabled');
      });
  });

  it('Verify no products show if the cart is empty', () => {
    login('test@gmail.com', '123456');
    cy.wait(1000);
    cy.get('a[href="/cart"]').click();
    cy.get('div[role="alert"]')
      .should('exist')
      .and('contain.text', 'Your cart is empty');
    cy.get('.card').within(() => {
      cy.get('.list-group-item')
        .eq(0)
        .invoke('text')
        .then((value) => {
          expect(value).to.equal('Subtotal (0) items$0.00');
        });
    });
  });

  it('Verify cart is empty after successfully place order', () => {
    login('test@gmail.com', '123456');
    cy.wait(1000);
    addToCart('/product/66f39d68d3e4433c7c7fc955', '5');
    addToCart('/product/66f39d68d3e4433c7c7fc952', '5');

    cy.wait(1000);
    cy.get('a[href="/cart"]').click();
    cy.get('.col-md-4')
      .find('.list-group-item')
      .eq(1)
      .within(() => {
        cy.contains('button', 'Proceed To Checkout').click();
      });

    fillInShipping('123 NVC', 'TPHCM', '01000', 'VN');
    cy.contains('button[type="submit"]', 'Continue').click();
    cy.contains('button', 'Place Order').click();
    cy.wait(1000);
    cy.get('a[href="/cart"]').click();

    cy.get('div[role="alert"]')
      .should('exist')
      .and('contain.text', 'Your cart is empty');
    cy.get('.card').within(() => {
      cy.get('.list-group-item')
        .eq(0)
        .invoke('text')
        .then((value) => {
          expect(value).to.equal('Subtotal (0) items$0.00');
        });
    });
  });
});
