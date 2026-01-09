import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import authService from '../../services/authService';
import teamService from '../../services/teamService';
import vehiculeService from '../../services/vehiculeService';
import bookingRoomService from '../../services/bookingRoomService';
import ManagerAnalytics from '../ManagerAnalytics';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

// Mock services
jest.mock('../../services/authService');
jest.mock('../../services/teamService');
jest.mock('../../services/vehiculeService');
jest.mock('../../services/bookingRoomService');

// Mock UserAnalytics component
jest.mock('../UserAnalytics', () => {
    return function MockUserAnalytics({ userId, title, subtitle }) {
        return (
            <div data-testid="user-analytics-mock">
                <div data-testid="user-analytics-userId">{userId}</div>
                <div data-testid="user-analytics-title">{title}</div>
                <div data-testid="user-analytics-subtitle">{subtitle}</div>
            </div>
        );
    };
});

// Mock chart components
jest.mock('../../component/KPICard', () => {
    return function MockKPICard({ title, value, description }) {
        return (
            <div data-testid="kpi-card">
                <div data-testid="kpi-title">{title}</div>
                <div data-testid="kpi-value">{value}</div>
                <div data-testid="kpi-description">{description}</div>
            </div>
        );
    };
});

jest.mock('../../component/PresenceChart', () => {
    return function MockPresenceChart({ data }) {
        return <div data-testid="presence-chart-mock">Presence Chart: {data.length} events</div>;
    };
});

jest.mock('../../component/WeeklyHoursChart', () => {
    return function MockWeeklyHoursChart({ data }) {
        return <div data-testid="weekly-hours-chart-mock">Weekly Hours Chart: {data.length} events</div>;
    };
});

// Mock html2canvas and jsPDF
jest.mock('html2canvas', () => jest.fn());
jest.mock('jspdf', () => {
    return jest.fn().mockImplementation(() => ({
        internal: {
            pageSize: {
                getWidth: () => 210,
                getHeight: () => 297,
            },
        },
        addImage: jest.fn(),
        save: jest.fn(),
    }));
});

