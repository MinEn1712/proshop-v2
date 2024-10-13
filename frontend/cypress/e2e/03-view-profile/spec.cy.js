import {Login} from './helper'

const longuser = {
    email: 'iamaverylongemailandpasswordverylongimtesting@gmail.com',
    password: '12345678',
    name: 'I am a very long email and password! Very long I\'m testing'
}

const usernoorder = {
    email: 'john@email.com',
    password: '123456',
    name: 'John Doe'
}
const userhavingorder = {
    email: 'test@gmail.com',
    password: '123456',
    name: 'test'
}
describe('View Profile Function',()=>{
    beforeEach(()=>{
        cy.visit('http://127.0.0.1:3000/'); 
    })
    
    
    const VerifyNameEmail = (name, email) => {
        
        cy.get('input#name').should('have.value', name);
        cy.get('input#email').should('have.value', email);
    }; 

    it('View profile successfully With User Having Orders' , () => {
        
        Login(userhavingorder.email, userhavingorder.password);
        cy.get('a#username').click();
        cy.get('a[href="/profile"]').click({force: true})

        //Verify list of orders >0
        cy.get('tbody').find('tr').should('have.length.greaterThan',0);

        //Verify name
        VerifyNameEmail(userhavingorder.name, userhavingorder.email);
    });

    it('View profile successfully With User Having No Orders' , () => {
        cy.get('a[href="/login"]').click();
        Login(usernoorder.email, usernoorder.password);
        cy.get('a#username').click();
        cy.get('a[href="/profile"]').click({force: true})

        //Verify list of orders >0
        cy.get('tbody').find('tr').should('have.length', 0);

        //Verify name
        VerifyNameEmail(usernoorder.name, usernoorder.email);
    });

    it('View profile unsuccessfully With non-logged-in user' , () => {
   
        cy.visit('http://127.0.0.1:3000/profile')
        cy.wait(500);
        cy.url().should('include', '/login');
    });

    it('Verify non-logged-in user do not have Profile button on the navigation bar' , () => {
        cy.get('a#username').should('not.exist');
        cy.get('a[href="/profile"]').should('not.exist');
    });

    it('Verify user profile information display', ()=>{
        cy.get('a[href="/login"]').click();
        Login(userhavingorder.email, userhavingorder.password);
        cy.get('a#username').click();
        cy.get('a[href="/profile"]').click({force: true})

        //Verify name
        VerifyNameEmail(userhavingorder.name, userhavingorder.email);
    });

    it('Verify Profile page with long usernames and emails', ()=>{
        cy.get('a[href="/login"]').click();
        Login(longuser.email, longuser.password);
        cy.get('a#username').click();
        cy.get('a[href="/profile"]').click({force: true})

        //Verify name
        VerifyNameEmail(longuser.name, longuser.email);
    });

})