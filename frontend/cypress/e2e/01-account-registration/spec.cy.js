describe('template spec', () => {
  it('passes', () => {
    cy.visit('http://localhost:3000/register');
  });
});

function generateUniqueEmail() {
  const timestamp = Date.now();
  return `user${timestamp}@example.com`;
}

beforeEach(() => {
  cy.visit('http://localhost:3000/register');
});

describe('verify successful registration', () => {
  it('should register successfully', () => {
    const email = generateUniqueEmail();
    cy.get('input#name').type('Manh123');
    cy.get('input#email').type(email);
    cy.get('input#password').type('Manh1712!');
    cy.get('input#confirmPassword').type('Manh1712!');
    cy.get('button[type="submit"]').contains('Register').click();
  });
});

describe('verify sign up with an invalid email (does not contain @ symbol)', () => {
  it('should show error message', () => {
    cy.get('input#name').type('Manh123');
    cy.get('input#email').type('userexample.com');
    cy.get('input#password').type('Manh1712!');
    cy.get('input#confirmPassword').type('Manh1712!');
    cy.get('button[type="submit"]').contains('Register').click();
    cy.get('input#email')
      .invoke('prop', 'validationMessage')
      .should(
        'equal',
        "Please include an '@' in the email address. 'userexample.com' is missing an '@'."
      );
  });
});

describe('verify sign up with an invalid email (does not contain a domain after @ symbol)', () => {
  it('should show error message', () => {
    cy.get('input#name').type('Manh123');
    cy.get('input#email').type('user@');
    cy.get('input#password').type('Manh1712!');
    cy.get('input#confirmPassword').type('Manh1712!');
    cy.get('button[type="submit"]').contains('Register').click();
    cy.get('input#email')
      .invoke('prop', 'validationMessage')
      .should(
        'equal',
        "Please enter a part following '@'. 'user@' is incomplete."
      );
  });
});

describe("verify sign up with an invalid email (does not contain at least a dot '.')", () => {
  it('should show error message', () => {
    cy.get('input#name').type('Manh123');
    cy.get('input#email').type('user@examplecom');
    cy.get('input#password').type('Manh1712!');
    cy.get('input#confirmPassword').type('Manh1712!');
    cy.get('button[type="submit"]').contains('Register').click();
    cy.get('input#email')
      .invoke('prop', 'validationMessage')
      .should(
        'equal',
        "A part following '.' should not be empty. 'user@examplecom' is incomplete."
      );
  });
});

describe('verify sign up with an invalid email (contains spaces)', () => {
  it('should show error message', () => {
    cy.get('input#name').type('Manh123');
    cy.get('input#email').type('user @example.com');
    cy.get('input#password').type('Manh1712!');
    cy.get('input#confirmPassword').type('Manh1712!');
    cy.get('button[type="submit"]').contains('Register').click();
    cy.get('input#email')
      .invoke('prop', 'validationMessage')
      .should('equal', 'Please match the requested format.');
  });
});

describe('verify sign up with an invalid email (contains special characters)', () => {
  it('should show error message', () => {
    cy.get('input#name').type('Manh123');
    cy.get('input#email').type('%^&%^&@example.com');
    cy.get('input#password').type('Manh1712!');
    cy.get('input#confirmPassword').type('Manh1712!');
    cy.get('button[type="submit"]').contains('Register').click();
    cy.get('input#email')
      .invoke('prop', 'validationMessage')
      .should('equal', 'Please match the requested format.');
  });
});

describe('verify sign up with an empty email', () => {
  it('should show error message', () => {
    cy.get('input#name').type('Manh123');
    cy.get('input#password').type('Manh1712!');
    cy.get('input#confirmPassword').type('Manh1712!');
    cy.get('button[type="submit"]').contains('Register').click();
    cy.get('.Toastify').should(
      'have.text',
      'User validation failed: email: Path `email` is required.'
    );
  });
});

describe('verify sign up with an existing account', () => {
  it('should show error message', () => {
    cy.get('input#name').type('Manh123');
    cy.get('input#email').type('john@email.com');
    cy.get('input#password').type('Manh1712!');
    cy.get('input#confirmPassword').type('Manh1712!');
    cy.get('button[type="submit"]').contains('Register').click();
    cy.get('.Toastify').should('have.text', 'User already exists');
  });
});

describe('verify sign up with under 8 characters password', () => {
  it('should show error message', () => {
    const email = generateUniqueEmail();
    cy.get('input#name').type('Manh123');
    cy.get('input#email').type(email);
    cy.get('input#password').type('Manh12!');
    cy.get('input#confirmPassword').type('Manh12!');
    cy.get('button[type="submit"]').contains('Register').click();
    cy.get('.Toastify').should(
      'have.text',
      'Password must be at least 8 characters'
    );
  });
});

