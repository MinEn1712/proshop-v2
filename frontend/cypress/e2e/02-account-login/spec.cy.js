Cypress.Commands.add('login', (email, password) => {
  cy.get('input#email').type(email);
  cy.get('input#password').type(password);
  cy.get('button[type="submit"]').contains('Sign In').click();
});

beforeEach(() => {
  cy.visit('http://localhost:3000/login');
});

describe('verify account login page', () => {
  it('should login successfully', () => {
    cy.login('john@email.com', '123456');
    cy.url().should('equal', 'http://localhost:3000/');
  });

  it('should not login successfully with a non-existing account', () => {
    cy.login('abc123@email.com', '123456');
    cy.get('.Toastify__toast').should('have.text', 'Invalid email or password');
  });

  it('should show error message when email does not contain @ symbol', () => {
    cy.login('johnemail.com', '123456');
    cy.get('input#email')
      .invoke('prop', 'validationMessage')
      .should(
        'equal',
        "Please include an '@' in the email address. 'johnemail.com' is missing an '@'."
      );
  });

  it('should show error message when email does not contain a domain after @ symbol', () => {
    cy.login('john@', '123456');
    cy.get('input#email')
      .invoke('prop', 'validationMessage')
      .should(
        'equal',
        "Please enter a part following '@'. 'john@' is incomplete."
      );
  });

  it('should show error message when email does not contain at least a dot "."', () => {
    cy.login('john@email', '123456');
    cy.get('input#email')
      .invoke('prop', 'validationMessage')
      .should(
        'equal',
        "A part following '.' should not be empty. 'user@examplecom' is incomplete."
      );
  });

  it('should show error message when email contains spaces', () => {
    cy.get('input#email').focus();
    cy.realType('john @email.com');
    cy.get('input#password').type('123456');
    cy.get('button[type="submit"]').contains('Sign In').click();
    cy.get('input#email')
      .invoke('prop', 'validationMessage')
      .should(
        'equal',
        "A part followed by '@' should not contain the symbol ' '."
      );
  });

  it('should show error message when email contains special characters', () => {
    cy.login('john!#$@email.com', '123456');
    cy.get('input#email')
      .invoke('prop', 'validationMessage')
      .should('include', "A part following '@' should not contain the symbol");
  });

  it('should show error message when email is empty', () => {
    cy.get('input#password').type('123456');
    cy.get('button[type="submit"]').contains('Sign In').click();
    cy.get('.Toastify__toast').should('have.text', 'Invalid email or password');
  });

  it('should show error message when password is incorrect', () => {
    cy.login('john@email.com', '1234567');
    cy.get('.Toastify__toast').should('have.text', 'Invalid email or password');
  });

  it('should show error message when password is empty', () => {
    cy.get('input#email').type('john@email.com');
    cy.get('button[type="submit"]').contains('Sign In').click();
    cy.get('.Toastify__toast').should('have.text', 'Invalid email or password');
  });

  it('should navigate to Register page from Sign In page', () => {
    cy.get('a').contains('Register').click();
    cy.url().should('include', '/register');
    cy.get('a').contains('Login').click();
    cy.url().should('include', '/login');
  });

  it('should logout successfully', () => {
    cy.login('john@email.com', '123456');
    cy.get('a#username').click();
    cy.get('a').contains('Logout').click();
    cy.url().should('include', '/login');
  });
});
