import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

// Mock API_URL
jest.mock('../../config/api', () => 'http://localhost:5000');

// Helper function to render with router
const renderWithRouter = (component) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Login Component', () => {
    let localStorageMock;

    beforeEach(() => {
        mockNavigate.mockClear();
        global.fetch = jest.fn();

        // Create proper localStorage mock with jest spies
        localStorageMock = {
            getItem: jest.fn(),
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
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // Test 1: Component renders correctly
    test('Renders login form with all elements', () => {
        renderWithRouter(<Login />);

        expect(screen.getByText('Connexion')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('nom@banque.fr')).toBeInTheDocument();
        expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
    });

    // Test 2: Email input changes
    test('Updates email input value on change', () => {
        renderWithRouter(<Login />);

        const emailInput = screen.getByPlaceholderText('nom@banque.fr');
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

        expect(emailInput.value).toBe('test@example.com');
    });

    // Test 3: Password input changes
    test('Updates password input value on change', () => {
        renderWithRouter(<Login />);

        const passwordInput = screen.getByLabelText('Mot de passe');
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        expect(passwordInput.value).toBe('password123');
    });

    // Test 4: Password visibility toggle
    test('Toggles password visibility', () => {
        renderWithRouter(<Login />);

        const passwordInput = screen.getByLabelText('Mot de passe');
        const toggleButton = screen.getByRole('button', { name: /afficher\/masquer le mot de passe/i });

        expect(passwordInput.type).toBe('password');

        fireEvent.click(toggleButton);
        expect(passwordInput.type).toBe('text');

        fireEvent.click(toggleButton);
        expect(passwordInput.type).toBe('password');
    });

    // Test 5: Successful login without MFA
    test('Handles successful login without MFA', async () => {
        const mockOnSubmit = jest.fn();
        const mockResponse = {
            accessToken: 'test-access-token',
            refreshToken: 'test-refresh-token',
            userId: '1',
            roleId: '2',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            mfaRequired: false
        };

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        });

        renderWithRouter(<Login onSubmit={mockOnSubmit} />);

        const emailInput = screen.getByPlaceholderText('nom@banque.fr');
        const passwordInput = screen.getByLabelText('Mot de passe');
        const submitButton = screen.getByRole('button', { name: /se connecter/i });

        fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:5000/login/',
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: 'john@example.com', password: 'password123' })
                })
            );
        });

        await waitFor(() => {
            expect(localStorageMock.setItem).toHaveBeenCalledWith('accessToken', 'test-access-token');
        });

        await waitFor(() => {
            expect(localStorageMock.setItem).toHaveBeenCalledWith('firstName', 'John');
        });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/home');
        });

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith(mockResponse);
        });
    });

    // Test 6: Login failure shows error
    test('Displays error message on failed login', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 401
        });

        renderWithRouter(<Login />);

        const emailInput = screen.getByPlaceholderText('nom@banque.fr');
        const passwordInput = screen.getByLabelText('Mot de passe');
        const submitButton = screen.getByRole('button', { name: /se connecter/i });

        fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/identifiants invalides/i)).toBeInTheDocument();
        });
    });

    // Test 7: MFA flow - shows MFA form when required
    test('Shows MFA form when MFA is required', async () => {
        const mockResponse = {
            mfaRequired: true,
            factorId: 'factor-123',
            challengeId: 'challenge-123',
            accessToken: 'temp-token',
            refreshToken: 'temp-refresh',
            userId: '1',
            roleId: '2',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com'
        };

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        });

        renderWithRouter(<Login />);

        const emailInput = screen.getByPlaceholderText('nom@banque.fr');
        const passwordInput = screen.getByLabelText('Mot de passe');
        const submitButton = screen.getByRole('button', { name: /se connecter/i });

        fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByTestId('mfa-title')).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByPlaceholderText('000000')).toBeInTheDocument();
        });
    });

    // Test 8: MFA code input validation
    test('MFA code input only accepts 6 digits', async () => {
        const mockResponse = {
            mfaRequired: true,
            factorId: 'factor-123',
            challengeId: 'challenge-123',
            accessToken: 'temp-token',
            refreshToken: 'temp-refresh',
            userId: '1',
            roleId: '2',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com'
        };

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        });

        renderWithRouter(<Login />);

        fireEvent.change(screen.getByPlaceholderText('nom@banque.fr'), { target: { value: 'john@example.com' } });
        fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

        await waitFor(() => {
            expect(screen.getByPlaceholderText('000000')).toBeInTheDocument();
        });

        const mfaInput = screen.getByPlaceholderText('000000');

        fireEvent.change(mfaInput, { target: { value: 'abc123' } });
        expect(mfaInput.value).toBe('123');

        fireEvent.change(mfaInput, { target: { value: '1234567890' } });
        expect(mfaInput.value).toBe('123456');
    });

    // Test 9: Successful MFA verification
    test('Handles successful MFA verification', async () => {
        const mockOnSubmit = jest.fn();

        // First call for login with MFA required
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                mfaRequired: true,
                factorId: 'factor-123',
                challengeId: 'challenge-123',
                accessToken: 'temp-token',
                refreshToken: 'temp-refresh',
                userId: '1',
                roleId: '2',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com'
            }),
        });

        renderWithRouter(<Login onSubmit={mockOnSubmit} />);

        fireEvent.change(screen.getByPlaceholderText('nom@banque.fr'), { target: { value: 'john@example.com' } });
        fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

        await waitFor(() => {
            expect(screen.getByPlaceholderText('000000')).toBeInTheDocument();
        });

        // Second call for MFA verification
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                accessToken: 'final-token',
                refreshToken: 'final-refresh',
                userId: '1',
                roleId: '2',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com'
            }),
        });

        const mfaInput = screen.getByPlaceholderText('000000');
        fireEvent.change(mfaInput, { target: { value: '123456' } });

        const verifyButton = screen.getByTestId('mfa-verify-button');
        fireEvent.click(verifyButton);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:5000/login/mfa-login',
                expect.objectContaining({
                    method: 'POST',
                    body: expect.stringContaining('123456')
                })
            );
        });

        await waitFor(() => {
            expect(localStorageMock.setItem).toHaveBeenCalledWith('accessToken', 'final-token');
        });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/home');
        });
    });

    // Test 10: Back to login from MFA
    test('Returns to login form from MFA screen', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                mfaRequired: true,
                factorId: 'factor-123',
                challengeId: 'challenge-123',
                accessToken: 'temp-token',
                refreshToken: 'temp-refresh',
                userId: '1',
                roleId: '2',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com'
            }),
        });

        renderWithRouter(<Login />);

        fireEvent.change(screen.getByPlaceholderText('nom@banque.fr'), { target: { value: 'john@example.com' } });
        fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

        await waitFor(() => {
            expect(screen.getByTestId('mfa-title')).toBeInTheDocument();
        });

        const backButton = screen.getByRole('button', { name: /← Retour à la connexion/i });
        fireEvent.click(backButton);

        expect(screen.getByText('Connexion')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('nom@banque.fr')).toBeInTheDocument();
    });

    // Test 11: Disabled state during loading
    test('Disables inputs and buttons during loading', async () => {
        global.fetch.mockImplementation(() => new Promise(() => { })); // Never resolves

        renderWithRouter(<Login />);

        const emailInput = screen.getByPlaceholderText('nom@banque.fr');
        const passwordInput = screen.getByLabelText('Mot de passe');
        const submitButton = screen.getByRole('button', { name: /se connecter/i });

        fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /connexion\.\.\./i })).toBeDisabled();
        });

        await waitFor(() => {
            expect(emailInput).toBeDisabled();
        });

        await waitFor(() => {
            expect(passwordInput).toBeDisabled();
        });
    });
});