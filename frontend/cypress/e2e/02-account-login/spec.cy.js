beforeEach(() => {
  cy.visit('http://localhost:3000/login');
});

describe('verify successful login', () => {
  it('should login successfully', () => {
    cy.get('input#email').type('john@email.com');
    cy.get('input#password').type('123456');
    cy.get('button[type="submit"]').contains('Sign In').click();
  });
});

describe('verify sign in with a non-existing account', () => {
  it('should not login successfully', () => {
    cy.get('input#email').type('abc123@email.com');
    cy.get('input#password').type('123456');
    cy.get('button[type="submit"]').contains('Sign In').click();
    cy.get('.Toastify__toast').should('have.text', 'Invalid email or password');
  });
});

describe('verify invalid email (does not contain @ symbol)', () => {
  it('should not login successfully', () => {
    cy.get('input#email').type('johnemail.com');
    cy.get('input#password').type('123456');
    cy.get('button[type="submit"]').contains('Sign In').click();
    cy.get('input#email')
      .invoke('prop', 'validationMessage')
      .should(
        'equal',
        "Please include an '@' in the email address. 'johnemail.com' is missing an '@'."
      );
  });
});

describe('verify invalid email (does not contain a domain after @ symbol)', () => {
  it('should not login successfully', () => {
    cy.get('input#email').type('john@');
    cy.get('input#password').type('123456');
    cy.get('button[type="submit"]').contains('Sign In').click();
    cy.get('input#email')
      .invoke('prop', 'validationMessage')
      .should(
        'equal',
        "Please enter a part following '@'. 'john@' is incomplete."
      );
  });
});

describe("verify invalid email (does not contain at least a dot '.')", () => {
  it('should not login successfully', () => {
    cy.get('input#email').type('john@email');
    cy.get('input#password').type('123456');
    cy.get('button[type="submit"]').contains('Sign In').click();
    cy.get('.Toastify__toast').should('have.text', 'Invalid email or password');
  });
});

describe('verify invalid email (contains spaces)', () => {
  it('should not login successfully', () => {
    cy.get('input#email').type('john @email.com');
    cy.get('input#password').type('123456');
    cy.get('button[type="submit"]').contains('Sign In').click();
    cy.get('input#email')
      .invoke('prop', 'validationMessage')
      .should(
        'equal',
        "A part followed by '@' should not contain the symbol ' '."
      );
  });
});

describe('verify invalid email (contains special characters)', () => {
  it('should not login successfully', () => {
    cy.get('input#email').type('john!#$@email.com');
    cy.get('input#password').type('123456');
    cy.get('button[type="submit"]').contains('Sign In').click();
    cy.get('.Toastify__toast').should('have.text', 'Invalid email or password');
  });
});

describe('verify invalid email (empty email)', () => {
  it('should not login successfully', () => {
    cy.get('input#password').type('123456');
    cy.get('button[type="submit"]').contains('Sign In').click();
    cy.get('.Toastify__toast').should('have.text', 'Invalid email or password');
  });
});

describe('verify incorrect password', () => {
  it('should not login successfully', () => {
    cy.get('input#email').type('john@email.com');
    cy.get('input#password').type('1234567');
    cy.get('button[type="submit"]').contains('Sign In').click();
    cy.get('.Toastify__toast').should('have.text', 'Invalid email or password');
  });
});

describe('verify invalid password (empty password)', () => {
  it('should not login successfully', () => {
    cy.get('input#email').type('john@email.com');
    cy.get('button[type="submit"]').contains('Sign In').click();
    cy.get('.Toastify__toast').should('have.text', 'Invalid email or password');
  });
});

describe('verify navigate from Register page to Sign In page', () => {
  it('should navigate to Sign In page', () => {
    cy.get('a').contains('Register').click();
    cy.url().should('include', '/register');
    cy.get('a').contains('Login').click();
    cy.url().should('include', '/login');
  });
});

describe('verify logout', () => {
  it('should log out successfully', () => {
    cy.get('input#email').type('john@email.com');
    cy.get('input#password').type('123456');
    cy.get('button[type="submit"]').contains('Sign In').click();
    cy.get('a#username').click();
    cy.get('a').contains('Logout').click();
    cy.url().should('include', '/login');
  });
});
