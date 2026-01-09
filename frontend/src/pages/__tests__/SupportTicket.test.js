import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import SupportTicket from '../SupportTicket';
import authService from '../../services/authService';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

// Mock authService
jest.mock('../../services/authService');

// Helper function to render with router
const renderWithRouter = (component) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('SupportTicket Component', () => {
    let localStorageMock;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();

        // Setup localStorage mock
        localStorageMock = {
            getItem: jest.fn((key) => {
                if (key === 'firstName') return 'John';
                if (key === 'lastName') return 'Doe';
                if (key === 'email') return 'john.doe@test.com';
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

        // Default authService mock
        authService.isAuthenticated = jest.fn(() => false);
        authService.post = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.useRealTimers();
    });

    // Test 1: Component renders correctly with all elements
    test('Renders support ticket page with all main elements', () => {
        renderWithRouter(<SupportTicket />);

        expect(screen.getByTestId('support-ticket-container')).toBeInTheDocument();
    });

    // Test 2: Displays ticket title
    test('Displays correct ticket title', () => {
        renderWithRouter(<SupportTicket />);

        expect(screen.getByTestId('ticket-title')).toBeInTheDocument();
    });

    // Test 3: Displays ticket subtitle
    test('Displays ticket subtitle', () => {
        renderWithRouter(<SupportTicket />);

        expect(screen.getByTestId('ticket-subtitle')).toBeInTheDocument();
    });

    // Test 4: Displays ticket icon
    test('Displays ticket icon', () => {
        renderWithRouter(<SupportTicket />);

        expect(screen.getByTestId('ticket-icon')).toBeInTheDocument();
    });

    // Test 5: Renders form with all input fields
    test('Renders form with all required fields', () => {
        renderWithRouter(<SupportTicket />);

        expect(screen.getByTestId('ticket-form')).toBeInTheDocument();
    });

    // Test 6: Displays assigned to select
    test('Displays assigned to select field', () => {
        renderWithRouter(<SupportTicket />);

        expect(screen.getByTestId('assigned-to-select')).toBeInTheDocument();
    });

    // Test 7: Displays first name input
    test('Displays first name input field', () => {
        renderWithRouter(<SupportTicket />);

        expect(screen.getByTestId('first-name-input')).toBeInTheDocument();
    });

    // Test 8: Displays last name input
    test('Displays last name input field', () => {
        renderWithRouter(<SupportTicket />);

        expect(screen.getByTestId('last-name-input')).toBeInTheDocument();
    });

    // Test 9: Displays email input
    test('Displays email input field', () => {
        renderWithRouter(<SupportTicket />);

        expect(screen.getByTestId('email-input')).toBeInTheDocument();
    });

    // Test 10: Displays category select
    test('Displays category select field', () => {
        renderWithRouter(<SupportTicket />);

        expect(screen.getByTestId('category-select')).toBeInTheDocument();
    });

    // Test 11: Displays description textarea
    test('Displays description textarea field', () => {
        renderWithRouter(<SupportTicket />);

        expect(screen.getByTestId('description-textarea')).toBeInTheDocument();
    });

    // Test 12: Displays submit button
    test('Displays submit button', () => {
        renderWithRouter(<SupportTicket />);

        expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });

    // Test 13: Category select is enabled when IT support is set by default for non-authenticated users
    test('Category select is enabled when IT support is set by default for non-authenticated users', () => {
        renderWithRouter(<SupportTicket />);

        const categorySelect = screen.getByTestId('category-select');

        expect(categorySelect).not.toBeDisabled();
    });

    // Test 14: Changes assigned to value when selected
    test('Changes assigned to value when service is selected', () => {
        renderWithRouter(<SupportTicket />);

        const assignedToSelect = screen.getByTestId('assigned-to-select');
        fireEvent.change(assignedToSelect, { target: { value: 'RH' } });

        expect(assignedToSelect.value).toBe('RH');
    });

    // Test 15: Enables category select after selecting service
    test('Enables category select after selecting a service', async () => {
        authService.isAuthenticated.mockReturnValue(true);

        renderWithRouter(<SupportTicket />);

        const assignedToSelect = screen.getByTestId('assigned-to-select');
        fireEvent.change(assignedToSelect, { target: { value: 'IT support' } });

        await waitFor(() => {
            expect(screen.getByTestId('category-select')).not.toBeDisabled();
        });
    });

    // Test 16: Clears category when changing service
    test('Clears category when changing service', () => {
        authService.isAuthenticated.mockReturnValue(true);

        renderWithRouter(<SupportTicket />);

        const assignedToSelect = screen.getByTestId('assigned-to-select');
        const categorySelect = screen.getByTestId('category-select');

        fireEvent.change(assignedToSelect, { target: { value: 'IT support' } });
        fireEvent.change(categorySelect, { target: { value: 'Bug/Erreur' } });
        fireEvent.change(assignedToSelect, { target: { value: 'RH' } });

        expect(categorySelect.value).toBe('');
    });

    // Test 17: Updates first name input value
    test('Updates first name input value on change', () => {
        renderWithRouter(<SupportTicket />);

        const firstNameInput = screen.getByTestId('first-name-input');
        fireEvent.change(firstNameInput, { target: { value: 'Jane' } });

        expect(firstNameInput.value).toBe('Jane');
    });

    // Test 18: Updates last name input value
    test('Updates last name input value on change', () => {
        renderWithRouter(<SupportTicket />);

        const lastNameInput = screen.getByTestId('last-name-input');
        fireEvent.change(lastNameInput, { target: { value: 'Smith' } });

        expect(lastNameInput.value).toBe('Smith');
    });

    // Test 19: Updates email input value
    test('Updates email input value on change', () => {
        renderWithRouter(<SupportTicket />);

        const emailInput = screen.getByTestId('email-input');
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

        expect(emailInput.value).toBe('test@example.com');
    });

    // Test 20: Updates description textarea value
    test('Updates description textarea value on change', () => {
        renderWithRouter(<SupportTicket />);

        const descriptionTextarea = screen.getByTestId('description-textarea');
        fireEvent.change(descriptionTextarea, { target: { value: 'Test description' } });

        expect(descriptionTextarea.value).toBe('Test description');
    });

    // Test 21: Pre-fills user data when authenticated
    test('Pre-fills user data when user is authenticated', () => {
        authService.isAuthenticated.mockReturnValue(true);

        renderWithRouter(<SupportTicket />);

        expect(screen.getByTestId('first-name-input').value).toBe('John');
    });

    // Test 22: Pre-fills last name when authenticated
    test('Pre-fills last name when user is authenticated', () => {
        authService.isAuthenticated.mockReturnValue(true);

        renderWithRouter(<SupportTicket />);

        expect(screen.getByTestId('last-name-input').value).toBe('Doe');
    });

    // Test 23: Pre-fills email when authenticated
    test('Pre-fills email when user is authenticated', () => {
        authService.isAuthenticated.mockReturnValue(true);

        renderWithRouter(<SupportTicket />);

        expect(screen.getByTestId('email-input').value).toBe('john.doe@test.com');
    });

    // Test 24: Disables user fields when authenticated
    test('Disables user input fields when authenticated', () => {
        authService.isAuthenticated.mockReturnValue(true);

        renderWithRouter(<SupportTicket />);

        expect(screen.getByTestId('first-name-input')).toBeDisabled();
    });

    // Test 25: Disables assigned to select when not authenticated
    test('Disables assigned to select when not authenticated', () => {
        authService.isAuthenticated.mockReturnValue(false);

        renderWithRouter(<SupportTicket />);

        expect(screen.getByTestId('assigned-to-select')).toBeDisabled();
    });

    // Test 26: Sets default IT support for non-authenticated users
    test('Sets default IT support for non-authenticated users', () => {
        authService.isAuthenticated.mockReturnValue(false);

        renderWithRouter(<SupportTicket />);

        expect(screen.getByTestId('assigned-to-select').value).toBe('IT support');
    });

    // Test 27: Successfully creates ticket with valid data
    test('Successfully creates ticket with valid data', async () => {
        authService.post.mockResolvedValue({ ok: true });

        renderWithRouter(<SupportTicket />);

        fireEvent.change(screen.getByTestId('first-name-input'), { target: { value: 'John' } });
        fireEvent.change(screen.getByTestId('last-name-input'), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'john@test.com' } });
        fireEvent.change(screen.getByTestId('category-select'), { target: { value: 'Bug/Erreur' } });
        fireEvent.change(screen.getByTestId('description-textarea'), { target: { value: 'Test description' } });

        fireEvent.click(screen.getByTestId('submit-button'));

        await waitFor(() => {
            expect(authService.post).toHaveBeenCalledWith('/tickets/', expect.any(Object));
        });
    });

    // Test 28: Displays success message after successful submission
    test('Displays success message after successful submission', async () => {
        authService.post.mockResolvedValue({ ok: true });

        renderWithRouter(<SupportTicket />);

        fireEvent.change(screen.getByTestId('first-name-input'), { target: { value: 'John' } });
        fireEvent.change(screen.getByTestId('last-name-input'), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'john@test.com' } });
        fireEvent.change(screen.getByTestId('category-select'), { target: { value: 'Bug/Erreur' } });
        fireEvent.change(screen.getByTestId('description-textarea'), { target: { value: 'Test' } });

        fireEvent.click(screen.getByTestId('submit-button'));

        await waitFor(() => {
            expect(screen.getByTestId('success-message')).toBeInTheDocument();
        });
    });

    // Test 29: Displays error message on submission failure
    test('Displays error message on submission failure', async () => {
        authService.post.mockResolvedValue({ ok: false, text: async () => 'Error occurred' });

        renderWithRouter(<SupportTicket />);

        fireEvent.change(screen.getByTestId('first-name-input'), { target: { value: 'John' } });
        fireEvent.change(screen.getByTestId('last-name-input'), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'john@test.com' } });
        fireEvent.change(screen.getByTestId('category-select'), { target: { value: 'Bug/Erreur' } });
        fireEvent.change(screen.getByTestId('description-textarea'), { target: { value: 'Test' } });

        fireEvent.click(screen.getByTestId('submit-button'));

        await waitFor(() => {
            expect(screen.getByTestId('error-message')).toBeInTheDocument();
        });
    });

    // Test 30: Disables submit button during submission
    test('Disables submit button during submission', async () => {
        authService.post.mockImplementation(() => new Promise(() => { }));

        renderWithRouter(<SupportTicket />);

        fireEvent.change(screen.getByTestId('first-name-input'), { target: { value: 'John' } });
        fireEvent.change(screen.getByTestId('last-name-input'), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'john@test.com' } });
        fireEvent.change(screen.getByTestId('category-select'), { target: { value: 'Bug/Erreur' } });
        fireEvent.change(screen.getByTestId('description-textarea'), { target: { value: 'Test' } });

        fireEvent.click(screen.getByTestId('submit-button'));

        await waitFor(() => {
            expect(screen.getByTestId('submit-button')).toBeDisabled();
        });
    });

    // Test 31: Redirects to home after successful submission when authenticated
    test('Redirects to home after successful submission when authenticated', async () => {
        authService.isAuthenticated.mockReturnValue(true);
        authService.post.mockResolvedValue({ ok: true });

        renderWithRouter(<SupportTicket />);

        fireEvent.change(screen.getByTestId('assigned-to-select'), { target: { value: 'IT support' } });
        fireEvent.change(screen.getByTestId('category-select'), { target: { value: 'Bug/Erreur' } });
        fireEvent.change(screen.getByTestId('description-textarea'), { target: { value: 'Test' } });

        fireEvent.click(screen.getByTestId('submit-button'));

        await waitFor(() => {
            expect(screen.getByTestId('success-message')).toBeInTheDocument();
        });

        jest.advanceTimersByTime(2000);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/home');
        });
    });

    // Test 32: Redirects to login after successful submission when not authenticated
    test('Redirects to login after successful submission when not authenticated', async () => {
        authService.isAuthenticated.mockReturnValue(false);
        authService.post.mockResolvedValue({ ok: true });

        renderWithRouter(<SupportTicket />);

        fireEvent.change(screen.getByTestId('first-name-input'), { target: { value: 'John' } });
        fireEvent.change(screen.getByTestId('last-name-input'), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'john@test.com' } });
        fireEvent.change(screen.getByTestId('category-select'), { target: { value: 'Bug/Erreur' } });
        fireEvent.change(screen.getByTestId('description-textarea'), { target: { value: 'Test' } });

        fireEvent.click(screen.getByTestId('submit-button'));

        await waitFor(() => {
            expect(screen.getByTestId('success-message')).toBeInTheDocument();
        });

        jest.advanceTimersByTime(2000);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });
    });

    // Test 33: Displays IT support categories when IT support is selected
    test('Displays IT support categories when IT support is selected', async () => {
        authService.isAuthenticated.mockReturnValue(true);

        renderWithRouter(<SupportTicket />);

        const assignedToSelect = screen.getByTestId('assigned-to-select');
        fireEvent.change(assignedToSelect, { target: { value: 'IT support' } });

        await waitFor(() => {
            expect(screen.getByTestId('category-select')).not.toBeDisabled();
        });
    });

    // Test 34: Displays RH categories when RH is selected
    test('Displays RH categories when RH is selected', async () => {
        authService.isAuthenticated.mockReturnValue(true);

        renderWithRouter(<SupportTicket />);

        const assignedToSelect = screen.getByTestId('assigned-to-select');
        fireEvent.change(assignedToSelect, { target: { value: 'RH' } });

        await waitFor(() => {
            expect(screen.getByTestId('category-select')).not.toBeDisabled();
        });
    });

    // Test 35: Disables form inputs during submission
    test('Disables description textarea during submission', async () => {
        authService.post.mockImplementation(() => new Promise(() => { }));

        renderWithRouter(<SupportTicket />);

        fireEvent.change(screen.getByTestId('first-name-input'), { target: { value: 'John' } });
        fireEvent.change(screen.getByTestId('last-name-input'), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'john@test.com' } });
        fireEvent.change(screen.getByTestId('category-select'), { target: { value: 'Bug/Erreur' } });
        fireEvent.change(screen.getByTestId('description-textarea'), { target: { value: 'Test' } });

        fireEvent.click(screen.getByTestId('submit-button'));

        await waitFor(() => {
            expect(screen.getByTestId('description-textarea')).toBeDisabled();
        });
    });
});