import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import GererEquipe from '../GererEquipe';
import authService from '../../services/authService';
import statsService from '../../services/statsService';
import planningService from '../../services/planningService';

// Mock services
jest.mock('../../services/authService');
jest.mock('../../services/statsService');
jest.mock('../../services/planningService');

// Mock child components
jest.mock('../ValidationPlanning', () => () => <div data-testid="validation-planning-component">ValidationPlanning</div>);
jest.mock('../ManagerAnalytics', () => () => <div data-testid="manager-analytics-component">ManagerAnalytics</div>);

describe('GererEquipe Component', () => {
    let localStorageMock;

    beforeEach(() => {
        jest.clearAllMocks();

        // Setup localStorage mock
        localStorageMock = {
            getItem: jest.fn((key) => {
                if (key === 'userId') return '1';
                if (key === 'roleId') return '1'; // Manager by default
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

        // Default mock implementations
        authService.get = jest.fn();
        statsService.fetchUserBadgeEvents = jest.fn();
        planningService.listByUser = jest.fn();
    });

    // Test 1: Component renders successfully for manager
    test('Renders page with manager title', async () => {
        authService.get.mockResolvedValue({
            ok: true,
            json: async () => [],
        });

        render(<GererEquipe />);

        await waitFor(() => {
            expect(screen.getByTestId('gerer-equipe-page')).toBeInTheDocument();
        });

        expect(screen.getByTestId('page-title')).toBeInTheDocument();
    });

    // Test 2: Component renders successfully for RH
    test('Renders page with RH title', async () => {
        localStorageMock.getItem.mockImplementation((key) => {
            if (key === 'userId') return '1';
            if (key === 'roleId') return '3'; // RH role
            return null;
        });

        authService.get.mockResolvedValue({
            ok: true,
            json: async () => [],
        });

        render(<GererEquipe />);

        await waitFor(() => {
            expect(screen.getByTestId('page-title')).toBeInTheDocument();
        });
    });

    // Test 3: Manager sees three tab buttons
    test('Displays three tab buttons for manager', async () => {
        authService.get.mockResolvedValue({
            ok: true,
            json: async () => [],
        });

        render(<GererEquipe />);

        await waitFor(() => {
            expect(screen.getByTestId('tab-button-manage')).toBeInTheDocument();
        });

        expect(screen.getByTestId('tab-button-validation')).toBeInTheDocument();
        expect(screen.getByTestId('tab-button-dashboard')).toBeInTheDocument();
    });

    // Test 4: RH sees only validation tab button
    test('Displays only validation tab for RH', async () => {
        localStorageMock.getItem.mockImplementation((key) => {
            if (key === 'userId') return '1';
            if (key === 'roleId') return '3';
            return null;
        });

        authService.get.mockResolvedValue({
            ok: true,
            json: async () => [],
        });

        render(<GererEquipe />);

        await waitFor(() => {
            expect(screen.getByTestId('tab-button-validation')).toBeInTheDocument();
        });

        expect(screen.queryByTestId('tab-button-manage')).not.toBeInTheDocument();
        expect(screen.queryByTestId('tab-button-dashboard')).not.toBeInTheDocument();
    });

    // Test 5: Loads team members for manager
    test('Loads and displays team members for manager', async () => {
        const mockUsers = [
            { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', teamId: 10, roleId: 0 },
            { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', teamId: 10, roleId: 0 }
        ];
        const mockTeams = [
            { id: 10, managerId: 1, name: 'Team A' }
        ];

        authService.get.mockImplementation((url) => {
            if (url === '/users') {
                return Promise.resolve({ ok: true, json: async () => mockUsers });
            }
            if (url === '/teams') {
                return Promise.resolve({ ok: true, json: async () => mockTeams });
            }
            return Promise.resolve({ ok: false });
        });

        statsService.fetchUserBadgeEvents.mockResolvedValue([]);

        render(<GererEquipe />);

        await waitFor(() => {
            expect(screen.getByTestId('team-member-card-1')).toBeInTheDocument();
        });

        expect(screen.getByTestId('team-member-card-2')).toBeInTheDocument();
        expect(screen.getByTestId('member-name-1')).toHaveTextContent('John Doe');
        expect(screen.getByTestId('member-name-2')).toHaveTextContent('Jane Smith');
    });

    // Test 6: Displays empty team message when no members
    test('Displays empty team message when no team members', async () => {
        authService.get.mockResolvedValue({
            ok: true,
            json: async () => [],
        });

        render(<GererEquipe />);

        await waitFor(() => {
            expect(screen.getByTestId('empty-team-message')).toBeInTheDocument();
        });
    });

    // Test 7: Shows error message on data load failure
    test('Displays error message on load failure', async () => {
        authService.get.mockResolvedValue({
            ok: false,
            status: 500
        });

        render(<GererEquipe />);

        await waitFor(() => {
            expect(screen.getByTestId('error-message')).toBeInTheDocument();
        });
    });

    // Test 8: Tab switching to validation works
    test('Switches to validation tab when clicked', async () => {
        authService.get.mockResolvedValue({
            ok: true,
            json: async () => [],
        });

        render(<GererEquipe />);

        await waitFor(() => {
            expect(screen.getByTestId('tab-button-validation')).toBeInTheDocument();
        });

        const validationTab = screen.getByTestId('tab-button-validation');
        fireEvent.click(validationTab);

        await waitFor(() => {
            expect(screen.getByTestId('validation-planning-component')).toBeInTheDocument();
        });
    });

    // Test 9: Tab switching to dashboard works
    test('Switches to dashboard tab when clicked', async () => {
        authService.get.mockResolvedValue({
            ok: true,
            json: async () => [],
        });

        render(<GererEquipe />);

        await waitFor(() => {
            expect(screen.getByTestId('tab-button-dashboard')).toBeInTheDocument();
        });

        const dashboardTab = screen.getByTestId('tab-button-dashboard');
        fireEvent.click(dashboardTab);

        await waitFor(() => {
            expect(screen.getByTestId('dashboard-view')).toBeInTheDocument();
        });

        expect(screen.getByTestId('manager-analytics-component')).toBeInTheDocument();
    });

    // Test 10: Manage view is displayed by default
    test('Displays manage view by default for manager', async () => {
        authService.get.mockResolvedValue({
            ok: true,
            json: async () => [],
        });

        render(<GererEquipe />);

        await waitFor(() => {
            expect(screen.getByTestId('manage-view')).toBeInTheDocument();
        });

        expect(screen.getByTestId('team-title')).toBeInTheDocument();
    });

    // Test 11: Fetches last punch for each team member
    test('Fetches and displays last punch for team members', async () => {
        const mockUsers = [
            { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', teamId: 10, roleId: 0 }
        ];
        const mockTeams = [
            { id: 10, managerId: 1, name: 'Team A' }
        ];
        const mockBadgeEvents = [
            { badgedAt: '2026-01-08T09:30:00Z' }
        ];

        authService.get.mockImplementation((url) => {
            if (url === '/users') return Promise.resolve({ ok: true, json: async () => mockUsers });
            if (url === '/teams') return Promise.resolve({ ok: true, json: async () => mockTeams });
            return Promise.resolve({ ok: false });
        });

        statsService.fetchUserBadgeEvents.mockResolvedValue(mockBadgeEvents);

        render(<GererEquipe />);

        await waitFor(() => {
            expect(screen.getByTestId('member-last-punch-1')).toBeInTheDocument();
        });

        expect(statsService.fetchUserBadgeEvents).toHaveBeenCalledWith(1);
    });

    // Test 12: Handles no last punch gracefully
    test('Displays no punch message when member has no badge events', async () => {
        const mockUsers = [
            { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', teamId: 10, roleId: 0 }
        ];
        const mockTeams = [
            { id: 10, managerId: 1, name: 'Team A' }
        ];

        authService.get.mockImplementation((url) => {
            if (url === '/users') return Promise.resolve({ ok: true, json: async () => mockUsers });
            if (url === '/teams') return Promise.resolve({ ok: true, json: async () => mockTeams });
            return Promise.resolve({ ok: false });
        });

        statsService.fetchUserBadgeEvents.mockResolvedValue([]);

        render(<GererEquipe />);

        await waitFor(() => {
            const punchTime = screen.getByTestId('member-punch-time-1');
            expect(punchTime).toBeInTheDocument();
        });
    });

    // Test 13: Content container shows reduced opacity when loading
    test('Content container shows loading state', async () => {
        authService.get.mockImplementation(() => new Promise(() => { })); // Never resolves

        render(<GererEquipe />);

        const contentContainer = screen.getByTestId('content-container');
        expect(contentContainer).toHaveStyle({ opacity: 0.6 });
    });

    // Test 14: Team members grid is rendered
    test('Renders team members grid container', async () => {
        authService.get.mockResolvedValue({
            ok: true,
            json: async () => [],
        });

        render(<GererEquipe />);

        await waitFor(() => {
            expect(screen.getByTestId('team-members-grid')).toBeInTheDocument();
        });
    });

    // Test 15: Member avatar is displayed
    test('Displays member avatar for each team member', async () => {
        const mockUsers = [
            { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', teamId: 10, roleId: 0 }
        ];
        const mockTeams = [
            { id: 10, managerId: 1, name: 'Team A' }
        ];

        authService.get.mockImplementation((url) => {
            if (url === '/users') return Promise.resolve({ ok: true, json: async () => mockUsers });
            if (url === '/teams') return Promise.resolve({ ok: true, json: async () => mockTeams });
            return Promise.resolve({ ok: false });
        });

        statsService.fetchUserBadgeEvents.mockResolvedValue([]);

        render(<GererEquipe />);

        await waitFor(() => {
            expect(screen.getByTestId('member-avatar-1')).toBeInTheDocument();
        });
    });

    // Test 16: Member email is displayed
    test('Displays member email for each team member', async () => {
        const mockUsers = [
            { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', teamId: 10, roleId: 0 }
        ];
        const mockTeams = [
            { id: 10, managerId: 1, name: 'Team A' }
        ];

        authService.get.mockImplementation((url) => {
            if (url === '/users') return Promise.resolve({ ok: true, json: async () => mockUsers });
            if (url === '/teams') return Promise.resolve({ ok: true, json: async () => mockTeams });
            return Promise.resolve({ ok: false });
        });

        statsService.fetchUserBadgeEvents.mockResolvedValue([]);

        render(<GererEquipe />);

        await waitFor(() => {
            expect(screen.getByTestId('member-email-1')).toHaveTextContent('john@example.com');
        });
    });

    // Test 17: RH loads all teams
    test('RH role loads all teams', async () => {
        localStorageMock.getItem.mockImplementation((key) => {
            if (key === 'userId') return '1';
            if (key === 'roleId') return '3';
            return null;
        });

        const mockTeams = [
            { id: 1, name: 'Team A' },
            { id: 2, name: 'Team B' }
        ];

        authService.get.mockImplementation((url) => {
            if (url === '/teams') return Promise.resolve({ ok: true, json: async () => mockTeams });
            if (url === '/users') return Promise.resolve({ ok: true, json: async () => [] });
            return Promise.resolve({ ok: false });
        });

        render(<GererEquipe />);

        await waitFor(() => {
            expect(authService.get).toHaveBeenCalledWith('/teams');
        });
    });

    // Test 18: RH loads all users
    test('RH role loads all users', async () => {
        localStorageMock.getItem.mockImplementation((key) => {
            if (key === 'userId') return '1';
            if (key === 'roleId') return '3';
            return null;
        });

        const mockUsers = [
            { id: 1, firstName: 'User', lastName: 'One', email: 'user1@example.com' },
            { id: 2, firstName: 'User', lastName: 'Two', email: 'user2@example.com' }
        ];

        authService.get.mockImplementation((url) => {
            if (url === '/users') return Promise.resolve({ ok: true, json: async () => mockUsers });
            if (url === '/teams') return Promise.resolve({ ok: true, json: async () => [] });
            return Promise.resolve({ ok: false });
        });

        planningService.listByUser.mockResolvedValue([]);

        render(<GererEquipe />);

        await waitFor(() => {
            expect(authService.get).toHaveBeenCalledWith('/users');
        });
    });

    // Test 19: Manager only loads their own team
    test('Manager only loads their own team members', async () => {
        localStorageMock.getItem.mockImplementation((key) => {
            if (key === 'userId') return '5';
            if (key === 'roleId') return '1';
            return null;
        });

        const mockUsers = [
            { id: 1, firstName: 'Team', lastName: 'Member', email: 'member@example.com', teamId: 20 },
            { id: 2, firstName: 'Other', lastName: 'User', email: 'other@example.com', teamId: 30 }
        ];
        const mockTeams = [
            { id: 20, managerId: 5, name: 'My Team' },
            { id: 30, managerId: 10, name: 'Other Team' }
        ];

        authService.get.mockImplementation((url) => {
            if (url === '/users') return Promise.resolve({ ok: true, json: async () => mockUsers });
            if (url === '/teams') return Promise.resolve({ ok: true, json: async () => mockTeams });
            return Promise.resolve({ ok: false });
        });

        statsService.fetchUserBadgeEvents.mockResolvedValue([]);

        render(<GererEquipe />);

        await waitFor(() => {
            expect(screen.getByTestId('team-member-card-1')).toBeInTheDocument();
        });

        expect(screen.queryByTestId('team-member-card-2')).not.toBeInTheDocument();
    });

    // Test 20: Header contains all expected elements
    test('Header contains title and tab buttons', async () => {
        authService.get.mockResolvedValue({
            ok: true,
            json: async () => [],
        });

        render(<GererEquipe />);

        await waitFor(() => {
            expect(screen.getByTestId('page-header')).toBeInTheDocument();
        });

        expect(screen.getByTestId('page-title')).toBeInTheDocument();
        expect(screen.getByTestId('tab-buttons')).toBeInTheDocument();
    });

    // Test 21: Handles users API error gracefully
    test('Handles users API error gracefully', async () => {
        authService.get.mockImplementation((url) => {
            if (url === '/users') return Promise.resolve({ ok: false, status: 404 });
            if (url === '/teams') return Promise.resolve({ ok: true, json: async () => [] });
            return Promise.resolve({ ok: false });
        });

        const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => { });

        render(<GererEquipe />);

        await waitFor(() => {
            expect(screen.getByTestId('error-message')).toBeInTheDocument();
        });

        consoleErrorMock.mockRestore();
    });

    // Test 22: Handles teams API error gracefully
    test('Handles teams API error gracefully', async () => {
        authService.get.mockImplementation((url) => {
            if (url === '/users') return Promise.resolve({ ok: true, json: async () => [] });
            if (url === '/teams') return Promise.resolve({ ok: false, status: 404 });
            return Promise.resolve({ ok: false });
        });

        const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => { });

        render(<GererEquipe />);

        await waitFor(() => {
            expect(screen.getByTestId('error-message')).toBeInTheDocument();
        });

        consoleErrorMock.mockRestore();
    });

    // Test 23: Handles stats service error for last punch
    test('Handles stats service error for last punch gracefully', async () => {
        const mockUsers = [
            { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', teamId: 10, roleId: 0 }
        ];
        const mockTeams = [
            { id: 10, managerId: 1, name: 'Team A' }
        ];

        authService.get.mockImplementation((url) => {
            if (url === '/users') return Promise.resolve({ ok: true, json: async () => mockUsers });
            if (url === '/teams') return Promise.resolve({ ok: true, json: async () => mockTeams });
            return Promise.resolve({ ok: false });
        });

        statsService.fetchUserBadgeEvents.mockRejectedValue(new Error('Stats error'));
        const consoleWarnMock = jest.spyOn(console, 'warn').mockImplementation(() => { });

        render(<GererEquipe />);

        await waitFor(() => {
            const punchTime = screen.getByTestId('member-punch-time-1');
            expect(punchTime).toBeInTheDocument();
        });

        consoleWarnMock.mockRestore();
    });

    // Test 24: Multiple team members are displayed correctly
    test('Displays multiple team members correctly', async () => {
        const mockUsers = [
            { id: 1, firstName: 'Alice', lastName: 'Johnson', email: 'alice@example.com', teamId: 10, roleId: 0 },
            { id: 2, firstName: 'Bob', lastName: 'Williams', email: 'bob@example.com', teamId: 10, roleId: 0 },
            { id: 3, firstName: 'Charlie', lastName: 'Brown', email: 'charlie@example.com', teamId: 10, roleId: 0 }
        ];
        const mockTeams = [
            { id: 10, managerId: 1, name: 'Team A' }
        ];

        authService.get.mockImplementation((url) => {
            if (url === '/users') return Promise.resolve({ ok: true, json: async () => mockUsers });
            if (url === '/teams') return Promise.resolve({ ok: true, json: async () => mockTeams });
            return Promise.resolve({ ok: false });
        });

        statsService.fetchUserBadgeEvents.mockResolvedValue([]);

        render(<GererEquipe />);

        await waitFor(() => {
            expect(screen.getByTestId('team-member-card-1')).toBeInTheDocument();
        });

        expect(screen.getByTestId('team-member-card-2')).toBeInTheDocument();
        expect(screen.getByTestId('team-member-card-3')).toBeInTheDocument();
        expect(screen.getByTestId('member-name-1')).toHaveTextContent('Alice Johnson');
        expect(screen.getByTestId('member-name-2')).toHaveTextContent('Bob Williams');
        expect(screen.getByTestId('member-name-3')).toHaveTextContent('Charlie Brown');
    });

    // Test 25: RH loads user plannings
    test('RH loads plannings for all users', async () => {
        localStorageMock.getItem.mockImplementation((key) => {
            if (key === 'userId') return '1';
            if (key === 'roleId') return '3';
            return null;
        });

        const mockUsers = [
            { id: 1, firstName: 'User', lastName: 'One', email: 'user1@example.com' },
            { id: 2, firstName: 'User', lastName: 'Two', email: 'user2@example.com' }
        ];

        authService.get.mockImplementation((url) => {
            if (url === '/users') return Promise.resolve({ ok: true, json: async () => mockUsers });
            if (url === '/teams') return Promise.resolve({ ok: true, json: async () => [] });
            return Promise.resolve({ ok: false });
        });

        render(<GererEquipe />);

        await waitFor(() => {
            expect(authService.get).toHaveBeenCalledWith('/users');
        });

        // RH role loads users and teams but does not currently call planningService
        expect(authService.get).toHaveBeenCalledWith('/teams');
        expect(planningService.listByUser).not.toHaveBeenCalled();
    });
});