import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import MfaSetup from '../MfaSetup';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

// Mock API_URL
jest.mock('../../config/api', () => 'http://localhost:5000');

describe('MfaSetup Component', () => {
    let localStorageMock;

    beforeEach(() => {
        mockNavigate.mockClear();
        global.fetch = jest.fn();

        // Create proper localStorage mock with jest spies
        localStorageMock = {
            getItem: jest.fn((key) => {
                if (key === 'accessToken') return 'test-access-token';
                if (key === 'refreshToken') return 'test-refresh-token';
                if (key === 'email') return 'john@example.com';
                if (key === 'firstName') return 'John';
                if (key === 'lastName') return 'Doe';
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
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // Test 1: Renders loading state while checking MFA status
    test('Renders loading state while checking MFA status', () => {
        global.fetch.mockImplementation(() => new Promise(() => { }));

        render(<MfaSetup />);

        expect(screen.getByTestId('checking-status-message')).toBeInTheDocument();
    });

    // Test 2: Renders MFA already enabled state
    test('Renders MFA already enabled state when MFA is active', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ mfaEnabled: true })
        });

        render(<MfaSetup />);

        await waitFor(() => {
            expect(screen.getByTestId('mfa-already-enabled')).toBeInTheDocument();
        });
    });

    // Test 3: Displays already enabled title
    test('Displays already enabled title when MFA is active', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ mfaEnabled: true })
        });

        render(<MfaSetup />);

        await waitFor(() => {
            expect(screen.getByTestId('mfa-already-enabled-title')).toBeInTheDocument();
        });
    });

    // Test 4: Shows support message when MFA already enabled
    test('Shows support message when MFA already enabled', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ mfaEnabled: true })
        });

        render(<MfaSetup />);

        await waitFor(() => {
            expect(screen.getByTestId('mfa-support-message')).toBeInTheDocument();
        });
    });

    // Test 5: Renders step 1 form when MFA not enabled
    test('Renders step 1 form when MFA not enabled', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ mfaEnabled: false })
        });

        render(<MfaSetup />);

        await waitFor(() => {
            expect(screen.getByTestId('mfa-step-1-form')).toBeInTheDocument();
        });
    });

    // Test 6: Displays user information in header
    test('Displays user information in header', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ mfaEnabled: false })
        });

        render(<MfaSetup />);

        await waitFor(() => {
            expect(screen.getByTestId('mfa-user-name')).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByTestId('mfa-user-email')).toBeInTheDocument();
        });
    });

    // Test 7: Displays recommended apps list
    test('Displays recommended apps list in step 1', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ mfaEnabled: false })
        });

        render(<MfaSetup />);

        await waitFor(() => {
            expect(screen.getByTestId('recommended-apps-list')).toBeInTheDocument();
        });
    });

    // Test 8: Password input updates correctly
    test('Password input updates correctly when user types', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ mfaEnabled: false })
        });

        render(<MfaSetup />);

        await waitFor(() => {
            expect(screen.getByTestId('password-input')).toBeInTheDocument();
        });

        const passwordInput = screen.getByTestId('password-input');
        fireEvent.change(passwordInput, { target: { value: 'mypassword123' } });

        await waitFor(() => {
            expect(passwordInput).toHaveValue('mypassword123');
        });
    });

    // Test 9: Password visibility toggle works
    test('Password visibility toggle works correctly', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ mfaEnabled: false })
        });

        render(<MfaSetup />);

        await waitFor(() => {
            expect(screen.getByTestId('password-input')).toBeInTheDocument();
        });

        const passwordInput = screen.getByTestId('password-input');
        const toggleButton = screen.getByTestId('password-toggle-button');

        await waitFor(() => {
            expect(passwordInput).toHaveAttribute('type', 'password');
        });

        fireEvent.click(toggleButton);

        await waitFor(() => {
            expect(passwordInput).toHaveAttribute('type', 'text');
        });
    });

    // Test 10: Start setup button disabled when password empty
    test('Start setup button disabled when password empty', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ mfaEnabled: false })
        });

        render(<MfaSetup />);

        await waitFor(() => {
            expect(screen.getByTestId('start-setup-button')).toBeInTheDocument();
        });

        const startButton = screen.getByTestId('start-setup-button');

        await waitFor(() => {
            expect(startButton).toBeDisabled();
        });
    });

    // Test 11: Start setup button enabled when password entered
    test('Start setup button enabled when password entered', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ mfaEnabled: false })
        });

        render(<MfaSetup />);

        await waitFor(() => {
            expect(screen.getByTestId('password-input')).toBeInTheDocument();
        });

        const passwordInput = screen.getByTestId('password-input');
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        await waitFor(() => {
            expect(screen.getByTestId('start-setup-button')).not.toBeDisabled();
        });
    });

    // Test 12: Shows error when MFA setup fails with wrong password
    test('Shows error when MFA setup fails with wrong password', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ mfaEnabled: false })
        });

        render(<MfaSetup />);

        await waitFor(() => {
            expect(screen.getByTestId('password-input')).toBeInTheDocument();
        });

        const passwordInput = screen.getByTestId('password-input');
        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });

        global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 401
        });

        const startButton = screen.getByTestId('start-setup-button');
        fireEvent.click(startButton);

        await waitFor(() => {
            expect(screen.getByTestId('error-message')).toBeInTheDocument();
        });
    });

    // Test 13: Moves to step 2 after successful setup start
    test('Moves to step 2 after successful setup start', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ mfaEnabled: false })
        });

        render(<MfaSetup />);

        await waitFor(() => {
            expect(screen.getByTestId('password-input')).toBeInTheDocument();
        });

        const passwordInput = screen.getByTestId('password-input');
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                qrCode: '<svg>test</svg>',
                secret: 'TESTSECRET123',
                factorId: 'factor-123',
                accessToken: 'new-token',
                refreshToken: 'new-refresh'
            })
        });

        const startButton = screen.getByTestId('start-setup-button');
        fireEvent.click(startButton);

        await waitFor(() => {
            expect(screen.getByTestId('mfa-step-2-form')).toBeInTheDocument();
        });
    });

    // Test 14: Displays QR code in step 2
    test('Displays QR code in step 2', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ mfaEnabled: false })
        });

        render(<MfaSetup />);

        await waitFor(() => {
            expect(screen.getByTestId('password-input')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'password123' } });

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                qrCode: '<svg>test</svg>',
                secret: 'TESTSECRET123',
                factorId: 'factor-123',
                accessToken: 'new-token',
                refreshToken: 'new-refresh'
            })
        });

        fireEvent.click(screen.getByTestId('start-setup-button'));

        await waitFor(() => {
            expect(screen.getByTestId('qr-code')).toBeInTheDocument();
        });
    });

    // Test 15: Displays secret value in step 2
    test('Displays secret value in step 2', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ mfaEnabled: false })
        });

        render(<MfaSetup />);

        await waitFor(() => {
            expect(screen.getByTestId('password-input')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'password123' } });

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                qrCode: '<svg>test</svg>',
                secret: 'TESTSECRET123',
                factorId: 'factor-123',
                accessToken: 'new-token',
                refreshToken: 'new-refresh'
            })
        });

        fireEvent.click(screen.getByTestId('start-setup-button'));

        await waitFor(() => {
            expect(screen.getByTestId('secret-value')).toBeInTheDocument();
        });
    });

    // Test 16: Verification code input accepts only digits
    test('Verification code input accepts only digits', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ mfaEnabled: false })
        });

        render(<MfaSetup />);

        await waitFor(() => {
            expect(screen.getByTestId('password-input')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'password123' } });

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                qrCode: '<svg>test</svg>',
                secret: 'TESTSECRET123',
                factorId: 'factor-123',
                accessToken: 'new-token',
                refreshToken: 'new-refresh'
            })
        });

        fireEvent.click(screen.getByTestId('start-setup-button'));

        await waitFor(() => {
            expect(screen.getByTestId('verification-code-input')).toBeInTheDocument();
        });

        const codeInput = screen.getByTestId('verification-code-input');
        fireEvent.change(codeInput, { target: { value: 'abc123xyz' } });

        await waitFor(() => {
            expect(codeInput).toHaveValue('123');
        });
    });

    // Test 17: Verification code limited to 6 digits
    test('Verification code limited to 6 digits', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ mfaEnabled: false })
        });

        render(<MfaSetup />);

        await waitFor(() => {
            expect(screen.getByTestId('password-input')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'password123' } });

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                qrCode: '<svg>test</svg>',
                secret: 'TESTSECRET123',
                factorId: 'factor-123',
                accessToken: 'new-token',
                refreshToken: 'new-refresh'
            })
        });

        fireEvent.click(screen.getByTestId('start-setup-button'));

        await waitFor(() => {
            expect(screen.getByTestId('verification-code-input')).toBeInTheDocument();
        });

        const codeInput = screen.getByTestId('verification-code-input');
        fireEvent.change(codeInput, { target: { value: '1234567890' } });

        await waitFor(() => {
            expect(codeInput).toHaveValue('123456');
        });
    });

    // Test 18: Verify button disabled when code incomplete
    test('Verify button disabled when code incomplete', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ mfaEnabled: false })
        });

        render(<MfaSetup />);

        await waitFor(() => {
            expect(screen.getByTestId('password-input')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'password123' } });

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                qrCode: '<svg>test</svg>',
                secret: 'TESTSECRET123',
                factorId: 'factor-123',
                accessToken: 'new-token',
                refreshToken: 'new-refresh'
            })
        });

        fireEvent.click(screen.getByTestId('start-setup-button'));

        await waitFor(() => {
            expect(screen.getByTestId('verify-button')).toBeInTheDocument();
        });

        const verifyButton = screen.getByTestId('verify-button');

        await waitFor(() => {
            expect(verifyButton).toBeDisabled();
        });
    });

    // Test 19: Verify button enabled when code complete
    test('Verify button enabled when code complete', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ mfaEnabled: false })
        });

        render(<MfaSetup />);

        await waitFor(() => {
            expect(screen.getByTestId('password-input')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'password123' } });

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                qrCode: '<svg>test</svg>',
                secret: 'TESTSECRET123',
                factorId: 'factor-123',
                accessToken: 'new-token',
                refreshToken: 'new-refresh'
            })
        });

        fireEvent.click(screen.getByTestId('start-setup-button'));

        await waitFor(() => {
            expect(screen.getByTestId('verification-code-input')).toBeInTheDocument();
        });

        const codeInput = screen.getByTestId('verification-code-input');
        fireEvent.change(codeInput, { target: { value: '123456' } });

        await waitFor(() => {
            expect(screen.getByTestId('verify-button')).not.toBeDisabled();
        });
    });

    // Test 20: Shows error when verification fails
    test('Shows error when verification fails', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ mfaEnabled: false })
        });

        render(<MfaSetup />);

        await waitFor(() => {
            expect(screen.getByTestId('password-input')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'password123' } });

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                qrCode: '<svg>test</svg>',
                secret: 'TESTSECRET123',
                factorId: 'factor-123',
                accessToken: 'new-token',
                refreshToken: 'new-refresh'
            })
        });

        fireEvent.click(screen.getByTestId('start-setup-button'));

        await waitFor(() => {
            expect(screen.getByTestId('verification-code-input')).toBeInTheDocument();
        });

        const codeInput = screen.getByTestId('verification-code-input');
        fireEvent.change(codeInput, { target: { value: '123456' } });

        global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 400
        });

        fireEvent.click(screen.getByTestId('verify-button'));

        await waitFor(() => {
            expect(screen.getByTestId('error-message')).toBeInTheDocument();
        });
    });

    // Test 21: Shows success message after verification
    test('Shows success message after verification', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ mfaEnabled: false })
        });

        render(<MfaSetup />);

        await waitFor(() => {
            expect(screen.getByTestId('password-input')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'password123' } });

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                qrCode: '<svg>test</svg>',
                secret: 'TESTSECRET123',
                factorId: 'factor-123',
                accessToken: 'new-token',
                refreshToken: 'new-refresh'
            })
        });

        fireEvent.click(screen.getByTestId('start-setup-button'));

        await waitFor(() => {
            expect(screen.getByTestId('verification-code-input')).toBeInTheDocument();
        });

        const codeInput = screen.getByTestId('verification-code-input');
        fireEvent.change(codeInput, { target: { value: '123456' } });

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({})
        });

        fireEvent.click(screen.getByTestId('verify-button'));

        await waitFor(() => {
            expect(screen.getByTestId('success-message')).toBeInTheDocument();
        });
    });

    // Test 22: Navigates to profile after successful verification
    test('Navigates to profile after successful verification', async () => {
        jest.useFakeTimers();

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ mfaEnabled: false })
        });

        render(<MfaSetup />);

        await waitFor(() => {
            expect(screen.getByTestId('password-input')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'password123' } });

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                qrCode: '<svg>test</svg>',
                secret: 'TESTSECRET123',
                factorId: 'factor-123',
                accessToken: 'new-token',
                refreshToken: 'new-refresh'
            })
        });

        fireEvent.click(screen.getByTestId('start-setup-button'));

        await waitFor(() => {
            expect(screen.getByTestId('verification-code-input')).toBeInTheDocument();
        });

        const codeInput = screen.getByTestId('verification-code-input');
        fireEvent.change(codeInput, { target: { value: '123456' } });

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({})
        });

        fireEvent.click(screen.getByTestId('verify-button'));

        await waitFor(() => {
            expect(screen.getByTestId('success-message')).toBeInTheDocument();
        });

        // Use act to properly handle the timer with fake timers
        await act(async () => {
            jest.advanceTimersByTime(2000);
        });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/profil');
        });

        jest.useRealTimers();
    });

    // Test 23: Back button navigates to profile from step 1
    test('Back button navigates to profile from step 1', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ mfaEnabled: false })
        });

        render(<MfaSetup />);

        await waitFor(() => {
            expect(screen.getByTestId('back-button')).toBeInTheDocument();
        });

        const backButton = screen.getByTestId('back-button');
        fireEvent.click(backButton);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/profil');
        });
    });

    // Test 24: Cancel button navigates to profile from step 2
    test('Cancel button navigates to profile from step 2', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ mfaEnabled: false })
        });

        render(<MfaSetup />);

        await waitFor(() => {
            expect(screen.getByTestId('password-input')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'password123' } });

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                qrCode: '<svg>test</svg>',
                secret: 'TESTSECRET123',
                factorId: 'factor-123',
                accessToken: 'new-token',
                refreshToken: 'new-refresh'
            })
        });

        fireEvent.click(screen.getByTestId('start-setup-button'));

        await waitFor(() => {
            expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
        });

        const cancelButton = screen.getByTestId('cancel-button');
        fireEvent.click(cancelButton);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/profil');
        });
    });

    // Test 25: Back button from already enabled state navigates to profile
    test('Back button from already enabled state navigates to profile', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ mfaEnabled: true })
        });

        render(<MfaSetup />);

        await waitFor(() => {
            expect(screen.getByTestId('back-button')).toBeInTheDocument();
        });

        const backButton = screen.getByTestId('back-button');
        fireEvent.click(backButton);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/profil');
        });
    });

    // Test 26: Shows loading button text during setup
    test('Shows loading button text during setup', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ mfaEnabled: false })
        });

        render(<MfaSetup />);

        await waitFor(() => {
            expect(screen.getByTestId('password-input')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'password123' } });

        global.fetch.mockImplementation(() => new Promise(() => { }));

        const startButton = screen.getByTestId('start-setup-button');
        fireEvent.click(startButton);

        await waitFor(() => {
            expect(startButton).toBeDisabled();
        });
    });

    // Test 27: Shows loading button text during verification
    test('Shows loading button text during verification', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ mfaEnabled: false })
        });

        render(<MfaSetup />);

        await waitFor(() => {
            expect(screen.getByTestId('password-input')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'password123' } });

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                qrCode: '<svg>test</svg>',
                secret: 'TESTSECRET123',
                factorId: 'factor-123',
                accessToken: 'new-token',
                refreshToken: 'new-refresh'
            })
        });

        fireEvent.click(screen.getByTestId('start-setup-button'));

        await waitFor(() => {
            expect(screen.getByTestId('verification-code-input')).toBeInTheDocument();
        });

        const codeInput = screen.getByTestId('verification-code-input');
        fireEvent.change(codeInput, { target: { value: '123456' } });

        global.fetch.mockImplementation(() => new Promise(() => { }));

        const verifyButton = screen.getByTestId('verify-button');
        fireEvent.click(verifyButton);

        await waitFor(() => {
            expect(verifyButton).toBeDisabled();
        });
    });

    // Test 28: Handles missing access token gracefully
    test('Handles missing access token gracefully', async () => {
        localStorageMock.getItem.mockImplementation((key) => {
            if (key === 'email') return 'john@example.com';
            if (key === 'firstName') return 'John';
            if (key === 'lastName') return 'Doe';
            return null;
        });

        render(<MfaSetup />);

        await waitFor(() => {
            expect(screen.getByTestId('mfa-step-1-form')).toBeInTheDocument();
        });
    });

    // Test 29: Disables buttons during loading in step 1
    test('Disables buttons during loading in step 1', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ mfaEnabled: false })
        });

        render(<MfaSetup />);

        await waitFor(() => {
            expect(screen.getByTestId('password-input')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'password123' } });

        global.fetch.mockImplementation(() => new Promise(() => { }));

        const startButton = screen.getByTestId('start-setup-button');
        fireEvent.click(startButton);

        await waitFor(() => {
            expect(startButton).toBeDisabled();
        });

        await waitFor(() => {
            expect(screen.getByTestId('back-button')).toBeDisabled();
        });
    });

    // Test 30: Disables buttons during loading in step 2
    test('Disables buttons during loading in step 2', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ mfaEnabled: false })
        });

        render(<MfaSetup />);

        await waitFor(() => {
            expect(screen.getByTestId('password-input')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'password123' } });

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                qrCode: '<svg>test</svg>',
                secret: 'TESTSECRET123',
                factorId: 'factor-123',
                accessToken: 'new-token',
                refreshToken: 'new-refresh'
            })
        });

        fireEvent.click(screen.getByTestId('start-setup-button'));

        await waitFor(() => {
            expect(screen.getByTestId('verification-code-input')).toBeInTheDocument();
        });

        const codeInput = screen.getByTestId('verification-code-input');
        fireEvent.change(codeInput, { target: { value: '123456' } });

        global.fetch.mockImplementation(() => new Promise(() => { }));

        const verifyButton = screen.getByTestId('verify-button');
        fireEvent.click(verifyButton);

        await waitFor(() => {
            expect(verifyButton).toBeDisabled();
        });

        await waitFor(() => {
            expect(screen.getByTestId('cancel-button')).toBeDisabled();
        });
    });
});