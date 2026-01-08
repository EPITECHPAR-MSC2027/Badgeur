import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Profil from '../Profil';
import authService from '../../services/authService';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

// Mock API_URL
jest.mock('../../config/api', () => 'http://localhost:5000');

// Mock authService
jest.mock('../../services/authService');

describe('Profil Component', () => {
    let localStorageMock;

    beforeEach(() => {
        mockNavigate.mockClear();
        global.fetch = jest.fn();

        // Create proper localStorage mock with jest spies
        localStorageMock = {
            getItem: jest.fn((key) => {
                if (key === 'firstName') return 'John';
                if (key === 'lastName') return 'Doe';
                if (key === 'email') return 'john.doe@example.com';
                if (key === 'roleId') return '0';
                if (key === 'accessToken') return 'test-token';
                if (key === 'refreshToken') return 'test-refresh-token';
                if (key === 'theme') return 'main';
                if (key === 'dyslexicMode') return 'false';
                return null;
            }),
            setItem: jest.fn(),
            clear: jest.fn(),
            removeItem: jest.fn(),
            length: 0,
            key: jest.fn(),
        };
        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
            writable: true
        });

        // Mock authService.logout
        authService.logout = jest.fn();

        // Mock fetch for MFA status
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ mfaEnabled: false })
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // Test 1: Renders profil page with loading state
    test('Renders loading state initially', () => {
        render(<Profil />);

        expect(screen.getByTestId('profil-container')).toBeInTheDocument();
        expect(screen.getByTestId('loading-message')).toBeInTheDocument();
    });

    // Test 2: Renders profil page with user data after loading
    test('Renders profil page with user data after loading', async () => {
        render(<Profil />);

        await waitFor(() => {
            expect(screen.queryByTestId('loading-message')).not.toBeInTheDocument();
        });

        expect(screen.getByTestId('profil-title')).toBeInTheDocument();
        expect(screen.getByTestId('personal-info-section')).toBeInTheDocument();
        expect(screen.getByTestId('settings-section')).toBeInTheDocument();
    });

    // Test 3: Displays user first name correctly
    test('Displays user first name correctly', async () => {
        render(<Profil />);

        await waitFor(() => {
            expect(screen.getByTestId('firstname-value')).toHaveTextContent('John');
        });
    });

    // Test 4: Displays user last name correctly
    test('Displays user last name correctly', async () => {
        render(<Profil />);

        await waitFor(() => {
            expect(screen.getByTestId('lastname-value')).toHaveTextContent('Doe');
        });
    });

    // Test 5: Displays user email correctly
    test('Displays user email correctly', async () => {
        render(<Profil />);

        await waitFor(() => {
            expect(screen.getByTestId('email-value')).toHaveTextContent('john.doe@example.com');
        });
    });

    // Test 6: Displays employee role correctly
    test('Displays employee role correctly', async () => {
        render(<Profil />);

        await waitFor(() => {
            expect(screen.getByTestId('role-value')).toHaveTextContent('Employé');
        });
    });

    // Test 7: Displays manager role correctly
    test('Displays manager role correctly', async () => {
        localStorageMock.getItem.mockImplementation((key) => {
            if (key === 'roleId') return '1';
            if (key === 'firstName') return 'Jane';
            if (key === 'lastName') return 'Smith';
            if (key === 'email') return 'jane.smith@example.com';
            if (key === 'accessToken') return 'test-token';
            if (key === 'theme') return 'main';
            if (key === 'dyslexicMode') return 'false';
            return null;
        });

        render(<Profil />);

        await waitFor(() => {
            expect(screen.getByTestId('role-value')).toHaveTextContent('Manager');
        });
    });

    // Test 8: Logout button calls authService.logout
    test('Logout button calls authService.logout', async () => {
        render(<Profil />);

        await waitFor(() => {
            expect(screen.getByTestId('logout-button')).toBeInTheDocument();
        });

        const logoutButton = screen.getByTestId('logout-button');
        fireEvent.click(logoutButton);

        expect(authService.logout).toHaveBeenCalled();
    });

    // Test 9: Logout button navigates to login page
    test('Logout button navigates to login page', async () => {
        render(<Profil />);

        await waitFor(() => {
            expect(screen.getByTestId('logout-button')).toBeInTheDocument();
        });

        const logoutButton = screen.getByTestId('logout-button');
        fireEvent.click(logoutButton);

        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    // Test 10: Support ticket button navigates to support page
    test('Support ticket button navigates to support page', async () => {
        render(<Profil />);

        await waitFor(() => {
            expect(screen.getByTestId('support-ticket-button')).toBeInTheDocument();
        });

        const supportButton = screen.getByTestId('support-ticket-button');
        fireEvent.click(supportButton);

        expect(mockNavigate).toHaveBeenCalledWith('/support');
    });

    // Test 11: Theme selector renders all theme options
    test('Theme selector renders all theme options', async () => {
        render(<Profil />);

        await waitFor(() => {
            expect(screen.getByTestId('theme-select')).toBeInTheDocument();
        });

        expect(screen.getByTestId('theme-option-main')).toBeInTheDocument();
        expect(screen.getByTestId('theme-option-azure')).toBeInTheDocument();
        expect(screen.getByTestId('theme-option-pink-matcha')).toBeInTheDocument();
        expect(screen.getByTestId('theme-option-coffee')).toBeInTheDocument();
        expect(screen.getByTestId('theme-option-deep-blue')).toBeInTheDocument();
        expect(screen.getByTestId('theme-option-cyber')).toBeInTheDocument();
        expect(screen.getByTestId('theme-option-warm')).toBeInTheDocument();
        expect(screen.getByTestId('theme-option-desert')).toBeInTheDocument();
        expect(screen.getByTestId('theme-option-starlight')).toBeInTheDocument();
    });

    // Test 12: Theme selector changes theme
    test('Theme selector changes theme', async () => {
        render(<Profil />);

        await waitFor(() => {
            expect(screen.getByTestId('theme-select')).toBeInTheDocument();
        });

        const themeSelect = screen.getByTestId('theme-select');
        fireEvent.change(themeSelect, { target: { value: 'azure' } });

        expect(themeSelect.value).toBe('azure');
        expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'azure');
    });

    // Test 13: Theme change updates document attribute
    test('Theme change updates document attribute', async () => {
        render(<Profil />);

        await waitFor(() => {
            expect(screen.getByTestId('theme-select')).toBeInTheDocument();
        });

        const themeSelect = screen.getByTestId('theme-select');
        fireEvent.change(themeSelect, { target: { value: 'cyber' } });

        await waitFor(() => {
            expect(document.documentElement.getAttribute('data-theme')).toBe('cyber');
        });
    });

    // Test 14: Dyslexic mode checkbox is initially unchecked
    test('Dyslexic mode checkbox is initially unchecked', async () => {
        render(<Profil />);

        await waitFor(() => {
            expect(screen.getByTestId('dyslexic-mode-checkbox')).toBeInTheDocument();
        });

        const checkbox = screen.getByTestId('dyslexic-mode-checkbox');
        expect(checkbox).not.toBeChecked();
    });

    // Test 15: Dyslexic mode checkbox can be toggled
    test('Dyslexic mode checkbox can be toggled', async () => {
        render(<Profil />);

        await waitFor(() => {
            expect(screen.getByTestId('dyslexic-mode-checkbox')).toBeInTheDocument();
        });

        const checkbox = screen.getByTestId('dyslexic-mode-checkbox');
        fireEvent.click(checkbox);

        expect(checkbox).toBeChecked();
        expect(localStorageMock.setItem).toHaveBeenCalledWith('dyslexicMode', 'true');
    });

    // Test 16: Dyslexic mode adds class to document body
    test('Dyslexic mode adds class to document body', async () => {
        render(<Profil />);

        await waitFor(() => {
            expect(screen.getByTestId('dyslexic-mode-checkbox')).toBeInTheDocument();
        });

        const checkbox = screen.getByTestId('dyslexic-mode-checkbox');
        fireEvent.click(checkbox);

        await waitFor(() => {
            expect(document.body.classList.contains('dyslexic-mode')).toBe(true);
        });
    });

    // Test 17: Dyslexic mode removes class when unchecked
    test('Dyslexic mode removes class when unchecked', async () => {
        localStorageMock.getItem.mockImplementation((key) => {
            if (key === 'dyslexicMode') return 'true';
            if (key === 'firstName') return 'John';
            if (key === 'lastName') return 'Doe';
            if (key === 'email') return 'john.doe@example.com';
            if (key === 'roleId') return '0';
            if (key === 'accessToken') return 'test-token';
            if (key === 'theme') return 'main';
            return null;
        });

        render(<Profil />);

        await waitFor(() => {
            expect(screen.getByTestId('dyslexic-mode-checkbox')).toBeChecked();
        });

        const checkbox = screen.getByTestId('dyslexic-mode-checkbox');
        fireEvent.click(checkbox);

        await waitFor(() => {
            expect(document.body.classList.contains('dyslexic-mode')).toBe(false);
        });
    });

    // Test 18: Shows loading state while fetching all data
    test('Shows loading state while fetching all data', () => {
        // Mock fetch to never resolve
        global.fetch.mockImplementation(() => new Promise(() => { }));

        render(<Profil />);

        // Should show loading message, not MFA elements
        expect(screen.getByTestId('loading-message')).toBeInTheDocument();
        expect(screen.queryByTestId('mfa-status')).not.toBeInTheDocument();
    });

    // Test 19: MFA status shows disabled when not enabled
    test('MFA status shows disabled when not enabled', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ mfaEnabled: false })
        });

        render(<Profil />);

        await waitFor(() => {
            expect(screen.getByTestId('mfa-status')).toHaveTextContent('Désactivée');
        });

        expect(screen.getByTestId('mfa-badge')).toHaveTextContent('○ Inactive');
    });

    // Test 20: MFA status shows enabled when active
    test('MFA status shows enabled when active', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ mfaEnabled: true })
        });

        render(<Profil />);

        await waitFor(() => {
            expect(screen.getByTestId('mfa-status')).toHaveTextContent('Activée');
        });

        expect(screen.getByTestId('mfa-badge')).toHaveTextContent('✓ Active');
    });

    // Test 21: MFA setup button shows correct text when disabled
    test('MFA setup button shows correct text when disabled', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ mfaEnabled: false })
        });

        render(<Profil />);

        await waitFor(() => {
            expect(screen.getByTestId('mfa-setup-button')).toHaveTextContent('Configurer MFA');
        });
    });

    // Test 22: MFA setup button shows correct text when enabled
    test('MFA setup button shows correct text when enabled', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ mfaEnabled: true })
        });

        render(<Profil />);

        await waitFor(() => {
            expect(screen.getByTestId('mfa-setup-button')).toHaveTextContent('Gérer MFA');
        });
    });

    // Test 23: MFA setup button navigates to MFA setup page
    test('MFA setup button navigates to MFA setup page', async () => {
        render(<Profil />);

        await waitFor(() => {
            expect(screen.getByTestId('mfa-setup-button')).toBeInTheDocument();
        });

        const mfaButton = screen.getByTestId('mfa-setup-button');
        fireEvent.click(mfaButton);

        expect(mockNavigate).toHaveBeenCalledWith('/login/mfa-setup');
    });

    // Test 24: MFA setup button is never disabled after loading completes
    test('MFA setup button is enabled after loading completes', async () => {
        render(<Profil />);

        await waitFor(() => {
            expect(screen.getByTestId('mfa-setup-button')).toBeInTheDocument();
        });

        const mfaButton = screen.getByTestId('mfa-setup-button');
        expect(mfaButton).not.toBeDisabled();
    });

    // Test 25: Handles missing access token gracefully
    test('Handles missing access token gracefully', async () => {
        localStorageMock.getItem.mockImplementation((key) => {
            if (key === 'accessToken') return null;
            if (key === 'firstName') return 'John';
            if (key === 'lastName') return 'Doe';
            if (key === 'email') return 'john.doe@example.com';
            if (key === 'roleId') return '0';
            if (key === 'theme') return 'main';
            if (key === 'dyslexicMode') return 'false';
            return null;
        });

        render(<Profil />);

        await waitFor(() => {
            expect(screen.getByTestId('mfa-status')).toHaveTextContent('Désactivée');
        });
    });

    // Test 26: Handles MFA API error gracefully
    test('Handles MFA API error gracefully', async () => {
        global.fetch.mockRejectedValue(new Error('API Error'));
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        render(<Profil />);

        await waitFor(() => {
            expect(screen.queryByTestId('loading-message')).not.toBeInTheDocument();
        });

        // Should still render the page even with MFA error
        expect(screen.getByTestId('mfa-status')).toBeInTheDocument();

        consoleErrorSpy.mockRestore();
    });

    // Test 27: All section headings are present
    test('All section headings are present', async () => {
        render(<Profil />);

        await waitFor(() => {
            expect(screen.getByTestId('personal-info-title')).toBeInTheDocument();
        });

        expect(screen.getByTestId('settings-title')).toBeInTheDocument();
        expect(screen.getByTestId('theme-heading')).toBeInTheDocument();
        expect(screen.getByTestId('accessibility-heading')).toBeInTheDocument();
        expect(screen.getByTestId('security-heading')).toBeInTheDocument();
    });

    // Test 28: All personal info labels are present
    test('All personal info labels are present', async () => {
        render(<Profil />);

        await waitFor(() => {
            expect(screen.getByTestId('firstname-label')).toBeInTheDocument();
        });

        expect(screen.getByTestId('lastname-label')).toBeInTheDocument();
        expect(screen.getByTestId('email-label')).toBeInTheDocument();
        expect(screen.getByTestId('role-label')).toBeInTheDocument();
    });

    // Test 29: Theme description is displayed
    test('Theme description is displayed', async () => {
        render(<Profil />);

        await waitFor(() => {
            expect(screen.getByTestId('theme-description')).toBeInTheDocument();
        });
    });

    // Test 30: Dyslexic mode description is displayed
    test('Dyslexic mode description is displayed', async () => {
        render(<Profil />);

        await waitFor(() => {
            expect(screen.getByTestId('dyslexic-mode-description')).toBeInTheDocument();
        });
    });

    // Test 31: MFA description is displayed
    test('MFA description is displayed', async () => {
        render(<Profil />);

        await waitFor(() => {
            expect(screen.getByTestId('mfa-description')).toBeInTheDocument();
        });
    });

    // Test 32: Profil sections container is rendered
    test('Profil sections container is rendered', async () => {
        render(<Profil />);

        await waitFor(() => {
            expect(screen.getByTestId('profil-sections-container')).toBeInTheDocument();
        });
    });

    // Test 33: Theme section is rendered
    test('Theme section is rendered', async () => {
        render(<Profil />);

        await waitFor(() => {
            expect(screen.getByTestId('theme-section')).toBeInTheDocument();
        });
    });

    // Test 34: Accessibility section is rendered
    test('Accessibility section is rendered', async () => {
        render(<Profil />);

        await waitFor(() => {
            expect(screen.getByTestId('accessibility-section')).toBeInTheDocument();
        });
    });

    // Test 35: Security section is rendered
    test('Security section is rendered', async () => {
        render(<Profil />);

        await waitFor(() => {
            expect(screen.getByTestId('security-section')).toBeInTheDocument();
        });
    });

    // Test 36: MFA container is rendered
    test('MFA container is rendered', async () => {
        render(<Profil />);

        await waitFor(() => {
            expect(screen.getByTestId('mfa-container')).toBeInTheDocument();
        });
    });

    // Test 37: MFA title is rendered
    test('MFA title is rendered', async () => {
        render(<Profil />);

        await waitFor(() => {
            expect(screen.getByTestId('mfa-title')).toBeInTheDocument();
        });
    });

    // Test 38: Dyslexic mode container is rendered
    test('Dyslexic mode container is rendered', async () => {
        render(<Profil />);

        await waitFor(() => {
            expect(screen.getByTestId('dyslexic-mode-container')).toBeInTheDocument();
        });
    });

    // Test 39: Dyslexic mode label is rendered
    test('Dyslexic mode label is rendered', async () => {
        render(<Profil />);

        await waitFor(() => {
            expect(screen.getByTestId('dyslexic-mode-label')).toBeInTheDocument();
        });
    });

    // Test 40: Fetch is called to check MFA status
    test('Fetch is called to check MFA status', async () => {
        render(<Profil />);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:5000/login/mfa-status',
                expect.objectContaining({
                    method: 'GET',
                    headers: expect.objectContaining({
                        'Authorization': 'Bearer test-token'
                    })
                })
            );
        });
    });
});