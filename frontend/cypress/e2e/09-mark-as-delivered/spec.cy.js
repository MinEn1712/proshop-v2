import { login } from '../helper';

describe('Mark As Delivered', () => {
  it('Should display tick icon for delivered orders', () => {
    login('john@email.com', '123456');
    cy.get('a#username').click();
    cy.get('a.dropdown-item[href="/profile"]').click();

    // Ensure there are orders to display
    cy.get('table tbody tr').should('have.length.greaterThan', 0);

    // Check if the first order is marked as delivered
    cy.get('table tbody tr')
      .first()
      .find('td')
      .eq(4)
      .invoke('text')
      .should('match', /^\d{4}-\d{2}-\d{2}$/); // Match YYYY-MM-DD format
  });

  it('Should display non-date values for unpaid orders in both 4th and 5th columns', () => {
    login('john@email.com', '123456');
    cy.get('a#username').click();
    cy.get('a.dropdown-item[href="/profile"]').click();

    // Ensure there are orders to display
    cy.get('table tbody tr')
      .first()
      .find('td')
      .eq(3)
      .invoke('text')
      .should('not.match', /^\d{4}-\d{2}-\d{2}$/); // Do not match YYYY-MM-DD format

    // Check if the 5th column is not a date
    cy.get('table tbody tr')
      .first()
      .find('td')
      .eq(4)
      .invoke('text')
      .should('not.match', /^\d{4}-\d{2}-\d{2}$/); // Do not match YYYY-MM-DD format
  });

  it('Should not allow changing delivery status for delivered orders', () => {
    login('admin@email.com', '123456');
    cy.get('a#username').click();
    cy.get('a#adminmenu').click();
    cy.get('a.dropdown-item[href="/admin/orderlist"]').click();
    cy.get('a').contains('Details').should('be.visible').click();
    cy.get('button.btn.btn-block.btn.btn-primary')
      .contains('Mark As Delivered')
      .click();
    cy.get('button.btn.btn-block.btn.btn-primary').should('not.exist');
  });

  it('Should allow admin to mark order as delivered', () => {
    login('admin@email.com', '123456');
    cy.get('a#username').click();
    cy.get('a#adminmenu').click();
    cy.get('a.dropdown-item[href="/admin/orderlist"]').click();
    cy.get('a').contains('Details').should('be.visible').click();
    cy.get('button.btn.btn-block.btn.btn-primary')
      .contains('Mark As Delivered')
      .click();
    cy.get('div[role="alert"]').should('not.contain', 'Not Delivered');
  });

  it('Should not allow regular users to mark orders as delivered', () => {
    login('john@email.com', '123456');
    cy.get('a#username').click();
    cy.get('a.dropdown-item[href="/profile"]').click();
    cy.get('a').contains('Mark As Delivered').should('not.be.visible');
  });
});
