import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Trombinoscope from '../Trombinoscope';
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

describe('Trombinoscope Component', () => {
    const mockUsers = [
        {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            telephone: '0123456789',
            roleId: 0,
            teamId: 1
        },
        {
            id: 2,
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            telephone: '0987654321',
            roleId: 1,
            teamId: 1
        },
        {
            id: 3,
            firstName: 'Bob',
            lastName: 'Manager',
            email: 'bob.manager@example.com',
            roleId: 2,
            teamId: 2
        }
    ];

    const mockTeams = [
        { id: 1, teamName: 'Development Team' },
        { id: 2, teamName: 'Management Team' }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        mockNavigate.mockClear();
        localStorage.clear();
        localStorage.setItem('roleId', '0');

        // Default mock implementations
        authService.get = jest.fn((url) => {
            if (url === '/users') {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve(mockUsers)
                });
            }
            if (url === '/teams') {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve(mockTeams)
                });
            }
            return Promise.resolve({ ok: false, status: 404 });
        });
    });

    describe('Component Rendering', () => {
        // Test 1: Renders trombinoscope page with title
        test('Renders trombinoscope page with title and subtitle', async () => {
            renderWithRouter(<Trombinoscope />);

            await waitFor(() => {
                expect(screen.getByTestId('trombinoscope-container')).toBeInTheDocument();
            });

            await waitFor(() => {
                expect(screen.getByTestId('trombinoscope-title')).toBeInTheDocument();
            });

            await waitFor(() => {
                expect(screen.getByTestId('trombinoscope-subtitle')).toBeInTheDocument();
            });
        });

        // Test 2: Renders search input
        test('Renders search input field', async () => {
            renderWithRouter(<Trombinoscope />);

            await waitFor(() => {
                expect(screen.getByTestId('search-input')).toBeInTheDocument();
            });
        });

        // Test 3: Renders header section
        test('Renders header section correctly', async () => {
            renderWithRouter(<Trombinoscope />);

            await waitFor(() => {
                expect(screen.getByTestId('trombinoscope-header')).toBeInTheDocument();
            });
        });
    });

    describe('Loading State', () => {
        // Test 4: Displays loading message when fetching users
        test('Displays loading message when fetching users', () => {
            authService.get = jest.fn(() => new Promise(() => {})); // Never resolves

            renderWithRouter(<Trombinoscope />);

            expect(screen.getByTestId('trombinoscope-loading')).toBeInTheDocument();
        });

        // Test 5: Shows correct loading text
        test('Shows correct loading text', () => {
            authService.get = jest.fn(() => new Promise(() => {})); // Never resolves

            renderWithRouter(<Trombinoscope />);

            expect(screen.getByTestId('loading-message')).toBeInTheDocument();
        });

        // Test 6: Hides loading state after data is loaded
        test('Hides loading state after data is loaded', async () => {
            renderWithRouter(<Trombinoscope />);

            await waitFor(() => {
                expect(screen.queryByTestId('trombinoscope-loading')).not.toBeInTheDocument();
            });
        });
    });

    describe('Users Loading and Display', () => {
        // Test 7: Loads users on component mount
        test('Loads users on component mount', async () => {
            renderWithRouter(<Trombinoscope />);

            await waitFor(() => {
                expect(authService.get).toHaveBeenCalledWith('/users');
            });
        });

        // Test 8: Loads teams on component mount
        test('Loads teams on component mount', async () => {
            renderWithRouter(<Trombinoscope />);

            await waitFor(() => {
                expect(authService.get).toHaveBeenCalledWith('/teams');
            });
        });

        // Test 9: Displays users grid after loading
        test('Displays users grid after loading', async () => {
            renderWithRouter(<Trombinoscope />);

            await waitFor(() => {
                expect(screen.getByTestId('users-grid')).toBeInTheDocument();
            });
        });

        // Test 10: Displays all user cards
        test('Displays all user cards', async () => {
            renderWithRouter(<Trombinoscope />);

            await waitFor(() => {
                expect(screen.getByTestId('user-card-1')).toBeInTheDocument();
            });

            await waitFor(() => {
                expect(screen.getByTestId('user-card-2')).toBeInTheDocument();
            });

            await waitFor(() => {
                expect(screen.getByTestId('user-card-3')).toBeInTheDocument();
            });
        });

        // Test 11: Displays user names correctly
        test('Displays user names correctly', async () => {
            renderWithRouter(<Trombinoscope />);

            await waitFor(() => {
                expect(screen.getByTestId('user-name-1')).toBeInTheDocument();
            });

            await waitFor(() => {
                expect(screen.getByTestId('user-name-2')).toBeInTheDocument();
            });
        });

        // Test 12: Displays user roles correctly
        test('Displays user roles correctly', async () => {
            renderWithRouter(<Trombinoscope />);

            await waitFor(() => {
                expect(screen.getByTestId('user-role-1')).toBeInTheDocument();
            });

            await waitFor(() => {
                expect(screen.getByTestId('user-role-2')).toBeInTheDocument();
            });
        });

        // Test 13: Displays user avatars
        test('Displays user avatars', async () => {
            renderWithRouter(<Trombinoscope />);

            await waitFor(() => {
                expect(screen.getByTestId('user-avatar-1')).toBeInTheDocument();
            });

            await waitFor(() => {
                expect(screen.getByTestId('user-avatar-2')).toBeInTheDocument();
            });
        });

        // Test 14: Displays user emails
        test('Displays user emails', async () => {
            renderWithRouter(<Trombinoscope />);

            await waitFor(() => {
                expect(screen.getByTestId('user-email-1')).toBeInTheDocument();
            });

            await waitFor(() => {
                expect(screen.getByTestId('user-email-2')).toBeInTheDocument();
            });
        });

        // Test 15: Displays user telephone when available
        test('Displays user telephone when available', async () => {
            renderWithRouter(<Trombinoscope />);

            await waitFor(() => {
                expect(screen.getByTestId('user-telephone-1')).toBeInTheDocument();
            });
        });

        // Test 16: Displays user team when available
        test('Displays user team when available', async () => {
            renderWithRouter(<Trombinoscope />);

            await waitFor(() => {
                expect(screen.getByTestId('user-team-1')).toBeInTheDocument();
            });
        });
    });

    describe('Search Functionality', () => {
        // Test 17: Search input filters users by first name
        test('Search input filters users by first name', async () => {
            renderWithRouter(<Trombinoscope />);

            await waitFor(() => {
                expect(screen.getByTestId('user-card-1')).toBeInTheDocument();
            });

            const searchInput = screen.getByTestId('search-input');
            fireEvent.change(searchInput, { target: { value: 'John' } });

            await waitFor(() => {
                expect(screen.getByTestId('user-card-1')).toBeInTheDocument();
            });

            await waitFor(() => {
                expect(screen.queryByTestId('user-card-2')).not.toBeInTheDocument();
            });
        });

        // Test 18: Search input filters users by last name
        test('Search input filters users by last name', async () => {
            renderWithRouter(<Trombinoscope />);

            await waitFor(() => {
                expect(screen.getByTestId('user-card-2')).toBeInTheDocument();
            });

            const searchInput = screen.getByTestId('search-input');
            fireEvent.change(searchInput, { target: { value: 'Smith' } });

            await waitFor(() => {
                expect(screen.getByTestId('user-card-2')).toBeInTheDocument();
            });

            await waitFor(() => {
                expect(screen.queryByTestId('user-card-1')).not.toBeInTheDocument();
            });
        });

        // Test 19: Search input filters users by email
        test('Search input filters users by email', async () => {
            renderWithRouter(<Trombinoscope />);

            await waitFor(() => {
                expect(screen.getByTestId('user-card-1')).toBeInTheDocument();
            });

            const searchInput = screen.getByTestId('search-input');
            fireEvent.change(searchInput, { target: { value: 'jane.smith' } });

            await waitFor(() => {
                expect(screen.getByTestId('user-card-2')).toBeInTheDocument();
            });

            await waitFor(() => {
                expect(screen.queryByTestId('user-card-1')).not.toBeInTheDocument();
            });
        });

        // Test 20: Search is case insensitive
        test('Search is case insensitive', async () => {
            renderWithRouter(<Trombinoscope />);

            await waitFor(() => {
                expect(screen.getByTestId('user-card-1')).toBeInTheDocument();
            });

            const searchInput = screen.getByTestId('search-input');
            fireEvent.change(searchInput, { target: { value: 'JOHN' } });

            await waitFor(() => {
                expect(screen.getByTestId('user-card-1')).toBeInTheDocument();
            });
        });

        // Test 21: Clearing search shows all users again
        test('Clearing search shows all users again', async () => {
            renderWithRouter(<Trombinoscope />);

            await waitFor(() => {
                expect(screen.getByTestId('user-card-1')).toBeInTheDocument();
            });

            const searchInput = screen.getByTestId('search-input');
            fireEvent.change(searchInput, { target: { value: 'John' } });

            await waitFor(() => {
                expect(screen.queryByTestId('user-card-2')).not.toBeInTheDocument();
            });

            fireEvent.change(searchInput, { target: { value: '' } });

            await waitFor(() => {
                expect(screen.getByTestId('user-card-1')).toBeInTheDocument();
            });

            await waitFor(() => {
                expect(screen.getByTestId('user-card-2')).toBeInTheDocument();
            });
        });

        // Test 22: Shows no users message when no match found
        test('Shows no users message when no match found', async () => {
            renderWithRouter(<Trombinoscope />);

            await waitFor(() => {
                expect(screen.getByTestId('user-card-1')).toBeInTheDocument();
            });

            const searchInput = screen.getByTestId('search-input');
            fireEvent.change(searchInput, { target: { value: 'NonExistentUser' } });

            await waitFor(() => {
                expect(screen.getByTestId('no-users-message')).toBeInTheDocument();
            });
        });
    });

    describe('User Role Based Behavior', () => {
        // Test 23: RH user sees clickable subtitle
        test('RH user sees clickable subtitle', async () => {
            localStorage.setItem('roleId', '3');

            renderWithRouter(<Trombinoscope />);

            await waitFor(() => {
                expect(screen.getByTestId('trombinoscope-subtitle')).toBeInTheDocument();
            });
        });

        // Test 24: Non-RH user sees directory subtitle
        test('Non-RH user sees directory subtitle', async () => {
            localStorage.setItem('roleId', '0');

            renderWithRouter(<Trombinoscope />);

            await waitFor(() => {
                expect(screen.getByTestId('trombinoscope-subtitle')).toBeInTheDocument();
            });
        });

        // Test 25: RH user can click on user cards
        test('RH user can click on user cards', async () => {
            localStorage.setItem('roleId', '3');

            renderWithRouter(<Trombinoscope />);

            await waitFor(() => {
                expect(screen.getByTestId('user-card-1')).toBeInTheDocument();
            });

            const userCard = screen.getByTestId('user-card-1');

            await waitFor(() => {
                expect(userCard).toHaveAttribute('data-clickable', 'true');
            });
        });

        // Test 26: Non-RH user cards are not clickable
        test('Non-RH user cards are not clickable', async () => {
            localStorage.setItem('roleId', '0');

            renderWithRouter(<Trombinoscope />);

            await waitFor(() => {
                expect(screen.getByTestId('user-card-1')).toBeInTheDocument();
            });

            const userCard = screen.getByTestId('user-card-1');

            await waitFor(() => {
                expect(userCard).toHaveAttribute('data-clickable', 'false');
            });
        });

        // Test 27: RH user navigates to user profile on click
        test('RH user navigates to user profile on click', async () => {
            localStorage.setItem('roleId', '3');

            renderWithRouter(<Trombinoscope />);

            await waitFor(() => {
                expect(screen.getByTestId('user-card-1')).toBeInTheDocument();
            });

            const userCard = screen.getByTestId('user-card-1');
            fireEvent.click(userCard);

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('/user-profile/1');
            });
        });

        // Test 28: Non-RH user does not navigate on card click
        test('Non-RH user does not navigate on card click', async () => {
            localStorage.setItem('roleId', '0');

            renderWithRouter(<Trombinoscope />);

            await waitFor(() => {
                expect(screen.getByTestId('user-card-1')).toBeInTheDocument();
            });

            const userCard = screen.getByTestId('user-card-1');
            fireEvent.click(userCard);

            await waitFor(() => {
                expect(mockNavigate).not.toHaveBeenCalled();
            });
        });
    });

    describe('Error Handling', () => {
        // Test 29: Handles 404 response when loading users
        test('Handles 404 response when loading users', async () => {
            authService.get = jest.fn((url) => {
                if (url === '/users') {
                    return Promise.resolve({
                        ok: false,
                        status: 404
                    });
                }
                if (url === '/teams') {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        json: () => Promise.resolve(mockTeams)
                    });
                }
                return Promise.resolve({ ok: false, status: 404 });
            });

            renderWithRouter(<Trombinoscope />);

            await waitFor(() => {
                expect(screen.getByTestId('no-users-message')).toBeInTheDocument();
            });
        });

        // Test 30: Handles error when loading users
        test('Handles error when loading users', async () => {
            const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
            
            authService.get = jest.fn((url) => {
                if (url === '/users') {
                    return Promise.resolve({
                        ok: false,
                        status: 500
                    });
                }
                if (url === '/teams') {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        json: () => Promise.resolve(mockTeams)
                    });
                }
                return Promise.resolve({ ok: false, status: 404 });
            });

            renderWithRouter(<Trombinoscope />);

            await waitFor(() => {
                expect(alertMock).toHaveBeenCalled();
            });

            alertMock.mockRestore();
        });

        // Test 31: Handles error when loading teams gracefully
        test('Handles error when loading teams gracefully', async () => {
            const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
            
            authService.get = jest.fn((url) => {
                if (url === '/users') {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        json: () => Promise.resolve(mockUsers)
                    });
                }
                if (url === '/teams') {
                    return Promise.reject(new Error('Teams loading error'));
                }
                return Promise.resolve({ ok: false, status: 404 });
            });

            renderWithRouter(<Trombinoscope />);

            await waitFor(() => {
                expect(screen.getByTestId('users-grid')).toBeInTheDocument();
            });

            await waitFor(() => {
                expect(consoleErrorMock).toHaveBeenCalled();
            });

            consoleErrorMock.mockRestore();
        });

        // Test 32: Handles empty users array
        test('Handles empty users array', async () => {
            authService.get = jest.fn((url) => {
                if (url === '/users') {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        json: () => Promise.resolve([])
                    });
                }
                if (url === '/teams') {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        json: () => Promise.resolve(mockTeams)
                    });
                }
                return Promise.resolve({ ok: false, status: 404 });
            });

            renderWithRouter(<Trombinoscope />);

            await waitFor(() => {
                expect(screen.getByTestId('no-users-message')).toBeInTheDocument();
            });
        });
    });

    describe('User Information Display', () => {
        // Test 33: Displays user info section
        test('Displays user info section', async () => {
            renderWithRouter(<Trombinoscope />);

            await waitFor(() => {
                expect(screen.getByTestId('user-info-1')).toBeInTheDocument();
            });
        });

        // Test 34: Does not display telephone if not available
        test('Does not display telephone if not available', async () => {
            const usersWithoutPhone = [
                {
                    ...mockUsers[0],
                    telephone: null
                }
            ];

            authService.get = jest.fn((url) => {
                if (url === '/users') {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        json: () => Promise.resolve(usersWithoutPhone)
                    });
                }
                if (url === '/teams') {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        json: () => Promise.resolve(mockTeams)
                    });
                }
                return Promise.resolve({ ok: false, status: 404 });
            });

            renderWithRouter(<Trombinoscope />);

            await waitFor(() => {
                expect(screen.queryByTestId('user-telephone-1')).not.toBeInTheDocument();
            });
        });

        // Test 35: Does not display team if not available
        test('Does not display team if not available', async () => {
            const usersWithoutTeam = [
                {
                    ...mockUsers[0],
                    teamId: 999
                }
            ];

            authService.get = jest.fn((url) => {
                if (url === '/users') {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        json: () => Promise.resolve(usersWithoutTeam)
                    });
                }
                if (url === '/teams') {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        json: () => Promise.resolve(mockTeams)
                    });
                }
                return Promise.resolve({ ok: false, status: 404 });
            });

            renderWithRouter(<Trombinoscope />);

            await waitFor(() => {
                expect(screen.queryByTestId('user-team-1')).not.toBeInTheDocument();
            });
        });
    });
});