const Login = (email, password) =>{
    cy.get('a[href="/login"]').click();
    cy.get('input#email').type(email);
    cy.get('input#password').type(password);
    cy.get('button[type="submit"]').contains('Sign In').click();
}


const AddToCart = (productPath, qty) => {
    cy.visit('http://127.0.0.1:3000/'); 
    cy.get('.row').find(`a[href="${productPath}"]`).first().click();
    cy.get('div.row .col select.form-control').select(qty, { force: true }).trigger('change');  ;
    cy.contains('button', 'Add To Cart').click();
}

const VerifyShoppingCart = (productNumber, qtyList) => {
    const price = [];
    let i=0;
        let totalPrice = 0;
        cy.get('.col-md-8').find('.list-group-item').each(($el) => {
            cy.wrap($el).within(() => {
                cy.get('.col-md-2').eq(1).invoke('text').then((value) => {
                    value = value.substring(1, value.length);
                    price.push(Number(value));
                })
            })

        }).then(() => {
            price.forEach(($el) => {
                cy.log($el);
                totalPrice += $el * qtyList[i];
                i++;
            })
            cy.log(totalPrice);

        })
        cy.get('.col-md-4').find('.list-group-item').eq(0).invoke('text').then((text) => {
            const price = text.match(/\$([0-9,]+(\.[0-9]{2})?)/)[0].replace('$', '');
            return Number(price);
        }).then((price) => {
            expect(totalPrice).to.equal(price);
        })

        cy.get('.col-md-4').find('.list-group-item').eq(0).find('h2').invoke('text').then((text) => {
            const quantity = text.match(/\((\d+)\)/)[1];
            expect(quantity).to.equal(productNumber);
        });
}

const FillInShipping = (address, city, postalCode, country) => {
    cy.get('#address').type(address);
  
    cy.get('#city').type(city);
  
    cy.get('#postalCode').type(postalCode);
  
    cy.get('#country').type(country);
  
    cy.contains('button[type="submit"]', 'Continue').click();
  }
export default {Login, AddToCart, VerifyShoppingCart, FillInShipping}