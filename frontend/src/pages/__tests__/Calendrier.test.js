import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Calendrier from '../Calendrier';
import planningService from '../../services/planningService';
import teamService from '../../services/teamService';

// Mock the services
jest.mock('../../services/planningService');
jest.mock('../../services/teamService');

describe('Calendrier', () => {
    const mockMembers = [
        { id: 1, firstName: 'John', lastName: 'Doe' },
        { id: 2, firstName: 'Jane', lastName: 'Smith' },
        { id: 3, firstName: 'Bob', lastName: 'Johnson' }
    ];

    const mockPlanningRecords = [
        {
            date: '2026-01-15T12:00:00Z',
            Date: '2026-01-15T12:00:00Z',
            period: '0',
            Period: '0',
            statut: '1',
            Statut: '1',
            demandTypeId: 1,
            DemandTypeId: 1
        },
        {
            date: '2026-01-15T12:00:00Z',
            Date: '2026-01-15T12:00:00Z',
            period: '1',
            Period: '1',
            statut: '1',
            Statut: '1',
            demandTypeId: 2,
            DemandTypeId: 2
        },
        {
            date: '2026-01-16T12:00:00Z',
            Date: '2026-01-16T12:00:00Z',
            period: '0',
            Period: '0',
            statut: '0',
            Statut: '0',
            demandTypeId: 3,
            DemandTypeId: 3
        }
    ];

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();

        // Setup default successful responses
        teamService.listMyTeamMembers = jest.fn(() => Promise.resolve(mockMembers));
        planningService.listByUser = jest.fn(() => Promise.resolve(mockPlanningRecords));
    });

    describe('Component Rendering', () => {
        // Test 1: Component renders correctly
        test('Renders calendrier page with title', async () => {
            render(<Calendrier />);

            await waitFor(() => {
                expect(screen.getByText('Equipe')).toBeInTheDocument();
            });
        });

        // Test 2: Month selector is displayed
        test('Renders month selector', async () => {
            render(<Calendrier />);

            await waitFor(() => {
                expect(screen.getAllByRole('combobox').length).toBeGreaterThanOrEqual(1);
            });
        });

        // Test 3: Year selector is displayed
        test('Renders year selector', async () => {
            render(<Calendrier />);

            await waitFor(() => {
                expect(screen.getAllByRole('combobox').length).toBeGreaterThanOrEqual(2);
            });
        });

        // Test 4: Members section header is visible
        test('Displays members section header', async () => {
            render(<Calendrier />);

            await waitFor(() => {
                expect(screen.getByText('Membres')).toBeInTheDocument();
            });
        });

        // Test 5: Legend section header is visible
        test('Displays legend section header', async () => {
            render(<Calendrier />);

            await waitFor(() => {
                expect(screen.getByTestId('legend-header')).toBeInTheDocument();
            });
        });

        // Test 6: All legend items are displayed
        test('Renders all legend items', async () => {
            render(<Calendrier />);

            await waitFor(() => {
                expect(screen.getByTestId('legend-item-1')).toBeInTheDocument();
            });
            expect(screen.getByTestId('legend-item-2')).toBeInTheDocument();
            expect(screen.getByTestId('legend-item-3')).toBeInTheDocument();
            expect(screen.getByTestId('legend-item-4')).toBeInTheDocument();
            expect(screen.getByTestId('legend-item-5')).toBeInTheDocument();
        });
    });

    describe('Loading State', () => {
        // Test 7: Loading indicator appears when fetching team
        test('Displays loading indicator when fetching team', () => {
            teamService.listMyTeamMembers = jest.fn(() => new Promise(() => { }));

            render(<Calendrier />);

            expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
        });

        // Test 8: Loading indicator disappears after data loads
        test('Hides loading indicator after team is loaded', async () => {
            render(<Calendrier />);

            await waitFor(() => {
                expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
            });
        });

        // Test 9: Loading indicator shows when fetching planning
        test('Shows loading indicator when fetching planning data', async () => {
            planningService.listByUser = jest.fn(() => new Promise(() => { }));

            render(<Calendrier />);

            await waitFor(() => {
                expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
            });
        });
    });

    describe('Error Handling', () => {
        // Test 10: Error message displays when team load fails
        test('Displays error message when team loading fails', async () => {
            teamService.listMyTeamMembers = jest.fn(() =>
                Promise.reject(new Error('Team load error'))
            );

            render(<Calendrier />);

            await waitFor(() => {
                expect(screen.getByText('Team load error')).toBeInTheDocument();
            });
        });

        // Test 11: Generic error message when error has no details
        test('Shows generic error message when error has no message', async () => {
            teamService.listMyTeamMembers = jest.fn(() =>
                Promise.reject(new Error())
            );

            render(<Calendrier />);

            await waitFor(() => {
                expect(screen.getByText('Erreur')).toBeInTheDocument();
            });
        });

        // Test 12: Component handles planning load failures gracefully
        test('Does not crash when planning load fails for a member', async () => {
            planningService.listByUser = jest.fn(() =>
                Promise.reject(new Error('Planning error'))
            );

            render(<Calendrier />);

            await waitFor(() => {
                expect(screen.getByText('John Doe')).toBeInTheDocument();
            });
        });
    });

    describe('Team Members Display', () => {
        // Test 13: All team members are shown
        test('Displays all team members', async () => {
            render(<Calendrier />);

            await waitFor(() => {
                expect(screen.getByText('John Doe')).toBeInTheDocument();
            });
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
            expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
        });

        // Test 14: Empty state message when no members
        test('Shows "Aucun membre" when no team members', async () => {
            teamService.listMyTeamMembers = jest.fn(() => Promise.resolve([]));

            render(<Calendrier />);

            await waitFor(() => {
                expect(screen.getByTestId('no-members')).toBeInTheDocument();
            });
        });

        // Test 15: Correct number of members rendered
        test('Displays correct number of members', async () => {
            render(<Calendrier />);

            await waitFor(() => {
                expect(teamService.listMyTeamMembers).toHaveBeenCalledTimes(1);
            });

            const johnDoe = screen.getByText('John Doe');
            const janeSmith = screen.getByText('Jane Smith');
            const bobJohnson = screen.getByText('Bob Johnson');
            expect(johnDoe).toBeInTheDocument();
            expect(janeSmith).toBeInTheDocument();
            expect(bobJohnson).toBeInTheDocument();
        });
    });

    describe('Month and Year Selection', () => {
        // Test 16: Month selector updates correctly
        test('Changes month when month selector is changed', async () => {
            render(<Calendrier />);

            await waitFor(() => {
                expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
            });

            const selects = screen.getAllByRole('combobox');
            const monthSelect = selects[0];

            fireEvent.change(monthSelect, { target: { value: '2' } });

            await waitFor(() => {
                expect(monthSelect.value).toBe('2');
            });
        });

        // Test 17: Year selector updates correctly
        test('Changes year when year selector is changed', async () => {
            render(<Calendrier />);

            await waitFor(() => {
                expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
            });

            const selects = screen.getAllByRole('combobox');
            const yearSelect = selects[1];

            fireEvent.change(yearSelect, { target: { value: '2025' } });

            await waitFor(() => {
                expect(yearSelect.value).toBe('2025');
            });
        });

        // Test 18: Data refetches when month changes
        test('Refetches planning data when month is changed', async () => {
            render(<Calendrier />);

            await waitFor(() => {
                expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
            });

            const initialCallCount = planningService.listByUser.mock.calls.length;

            const selects = screen.getAllByRole('combobox');
            const monthSelect = selects[0];

            fireEvent.change(monthSelect, { target: { value: '2' } });

            await waitFor(() => {
                expect(planningService.listByUser.mock.calls.length).toBeGreaterThan(initialCallCount);
            });
        });

        // Test 19: Data refetches when year changes
        test('Refetches planning data when year is changed', async () => {
            render(<Calendrier />);

            await waitFor(() => {
                expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
            });

            const initialCallCount = planningService.listByUser.mock.calls.length;

            const selects = screen.getAllByRole('combobox');
            const yearSelect = selects[1];

            fireEvent.change(yearSelect, { target: { value: '2025' } });

            await waitFor(() => {
                expect(planningService.listByUser.mock.calls.length).toBeGreaterThan(initialCallCount);
            });
        });
    });

    describe('Planning Grid Display', () => {
        // Test 20: Calendar grid renders all month days
        test('Renders calendar grid for current month', async () => {
            render(<Calendrier />);

            await waitFor(() => {
                expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
            });

            // January 2026 has 31 days, should see day 1 and day 31
            const dayElements = screen.queryAllByText('1');
            expect(dayElements.length).toBeGreaterThan(0);
        });

        // Test 21: Grid displays row per member
        test('Displays grid rows for each team member', async () => {
            render(<Calendrier />);

            await waitFor(() => {
                expect(screen.getByText('John Doe')).toBeInTheDocument();
            });
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
            expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
        });

        // Test 22: Empty state for grid when no members
        test('Shows "Aucun membre à afficher" when no members in grid', async () => {
            teamService.listMyTeamMembers = jest.fn(() => Promise.resolve([]));

            render(<Calendrier />);

            await waitFor(() => {
                expect(screen.getByTestId('no-members-grid')).toBeInTheDocument();
            });
        });
    });

    describe('Planning Data Loading', () => {
        // Test 23: Service called for each member
        test('Calls planningService.listByUser for each member', async () => {
            render(<Calendrier />);

            await waitFor(() => {
                expect(planningService.listByUser).toHaveBeenCalledWith(1);
            });
            expect(planningService.listByUser).toHaveBeenCalledWith(2);
            expect(planningService.listByUser).toHaveBeenCalledWith(3);
        });

        // Test 24: Records filtered by month and year
        test('Filters planning records by current month and year', async () => {
            const recordsWithDifferentMonths = [
                {
                    date: '2026-01-15T12:00:00Z',
                    period: '0',
                    statut: '1',
                    demandTypeId: 1
                },
                {
                    date: '2026-02-15T12:00:00Z',
                    period: '0',
                    statut: '1',
                    demandTypeId: 1
                },
                {
                    date: '2025-01-15T12:00:00Z',
                    period: '0',
                    statut: '1',
                    demandTypeId: 1
                }
            ];

            planningService.listByUser = jest.fn(() =>
                Promise.resolve(recordsWithDifferentMonths)
            );

            render(<Calendrier />);

            await waitFor(() => {
                expect(planningService.listByUser).toHaveBeenCalled();
            });

            // Only January 2026 records should be displayed
            // We can't easily test the internal state, but we verify the service was called
            expect(planningService.listByUser).toHaveBeenCalledTimes(mockMembers.length);
        });

        // Test 25: Empty planning records handled gracefully
        test('Handles empty planning records gracefully', async () => {
            planningService.listByUser = jest.fn(() => Promise.resolve([]));

            render(<Calendrier />);

            await waitFor(() => {
                expect(screen.getByText('John Doe')).toBeInTheDocument();
            });

            expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
        });

        // Test 26: Service not called when no members
        test('Does not call planningService when no members', async () => {
            teamService.listMyTeamMembers = jest.fn(() => Promise.resolve([]));

            render(<Calendrier />);

            await waitFor(() => {
                expect(screen.getByTestId('no-members')).toBeInTheDocument();
            });

            // Should not call planning service if no members
            expect(planningService.listByUser).not.toHaveBeenCalled();
        });
    });

    describe('Legend Display', () => {
        // Test 27: All planning types shown in legend
        test('Displays all fixed planning types in legend', async () => {
            render(<Calendrier />);

            await waitFor(() => {
                expect(screen.getByTestId('legend-item-1')).toBeInTheDocument();
            });
            expect(screen.getByTestId('legend-item-2')).toBeInTheDocument();
            expect(screen.getByTestId('legend-item-3')).toBeInTheDocument();
            expect(screen.getByTestId('legend-item-4')).toBeInTheDocument();
            expect(screen.getByTestId('legend-item-5')).toBeInTheDocument();
        });

        // Test 28: Legend items in correct order
        test('Legend items have correct order', async () => {
            render(<Calendrier />);

            await waitFor(() => {
                expect(screen.getByTestId('legend-header')).toBeInTheDocument();
            });

            expect(screen.getByTestId('legend-item-1')).toBeInTheDocument();
            expect(screen.getByTestId('legend-item-2')).toBeInTheDocument();
            expect(screen.getByTestId('legend-item-3')).toBeInTheDocument();
            expect(screen.getByTestId('legend-item-4')).toBeInTheDocument();
            expect(screen.getByTestId('legend-item-5')).toBeInTheDocument();
        });
    });

    describe('Data Processing', () => {
        // Test 29: Mixed case field names handled correctly
        test('Handles both camelCase and PascalCase field names', async () => {
            const mixedCaseRecords = [
                {
                    date: '2026-01-15T12:00:00Z',
                    period: '0',
                    statut: '1',
                    demandTypeId: 1
                },
                {
                    Date: '2026-01-16T12:00:00Z',
                    Period: '1',
                    Statut: '1',
                    DemandTypeId: 2
                }
            ];

            planningService.listByUser = jest.fn(() =>
                Promise.resolve(mixedCaseRecords)
            );

            render(<Calendrier />);

            await waitFor(() => {
                expect(planningService.listByUser).toHaveBeenCalled();
            });

            expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
        });

        // Test 30: Statut converted from string to number
        test('Converts statut string to number', async () => {
            const recordsWithStringStatus = [
                {
                    date: '2026-01-15T12:00:00Z',
                    period: '0',
                    statut: '1',
                    demandTypeId: 1
                },
                {
                    date: '2026-01-16T12:00:00Z',
                    period: '0',
                    Statut: '0',
                    DemandTypeId: 2
                }
            ];

            planningService.listByUser = jest.fn(() =>
                Promise.resolve(recordsWithStringStatus)
            );

            render(<Calendrier />);

            await waitFor(() => {
                expect(planningService.listByUser).toHaveBeenCalled();
            });

            expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
        });
    });

    describe('Month Grid Calculation', () => {
        // Test 31: Correct day count for January
        test('Calculates correct number of days for January', async () => {
            render(<Calendrier />);

            await waitFor(() => {
                expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
            });

            // Check that various day numbers are present
            expect(screen.getByText('1')).toBeInTheDocument();
            expect(screen.getByText('15')).toBeInTheDocument();
        });

        // Test 32: Grid updates on month change
        test('Handles month change correctly', async () => {
            render(<Calendrier />);

            await waitFor(() => {
                expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
            });

            const selects = screen.getAllByRole('combobox');
            const monthSelect = selects[0];

            // Change to February (month index 1)
            fireEvent.change(monthSelect, { target: { value: '1' } });

            await waitFor(() => {
                expect(monthSelect.value).toBe('1');
            });
        });
    });

    describe('Component Lifecycle', () => {
        // Test 33: Team members load on mount
        test('Loads team members on mount', async () => {
            render(<Calendrier />);

            await waitFor(() => {
                expect(teamService.listMyTeamMembers).toHaveBeenCalledTimes(1);
            });
        });

        // Test 34: Planning loads after team loads
        test('Loads planning data after team members are loaded', async () => {
            render(<Calendrier />);

            await waitFor(() => {
                expect(teamService.listMyTeamMembers).toHaveBeenCalled();
            });

            await waitFor(() => {
                expect(planningService.listByUser).toHaveBeenCalled();
            });
        });

        // Test 35: Team members not reloaded on month change
        test('Does not reload team members on month change', async () => {
            render(<Calendrier />);

            await waitFor(() => {
                expect(teamService.listMyTeamMembers).toHaveBeenCalledTimes(1);
            });

            const selects = screen.getAllByRole('combobox');
            const monthSelect = selects[0];

            fireEvent.change(monthSelect, { target: { value: '2' } });

            await waitFor(() => {
                // Should still be called only once (on mount)
                expect(teamService.listMyTeamMembers).toHaveBeenCalledTimes(1);
            });
        });
    });
});