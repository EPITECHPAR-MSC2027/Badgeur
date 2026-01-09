import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import authService from '../../services/authService';
import UserProfile from '../UserProfile';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
    useParams: () => ({ userId: '1' }),
}));

// Mock authService
jest.mock('../../services/authService');

// Helper function to render with router
const renderWithRouter = (component, initialEntries = ['/profile/1']) => {
    return render(
        <MemoryRouter initialEntries={initialEntries}>
            {component}
        </MemoryRouter>
    );
};

describe('UserProfile Component', () => {
    let localStorageMock;

    beforeEach(() => {
        mockNavigate.mockClear();

        // Create proper localStorage mock
        localStorageMock = {
            getItem: jest.fn((key) => {
                if (key === 'roleId') return '3';
                if (key === 'userId') return '5';
                if (key === 'accessToken') return 'test-token';
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

        // Mock authService methods
        authService.get = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // Test 1: Blocks access for non-HR users
    test('Blocks access for non-HR users', async () => {
        localStorageMock.getItem.mockImplementation((key) => {
            if (key === 'roleId') return '0';
            if (key === 'accessToken') return 'test-token';
            return null;
        });

        const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => { });
        renderWithRouter(<UserProfile />);

        await waitFor(() => {
            expect(alertMock).toHaveBeenCalled();
        });
        expect(mockNavigate).toHaveBeenCalledWith('/trombinoscope');

        alertMock.mockRestore();
    });

    // Test 2: Renders loading state initially
    test('Renders loading state initially', async () => {
        authService.get.mockImplementation(() => new Promise(() => { }));

        renderWithRouter(<UserProfile />);

        expect(screen.getByTestId('loading-container')).toBeInTheDocument();
        expect(screen.getByTestId('loading-text')).toBeInTheDocument();
    });

    // Test 3: Loads and displays user profile successfully
    test('Loads and displays user profile successfully', async () => {
        const mockUser = {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            roleId: 0,
            teamId: null,
            telephone: null
        };

        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => [mockUser],
        });

        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });

        renderWithRouter(<UserProfile />);

        await waitFor(() => {
            expect(screen.getByTestId('profile-container')).toBeInTheDocument();
        });

        expect(screen.getByTestId('profile-title')).toBeInTheDocument();
        expect(screen.getByTestId('user-role')).toBeInTheDocument();
        expect(screen.getByTestId('user-email')).toBeInTheDocument();
    });

    // Test 4: Displays email field correctly
    test('Displays email field correctly', async () => {
        const mockUser = {
            id: 1,
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@company.com',
            roleId: 1,
            teamId: null
        };

        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => [mockUser],
        });

        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });

        renderWithRouter(<UserProfile />);

        await waitFor(() => {
            expect(screen.getByTestId('email-field')).toBeInTheDocument();
        });

        const emailElement = screen.getByTestId('user-email');
        expect(emailElement.textContent).toBe('jane.smith@company.com');
    });

    // Test 5: Displays telephone field when available
    test('Displays telephone field when available', async () => {
        const mockUser = {
            id: 1,
            firstName: 'Alice',
            lastName: 'Johnson',
            email: 'alice@example.com',
            telephone: '0123456789',
            roleId: 0,
            teamId: null
        };

        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => [mockUser],
        });

        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });

        renderWithRouter(<UserProfile />);

        await waitFor(() => {
            expect(screen.getByTestId('telephone-field')).toBeInTheDocument();
        });

        const phoneElement = screen.getByTestId('user-telephone');
        expect(phoneElement.textContent).toBe('0123456789');
    });

    // Test 6: Hides telephone field when not available
    test('Hides telephone field when not available', async () => {
        const mockUser = {
            id: 1,
            firstName: 'Bob',
            lastName: 'Brown',
            email: 'bob@example.com',
            telephone: null,
            roleId: 0,
            teamId: null
        };

        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => [mockUser],
        });

        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });

        renderWithRouter(<UserProfile />);

        await waitFor(() => {
            expect(screen.getByTestId('profile-container')).toBeInTheDocument();
        });

        expect(screen.queryByTestId('telephone-field')).not.toBeInTheDocument();
    });

    // Test 7: Displays team name for user with team
    test('Displays team name for user with team', async () => {
        const mockUser = {
            id: 1,
            firstName: 'Charlie',
            lastName: 'Davis',
            email: 'charlie@example.com',
            roleId: 0,
            teamId: 5
        };

        const mockTeams = [
            { id: 5, teamName: 'Engineering Team', managerId: null }
        ];

        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => [mockUser],
        });

        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });

        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => mockTeams,
        });

        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });

        renderWithRouter(<UserProfile />);

        await waitFor(() => {
            expect(screen.getByTestId('team-field')).toBeInTheDocument();
        });

        const teamElement = screen.getByTestId('user-team');
        expect(teamElement.textContent).toBe('Engineering Team');
    });

    // Test 8: Displays manager name for employee with manager
    test('Displays manager name for employee with manager', async () => {
        const mockUser = {
            id: 1,
            firstName: 'Diana',
            lastName: 'Evans',
            email: 'diana@example.com',
            roleId: 0,
            teamId: 3
        };

        const mockTeams = [
            { id: 3, teamName: 'Sales Team', managerId: 10 }
        ];

        const mockUsers = [
            mockUser,
            { id: 10, firstName: 'Manager', lastName: 'Smith' }
        ];

        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => [mockUser],
        });

        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });

        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => mockTeams,
        });

        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => mockUsers,
        });

        renderWithRouter(<UserProfile />);

        await waitFor(() => {
            expect(screen.getByTestId('manager-field')).toBeInTheDocument();
        });

        const managerElement = screen.getByTestId('user-manager');
        expect(managerElement.textContent).toBe('Manager Smith');
    });

    // Test 9: Hides manager field for non-employees
    test('Hides manager field for non-employees', async () => {
        const mockUser = {
            id: 1,
            firstName: 'Eva',
            lastName: 'Foster',
            email: 'eva@example.com',
            roleId: 1,
            teamId: 3
        };

        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => [mockUser],
        });

        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });

        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });

        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });

        renderWithRouter(<UserProfile />);

        await waitFor(() => {
            expect(screen.getByTestId('profile-container')).toBeInTheDocument();
        });

        expect(screen.queryByTestId('manager-field')).not.toBeInTheDocument();
    });

    // Test 10: Loads and displays badge history
    test('Loads and displays badge history', async () => {
        const mockUser = {
            id: 1,
            firstName: 'Frank',
            lastName: 'Garcia',
            email: 'frank@example.com',
            roleId: 0,
            teamId: null
        };

        // Use today's date (January 9, 2026) to match the component's default selectedDate
        const today = new Date().toISOString().split('T')[0];
        const mockBadges = [
            { id: 1, badgedAt: `${today}T09:00:00Z` },
            { id: 2, badgedAt: `${today}T12:00:00Z` }
        ];

        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => [mockUser],
        });

        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => mockBadges,
        });

        renderWithRouter(<UserProfile />);

        await waitFor(() => {
            expect(screen.getByTestId('badges-list-container')).toBeInTheDocument();
        });

        expect(screen.getByTestId('badges-count')).toBeInTheDocument();
        expect(screen.getByTestId('badge-card-0')).toBeInTheDocument();
        expect(screen.getByTestId('badge-card-1')).toBeInTheDocument();
    });

    // Test 11: Shows empty state when no badges for selected date
    test('Shows empty state when no badges for selected date', async () => {
        const mockUser = {
            id: 1,
            firstName: 'Grace',
            lastName: 'Harris',
            email: 'grace@example.com',
            roleId: 0,
            teamId: null
        };

        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => [mockUser],
        });

        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });

        renderWithRouter(<UserProfile />);

        await waitFor(() => {
            expect(screen.getByTestId('empty-badges-state')).toBeInTheDocument();
        });

        expect(screen.getByTestId('empty-badges-message')).toBeInTheDocument();
    });

    // Test 12: Shows loading state while loading badges
    test('Shows loading state while loading badges', async () => {
        const mockUser = {
            id: 1,
            firstName: 'Henry',
            lastName: 'Irving',
            email: 'henry@example.com',
            roleId: 0,
            teamId: null
        };

        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => [mockUser],
        });

        authService.get.mockImplementation(() => new Promise(() => { }));

        renderWithRouter(<UserProfile />);

        await waitFor(() => {
            expect(screen.getByTestId('loading-badges')).toBeInTheDocument();
        });
    });

    // Test 13: Changes date selection and filters badges
    test('Changes date selection and filters badges', async () => {
        const mockUser = {
            id: 1,
            firstName: 'Ivy',
            lastName: 'Jackson',
            email: 'ivy@example.com',
            roleId: 0,
            teamId: null
        };

        const mockBadges = [
            { id: 1, badgedAt: '2026-01-08T09:00:00Z' },
            { id: 2, badgedAt: '2026-01-07T10:00:00Z' }
        ];

        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => [mockUser],
        });

        authService.get.mockResolvedValue({
            ok: true,
            json: async () => mockBadges,
        });

        renderWithRouter(<UserProfile />);

        await waitFor(() => {
            expect(screen.getByTestId('date-picker')).toBeInTheDocument();
        });

        const datePicker = screen.getByTestId('date-picker');
        fireEvent.change(datePicker, { target: { value: '2026-01-07' } });

        await waitFor(() => {
            expect(datePicker.value).toBe('2026-01-07');
        });
    });

    // Test 14: Navigates back to trombinoscope on button click
    test('Navigates back to trombinoscope on button click', async () => {
        const mockUser = {
            id: 1,
            firstName: 'Jack',
            lastName: 'King',
            email: 'jack@example.com',
            roleId: 0,
            teamId: null
        };

        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => [mockUser],
        });

        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });

        renderWithRouter(<UserProfile />);

        await waitFor(() => {
            expect(screen.getByTestId('back-button')).toBeInTheDocument();
        });

        const backButton = screen.getByTestId('back-button');
        fireEvent.click(backButton);

        expect(mockNavigate).toHaveBeenCalledWith('/trombinoscope');
    });

    // Test 15: Displays correct role labels
    test('Displays correct role labels', async () => {
        const testCases = [
            { roleId: 0, expected: 'Employe' },
            { roleId: 1, expected: 'Manager' },
            { roleId: 2, expected: 'Admin' },
            { roleId: 3, expected: 'RH' }
        ];

        for (const testCase of testCases) {
            const mockUser = {
                id: 1,
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                roleId: testCase.roleId,
                teamId: null
            };

            authService.get.mockResolvedValueOnce({
                ok: true,
                json: async () => [mockUser],
            });

            authService.get.mockResolvedValueOnce({
                ok: true,
                json: async () => [],
            });

            const { unmount } = renderWithRouter(<UserProfile />);

            await waitFor(() => {
                expect(screen.getByTestId('user-role')).toBeInTheDocument();
            });

            const roleElement = screen.getByTestId('user-role');
            expect(roleElement.textContent).toBe(testCase.expected);

            unmount();
        }
    });

    // Test 16: Handles user not found error
    test('Handles user not found error', async () => {
        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });

        const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => { });

        renderWithRouter(<UserProfile />);

        await waitFor(() => {
            expect(alertMock).toHaveBeenCalled();
        });
        expect(mockNavigate).toHaveBeenCalledWith('/trombinoscope');

        alertMock.mockRestore();
    });

    // Test 17: Handles API error when loading users
    test('Handles API error when loading users', async () => {
        authService.get.mockResolvedValueOnce({
            ok: false,
            status: 500
        });

        const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => { });

        renderWithRouter(<UserProfile />);

        await waitFor(() => {
            expect(alertMock).toHaveBeenCalled();
        });
        expect(mockNavigate).toHaveBeenCalledWith('/trombinoscope');

        alertMock.mockRestore();
    });

    // Test 18: Handles network error gracefully
    test('Handles network error gracefully', async () => {
        authService.get.mockRejectedValueOnce(new Error('Network error'));

        const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => { });
        const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => { });

        renderWithRouter(<UserProfile />);

        await waitFor(() => {
            expect(consoleErrorMock).toHaveBeenCalled();
        });
        expect(alertMock).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/trombinoscope');

        alertMock.mockRestore();
        consoleErrorMock.mockRestore();
    });

    // Test 19: Displays multiple badges in chronological order
    test('Displays multiple badges in chronological order', async () => {
        const mockUser = {
            id: 1,
            firstName: 'Laura',
            lastName: 'Miller',
            email: 'laura@example.com',
            roleId: 0,
            teamId: null
        };

        // Use today's date (January 9, 2026) to match the component's default selectedDate
        const today = new Date().toISOString().split('T')[0];
        const mockBadges = [
            { id: 1, badgedAt: `${today}T09:00:00Z` },
            { id: 2, badgedAt: `${today}T12:30:00Z` },
            { id: 3, badgedAt: `${today}T17:00:00Z` }
        ];

        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => [mockUser],
        });

        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => mockBadges,
        });

        renderWithRouter(<UserProfile />);

        await waitFor(() => {
            expect(screen.getByTestId('badges-list')).toBeInTheDocument();
        });

        expect(screen.getByTestId('badge-card-0')).toBeInTheDocument();
        expect(screen.getByTestId('badge-card-1')).toBeInTheDocument();
        expect(screen.getByTestId('badge-card-2')).toBeInTheDocument();
        expect(screen.getByTestId('badge-time-0')).toBeInTheDocument();
        expect(screen.getByTestId('badge-time-1')).toBeInTheDocument();
        expect(screen.getByTestId('badge-time-2')).toBeInTheDocument();
    });

    // Test 20: Renders all information sections
    test('Renders all information sections', async () => {
        const mockUser = {
            id: 1,
            firstName: 'Mike',
            lastName: 'Nelson',
            email: 'mike@example.com',
            roleId: 0,
            teamId: null
        };

        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => [mockUser],
        });

        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });

        renderWithRouter(<UserProfile />);

        await waitFor(() => {
            expect(screen.getByTestId('info-card')).toBeInTheDocument();
        });

        expect(screen.getByTestId('info-section-title')).toBeInTheDocument();
        expect(screen.getByTestId('history-card')).toBeInTheDocument();
        expect(screen.getByTestId('history-section-title')).toBeInTheDocument();
        expect(screen.getByTestId('date-label')).toBeInTheDocument();
    });
});