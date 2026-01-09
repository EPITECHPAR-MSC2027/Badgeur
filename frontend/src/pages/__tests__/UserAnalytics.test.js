import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserAnalytics from '../UserAnalytics';
import authService from '../../services/authService';
import vehiculeService from '../../services/vehiculeService';
import bookingRoomService from '../../services/bookingRoomService';

// Mock the services
jest.mock('../../services/authService');
jest.mock('../../services/vehiculeService');
jest.mock('../../services/bookingRoomService');

// Mock child components
jest.mock('../../component/KPICard', () => ({ title, value, description }) => (
    <div data-testid={`kpi-${title.toLowerCase().replace(/\s+/g, '-')}`}>
        <div>{title}</div>
        <div>{value}</div>
        <div>{description}</div>
    </div>
));
jest.mock('../../component/PresenceChart', () => () => <div data-testid="presence-chart">PresenceChart</div>);
jest.mock('../../component/WeeklyHoursChart', () => () => <div data-testid="weekly-hours-chart">WeeklyHoursChart</div>);
jest.mock('../../component/HeatmapCalendar', () => () => <div data-testid="heatmap-calendar">HeatmapCalendar</div>);

// Mock html2canvas and jsPDF
jest.mock('html2canvas', () => jest.fn(() => Promise.resolve({
    toDataURL: jest.fn(() => 'mock-image-data'),
    width: 800,
    height: 600
})));
jest.mock('jspdf', () => {
    return jest.fn().mockImplementation(() => ({
        internal: {
            pageSize: {
                getWidth: () => 210,
                getHeight: () => 297
            }
        },
        addImage: jest.fn(),
        save: jest.fn()
    }));
});

