/* global cy, describe, it, beforeEach */

describe('Logout Flow E2E Tests', () => {
    beforeEach(() => {
        cy.viewport(1920, 1080);
    });

    describe('Manager Login and Logout Flow', () => {
        it('should login as manager, click profile icon, and logout successfully', () => {
            // Step 1: Visit login page
            cy.visit('/login');

            // Step 2: Login as manager (no MFA)
            cy.get('#email-input').type('manager@test.fr');
            cy.get('#password-input').type('1234');
            cy.get('.login-submit-button').click();

            // Step 3: Verify redirect to home page
            cy.url().should('include', '/home', { timeout: 15000 });

            // Verify localStorage has user data
            cy.window().then((win) => {
                expect(win.localStorage.getItem('accessToken')).to.not.be.null;
                expect(win.localStorage.getItem('email')).to.eq('manager@test.fr');
            });

            // Step 4: Click the profile icon in the navbar (top right)
            cy.get('button[title="Profil"]', { timeout: 10000 })
                .should('be.visible')
                .click();

            // Step 5: Verify navigation to profile page
            cy.url().should('include', '/profil');

            // Step 6: Verify profile page loaded correctly
            cy.get('[data-testid="profil-container"]', { timeout: 10000 }).should('be.visible');
            cy.get('[data-testid="logout-button"]').should('be.visible');

            // Step 7: Click the logout button
            cy.get('[data-testid="logout-button"]').click();

            // Step 8: Verify redirect to login page
            cy.url().should('include', '/login');

            // Step 9: Verify localStorage is cleared
            cy.window().then((win) => {
                expect(win.localStorage.getItem('accessToken')).to.be.null;
            });

            // Step 10: Verify login form is displayed
            cy.get('[data-testid="login-form"]').should('be.visible');
        });

        it('should display user information on profile page before logout', () => {
            // Login as manager
            cy.visit('/login');
            cy.get('#email-input').type('manager@test.fr');
            cy.get('#password-input').type('1234');
            cy.get('.login-submit-button').click();

            // Wait for home page
            cy.url().should('include', '/home', { timeout: 15000 });

            // Navigate to profile
            cy.get('button[title="Profil"]', { timeout: 10000 }).click();
            cy.url().should('include', '/profil');

            // Verify user info is displayed
            cy.get('[data-testid="profil-container"]', { timeout: 10000 }).should('be.visible');
            cy.get('[data-testid="email-value"]').should('exist');
            cy.get('[data-testid="firstname-value"]').should('exist');
            cy.get('[data-testid="lastname-value"]').should('exist');
            cy.get('[data-testid="role-value"]').should('exist');
        });

        it('should not be able to access protected pages after logout', () => {
            // Login as manager
            cy.visit('/login');
            cy.get('#email-input').type('manager@test.fr');
            cy.get('#password-input').type('1234');
            cy.get('.login-submit-button').click();

            // Wait for home page
            cy.url().should('include', '/home', { timeout: 15000 });

            // Navigate to profile and logout
            cy.get('button[title="Profil"]', { timeout: 10000 }).click();
            cy.url().should('include', '/profil');
            cy.get('[data-testid="logout-button"]', { timeout: 10000 }).click();

            // Verify redirected to login
            cy.url().should('include', '/login');

            // Try to access home page directly (should redirect to login or show unauthorized)
            cy.visit('/home');
            
            // Should either stay on login or be redirected back
            cy.url().should('include', '/login');
        });
    });

    describe('Profile Page Elements', () => {
        beforeEach(() => {
            // Login and navigate to profile
            cy.visit('/login');
            cy.get('#email-input').type('manager@test.fr');
            cy.get('#password-input').type('1234');
            cy.get('.login-submit-button').click();
            cy.url().should('include', '/home', { timeout: 15000 });
            cy.get('button[title="Profil"]', { timeout: 10000 }).click();
            cy.get('[data-testid="profil-container"]', { timeout: 10000 }).should('be.visible');
        });

        it('should display personal info section', () => {
            cy.get('[data-testid="personal-info-section"]').should('be.visible');
        });

        it('should display settings section', () => {
            cy.get('[data-testid="settings-section"]').should('be.visible');
        });

        it('should display theme selector', () => {
            cy.get('[data-testid="theme-select"]').should('be.visible');
        });

        it('should display dyslexic mode checkbox', () => {
            cy.get('[data-testid="dyslexic-mode-checkbox"]').should('exist');
        });

        it('should display MFA section', () => {
            cy.get('[data-testid="security-section"]').should('be.visible');
            cy.get('[data-testid="mfa-container"]').should('be.visible');
        });

        it('should display support ticket button', () => {
            cy.get('[data-testid="support-ticket-button"]').should('be.visible');
        });

        it('should allow changing theme', () => {
            cy.get('[data-testid="theme-select"]').select('azure');
            cy.get('[data-testid="theme-select"]').should('have.value', 'azure');
        });

        it('should allow toggling dyslexic mode', () => {
            cy.get('[data-testid="dyslexic-mode-checkbox"]').click();
            cy.get('[data-testid="dyslexic-mode-checkbox"]').should('be.checked');
        });
    });

    describe('Navigation from Profile', () => {
        beforeEach(() => {
            // Login and navigate to profile
            cy.visit('/login');
            cy.get('#email-input').type('manager@test.fr');
            cy.get('#password-input').type('1234');
            cy.get('.login-submit-button').click();
            cy.url().should('include', '/home', { timeout: 15000 });
            cy.get('button[title="Profil"]', { timeout: 10000 }).click();
            cy.get('[data-testid="profil-container"]', { timeout: 10000 }).should('be.visible');
        });

        it('should navigate to support page when clicking support button', () => {
            cy.get('[data-testid="support-ticket-button"]').click();
            cy.url().should('include', '/support');
        });
    });
});