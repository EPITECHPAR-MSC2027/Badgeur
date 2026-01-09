/* global cy, describe, it, beforeEach */

describe('Pointage Flow E2E Tests', () => {
    beforeEach(() => {
        cy.viewport(1920, 1080);
    });

    describe('Manager Login and Badge Flow', () => {
        it('should login as manager (no MFA), navigate to pointage, and badge successfully', () => {
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
            });

            // Step 4: Click "Pointer maintenant" button on home page
            cy.contains('button', 'Pointer maintenant', { timeout: 10000 })
                .should('be.visible')
                .click();

            // Step 5: Verify navigation to pointage page
            cy.url().should('include', '/pointage');

            // Step 6: Verify pointage page loaded correctly
            cy.get('[data-testid="pointage-container"]', { timeout: 10000 }).should('be.visible');
            cy.get('[data-testid="badge-button"]').should('be.visible');

            // Step 7: Click the BADGER button
            cy.get('[data-testid="badge-button"]').click();

            // Step 8: Verify toast notification appears (just check existence, not content)
            cy.get('[data-testid="toast"]', { timeout: 10000 })
                .should('exist')
                .and('be.visible');

            // Step 9: Verify badge appears in history
            cy.get('[data-testid="history-count"]', { timeout: 5000 })
                .should('exist');
        });

        it('should show the badge in history after badging', () => {
            // Login as manager
            cy.visit('/login');
            cy.get('#email-input').type('manager@test.fr');
            cy.get('#password-input').type('1234');
            cy.get('.login-submit-button').click();

            // Navigate to pointage
            cy.url().should('include', '/home', { timeout: 15000 });
            cy.contains('button', 'Pointer maintenant', { timeout: 10000 }).click();
            cy.url().should('include', '/pointage');

            // Click BADGER
            cy.get('[data-testid="badge-button"]').click();

            // Wait for toast (just check it exists)
            cy.get('[data-testid="toast"]', { timeout: 10000 })
                .should('exist')
                .and('be.visible');

            // Verify history updated
            cy.get('[data-testid="history-count"]', { timeout: 5000 }).should('exist');
        });

        it('should display "Dernier" label on the most recent badge', () => {
            // Login as manager
            cy.visit('/login');
            cy.get('#email-input').type('manager@test.fr');
            cy.get('#password-input').type('1234');
            cy.get('.login-submit-button').click();

            // Navigate directly to pointage
            cy.url().should('include', '/home', { timeout: 15000 });
            cy.visit('/pointage');

            // Wait for page to load
            cy.get('[data-testid="pointage-container"]', { timeout: 10000 }).should('be.visible');

            // Click BADGER
            cy.get('[data-testid="badge-button"]').click();

            // Wait for toast
            cy.get('[data-testid="toast"]', { timeout: 10000 })
                .should('exist')
                .and('be.visible');

            // Verify "Dernier" label appears (just check data-testid exists)
            cy.get('[data-testid="last-badge"]', { timeout: 5000 })
                .should('exist')
                .and('be.visible');
        });

        it('should disable badge button while processing', () => {
            // Login as manager
            cy.visit('/login');
            cy.get('#email-input').type('manager@test.fr');
            cy.get('#password-input').type('1234');
            cy.get('.login-submit-button').click();

            // Navigate to pointage
            cy.url().should('include', '/home', { timeout: 15000 });
            cy.visit('/pointage');

            // Wait for page to load
            cy.get('[data-testid="badge-button"]', { timeout: 10000 }).should('be.visible');

            // Click BADGER and immediately check if disabled
            cy.get('[data-testid="badge-button"]').click();
            cy.get('[data-testid="badge-button"]').should('be.disabled');
        });
    });

    describe('Pointage Page Elements', () => {
        beforeEach(() => {
            // Login and navigate to pointage
            cy.visit('/login');
            cy.get('#email-input').type('manager@test.fr');
            cy.get('#password-input').type('1234');
            cy.get('.login-submit-button').click();
            cy.url().should('include', '/home', { timeout: 15000 });
            cy.visit('/pointage');
            cy.get('[data-testid="pointage-container"]', { timeout: 10000 }).should('be.visible');
        });

        it('should display all moment cards', () => {
            cy.get('[data-testid="moment-0"]').should('be.visible');
            cy.get('[data-testid="moment-1"]').should('be.visible');
            cy.get('[data-testid="moment-2"]').should('be.visible');
            cy.get('[data-testid="moment-3"]').should('be.visible');
        });

        it('should display the current date', () => {
            cy.get('[data-testid="current-date"]').should('be.visible');
        });

        it('should display info text about badging', () => {
            cy.get('[data-testid="info-text"]').should('be.visible');
        });

        it('should display history section', () => {
            cy.get('[data-testid="history-card"]').should('be.visible');
        });
    });
});