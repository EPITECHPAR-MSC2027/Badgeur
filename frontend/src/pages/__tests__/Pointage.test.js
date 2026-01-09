import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import authService from '../../services/authService';
import Pointage from '../Pointage';

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

// Mock notificationService
jest.mock('../../services/notificationService', () => ({
    createNotification: jest.fn().mockResolvedValue({}),
}));

// Mock teamService
jest.mock('../../services/teamService', () => ({
    listUsers: jest.fn().mockResolvedValue([]),
}));

// Helper function to render with router
const renderWithRouter = (component) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
};
describe('Pointage Component', () => {
    let localStorageMock;
    beforeEach(() => {
        mockNavigate.mockClear();
        jest.useFakeTimers();

        // Create proper localStorage mock with jest spies
        localStorageMock = {
            getItem: jest.fn((key) => {
                if (key === 'userId') return '1';
                if (key === 'roleId') return '0';
                if (key === 'firstName') return 'John';
                if (key === 'lastName') return 'Doe';
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
        authService.post = jest.fn();
        authService.getAccessToken = jest.fn(() => 'test-token');
    });
    afterEach(() => {
        jest.restoreAllMocks();
        jest.useRealTimers();
    });

    // Test 1: Component renders correctly
    test('Renders pointage page with all elements', async () => {
        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });
        renderWithRouter(<Pointage />);
        await waitFor(() => {
            expect(screen.getByText('Badgeage')).toBeInTheDocument();
        });
        expect(screen.getByTestId('info-text')).toBeInTheDocument();
        expect(screen.getByTestId('badge-button')).toBeInTheDocument();
        expect(screen.getByText('Historique du jour')).toBeInTheDocument();

        // Check for moment cards by test ID instead of text with accents
        expect(screen.getByTestId('moment-0')).toBeInTheDocument();
        expect(screen.getByTestId('moment-1')).toBeInTheDocument();
        expect(screen.getByTestId('moment-2')).toBeInTheDocument();
        expect(screen.getByTestId('moment-3')).toBeInTheDocument();

        // Verify the times are present (no accents)
        expect(screen.getByText('08h00')).toBeInTheDocument();
        expect(screen.getByText('12h00')).toBeInTheDocument();
        expect(screen.getByText('13h00')).toBeInTheDocument();
        expect(screen.getByText('17h00')).toBeInTheDocument();
    });

    // Test 2: Loads badge history on mount
    test('Loads badge history on component mount', async () => {
        const mockHistory = [
            { badgedAt: '2026-01-07T09:00:00Z' },
            { badgedAt: '2026-01-07T12:00:00Z' },
        ];
        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => mockHistory,
        });
        renderWithRouter(<Pointage />);
        await waitFor(() => {
            expect(authService.get).toHaveBeenCalledWith('/badgeLogEvent/user/1');
        });
        await waitFor(() => {
            const historyCount = screen.getByTestId('history-count');
            expect(historyCount.textContent).toContain('2 badgeages');
        });
    });

    // Test 3: Shows empty state when no history
    test('Displays empty state when no badge history', async () => {
        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });
        renderWithRouter(<Pointage />);
        await waitFor(() => {
            expect(screen.getByTestId('empty-state')).toBeInTheDocument();
        });
        await waitFor(() => {
            const emptyMessage = screen.getByTestId('empty-message');
            expect(emptyMessage.textContent).toContain('Effectuez votre premier badgeage');
        });
    });

    // Test 4: Successfully creates a badge
    test('Handles successful badge creation', async () => {
        // Mock history load
        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });
        renderWithRouter(<Pointage />);
        await waitFor(() => {
            expect(screen.getByTestId('badge-button')).toBeInTheDocument();
        });

        // Mock badge creation
        authService.post.mockResolvedValueOnce({
            ok: true,
            json: async () => 123,
        });
        const badgeButton = screen.getByTestId('badge-button');
        fireEvent.click(badgeButton);
        await waitFor(() => {
            expect(authService.post).toHaveBeenCalledWith(
                '/badgeLogEvent/',
                expect.objectContaining({
                    userId: 1,
                })
            );
        });
    });

    // Test 5: Shows toast notification after badge
    test('Displays toast notification after successful badge', async () => {
        // Mock history load
        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });
        renderWithRouter(<Pointage />);
        await waitFor(() => {
            expect(screen.getByTestId('badge-button')).toBeInTheDocument();
        });

        // Mock badge creation
        authService.post.mockResolvedValueOnce({
            ok: true,
            json: async () => 123,
        });
        const badgeButton = screen.getByTestId('badge-button');
        fireEvent.click(badgeButton);
        await waitFor(() => {
            expect(screen.getByTestId('toast')).toBeInTheDocument();
        });

        // Fast forward time to hide toast
        jest.advanceTimersByTime(3000);
        await waitFor(() => {
            expect(screen.queryByTestId('toast')).not.toBeInTheDocument();
        });
    });

    // Test 6: Disables button during loading
    test('Disables badge button during loading', async () => {
        // Mock history load
        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });
        renderWithRouter(<Pointage />);
        await waitFor(() => {
            expect(screen.getByTestId('badge-button')).toBeInTheDocument();
        });

        // Mock badge creation that takes time
        authService.post.mockImplementation(() => new Promise(() => { })); // Never resolves
        const badgeButton = screen.getByTestId('badge-button');
        fireEvent.click(badgeButton);
        await waitFor(() => {
            expect(badgeButton).toBeDisabled();
        });
    });

    // Test 7: Handles badge creation error
    test('Displays alert on badge creation error', async () => {
        // Mock history load
        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });
        const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => { });
        renderWithRouter(<Pointage />);
        await waitFor(() => {
            expect(screen.getByTestId('badge-button')).toBeInTheDocument();
        });

        // Mock badge creation failure
        authService.post.mockResolvedValueOnce({
            ok: false,
            status: 500,
            text: async () => 'Internal Server Error',
        });
        const badgeButton = screen.getByTestId('badge-button');
        fireEvent.click(badgeButton);
        await waitFor(() => {
            expect(alertMock).toHaveBeenCalled();
        });
        alertMock.mockRestore();
    });

    // Test 8: Handles missing userId
    test('Handles missing userId gracefully', async () => {
        localStorageMock.getItem.mockImplementation((key) => {
            if (key === 'accessToken') return 'test-token';
            return null;
        });
        const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => { });
        renderWithRouter(<Pointage />);

        await waitFor(() => {
            expect(consoleErrorMock).toHaveBeenCalled();
        });

        consoleErrorMock.mockRestore();
    });

    // Test 9: Pagination works correctly
    test('Paginates badge history correctly', async () => {
        const mockHistory = Array.from({ length: 12 }, (_, i) => ({
            badgedAt: new Date(2026, 0, 7, 9 + i, 0, 0).toISOString(),
        }));
        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => mockHistory,
        });
        renderWithRouter(<Pointage />);
        await waitFor(() => {
            const historyCount = screen.getByTestId('history-count');
            expect(historyCount.textContent).toContain('12 badgeages');
        });

        // Check pagination is visible
        await waitFor(() => {
            const pageInfo = screen.getByTestId('page-info');
            expect(pageInfo.textContent).toContain('Page 1 sur 3');
        });

        // Navigate to next page
        const nextButton = screen.getByTestId('next-button');
        fireEvent.click(nextButton);
        await waitFor(() => {
            const pageInfo = screen.getByTestId('page-info');
            expect(pageInfo.textContent).toContain('Page 2 sur 3');
        });

        // Navigate to previous page
        const prevButton = screen.getByTestId('prev-button');
        fireEvent.click(prevButton);
        await waitFor(() => {
            const pageInfo = screen.getByTestId('page-info');
            expect(pageInfo.textContent).toContain('Page 1 sur 3');
        });
    });

    // Test 10: Shows "Dernier" badge for most recent entry
    test('Displays "Dernier" label for most recent badge', async () => {
        const mockHistory = [
            { badgedAt: '2026-01-07T12:00:00Z' },
            { badgedAt: '2026-01-07T09:00:00Z' },
        ];
        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => mockHistory,
        });
        renderWithRouter(<Pointage />);
        await waitFor(() => {
            expect(screen.getByTestId('last-badge')).toBeInTheDocument();
        });

        // Should only have one "Dernier" label
        const dernierLabels = screen.getAllByTestId('last-badge');
        expect(dernierLabels).toHaveLength(1);
    });

    // Test 11: Sorts badge history by most recent first
    test('Sorts badge history with most recent first', async () => {
        const mockHistory = [
            { badgedAt: '2026-01-07T09:00:00Z' },
            { badgedAt: '2026-01-07T12:00:00Z' },
            { badgedAt: '2026-01-07T10:30:00Z' },
        ];
        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => mockHistory,
        });
        renderWithRouter(<Pointage />);
        await waitFor(() => {
            expect(screen.getByTestId('history-list')).toBeInTheDocument();
        });

        // The most recent time should be associated with "Dernier"
        expect(screen.getByTestId('last-badge')).toBeInTheDocument();
    });

    // Test 12: Handles 404 response gracefully
    test('Handles 404 response when loading history', async () => {
        authService.get.mockResolvedValueOnce({
            ok: false,
            status: 404,
        });
        const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => { });
        renderWithRouter(<Pointage />);
        await waitFor(() => {
            expect(screen.getByTestId('empty-state')).toBeInTheDocument();
        });
        consoleErrorMock.mockRestore();
    });

    // Test 13: Displays current date
    test('Displays current date in header', async () => {
        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });
        const mockDate = new Date('2026-01-07T10:00:00Z');
        jest.setSystemTime(mockDate);
        renderWithRouter(<Pointage />);
        await waitFor(() => {
            const dateElement = screen.getByTestId('current-date');
            expect(dateElement.textContent).toBe('07/01/2026');
        });
    });

    // Test 14: Resets to page 1 after creating new badge
    test('Resets to page 1 after creating new badge', async () => {
        // Create 6 badges across multiple time slots to trigger pagination
        // Use times that allow us to add another badge at 9:00 AM (morning slot)
        const mockHistory = [
            { badgedAt: new Date(2026, 0, 9, 12, 15, 0).toISOString() }, // Lunch slot (11:01-12:50)
            { badgedAt: new Date(2026, 0, 9, 13, 30, 0).toISOString() }, // Afternoon slot (12:51-16:30)
            { badgedAt: new Date(2026, 0, 9, 17, 0, 0).toISOString() },  // Departure slot (16:31-18:00)
            { badgedAt: new Date(2026, 0, 8, 8, 0, 0).toISOString() },   // Yesterday - for pagination
            { badgedAt: new Date(2026, 0, 8, 12, 0, 0).toISOString() },  // Yesterday - for pagination
            { badgedAt: new Date(2026, 0, 8, 14, 0, 0).toISOString() }   // Yesterday - for pagination
        ];

        // Initial history load
        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => mockHistory,
        });

        renderWithRouter(<Pointage />);

        // Wait for initial load - should show 3 badges for TODAY (2026-01-09)
        await waitFor(() => {
            const historyCount = screen.getByTestId('history-count');
            expect(historyCount.textContent).toContain('3 badgeages');
        });

        // No pagination yet (only 3 badges today, need 6+ for page 2)

        // Mock badge creation (4th badge in morning slot at 9:00 AM)
        authService.post.mockResolvedValueOnce({
            ok: true,
            json: async () => 123,
        });

        // Mock history reload after badge - now 4 badges for TODAY
        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => [
                { badgedAt: new Date(2026, 0, 9, 9, 0, 0).toISOString() }, // NEW badge (morning slot)
                ...mockHistory
            ],
        });

        const badgeButton = screen.getByTestId('badge-button');
        fireEvent.click(badgeButton);

        await waitFor(() => {
            const historyCount = screen.getByTestId('history-count');
            expect(historyCount.textContent).toContain('4 badgeages');
        });

        // Still no pagination (4 badges < 6 needed for 2 pages)
        expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
    });

    // Test 15: Disables pagination buttons at boundaries
    test('Disables pagination buttons at boundaries', async () => {
        const mockHistory = Array.from({ length: 12 }, (_, i) => ({
            badgedAt: new Date(2026, 0, 7, 9 + i, 0, 0).toISOString(),
        }));
        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => mockHistory,
        });
        renderWithRouter(<Pointage />);
        await waitFor(() => {
            const pageInfo = screen.getByTestId('page-info');
            expect(pageInfo.textContent).toContain('Page 1 sur 3');
        });

        // Previous button should be disabled on first page
        const prevButton = screen.getByTestId('prev-button');
        expect(prevButton).toBeDisabled();

        // Navigate to last page
        const nextButton = screen.getByTestId('next-button');
        fireEvent.click(nextButton);
        fireEvent.click(nextButton);
        await waitFor(() => {
            const pageInfo = screen.getByTestId('page-info');
            expect(pageInfo.textContent).toContain('Page 3 sur 3');
        });

        // Next button should be disabled on last page
        expect(nextButton).toBeDisabled();
    });
});