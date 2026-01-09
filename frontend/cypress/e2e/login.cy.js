/* global cy, describe, it, beforeEach */

describe('Login Page E2E Tests', () => {
    beforeEach(() => {
        cy.visit('/login');
    });

    describe('Login Form Display', () => {
        it('should display the login form with all elements', () => {
            cy.get('[data-testid="login-form"]').should('be.visible');
            cy.get('#email-input').should('be.visible');
            cy.get('#password-input').should('be.visible');
            cy.get('.login-submit-button').should('be.visible').and('contain', 'Se connecter');
        });

        it('should display the application branding', () => {
            cy.get('.header-title').should('contain', 'BADGEUR');
            cy.get('.login-title').should('contain', 'Connexion');
        });
    });

    describe('Form Interaction', () => {
        it('should allow typing in email and password fields', () => {
            cy.get('#email-input').type('admin@test.fr');
            cy.get('#email-input').should('have.value', 'admin@test.fr');

            cy.get('#password-input').type('1234');
            cy.get('#password-input').should('have.value', '1234');
        });

        it('should toggle password visibility', () => {
            cy.get('#password-input').should('have.attr', 'type', 'password');

            cy.get('.login-password-toggle').click();
            cy.get('#password-input').should('have.attr', 'type', 'text');

            cy.get('.login-password-toggle').click();
            cy.get('#password-input').should('have.attr', 'type', 'password');
        });
    });

    describe('MFA Flow', () => {
        beforeEach(() => {
            cy.get('#email-input').type('admin@test.fr');
            cy.get('#password-input').type('1234');
            cy.get('.login-submit-button').click();
            cy.get('[data-testid="mfa-form"]', { timeout: 10000 }).should('exist').and('be.visible');
        });

        it('should display MFA verification form after valid credentials', () => {
            cy.get('[data-testid="mfa-title"]').should('contain', 'Vérification MFA');
            cy.get('#mfa-code-input').should('be.visible');
            cy.get('[data-testid="mfa-verify-button"]').should('be.visible');
        });

        it('should display MFA icon and instructions', () => {
            cy.get('.login-mfa-icon').should('contain', '🔐');
            cy.get('.login-subtitle').should('contain', 'code à 6 chiffres');
        });

        it('should only accept numeric input for MFA code', () => {
            cy.get('#mfa-code-input').type('abc123def456');
            cy.get('#mfa-code-input').should('have.value', '123456');
        });

        it('should limit MFA code to 6 digits', () => {
            cy.get('#mfa-code-input').type('1234567890');
            cy.get('#mfa-code-input').should('have.value', '123456');
        });

        it('should disable verify button when code is incomplete', () => {
            cy.get('#mfa-code-input').type('123');
            cy.get('[data-testid="mfa-verify-button"]').should('be.disabled');
        });

        it('should enable verify button when 6 digits are entered', () => {
            cy.get('#mfa-code-input').type('123456');
            cy.get('[data-testid="mfa-verify-button"]').should('not.be.disabled');
        });

        it('should return to login form when back button is clicked', () => {
            cy.get('.login-back-button').click();
            cy.get('[data-testid="login-form"]').should('be.visible');
            cy.get('.login-title').should('contain', 'Connexion');
        });

        it('should clear MFA code when returning to login', () => {
            cy.get('#mfa-code-input').type('123456');
            cy.get('.login-back-button').click();
            cy.get('.login-submit-button').click();
            cy.get('#mfa-code-input', { timeout: 10000 }).should('have.value', '');
        });

        it('should show error message with invalid MFA code', () => {
            cy.get('#mfa-code-input').clear().type('000000');
            cy.get('[data-testid="mfa-verify-button"]').should('not.be.disabled');
            cy.get('[data-testid="mfa-verify-button"]').click();

            // Wait for the error element to exist in DOM first, then check visibility
            cy.get('[data-testid="login-error"]', { timeout: 15000 })
                .should('exist')
                .and('be.visible');
        });

        it('should show loading state while verifying MFA', () => {
            cy.get('#mfa-code-input').type('123456');
            cy.get('[data-testid="mfa-verify-button"]').click();
            cy.get('[data-testid="mfa-verify-button"]').should('be.disabled');
        });
    });

    describe('Failed Login', () => {
        it('should display error message with invalid credentials', () => {
            cy.get('#email-input').type('wrong@email.com');
            cy.get('#password-input').type('wrongpassword');
            cy.get('.login-submit-button').click();

            cy.get('[data-testid="login-error"]', { timeout: 15000 })
                .should('exist')
                .and('be.visible');
        });

        it('should not redirect on failed login', () => {
            cy.get('#email-input').type('wrong@email.com');
            cy.get('#password-input').type('wrongpassword');
            cy.get('.login-submit-button').click();

            cy.get('[data-testid="login-error"]', { timeout: 15000 })
                .should('exist')
                .and('be.visible');
            cy.url().should('include', '/login');
        });
    });

    describe('Loading State', () => {
        it('should show loading state while submitting credentials', () => {
            cy.get('#email-input').type('admin@test.fr');
            cy.get('#password-input').type('1234');
            cy.get('.login-submit-button').click();
            cy.get('.login-submit-button').should('be.disabled');
        });
    });

    describe('Form Validation', () => {
        it('should require email and password fields', () => {
            cy.get('.login-submit-button').click();
            cy.url().should('include', '/login');
        });
    });
});