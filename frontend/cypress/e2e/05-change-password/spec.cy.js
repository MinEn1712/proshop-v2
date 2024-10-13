/* eslint-disable no-undef */

import {
  confirmPassword,
  login
} from '../helper';

const validPassword = 'N3wP@ss12e!';
const email = 'jane@email.com'

beforeEach(() => {
  cy.visit('http://localhost:3000');
});

describe('Change Password', () => {
  it('verify changing password successfully', () => {
    login(email, '123456')
    confirmPassword(validPassword, validPassword)
    cy.contains('div', 'Profile updated successfully').should('be.visible');
  });

  it('verify sign in with new password', () => {
    login(email, validPassword);
  });

  it('Verify changing password with password length less than 8 characters', () => {
    login(email, validPassword)
    confirmPassword('New12!', 'New12!');
    cy.contains('div', 'Invalid password').should('be.visible');
  });

  it('Verify changing password with mismatched new password and confirmation password', () => {
    login(email, 'New12!');
    confirmPassword('NewPass12!', 'NewPass@@12!')
    cy.contains('div', 'Passwords do not match').should('be.visible');
  });

  it('Verify changing password with password reuse', () => {
    login(email, 'New12!')
    confirmPassword(validPassword, validPassword)
    cy.contains('div', 'Password has been used').should('be.visible');
  });

  it('Verify changing password with password missing uppercase letter', () => {
    login(email, validPassword)
    confirmPassword('mynewpw846!', 'mynewpw846!')
    cy.contains('div', 'Invalid password').should('be.visible');
  });

  it('Verify changing password with password missing numbers', () => {
    login(email, 'mynewpw846!')
    confirmPassword('DoeJane!', 'DoeJane!');
    cy.contains('div', 'Invalid password').should('be.visible');
  });

  it('Verify changing password with password missing lowercase letter', () => {
    login(email, 'DoeJane!')
    confirmPassword('DOEJ284!', 'DOEJ284!');
    cy.contains('div', 'Invalid password').should('be.visible');
  });

  it('Verify changing password with password missing special character', () => {
    login(email, 'DOEJ284!')
    confirmPassword('DoeJ837', 'DoeJ837');
    cy.contains('div', 'Invalid password').should('be.visible');
  });

  it('Verify changing password with password has sequential characters', () => {
    login(email, 'DoeJ837')
    confirmPassword('Abcd1234!', 'Abcd1234!');
    cy.contains('div', 'Invalid password').should('be.visible');
  });

  it('Verify changing password with password has repeated characters', () => {
    login(email, 'Abcd1234!')
    confirmPassword('Pass1111!', 'Pass1111!');
    cy.contains('div', 'Invalid password').should('be.visible');
  });

  it('Verify changing password with password contains user information (user name)', () => {
    login(email, 'Pass1111!')
    confirmPassword('JaneDoe1936!', 'JaneDoe1936!');
    cy.contains('div', 'Invalid password').should('be.visible');
  });

  it('Verify changing password with password contains user email', () => {
    login(email, 'Pass1111!')
    confirmPassword('JaneDoe1936!', 'JaneDoe1936!');
    cy.contains('div', 'Invalid password').should('be.visible');
  });
  
  it('Verify changing password with common password', () => {
    login(email, 'JaneDoe1936!')
    confirmPassword('Password1!', 'Password1!');
    cy.contains('div', 'Invalid password').should('be.visible');
  });

  it('Verify canceling password change process', () => {
    login(email, 'Password1!')
    confirmPassword(validPassword, validPassword);
    cy.get('.navbar-brand').click()
    cy.contains('div', 'Profile updated successfully').should('not.be.visible')
  });

  
});
