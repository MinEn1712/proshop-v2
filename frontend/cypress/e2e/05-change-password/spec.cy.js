/* eslint-disable no-undef */
//Trước khi chạy test file này phải đổi mật khẩu của user về ban đầu (123456)

import { confirmChangePassword, login, registration } from '../helper';

const validPassword = 'N3wP@ss12e!';
const email = 'quynhdao@gmail.com';

beforeEach(() => {
  cy.visit('http://localhost:3000');
});

describe('Change Password', () => {
  it('verify changing password successfully', () => {
    registration('Quynh', 'quynhdao@gmail.com', '123456', '123456');
    login(email, '123456');
    confirmChangePassword(validPassword, validPassword);
    cy.contains('div', 'Profile updated successfully').should('be.visible');
  });

  it('verify sign in with new password', () => {
    login(email, validPassword);
  });

  it('Verify changing password with password length less than 8 characters', () => {
    login(email, validPassword);
    confirmChangePassword('New12!', 'New12!');
    cy.contains('div', 'Invalid password').should('be.visible');
  });

  it('Verify changing password with mismatched new password and confirmation password', () => {
    login(email, 'New12!');
    confirmChangePassword('NewPass12!', 'NewPass@@12!');
    cy.contains('div', 'Passwords do not match').should('be.visible');
  });

  it('Verify changing password with password reuse', () => {
    login(email, 'New12!');
    confirmChangePassword(validPassword, validPassword);
    cy.contains('div', 'Password has been used').should('be.visible');
  });

  it('Verify changing password with password missing uppercase letter', () => {
    login(email, validPassword);
    confirmChangePassword('mynewpw846!', 'mynewpw846!');
    cy.contains('div', 'Invalid password').should('be.visible');
  });

  it('Verify changing password with password missing numbers', () => {
    login(email, 'mynewpw846!');
    confirmChangePassword('DoeJane!', 'DoeJane!');
    cy.contains('div', 'Invalid password').should('be.visible');
  });

  it('Verify changing password with password missing lowercase letter', () => {
    login(email, 'DoeJane!');
    confirmChangePassword('DOEJ284!', 'DOEJ284!');
    cy.contains('div', 'Invalid password').should('be.visible');
  });

  it('Verify changing password with password missing special character', () => {
    login(email, 'DOEJ284!');
    confirmChangePassword('DoeJ837', 'DoeJ837');
    cy.contains('div', 'Invalid password').should('be.visible');
  });

  it('Verify changing password with password has sequential characters', () => {
    login(email, 'DoeJ837');
    confirmChangePassword('Abcd1234!', 'Abcd1234!');
    cy.contains('div', 'Invalid password').should('be.visible');
  });

  it('Verify changing password with password has repeated characters', () => {
    login(email, 'Abcd1234!');
    confirmChangePassword('Pass1111!', 'Pass1111!');
    cy.contains('div', 'Invalid password').should('be.visible');
  });

  it('Verify changing password with password contains user information (user name)', () => {
    login(email, 'Pass1111!');
    confirmChangePassword('QuynhDao1936!', 'QuynhDao1936!');
    cy.contains('div', 'Invalid password').should('be.visible');
  });

  it('Verify changing password with password contains user email', () => {
    login(email, 'QuynhDao1936!');
    confirmChangePassword('QuynhDao@gmail.com1936!', 'QuynhDao@gmail.com1936!');
    cy.contains('div', 'Invalid password').should('be.visible');
  });

  it('Verify changing password with common password', () => {
    login(email, 'QuynhDao@gmail.com1936!');
    confirmChangePassword('Password1!', 'Password1!');
    cy.contains('div', 'Invalid password').should('be.visible');
  });

  it('Verify canceling password change process', () => {
    login(email, 'Password1!');
    confirmChangePassword(validPassword, validPassword);
    cy.get('.navbar-brand').click();
    cy.contains('div', 'Profile updated successfully').should('not.be.visible');
  });
});