describe('verify sign up with an invalid password (does not contain at least 1 number)', () => {
  it('should show error message', () => {
    const email = generateUniqueEmail();
    cy.get('input#name').type('Manh123');
    cy.get('input#email').type(email);
    cy.get('input#password').type('ManhManh!');
    cy.get('input#confirmPassword').type('ManhManh!');
    cy.get('button[type="submit"]').contains('Register').click();
    cy.get('.Toastify').should(
      'have.text',
      'Password must contain at least 1 number'
    );
  });
});

describe('verify sign up with an invalid password (does not contain at least 1 special characters)', () => {
  it('should show error message', () => {
    const email = generateUniqueEmail();
    cy.get('input#name').type('Manh123');
    cy.get('input#email').type(email);
    cy.get('input#password').type('Manh171203');
    cy.get('input#confirmPassword').type('Manh171203');
    cy.get('button[type="submit"]').contains('Register').click();
    cy.get('.Toastify').should(
      'have.text',
      'Password must contain at least 1 special character'
    );
  });
});

describe('verify sign up with an invalid password (does not contain at least 1 lowercase character)', () => {
  it('should show error message', () => {
    const email = generateUniqueEmail();
    cy.get('input#name').type('Manh123');
    cy.get('input#email').type(email);
    cy.get('input#password').type('MANH1712!');
    cy.get('input#confirmPassword').type('MANH1712!');
    cy.get('button[type="submit"]').contains('Register').click();
    cy.get('.Toastify').should(
      'have.text',
      'Password must contain at least 1 lowercase character'
    );
  });
});

describe('verify sign up with an invalid password (does not contain at least 1 uppercase character)', () => {
  it('should show error message', () => {
    const email = generateUniqueEmail();
    cy.get('input#name').type('Manh123');
    cy.get('input#email').type(email);
    cy.get('input#password').type('manh1712!');
    cy.get('input#confirmPassword').type('manh1712!');
    cy.get('button[type="submit"]').contains('Register').click();
    cy.get('.Toastify').should(
      'have.text',
      'Password must contain at least 1 uppercase character'
    );
  });
});

describe('verify sign up with an empty password', () => {
  it('should show error message', () => {
    const email = generateUniqueEmail();
    cy.get('input#name').type('Manh123');
    cy.get('input#email').type(email);
    cy.get('button[type="submit"]').contains('Register').click();
    cy.get('.Toastify').should(
      'have.text',
      'Password must be at least 8 characters'
    );
  });
});

describe('verify sign up with a password contains sequential characters', () => {
  it('should show error message', () => {
    const email = generateUniqueEmail();
    cy.get('input#name').type('Manh123');
    cy.get('input#email').type(email);
    cy.get('input#password').type('Manh12345!');
    cy.get('input#confirmPassword').type('Manh12345!');
    cy.get('button[type="submit"]').contains('Register').click();
    cy.get('.Toastify').should(
      'have.text',
      'Password must not contain sequential characters'
    );
  });
});

describe('verify sign up with a password contains repeated characters', () => {
  it('should show error message', () => {
    const email = generateUniqueEmail();
    cy.get('input#name').type('Manh123');
    cy.get('input#email').type(email);
    cy.get('input#password').type('Manhhhhh!');
    cy.get('input#confirmPassword').type('Manhhhhh!');
    cy.get('button[type="submit"]').contains('Register').click();
    cy.get('.Toastify').should(
      'have.text',
      'Password must not contain repeated characters'
    );
  });
});

describe('verify sign up with a password which is also the email', () => {
  it('should show error message', () => {
    const email = generateUniqueEmail();
    cy.get('input#name').type('Manh123');
    cy.get('input#email').type(email);
    cy.get('input#password').type(email);
    cy.get('input#confirmPassword').type(email);
    cy.get('button[type="submit"]').contains('Register').click();
    cy.get('.Toastify').should(
      'have.text',
      'Password must not be the same as email'
    );
  });
});

describe('verify sign up with an empty name', () => {
  it('should show error message', () => {
    const email = generateUniqueEmail();
    cy.get('input#email').type(email);
    cy.get('input#password').type('Manh1712!');
    cy.get('input#confirmPassword').type('Manh1712!');
    cy.get('button[type="submit"]').contains('Register').click();
    cy.get('.Toastify').should('have.text', 'Name is required');
  });
});

describe('verify sign up with incorrect password confirmation', () => {
  it('should show error message', () => {
    const email = generateUniqueEmail();
    cy.get('input#name').type('Manh123');
    cy.get('input#email').type(email);
    cy.get('input#password').type('Manh1712!');
    cy.get('input#confirmPassword').type('Manh1912!');
    cy.get('button[type="submit"]').contains('Register').click();
    cy.get('.Toastify').should('have.text', 'Passwords do not match');
  });
});