// Helper function to render with router
const renderWithRouter = (component) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('ManagerAnalytics Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Default mock implementations
        authService.get = jest.fn();
        authService.post = jest.fn();
        teamService.listMyTeamMembers = jest.fn().mockResolvedValue([]);
        vehiculeService.getAllBookings = jest.fn().mockResolvedValue([]);
        bookingRoomService.list = jest.fn().mockResolvedValue([]);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // Test 1: Component renders correctly
    test('Renders manager analytics page with all elements', async () => {
        teamService.listMyTeamMembers.mockResolvedValue([]);

        renderWithRouter(<ManagerAnalytics />);

        await waitFor(() => {
            expect(screen.getByTestId('manager-analytics-page')).toBeInTheDocument();
        });

        expect(screen.getByTestId('analytics-header')).toBeInTheDocument();
        expect(screen.getByTestId('page-title')).toBeInTheDocument();
        expect(screen.getByTestId('page-subtitle')).toBeInTheDocument();
        expect(screen.getByTestId('filters-section')).toBeInTheDocument();
        expect(screen.getByTestId('view-filter')).toBeInTheDocument();
    });

    // Test 2: Loads team members on mount
    test('Loads team members on component mount', async () => {
        const mockTeamMembers = [
            { id: 1, firstName: 'Alice', lastName: 'Smith', roleId: 0 },
            { id: 2, firstName: 'Bob', lastName: 'Johnson', roleId: 1 },
        ];

        teamService.listMyTeamMembers.mockResolvedValue(mockTeamMembers);

        renderWithRouter(<ManagerAnalytics />);

        await waitFor(() => {
            expect(teamService.listMyTeamMembers).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(screen.getByTestId('page-subtitle').textContent).toContain('2 membres');
        });
    });

    // Test 3: Displays team summary KPI cards
    test('Displays team summary KPI cards', async () => {
        const mockTeamMembers = [
            { id: 1, firstName: 'Alice', lastName: 'Smith', roleId: 0 },
            { id: 2, firstName: 'Bob', lastName: 'Johnson', roleId: 1 },
            { id: 3, firstName: 'Charlie', lastName: 'Brown', roleId: 0 },
        ];

        teamService.listMyTeamMembers.mockResolvedValue(mockTeamMembers);

        renderWithRouter(<ManagerAnalytics />);

        await waitFor(() => {
            expect(screen.getByTestId('team-summary-grid')).toBeInTheDocument();
        });

        expect(screen.getByTestId('total-members-card')).toBeInTheDocument();
        expect(screen.getByTestId('total-managers-card')).toBeInTheDocument();
        expect(screen.getByTestId('total-employees-card')).toBeInTheDocument();
    });

    // Test 4: Shows export button when viewing team view
    test('Shows export button when viewing team view', async () => {
        teamService.listMyTeamMembers.mockResolvedValue([
            { id: 1, firstName: 'Alice', lastName: 'Smith', roleId: 0 },
        ]);

        renderWithRouter(<ManagerAnalytics />);

        await waitFor(() => {
            expect(screen.getByTestId('export-button')).toBeInTheDocument();
        });
    });

    // Test 5: Hides export button when viewing individual member
    test('Hides export button when viewing individual member', async () => {
        const mockTeamMembers = [
            { id: 1, firstName: 'Alice', lastName: 'Smith', roleId: 0 },
        ];

        teamService.listMyTeamMembers.mockResolvedValue(mockTeamMembers);
        authService.get.mockResolvedValue({
            ok: true,
            json: async () => [],
        });

        renderWithRouter(<ManagerAnalytics />);

        await waitFor(() => {
            expect(screen.getByTestId('view-select')).toBeInTheDocument();
        });

        const viewSelect = screen.getByTestId('view-select');
        fireEvent.change(viewSelect, { target: { value: '1' } });

        await waitFor(() => {
            expect(screen.queryByTestId('export-button')).not.toBeInTheDocument();
        });
    });

    // Test 6: Displays no team message when team is empty
    test('Displays no team message when team is empty', async () => {
        teamService.listMyTeamMembers.mockResolvedValue([]);

        renderWithRouter(<ManagerAnalytics />);

        await waitFor(() => {
            expect(screen.getByTestId('no-team-message')).toBeInTheDocument();
        });
    });

    // Test 7: Loads analytics data for team members
    test('Loads analytics data for team members', async () => {
        const mockTeamMembers = [
            { id: 1, firstName: 'Alice', lastName: 'Smith', roleId: 0 },
        ];

        const mockEvents = [
            { badgedAt: '2026-01-07T09:00:00Z' },
            { badgedAt: '2026-01-07T17:00:00Z' },
        ];

        teamService.listMyTeamMembers.mockResolvedValue(mockTeamMembers);
        authService.get.mockResolvedValue({
            ok: true,
            json: async () => mockEvents,
        });

        renderWithRouter(<ManagerAnalytics />);

        await waitFor(() => {
            expect(authService.get).toHaveBeenCalledWith('/badgeLogEvent/user/1');
        });
    });

    // Test 8: Shows loading state while fetching data
    test('Shows loading state while fetching data', async () => {
        const mockTeamMembers = [
            { id: 1, firstName: 'Alice', lastName: 'Smith', roleId: 0 },
        ];

        teamService.listMyTeamMembers.mockResolvedValue(mockTeamMembers);
        authService.get.mockImplementation(() => new Promise(() => { })); // Never resolves

        renderWithRouter(<ManagerAnalytics />);

        await waitFor(() => {
            expect(screen.getByTestId('loading-state')).toBeInTheDocument();
        });
    });

    // Test 9: Displays error message when team fetch fails
    test('Displays error message when team fetch fails', async () => {
        teamService.listMyTeamMembers.mockRejectedValue(new Error('Failed to fetch team'));

        renderWithRouter(<ManagerAnalytics />);

        await waitFor(() => {
            expect(screen.getByTestId('error-message')).toBeInTheDocument();
        }, { timeout: 3000 });

        expect(screen.getByTestId('error-text')).toBeInTheDocument();
        expect(screen.getByTestId('retry-button')).toBeInTheDocument();
    });

    // Test 10: Retry button calls fetchAnalyticsData
    test('Retry button calls fetchAnalyticsData and maintains error state', async () => {
        teamService.listMyTeamMembers.mockRejectedValue(new Error('Failed to fetch team'));

        renderWithRouter(<ManagerAnalytics />);

        await waitFor(() => {
            expect(screen.getByTestId('error-message')).toBeInTheDocument();
        }, { timeout: 3000 });

        const retryButton = screen.getByTestId('retry-button');

        // Clicking retry calls fetchAnalyticsData, but since teamMembers is still empty,
        // the error state persists
        fireEvent.click(retryButton);

        // Error message should still be visible since team members are still not loaded
        await waitFor(() => {
            expect(screen.getByTestId('error-message')).toBeInTheDocument();
        });
    });

    // Test 11: Month filter changes selected month
    test('Month filter changes selected month', async () => {
        teamService.listMyTeamMembers.mockResolvedValue([
            { id: 1, firstName: 'Alice', lastName: 'Smith', roleId: 0 },
        ]);
        authService.get.mockResolvedValue({
            ok: true,
            json: async () => [],
        });

        renderWithRouter(<ManagerAnalytics />);

        await waitFor(() => {
            expect(screen.getByTestId('month-select')).toBeInTheDocument();
        });

        const monthSelect = screen.getByTestId('month-select');
        fireEvent.change(monthSelect, { target: { value: '3' } });

        await waitFor(() => {
            expect(monthSelect.value).toBe('3');
        });
    });

    // Test 12: Year filter changes selected year
    test('Year filter changes selected year', async () => {
        teamService.listMyTeamMembers.mockResolvedValue([
            { id: 1, firstName: 'Alice', lastName: 'Smith', roleId: 0 },
        ]);
        authService.get.mockResolvedValue({
            ok: true,
            json: async () => [],
        });

        renderWithRouter(<ManagerAnalytics />);

        await waitFor(() => {
            expect(screen.getByTestId('year-select')).toBeInTheDocument();
        });

        const yearSelect = screen.getByTestId('year-select');
        const newYear = '2025';
        fireEvent.change(yearSelect, { target: { value: newYear } });

        await waitFor(() => {
            expect(yearSelect.value).toBe(newYear);
        });
    });

    // Test 13: View selector switches between team and individual view
    test('View selector switches between team and individual view', async () => {
        const mockTeamMembers = [
            { id: 1, firstName: 'Alice', lastName: 'Smith', roleId: 0 },
        ];

        teamService.listMyTeamMembers.mockResolvedValue(mockTeamMembers);
        authService.get.mockResolvedValue({
            ok: true,
            json: async () => [],
        });

        renderWithRouter(<ManagerAnalytics />);

        await waitFor(() => {
            expect(screen.getByTestId('view-select')).toBeInTheDocument();
        });

        const viewSelect = screen.getByTestId('view-select');

        // Switch to individual view
        fireEvent.change(viewSelect, { target: { value: '1' } });

        await waitFor(() => {
            expect(screen.getByTestId('user-analytics-container')).toBeInTheDocument();
        });

        // Switch back to team view
        fireEvent.change(viewSelect, { target: { value: 'team' } });

        await waitFor(() => {
            expect(screen.queryByTestId('user-analytics-container')).not.toBeInTheDocument();
        });
    });

    // Test 14: Displays KPI grid with analytics data
    test('Displays KPI grid with analytics data', async () => {
        const mockTeamMembers = [
            { id: 1, firstName: 'Alice', lastName: 'Smith', roleId: 0 },
        ];

        const mockEvents = [
            { badgedAt: '2026-01-07T09:00:00Z' },
            { badgedAt: '2026-01-07T17:00:00Z' },
        ];

        teamService.listMyTeamMembers.mockResolvedValue(mockTeamMembers);
        authService.get.mockResolvedValue({
            ok: true,
            json: async () => mockEvents,
        });
        vehiculeService.getAllBookings.mockResolvedValue([]);
        bookingRoomService.list.mockResolvedValue([]);

        renderWithRouter(<ManagerAnalytics />);

        await waitFor(() => {
            expect(screen.getByTestId('kpi-grid')).toBeInTheDocument();
        });

        expect(screen.getByTestId('kpi-working-days')).toBeInTheDocument();
        expect(screen.getByTestId('kpi-hours-per-day')).toBeInTheDocument();
        expect(screen.getByTestId('kpi-hours-per-week')).toBeInTheDocument();
        expect(screen.getByTestId('kpi-presence-rate')).toBeInTheDocument();
        expect(screen.getByTestId('kpi-vehicle-bookings')).toBeInTheDocument();
        expect(screen.getByTestId('kpi-room-bookings')).toBeInTheDocument();
    });

    // Test 15: Displays charts section when data is available
    test('Displays charts section when data is available', async () => {
        const mockTeamMembers = [
            { id: 1, firstName: 'Alice', lastName: 'Smith', roleId: 0 },
        ];

        const mockEvents = [
            { badgedAt: '2026-01-07T09:00:00Z' },
            { badgedAt: '2026-01-07T17:00:00Z' },
        ];

        teamService.listMyTeamMembers.mockResolvedValue(mockTeamMembers);
        authService.get.mockResolvedValue({
            ok: true,
            json: async () => mockEvents,
        });
        vehiculeService.getAllBookings.mockResolvedValue([]);
        bookingRoomService.list.mockResolvedValue([]);

        renderWithRouter(<ManagerAnalytics />);

        await waitFor(() => {
            expect(screen.getByTestId('charts-section')).toBeInTheDocument();
        });

        expect(screen.getByTestId('presence-chart')).toBeInTheDocument();
        expect(screen.getByTestId('weekly-hours-chart')).toBeInTheDocument();
    });

    // Test 16: Shows no chart data message when no events
    test('Shows no chart data message when no events', async () => {
        const mockTeamMembers = [
            { id: 1, firstName: 'Alice', lastName: 'Smith', roleId: 0 },
        ];

        teamService.listMyTeamMembers.mockResolvedValue(mockTeamMembers);
        authService.get.mockResolvedValue({
            ok: true,
            json: async () => [],
        });
        vehiculeService.getAllBookings.mockResolvedValue([]);
        bookingRoomService.list.mockResolvedValue([]);

        renderWithRouter(<ManagerAnalytics />);

        await waitFor(() => {
            expect(screen.getByTestId('no-chart-data')).toBeInTheDocument();
        });
    });

    // Test 17: Displays calendar section
    test('Displays calendar section', async () => {
        const mockTeamMembers = [
            { id: 1, firstName: 'Alice', lastName: 'Smith', roleId: 0 },
        ];

        teamService.listMyTeamMembers.mockResolvedValue(mockTeamMembers);
        authService.get.mockResolvedValue({
            ok: true,
            json: async () => [],
        });
        vehiculeService.getAllBookings.mockResolvedValue([]);
        bookingRoomService.list.mockResolvedValue([]);

        renderWithRouter(<ManagerAnalytics />);

        await waitFor(() => {
            expect(screen.getByTestId('calendar-section')).toBeInTheDocument();
        });

        expect(screen.getByTestId('heatmap-calendar')).toBeInTheDocument();
    });

    // Test 18: Calculates vehicle bookings for team
    test('Calculates vehicle bookings for team', async () => {
        const mockTeamMembers = [
            { id: 1, firstName: 'Alice', lastName: 'Smith', roleId: 0 },
        ];

        const mockVehicleBookings = [
            { userId: 1, startDatetime: '2026-01-07T09:00:00Z' },
            { userId: 1, startDatetime: '2026-01-15T10:00:00Z' },
        ];

        teamService.listMyTeamMembers.mockResolvedValue(mockTeamMembers);
        authService.get.mockResolvedValue({
            ok: true,
            json: async () => [],
        });
        vehiculeService.getAllBookings.mockResolvedValue(mockVehicleBookings);
        bookingRoomService.list.mockResolvedValue([]);

        renderWithRouter(<ManagerAnalytics />);

        await waitFor(() => {
            expect(vehiculeService.getAllBookings).toHaveBeenCalled();
        });
    });

    // Test 19: Calculates room bookings for team
    test('Calculates room bookings for team', async () => {
        const mockTeamMembers = [
            { id: 1, firstName: 'Alice', lastName: 'Smith', roleId: 0 },
        ];

        const mockRoomBookings = [
            { UserId: 1, StartDatetime: '2026-01-07T09:00:00Z' },
            { UserId: 1, StartDatetime: '2026-01-15T10:00:00Z' },
        ];

        teamService.listMyTeamMembers.mockResolvedValue(mockTeamMembers);
        authService.get.mockResolvedValue({
            ok: true,
            json: async () => [],
        });
        vehiculeService.getAllBookings.mockResolvedValue([]);
        bookingRoomService.list.mockResolvedValue(mockRoomBookings);

        renderWithRouter(<ManagerAnalytics />);

        await waitFor(() => {
            expect(bookingRoomService.list).toHaveBeenCalled();
        });
    });

    // Test 20: Handles team fetch error gracefully
    test('Handles team fetch error gracefully', async () => {
        teamService.listMyTeamMembers.mockRejectedValue(new Error('Failed to fetch team'));
        const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => { });

        renderWithRouter(<ManagerAnalytics />);

        await waitFor(() => {
            expect(consoleErrorMock).toHaveBeenCalled();
        });

        consoleErrorMock.mockRestore();
    });

    // Test 21: Renders heatmap calendar with correct structure
    test('Renders heatmap calendar with correct structure', async () => {
        const mockTeamMembers = [
            { id: 1, firstName: 'Alice', lastName: 'Smith', roleId: 0 },
        ];

        teamService.listMyTeamMembers.mockResolvedValue(mockTeamMembers);
        authService.get.mockResolvedValue({
            ok: true,
            json: async () => [],
        });
        vehiculeService.getAllBookings.mockResolvedValue([]);
        bookingRoomService.list.mockResolvedValue([]);

        renderWithRouter(<ManagerAnalytics />);

        await waitFor(() => {
            expect(screen.getByTestId('heatmap-calendar')).toBeInTheDocument();
        });

        expect(screen.getByTestId('calendar-header')).toBeInTheDocument();
        expect(screen.getByTestId('calendar-grid')).toBeInTheDocument();
        expect(screen.getByTestId('week-days')).toBeInTheDocument();
        expect(screen.getByTestId('calendar-days')).toBeInTheDocument();
        expect(screen.getByTestId('calendar-legend')).toBeInTheDocument();
    });

    // Test 22: Displays calendar legend items
    test('Displays calendar legend items', async () => {
        const mockTeamMembers = [
            { id: 1, firstName: 'Alice', lastName: 'Smith', roleId: 0 },
        ];

        teamService.listMyTeamMembers.mockResolvedValue(mockTeamMembers);
        authService.get.mockResolvedValue({
            ok: true,
            json: async () => [],
        });
        vehiculeService.getAllBookings.mockResolvedValue([]);
        bookingRoomService.list.mockResolvedValue([]);

        renderWithRouter(<ManagerAnalytics />);

        await waitFor(() => {
            expect(screen.getByTestId('calendar-legend')).toBeInTheDocument();
        });

        expect(screen.getByTestId('legend-high')).toBeInTheDocument();
        expect(screen.getByTestId('legend-medium')).toBeInTheDocument();
        expect(screen.getByTestId('legend-low')).toBeInTheDocument();
        expect(screen.getByTestId('legend-none')).toBeInTheDocument();
    });

    // Test 23: Filters events by selected month and year
    test('Filters events by selected month and year', async () => {
        const mockTeamMembers = [
            { id: 1, firstName: 'Alice', lastName: 'Smith', roleId: 0 },
        ];

        const mockEvents = [
            { badgedAt: '2026-01-07T09:00:00Z' },
            { badgedAt: '2026-02-07T09:00:00Z' },
            { badgedAt: '2025-01-07T09:00:00Z' },
        ];

        teamService.listMyTeamMembers.mockResolvedValue(mockTeamMembers);
        authService.get.mockResolvedValue({
            ok: true,
            json: async () => mockEvents,
        });
        vehiculeService.getAllBookings.mockResolvedValue([]);
        bookingRoomService.list.mockResolvedValue([]);

        renderWithRouter(<ManagerAnalytics />);

        await waitFor(() => {
            expect(authService.get).toHaveBeenCalled();
        });
    });

    // Test 24: Disables export button during export
    test('Disables export button during export', async () => {
        const html2canvas = require('html2canvas');
        html2canvas.mockImplementation(() => new Promise(() => { })); // Never resolves

        teamService.listMyTeamMembers.mockResolvedValue([
            { id: 1, firstName: 'Alice', lastName: 'Smith', roleId: 0 },
        ]);
        authService.get.mockResolvedValue({
            ok: true,
            json: async () => [],
        });
        vehiculeService.getAllBookings.mockResolvedValue([]);
        bookingRoomService.list.mockResolvedValue([]);

        renderWithRouter(<ManagerAnalytics />);

        await waitFor(() => {
            expect(screen.getByTestId('export-button')).toBeInTheDocument();
        });

        const exportButton = screen.getByTestId('export-button');
        fireEvent.click(exportButton);

        await waitFor(() => {
            expect(exportButton).toBeDisabled();
        });
    });

    // Test 25: Shows UserAnalytics component when member is selected
    test('Shows UserAnalytics component when member is selected', async () => {
        const mockTeamMembers = [
            { id: 1, firstName: 'Alice', lastName: 'Smith', roleId: 0 },
        ];

        teamService.listMyTeamMembers.mockResolvedValue(mockTeamMembers);
        authService.get.mockResolvedValue({
            ok: true,
            json: async () => [],
        });

        renderWithRouter(<ManagerAnalytics />);

        await waitFor(() => {
            expect(screen.getByTestId('view-select')).toBeInTheDocument();
        });

        const viewSelect = screen.getByTestId('view-select');
        fireEvent.change(viewSelect, { target: { value: '1' } });

        await waitFor(() => {
            expect(screen.getByTestId('user-analytics-mock')).toBeInTheDocument();
        });

        expect(screen.getByTestId('user-analytics-userId').textContent).toBe('1');
    });
});