/* eslint-disable no-undef */
import '../helper';

//user's login data must be original email and password:
const validPassword = '123456';
const initialEmail = 'john@email.com';
const defaultName = 'John Doe';
describe('Edit Profile Functionality', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('TC-EP-001: Update full name with valid input', () => {
    cy.login(initialEmail, validPassword);
    cy.navigateToProfile();
    cy.updateProfile('John New', undefined);
    cy.contains('Profile updated successfully').should('be.visible');
    cy.wait(6); 
    cy.logout();
  });

  it('TC-EP-002: Update email address with valid input', () => {
    cy.login(initialEmail, validPassword);
    cy.navigateToProfile();
    cy.updateProfile(undefined, 'newjohn@email.com'); 
    cy.contains('Profile updated successfully').should('be.visible'); 
    cy.wait(6); 
    cy.logout();
  });


  it('TC-EP-003: Update both full name and email address with valid inputs', () => {
    cy.login('newjohn@email.com', validPassword);
    cy.navigateToProfile();
    cy.updateProfile('John Smith', 'john.smith@example.com');
    cy.contains('Profile updated successfully').should('be.visible');
    cy.wait(6);
    cy.logout();
  });


  it('TC-EP-004: Update profile without changing any information', () => {
    cy.login('john.smith@example.com', validPassword);
    cy.navigateToProfile();
    cy.updateProfile(undefined, undefined);
    cy.contains('Profile updated successfully').should('be.visible');
    cy.wait(6); 
    cy.logout();
  });

  it('TC-EP-005: Update email with a different valid format', () => {
    cy.login('john.smith@example.com', validPassword);
    cy.navigateToProfile();
    cy.updateProfile(undefined, 'user@subdomain.example.com');
    cy.contains('Profile updated successfully').should('be.visible');
    cy.wait(6);
    cy.logout(); 
  });

  it("TC-EP-006: Update email with missing '@' symbol", () => {
  cy.login('user@subdomain.example.com', validPassword);
  cy.navigateToProfile();
  cy.updateProfile('John Doe', 'userexample.com'); 
  cy.get('input#email').blur();
  cy.get('input#email')
    .invoke('prop', 'validationMessage')
    .should(
      'equal',
      "Please include an '@' in the email address. 'userexample.com' is missing an '@'."
    );

  cy.wait(6);
  cy.logout();
});



  it("TC-EP-007: Submit profile form without domain field", () => {
  cy.login('user@subdomain.example.com', validPassword);
  cy.navigateToProfile();
  cy.updateProfile('John Doe', 'user@');
  cy.get('input#email').blur();
  cy.get('input#email')
    .invoke('prop', 'validationMessage')
    .should(
      'equal',
      "Please enter a part following '@'. 'user@' is incomplete."
    );

  cy.wait(6); 
  cy.logout();
});


  it('TC-EP-008: Update email with invalid characters', () => {
    cy.login('user@subdomain.example.com', validPassword);
    cy.navigateToProfile();
    cy.updateProfile(undefined, 'user!name@example.com');
    cy.contains('Invalid characters').should('be.visible');
    cy.wait(6); 
    cy.logout();
  });

  it('TC-EP-009: Update profile with invalid email containing multiple "@"', () => {
  cy.login('user!name@example.com', validPassword);
  cy.navigateToProfile();
  cy.updateProfile('John Doe', 'user@name@example.com'); 
  cy.get('input#email').blur();
  cy.get('input#email')
    .invoke('prop', 'validationMessage')
    .should(
      'equal',
      "A part following '@' should not contain the symbol '@'."
    );

  cy.wait(6); 
  cy.logout(); 
  });

  it('TC-EP-010: Update email with missing "." in domain', () => {
    cy.login('user!name@example.com', validPassword);
    cy.navigateToProfile();
    cy.updateProfile(undefined, 'user@examplecom');
    cy.contains('Invalid email format').should('be.visible');
    cy.wait(6); 
    cy.logout(); 
  });

  it('TC-EP-011: Update email with space character', () => {
  cy.login('user@examplecom', validPassword);
  cy.navigateToProfile();

  cy.get('input#email').clear().type('ha le@example.com', { force: true });
  cy.get('input#email').should('have.value', 'hale@example.com');

  cy.wait(6); 
  cy.logout();
});



  it('TC-EP-012: Update email with consecutive dots', () => {
    cy.login('user@examplecom', validPassword);
    cy.navigateToProfile();
    cy.updateProfile(undefined, 'user..name@example.com');
    cy.contains('Invalid email format').should('be.visible');
    cy.wait(6); 
    cy.logout();
  });

  it('TC-EP-013: Submit form with empty full name', () => {
    cy.login('user..name@example.com', validPassword);
    cy.navigateToProfile();
    cy.updateProfile('', undefined);
    cy.contains('Full name is required').should('be.visible');
    cy.wait(6); 
    cy.logout(); 
  });

  it('TC-EP-014: Submit form with empty email', () => {
    cy.login('user..name@example.com', validPassword);
    cy.navigateToProfile();
    cy.updateProfile(undefined, '');
    cy.contains('Email is required').should('be.visible');
    cy.wait(6); 
    cy.logout(); 
  });

  it('TC-EP-015: Attempt to update with both full name and email address empty', () => {
    cy.login('user..name@example.com', validPassword);
    cy.navigateToProfile();
    cy.updateProfile('', '');
    cy.contains('Email is required').should('be.visible');
    cy.wait(6); 
    cy.logout(); 
  });

  it('TC-EP-016: Attempt to update profile with a email address already in use by another user', () => {
    cy.login('user..name@example.com', validPassword);
    cy.navigateToProfile();
    cy.updateProfile('John Doe', 'jane@email.com'); 
    cy.contains('E11000 duplicate key error collection').should('be.visible'); 
  });
//Reset to original email and password
    it('TC-EP-017: Reset to original name and email for next function', () => {
    cy.login('user..name@example.com', validPassword);
    cy.navigateToProfile();
    cy.updateProfile('John Doe', 'john@email.com'); 
    cy.wait(6); 
    cy.logout();
  });
});
