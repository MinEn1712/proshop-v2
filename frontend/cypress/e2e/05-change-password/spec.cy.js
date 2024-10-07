/* eslint-disable no-undef */
const validPassword = 'N3wP@ss12e!';
const email = 'jane@email.com'

Cypress.Commands.add('login', (email, password) => {
  cy.visit('http://localhost:3000/login');
  cy.get('#email').type(email);
  cy.get('#password').type(password);
  cy.get('button').contains('Sign In').click();
});

Cypress.Commands.add('confirmPassword', (password, confirmPassword) => {
  cy.wait(1000);
  cy.get('a#username').click();
  cy.get('a.dropdown-item[href="/profile"]').click();
  cy.get('#password').type(password);
  if (confirmPassword !== undefined) {
    cy.get('#confirmPassword').type(confirmPassword);
  }
  cy.contains('Update').click();
});

beforeEach(() => {
  cy.visit('http://localhost:3000');
});

describe('Change Password', () => {
  it('verify changing password successfully', () => {
    cy.login(email, '123456')
    cy.confirmPassword(validPassword, validPassword)
    cy.contains('div', 'Profile updated successfully').should('be.visible');
  });

  it('verify sign in with new password', () => {
    cy.login(email, validPassword);
  });

  it('Verify changing password with password length less than 8 characters', () => {
    cy.login(email, validPassword)
    cy.confirmPassword('New12!', 'New12!');
    cy.contains('div', 'Invalid password').should('be.visible');
  });

  it('Verify changing password with mismatched new password and confirmation password', () => {
    cy.login(email, 'New12!');
    cy.confirmPassword('NewPass12!', 'NewPass@@12!')
    cy.contains('div', 'Passwords do not match').should('be.visible');
  });

  it('Verify changing password with password reuse', () => {
    cy.login(email, 'New12!')
    cy.confirmPassword(validPassword, validPassword)
    cy.contains('div', 'Password has been used').should('be.visible');
  });

  it('Verify changing password with password missing uppercase letter', () => {
    cy.login(email, validPassword)
    cy.confirmPassword('mynewpw846!', 'mynewpw846!')
    cy.contains('div', 'Invalid password').should('be.visible');
  });

  it('Verify changing password with password missing numbers', () => {
    cy.login(email, 'mynewpw846!')
    cy.confirmPassword('DoeJane!', 'DoeJane!');
    cy.contains('div', 'Invalid password').should('be.visible');
  });

  it('Verify changing password with password missing lowercase letter', () => {
    cy.login(email, 'DoeJane!')
    cy.confirmPassword('DOEJ284!', 'DOEJ284!');
    cy.contains('div', 'Invalid password').should('be.visible');
  });

  it('Verify changing password with password missing special character', () => {
    cy.login(email, 'DOEJ284!')
    cy.confirmPassword('DoeJ837', 'DoeJ837');
    cy.contains('div', 'Invalid password').should('be.visible');
  });

  it('Verify changing password with password has sequential characters', () => {
    cy.login(email, 'DoeJ837')
    cy.confirmPassword('Abcd1234!', 'Abcd1234!');
    cy.contains('div', 'Invalid password').should('be.visible');
  });

  it('Verify changing password with password has repeated characters', () => {
    cy.login(email, 'Abcd1234!')
    cy.confirmPassword('Pass1111!', 'Pass1111!');
    cy.contains('div', 'Invalid password').should('be.visible');
  });

  it('Verify changing password with password contains user information (user name)', () => {
    cy.login(email, 'Pass1111!')
    cy.confirmPassword('JaneDoe1936!', 'JaneDoe1936!');
    cy.contains('div', 'Invalid password').should('be.visible');
  });

  it('Verify changing password with password contains user email', () => {
    cy.login(email, 'Pass1111!')
    cy.confirmPassword('JaneDoe1936!', 'JaneDoe1936!');
    cy.contains('div', 'Invalid password').should('be.visible');
  });
  
  it('Verify changing password with common password', () => {
    cy.login(email, 'JaneDoe1936!')
    cy.confirmPassword('Password1!', 'Password1!');
    cy.contains('div', 'Invalid password').should('be.visible');
  });

  it('Verify canceling password change process', () => {
    cy.login(email, 'Password1!')
    cy.confirmPassword(validPassword, validPassword);
    cy.get('.navbar-brand').click()
    cy.contains('div', 'Profile updated successfully').should('not.be.visible')
  });

  
  it('Verify blank new password field', () => {
    cy.login(email, validPassword)
    cy.confirmPassword(validPassword);
    cy.get('.navbar-brand').click()
    cy.contains('div', 'Confirm password can not be blank').should('be.visible')
  });

  
});