describe('UserAnalytics', () => {
    const mockUserId = '123';
    const mockEvents = [
        { badgedAt: '2026-01-15T08:00:00Z' },
        { badgedAt: '2026-01-15T12:00:00Z' },
        { badgedAt: '2026-01-15T13:00:00Z' },
        { badgedAt: '2026-01-15T17:00:00Z' }
    ];

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();

        // Setup localStorage mock
        Storage.prototype.getItem = jest.fn((key) => {
            if (key === 'userId') return mockUserId;
            return null;
        });

        // Setup default successful responses
        authService.get = jest.fn((url) => {
            if (url === '/kpis/me') {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve({
                        hoursPerDay: '08:00',
                        hoursPerWeek: '40:00',
                        workingDays: 20,
                        presenceRate: '90.00'
                    })
                });
            }
            if (url.includes('/badgeLogEvent/user/')) {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve(mockEvents)
                });
            }
            return Promise.resolve({ ok: false, status: 404 });
        });

        vehiculeService.getBookingsByUserId = jest.fn(() => Promise.resolve([]));
        bookingRoomService.list = jest.fn(() => Promise.resolve([]));
    });

    describe('Component Rendering', () => {
        // Test 1: Renders analytics page with default title
        test('Renders analytics page with default title and subtitle', async () => {
            render(<UserAnalytics />);

            await waitFor(() => {
                expect(screen.getByTestId('analytics-page')).toBeInTheDocument();
            });

            await waitFor(() => {
                expect(screen.getByTestId('analytics-title')).toHaveTextContent('Mes Analytics');
            });

            await waitFor(() => {
                expect(screen.getByTestId('analytics-subtitle')).toHaveTextContent('Analyse de mes données personnelles');
            });
        });

        // Test 2: Renders analytics page with custom title
        test('Renders analytics page with custom title and subtitle', async () => {
            render(<UserAnalytics title="Custom Title" subtitle="Custom Subtitle" />);

            await waitFor(() => {
                expect(screen.getByTestId('analytics-page')).toBeInTheDocument();
            });

            await waitFor(() => {
                expect(screen.getByTestId('analytics-title')).toHaveTextContent('Custom Title');
            });

            await waitFor(() => {
                expect(screen.getByTestId('analytics-subtitle')).toHaveTextContent('Custom Subtitle');
            });
        });

        // Test 3: Renders month selector
        test('Renders month and year selectors', async () => {
            render(<UserAnalytics />);

            await waitFor(() => {
                expect(screen.getByTestId('month-select')).toBeInTheDocument();
            });

            await waitFor(() => {
                expect(screen.getByTestId('year-select')).toBeInTheDocument();
            });
        });

        // Test 4: Renders export button
        test('Renders export button', async () => {
            render(<UserAnalytics />);

            await waitFor(() => {
                expect(screen.getByTestId('export-button')).toBeInTheDocument();
            });

            await waitFor(() => {
                expect(screen.getByTestId('export-button')).toHaveTextContent('📊 Exporter en PDF');
            });
        });
    });

    describe('Loading State', () => {
        // Test 5: Displays loading indicator when fetching data
        test('Displays loading indicator when fetching data', () => {
            authService.get = jest.fn(() => new Promise(() => { })); // Never resolves

            render(<UserAnalytics />);

            expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
        });

        // Test 6: Shows correct loading message
        test('Shows correct loading message', () => {
            authService.get = jest.fn(() => new Promise(() => { })); // Never resolves

            render(<UserAnalytics />);

            expect(screen.getByTestId('loading-indicator')).toHaveTextContent('Chargement des données...');
        });

        // Test 7: Hides loading indicator after data is fetched
        test('Hides loading indicator after data is fetched', async () => {
            render(<UserAnalytics />);

            await waitFor(() => {
                expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
            });
        });
    });

    describe('Error Handling', () => {
        // Test 8: Displays error message when user is not connected
        test('Displays error message when user is not connected', async () => {
            Storage.prototype.getItem = jest.fn(() => null);

            render(<UserAnalytics />);

            await waitFor(() => {
                expect(screen.getByTestId('error-message')).toBeInTheDocument();
            });
        });

        // Test 9: Shows correct error text when user is not connected
        test('Shows correct error text when user is not connected', async () => {
            Storage.prototype.getItem = jest.fn(() => null);

            render(<UserAnalytics />);

            await waitFor(() => {
                expect(screen.getByText('Utilisateur non connecté')).toBeInTheDocument();
            });
        });

        // Test 10: Displays error message when API call fails
        test('Displays error message when API call fails', async () => {
            authService.get = jest.fn(() =>
                Promise.reject(new Error('API Error'))
            );

            render(<UserAnalytics />);

            await waitFor(() => {
                expect(screen.getByTestId('error-message')).toBeInTheDocument();
            });
        });

        // Test 11: Renders retry button on error
        test('Renders retry button on error', async () => {
            authService.get = jest.fn(() =>
                Promise.reject(new Error('API Error'))
            );

            render(<UserAnalytics />);

            await waitFor(() => {
                expect(screen.getByTestId('retry-button')).toBeInTheDocument();
            });
        });

        // Test 12: Shows correct retry button text
        test('Shows correct retry button text', async () => {
            authService.get = jest.fn(() =>
                Promise.reject(new Error('API Error'))
            );

            render(<UserAnalytics />);

            await waitFor(() => {
                expect(screen.getByTestId('retry-button')).toHaveTextContent('🔄 Réessayer');
            });
        });

        // Test 13: Retries fetching data when retry button is clicked
        test('Retries fetching data when retry button is clicked', async () => {
            let shouldFail = true;

            authService.get = jest.fn(() => {
                if (shouldFail) {
                    return Promise.reject(new Error('API Error'));
                }

                // After retry, return success
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve({})
                });
            });

            // Make vehicle and room services fail too
            vehiculeService.getBookingsByUserId = jest.fn(() => {
                if (shouldFail) {
                    return Promise.reject(new Error('API Error'));
                }
                return Promise.resolve([]);
            });

            bookingRoomService.list = jest.fn(() => {
                if (shouldFail) {
                    return Promise.reject(new Error('API Error'));
                }
                return Promise.resolve([]);
            });

            render(<UserAnalytics />);

            // Wait for error state
            await waitFor(() => {
                expect(screen.getByTestId('error-message')).toBeInTheDocument();
            }, { timeout: 3000 });

            // Verify retry button exists
            expect(screen.getByTestId('retry-button')).toBeInTheDocument();

            // Now allow all requests to succeed
            shouldFail = false;

            // Click retry
            fireEvent.click(screen.getByTestId('retry-button'));

            // Wait for successful render (error should disappear)
            await waitFor(() => {
                expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
            }, { timeout: 3000 });

            // Verify data loaded successfully
            await waitFor(() => {
                expect(screen.getByTestId('kpi-grid')).toBeInTheDocument();
            });
        });
    });

    describe('KPI Display', () => {
        // Test 14: Displays KPI grid container
        test('Displays KPI grid container', async () => {
            render(<UserAnalytics />);

            await waitFor(() => {
                expect(screen.getByTestId('kpi-grid')).toBeInTheDocument();
            });
        });

        // Test 15: Displays all KPI card titles
        test('Displays all KPI card titles', async () => {
            render(<UserAnalytics />);

            await waitFor(() => {
                expect(screen.getByTestId('kpi-grid')).toBeInTheDocument();
            });

            const kpiCards = screen.getAllByText(/jours travaillés|heures\/jour|heures\/semaine|taux de présence|réservations/i);
            expect(kpiCards.length).toBeGreaterThan(0);
        });

        // Test 16: Calculates working days correctly from events
        test('Calculates working days correctly from events', async () => {
            const eventsInJanuary = [
                { badgedAt: '2026-01-15T08:00:00Z' },
                { badgedAt: '2026-01-15T17:00:00Z' },
                { badgedAt: '2026-01-16T08:00:00Z' },
                { badgedAt: '2026-01-16T17:00:00Z' }
            ];

            authService.get = jest.fn((url) => {
                if (url.includes('/badgeLogEvent/user/')) {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        json: () => Promise.resolve(eventsInJanuary)
                    });
                }
                return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) });
            });

            render(<UserAnalytics />);

            await waitFor(() => {
                expect(screen.getByTestId('kpi-grid')).toBeInTheDocument();
            });

            await waitFor(() => {
                expect(screen.getByText(/2\/31/)).toBeInTheDocument();
            });
        });

        // Test 17: Displays vehicle bookings count
        test('Displays vehicle bookings count', async () => {
            const mockVehicleBookings = [
                { startDatetime: '2026-01-15T10:00:00Z' },
                { startDatetime: '2026-01-20T10:00:00Z' }
            ];

            vehiculeService.getBookingsByUserId = jest.fn(() =>
                Promise.resolve(mockVehicleBookings)
            );

            render(<UserAnalytics />);

            await waitFor(() => {
                expect(screen.getByText('2')).toBeInTheDocument();
            });
        });

        // Test 18: Displays room bookings count
        test('Displays room bookings count', async () => {
            const mockRoomBookings = [
                { UserId: 123, StartDatetime: '2026-01-15T10:00:00Z' },
                { UserId: 123, StartDatetime: '2026-01-20T10:00:00Z' }
            ];

            bookingRoomService.list = jest.fn(() =>
                Promise.resolve(mockRoomBookings)
            );

            render(<UserAnalytics />);

            await waitFor(() => {
                expect(screen.getByText('2')).toBeInTheDocument();
            });
        });
    });

    describe('Month and Year Selection', () => {
        // Test 19: Changes month when month selector is changed
        test('Changes month when month selector is changed', async () => {
            render(<UserAnalytics />);

            await waitFor(() => {
                expect(screen.getByTestId('month-select')).toBeInTheDocument();
            });

            const monthSelect = screen.getByTestId('month-select');

            fireEvent.change(monthSelect, { target: { value: '2' } });

            await waitFor(() => {
                expect(monthSelect.value).toBe('2');
            });
        });

        // Test 20: Changes year when year selector is changed
        test('Changes year when year selector is changed', async () => {
            render(<UserAnalytics />);

            await waitFor(() => {
                expect(screen.getByTestId('year-select')).toBeInTheDocument();
            });

            const yearSelect = screen.getByTestId('year-select');

            fireEvent.change(yearSelect, { target: { value: '2025' } });

            await waitFor(() => {
                expect(yearSelect.value).toBe('2025');
            });
        });

        // Test 21: Refetches data when month is changed
        test('Refetches data when month is changed', async () => {
            render(<UserAnalytics />);

            await waitFor(() => {
                expect(screen.getByTestId('month-select')).toBeInTheDocument();
            });

            const initialCallCount = authService.get.mock.calls.length;

            const monthSelect = screen.getByTestId('month-select');
            fireEvent.change(monthSelect, { target: { value: '2' } });

            await waitFor(() => {
                expect(authService.get.mock.calls.length).toBeGreaterThan(initialCallCount);
            });
        });

        // Test 22: Refetches data when year is changed
        test('Refetches data when year is changed', async () => {
            render(<UserAnalytics />);

            await waitFor(() => {
                expect(screen.getByTestId('year-select')).toBeInTheDocument();
            });

            const initialCallCount = authService.get.mock.calls.length;

            const yearSelect = screen.getByTestId('year-select');
            fireEvent.change(yearSelect, { target: { value: '2025' } });

            await waitFor(() => {
                expect(authService.get.mock.calls.length).toBeGreaterThan(initialCallCount);
            });
        });
    });

    describe('Charts Display', () => {
        // Test 23: Displays charts section when data is available
        test('Displays charts section when data is available', async () => {
            render(<UserAnalytics />);

            await waitFor(() => {
                expect(screen.getByTestId('charts-section')).toBeInTheDocument();
            });
        });

        // Test 24: Displays presence chart
        test('Displays presence chart', async () => {
            render(<UserAnalytics />);

            await waitFor(() => {
                expect(screen.getByTestId('presence-chart')).toBeInTheDocument();
            });
        });

        // Test 25: Displays weekly hours chart
        test('Displays weekly hours chart', async () => {
            render(<UserAnalytics />);

            await waitFor(() => {
                expect(screen.getByTestId('weekly-hours-chart')).toBeInTheDocument();
            });
        });

        // Test 26: Displays no data message when no events exist
        test('Displays no data message when no events exist', async () => {
            authService.get = jest.fn((url) => {
                if (url.includes('/badgeLogEvent/user/')) {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        json: () => Promise.resolve([])
                    });
                }
                return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) });
            });

            render(<UserAnalytics />);

            await waitFor(() => {
                expect(screen.getByTestId('no-data-message')).toBeInTheDocument();
            });
        });

        // Test 27: Shows correct no data message text
        test('Shows correct no data message text', async () => {
            authService.get = jest.fn((url) => {
                if (url.includes('/badgeLogEvent/user/')) {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        json: () => Promise.resolve([])
                    });
                }
                return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) });
            });

            render(<UserAnalytics />);

            await waitFor(() => {
                expect(screen.getByText('Aucune donnée disponible pour cette période')).toBeInTheDocument();
            });
        });

        // Test 28: Displays calendar section
        test('Displays calendar section', async () => {
            render(<UserAnalytics />);

            await waitFor(() => {
                expect(screen.getByTestId('calendar-section')).toBeInTheDocument();
            });
        });

        // Test 29: Displays heatmap calendar
        test('Displays heatmap calendar', async () => {
            render(<UserAnalytics />);

            await waitFor(() => {
                expect(screen.getByTestId('heatmap-calendar')).toBeInTheDocument();
            });
        });
    });

    describe('Export Functionality', () => {
        // Test 30: Disables export button while loading
        test('Disables export button while loading', () => {
            authService.get = jest.fn(() => new Promise(() => { })); // Never resolves

            render(<UserAnalytics />);

            const exportButton = screen.getByTestId('export-button');
            expect(exportButton).toBeDisabled();
        });

        // Test 31: Enables export button after data is loaded
        test('Enables export button after data is loaded', async () => {
            render(<UserAnalytics />);

            await waitFor(() => {
                expect(screen.getByTestId('export-button')).not.toBeDisabled();
            });
        });

        // Test 32: Shows correct export button text
        test('Shows correct export button text', async () => {
            render(<UserAnalytics />);

            await waitFor(() => {
                expect(screen.getByTestId('export-button')).not.toBeDisabled();
            });

            const exportButton = screen.getByTestId('export-button');

            expect(exportButton).toHaveTextContent('📊 Exporter en PDF');
        });
    });

    describe('Custom userId Prop', () => {
        // Test 33: Uses provided userId prop instead of localStorage
        test('Uses provided userId prop instead of localStorage', async () => {
            const customUserId = '456';

            render(<UserAnalytics userId={customUserId} />);

            await waitFor(() => {
                expect(authService.get).toHaveBeenCalledWith(
                    expect.stringContaining(customUserId)
                );
            });
        });

        // Test 34: Fallbacks to localStorage when userId prop is not provided
        test('Fallbacks to localStorage when userId prop is not provided', async () => {
            render(<UserAnalytics />);

            await waitFor(() => {
                expect(authService.get).toHaveBeenCalledWith(
                    expect.stringContaining(mockUserId)
                );
            });
        });
    });

    describe('KPI Fallback Logic', () => {
        // Test 35: Uses backend KPI values when available
        test('Uses backend KPI values when available', async () => {
            const mockKPIData = {
                hoursPerDay: '07:30',
                hoursPerWeek: '37:30',
                workingDays: 18,
                presenceRate: '85.00'
            };

            authService.get = jest.fn((url) => {
                if (url === '/kpis/me') {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        json: () => Promise.resolve(mockKPIData)
                    });
                }
                if (url.includes('/badgeLogEvent/user/')) {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        json: () => Promise.resolve(mockEvents)
                    });
                }
                return Promise.resolve({ ok: false, status: 404 });
            });

            render(<UserAnalytics />);

            await waitFor(() => {
                expect(screen.getByText('07:30h')).toBeInTheDocument();
            });
        });

        // Test 36: Displays correct hours per week from backend
        test('Displays correct hours per week from backend', async () => {
            const mockKPIData = {
                hoursPerDay: '07:30',
                hoursPerWeek: '37:30',
                workingDays: 18,
                presenceRate: '85.00'
            };

            authService.get = jest.fn((url) => {
                if (url === '/kpis/me') {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        json: () => Promise.resolve(mockKPIData)
                    });
                }
                if (url.includes('/badgeLogEvent/user/')) {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        json: () => Promise.resolve(mockEvents)
                    });
                }
                return Promise.resolve({ ok: false, status: 404 });
            });

            render(<UserAnalytics />);

            await waitFor(() => {
                expect(screen.getByText('37:30h')).toBeInTheDocument();
            });
        });

        // Test 37: Calculates KPIs from events when backend data is unavailable
        test('Calculates KPIs from events when backend data is unavailable', async () => {
            authService.get = jest.fn((url) => {
                if (url === '/kpis/me') {
                    return Promise.resolve({
                        ok: false,
                        status: 404
                    });
                }
                if (url.includes('/badgeLogEvent/user/')) {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        json: () => Promise.resolve(mockEvents)
                    });
                }
                return Promise.resolve({ ok: false, status: 404 });
            });

            render(<UserAnalytics />);

            await waitFor(() => {
                expect(screen.getByTestId('kpi-grid')).toBeInTheDocument();
            });
        });

        // Test 38: Does not display backend hours when fallback to calculated values
        test('Does not display backend hours when fallback to calculated values', async () => {
            authService.get = jest.fn((url) => {
                if (url === '/kpis/me') {
                    return Promise.resolve({
                        ok: false,
                        status: 404
                    });
                }
                if (url.includes('/badgeLogEvent/user/')) {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        json: () => Promise.resolve(mockEvents)
                    });
                }
                return Promise.resolve({ ok: false, status: 404 });
            });

            render(<UserAnalytics />);

            await waitFor(() => {
                expect(screen.queryByText('07:30h')).not.toBeInTheDocument();
            });
        });
    });
});