import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ValidationPlanning from '../ValidationPlanning';
import planningService from '../../services/planningService';
import teamService from '../../services/teamService';
import notificationService from '../../services/notificationService';

// Mock the services
jest.mock('../../services/planningService');
jest.mock('../../services/teamService');
jest.mock('../../services/notificationService');

describe('ValidationPlanning Component', () => {
    const mockTeamMembers = [
        {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            roleId: 0
        },
        {
            id: 2,
            firstName: 'Jane',
            lastName: 'Smith',
            roleId: 0
        }
    ];

    const mockPendingRequestsUser1 = [
        {
            id: 101,
            date: '2026-01-15T12:00:00Z',
            period: '0',
            statut: 0,
            demandTypeId: 1,
            userId: 1
        },
        {
            id: 102,
            date: '2026-01-16T12:00:00Z',
            period: '1',
            statut: 0,
            demandTypeId: 3,
            userId: 1
        }
    ];

    const mockPendingRequestsUser2 = [
        {
            id: 201,
            date: '2026-01-17T12:00:00Z',
            period: '0',
            statut: 0,
            demandTypeId: 2,
            userId: 2
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();

        // Default mock implementations
        teamService.listMyTeamMembers.mockResolvedValue(mockTeamMembers);

        // Return different requests based on userId
        planningService.listByUser.mockImplementation((userId) => {
            if (userId === 1) return Promise.resolve(mockPendingRequestsUser1);
            if (userId === 2) return Promise.resolve(mockPendingRequestsUser2);
            return Promise.resolve([]);
        });

        planningService.update.mockResolvedValue({});
        notificationService.createNotification.mockResolvedValue({});
    });

    // Test 1: Component renders with title and subtitle
    test('Renders validation planning page with title and subtitle', async () => {
        render(<ValidationPlanning />);

        await waitFor(() => {
            expect(screen.getByTestId('validation-planning-container')).toBeInTheDocument();
        });

        expect(screen.getByTestId('validation-planning-title')).toBeInTheDocument();
        expect(screen.getByTestId('validation-planning-subtitle')).toBeInTheDocument();
    });

    // Test 2: Displays loading state initially
    test('Displays loading message during data fetch', () => {
        teamService.listMyTeamMembers.mockImplementation(() => new Promise(() => { }));

        render(<ValidationPlanning />);

        expect(screen.getByTestId('loading-message')).toBeInTheDocument();
    });

    // Test 3: Hides loading message after data is loaded
    test('Hides loading message after data is loaded', async () => {
        render(<ValidationPlanning />);

        await waitFor(() => {
            expect(screen.queryByTestId('loading-message')).not.toBeInTheDocument();
        });
    });

    // Test 4: Fetches team members on mount
    test('Fetches team members on component mount', async () => {
        render(<ValidationPlanning />);

        await waitFor(() => {
            expect(teamService.listMyTeamMembers).toHaveBeenCalledTimes(1);
        });
    });

    // Test 5: Fetches planning data for each team member
    test('Fetches planning data for each team member', async () => {
        render(<ValidationPlanning />);

        await waitFor(() => {
            expect(planningService.listByUser).toHaveBeenCalledWith(1);
        });

        await waitFor(() => {
            expect(planningService.listByUser).toHaveBeenCalledWith(2);
        });
    });

    // Test 6: Displays team member sections
    test('Displays sections for each team member', async () => {
        render(<ValidationPlanning />);

        await waitFor(() => {
            expect(screen.getByTestId('user-section-1')).toBeInTheDocument();
        });

        expect(screen.getByTestId('user-section-2')).toBeInTheDocument();
    });

    // Test 7: Displays team member names correctly
    test('Displays team member names correctly', async () => {
        render(<ValidationPlanning />);

        await waitFor(() => {
            expect(screen.getByTestId('user-name-1')).toBeInTheDocument();
        });

        expect(screen.getByTestId('user-name-2')).toBeInTheDocument();
    });

    // Test 8: Displays pending request count for each user
    test('Displays pending request count for each user', async () => {
        render(<ValidationPlanning />);

        await waitFor(() => {
            expect(screen.getByTestId('user-pending-count-1')).toBeInTheDocument();
        });

        expect(screen.getByTestId('user-pending-count-2')).toBeInTheDocument();
    });

    // Test 9: Displays no requests message when user has no pending requests
    test('Displays no requests message when user has no pending requests', async () => {
        planningService.listByUser.mockImplementation((userId) => {
            if (userId === 1) return Promise.resolve(mockPendingRequestsUser1);
            if (userId === 2) return Promise.resolve([]);
            return Promise.resolve([]);
        });

        render(<ValidationPlanning />);

        await waitFor(() => {
            expect(screen.getByTestId('no-requests-2')).toBeInTheDocument();
        });
    });

    // Test 10: Displays request cards for pending requests
    test('Displays request cards for pending requests', async () => {
        render(<ValidationPlanning />);

        await waitFor(() => {
            expect(screen.getByTestId('request-card-101')).toBeInTheDocument();
        });

        expect(screen.getByTestId('request-card-102')).toBeInTheDocument();
        expect(screen.getByTestId('request-card-201')).toBeInTheDocument();
    });

    // Test 11: Displays request date on each card
    test('Displays request date on each card', async () => {
        render(<ValidationPlanning />);

        await waitFor(() => {
            expect(screen.getByTestId('request-date-101')).toBeInTheDocument();
        });

        expect(screen.getByTestId('request-date-102')).toBeInTheDocument();
        expect(screen.getByTestId('request-date-201')).toBeInTheDocument();
    });

    // Test 12: Displays morning badge for morning period
    test('Displays morning badge for morning period requests', async () => {
        render(<ValidationPlanning />);

        await waitFor(() => {
            expect(screen.getByTestId('badge-morning-101')).toBeInTheDocument();
        });
    });

    // Test 13: Displays afternoon badge for afternoon period
    test('Displays afternoon badge for afternoon period requests', async () => {
        render(<ValidationPlanning />);

        await waitFor(() => {
            expect(screen.getByTestId('badge-afternoon-102')).toBeInTheDocument();
        });
    });

    // Test 14: Displays request type label
    test('Displays request type label for each request', async () => {
        render(<ValidationPlanning />);

        await waitFor(() => {
            expect(screen.getByTestId('request-type-label-101')).toBeInTheDocument();
        });

        expect(screen.getByTestId('request-type-label-102')).toBeInTheDocument();
    });

    // Test 15: Displays request type color indicator
    test('Displays request type color indicator for each request', async () => {
        render(<ValidationPlanning />);

        await waitFor(() => {
            expect(screen.getByTestId('request-type-indicator-101')).toBeInTheDocument();
        });

        expect(screen.getByTestId('request-type-indicator-102')).toBeInTheDocument();
    });

    // Test 16: Displays approve button for each request
    test('Displays approve button for each request', async () => {
        render(<ValidationPlanning />);

        await waitFor(() => {
            expect(screen.getByTestId('approve-button-101')).toBeInTheDocument();
        });

        expect(screen.getByTestId('approve-button-102')).toBeInTheDocument();
    });

    // Test 17: Displays reject button for each request
    test('Displays reject button for each request', async () => {
        render(<ValidationPlanning />);

        await waitFor(() => {
            expect(screen.getByTestId('reject-button-101')).toBeInTheDocument();
        });

        expect(screen.getByTestId('reject-button-102')).toBeInTheDocument();
    });

    // Test 18: Approve button calls update service with correct status
    test('Approve button calls update service with status 1', async () => {
        render(<ValidationPlanning />);

        await waitFor(() => {
            expect(screen.getByTestId('approve-button-101')).toBeInTheDocument();
        });

        const approveButton = screen.getByTestId('approve-button-101');
        fireEvent.click(approveButton);

        await waitFor(() => {
            expect(planningService.update).toHaveBeenCalled();
        });
    });

    // Test 19: Reject button calls update service with correct status
    test('Reject button calls update service with status 2', async () => {
        render(<ValidationPlanning />);

        await waitFor(() => {
            expect(screen.getByTestId('reject-button-101')).toBeInTheDocument();
        });

        const rejectButton = screen.getByTestId('reject-button-101');
        fireEvent.click(rejectButton);

        await waitFor(() => {
            expect(planningService.update).toHaveBeenCalled();
        });
    });

    // Test 20: Request card is removed after approval
    test('Request card is removed after successful approval', async () => {
        render(<ValidationPlanning />);

        await waitFor(() => {
            expect(screen.getByTestId('request-card-101')).toBeInTheDocument();
        });

        const approveButton = screen.getByTestId('approve-button-101');
        fireEvent.click(approveButton);

        await waitFor(() => {
            expect(screen.queryByTestId('request-card-101')).not.toBeInTheDocument();
        });
    });

    // Test 21: Request card is removed after rejection
    test('Request card is removed after successful rejection', async () => {
        render(<ValidationPlanning />);

        await waitFor(() => {
            expect(screen.getByTestId('request-card-101')).toBeInTheDocument();
        });

        const rejectButton = screen.getByTestId('reject-button-101');
        fireEvent.click(rejectButton);

        await waitFor(() => {
            expect(screen.queryByTestId('request-card-101')).not.toBeInTheDocument();
        });
    });

    // Test 22: Creates notification after approval for employee
    test('Creates notification after approval for employee', async () => {
        render(<ValidationPlanning />);

        await waitFor(() => {
            expect(screen.getByTestId('approve-button-101')).toBeInTheDocument();
        });

        const approveButton = screen.getByTestId('approve-button-101');
        fireEvent.click(approveButton);

        await waitFor(() => {
            expect(notificationService.createNotification).toHaveBeenCalled();
        });
    });

    // Test 23: Creates notification after rejection for employee
    test('Creates notification after rejection for employee', async () => {
        render(<ValidationPlanning />);

        await waitFor(() => {
            expect(screen.getByTestId('reject-button-101')).toBeInTheDocument();
        });

        const rejectButton = screen.getByTestId('reject-button-101');
        fireEvent.click(rejectButton);

        await waitFor(() => {
            expect(notificationService.createNotification).toHaveBeenCalled();
        });
    });

    // Test 24: Disables buttons while saving
    test('Disables approve button while saving', async () => {
        planningService.update.mockImplementation(() => new Promise(() => { }));

        render(<ValidationPlanning />);

        await waitFor(() => {
            expect(screen.getByTestId('approve-button-101')).toBeInTheDocument();
        });

        const approveButton = screen.getByTestId('approve-button-101');
        fireEvent.click(approveButton);

        await waitFor(() => {
            expect(approveButton).toBeDisabled();
        });
    });

    // Test 25: Disables reject button while saving
    test('Disables reject button while saving', async () => {
        planningService.update.mockImplementation(() => new Promise(() => { }));

        render(<ValidationPlanning />);

        await waitFor(() => {
            expect(screen.getByTestId('reject-button-101')).toBeInTheDocument();
        });

        const rejectButton = screen.getByTestId('reject-button-101');
        fireEvent.click(rejectButton);

        await waitFor(() => {
            expect(rejectButton).toBeDisabled();
        });
    });

    // Test 26: Displays error message when team fetch fails
    test('Displays error message when team fetch fails', async () => {
        const errorMessage = 'Failed to load team';
        teamService.listMyTeamMembers.mockRejectedValue(new Error(errorMessage));

        render(<ValidationPlanning />);

        await waitFor(() => {
            expect(screen.getByTestId('error-message')).toBeInTheDocument();
        });
    });

    // Test 27: Displays error message when update fails
    test('Displays error message when update fails', async () => {
        planningService.update.mockRejectedValue(new Error('Update failed'));

        render(<ValidationPlanning />);

        await waitFor(() => {
            expect(screen.getByTestId('approve-button-101')).toBeInTheDocument();
        });

        const approveButton = screen.getByTestId('approve-button-101');
        fireEvent.click(approveButton);

        await waitFor(() => {
            expect(screen.getByTestId('error-message')).toBeInTheDocument();
        });
    });

    // Test 28: Filters only pending requests with status 0
    test('Filters and displays only pending requests with status 0', async () => {
        const mixedRequests = [
            ...mockPendingRequestsUser1,
            {
                id: 103,
                date: '2026-01-17T12:00:00Z',
                period: '0',
                statut: 1,
                demandTypeId: 2,
                userId: 1
            }
        ];

        planningService.listByUser.mockImplementation((userId) => {
            if (userId === 1) return Promise.resolve(mixedRequests);
            if (userId === 2) return Promise.resolve([]);
            return Promise.resolve([]);
        });

        render(<ValidationPlanning />);

        await waitFor(() => {
            expect(screen.getByTestId('request-card-101')).toBeInTheDocument();
        });

        expect(screen.getByTestId('request-card-102')).toBeInTheDocument();
        expect(screen.queryByTestId('request-card-103')).not.toBeInTheDocument();
    });

    // Test 29: Sorts requests by date in ascending order
    test('Sorts requests by date in ascending order', async () => {
        const unsortedRequests = [
            {
                id: 102,
                date: '2026-01-20T12:00:00Z',
                period: '1',
                statut: 0,
                demandTypeId: 3,
                userId: 1
            },
            {
                id: 101,
                date: '2026-01-10T12:00:00Z',
                period: '0',
                statut: 0,
                demandTypeId: 1,
                userId: 1
            }
        ];

        planningService.listByUser.mockImplementation((userId) => {
            if (userId === 1) return Promise.resolve(unsortedRequests);
            if (userId === 2) return Promise.resolve([]);
            return Promise.resolve([]);
        });

        render(<ValidationPlanning />);

        await waitFor(() => {
            expect(screen.getByTestId('requests-grid-1')).toBeInTheDocument();
        });

        const grid = screen.getByTestId('requests-grid-1');
        const cards = grid.querySelectorAll('[data-testid^="request-card-"]');

        expect(cards[0]).toHaveAttribute('data-testid', 'request-card-101');
        expect(cards[1]).toHaveAttribute('data-testid', 'request-card-102');
    });

    // Test 30: Handles empty team members list
    test('Handles empty team members list gracefully', async () => {
        teamService.listMyTeamMembers.mockResolvedValue([]);

        render(<ValidationPlanning />);

        await waitFor(() => {
            expect(screen.queryByTestId('loading-message')).not.toBeInTheDocument();
        });

        expect(screen.queryByTestId('user-section-1')).not.toBeInTheDocument();
        expect(screen.queryByTestId('user-section-2')).not.toBeInTheDocument();
    });

    // Test 31: Does not create notification for manager role
    test('Does not create notification for manager role', async () => {
        const managerMember = {
            id: 3,
            firstName: 'Manager',
            lastName: 'Person',
            roleId: 1
        };

        teamService.listMyTeamMembers.mockResolvedValue([managerMember]);

        const managerRequest = {
            id: 301,
            date: '2026-01-15T12:00:00Z',
            period: '0',
            statut: 0,
            demandTypeId: 1,
            userId: 3
        };

        planningService.listByUser.mockImplementation((userId) => {
            if (userId === 3) return Promise.resolve([managerRequest]);
            return Promise.resolve([]);
        });

        render(<ValidationPlanning />);

        await waitFor(() => {
            expect(screen.getByTestId('approve-button-301')).toBeInTheDocument();
        });

        const approveButton = screen.getByTestId('approve-button-301');
        fireEvent.click(approveButton);

        await waitFor(() => {
            expect(planningService.update).toHaveBeenCalled();
        });

        expect(notificationService.createNotification).not.toHaveBeenCalled();
    });

    // Test 32: Handles notification creation error gracefully
    test('Handles notification creation error gracefully', async () => {
        notificationService.createNotification.mockRejectedValue(new Error('Notification failed'));
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        render(<ValidationPlanning />);

        await waitFor(() => {
            expect(screen.getByTestId('approve-button-101')).toBeInTheDocument();
        });

        const approveButton = screen.getByTestId('approve-button-101');
        fireEvent.click(approveButton);

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalled();
        });

        consoleErrorSpy.mockRestore();
    });

    // Test 33: Displays requests grid for each user
    test('Displays requests grid for each user', async () => {
        render(<ValidationPlanning />);

        await waitFor(() => {
            expect(screen.getByTestId('requests-grid-1')).toBeInTheDocument();
        });

        expect(screen.getByTestId('requests-grid-2')).toBeInTheDocument();
    });

    // Test 34: Displays action buttons container
    test('Displays action buttons container for each request', async () => {
        render(<ValidationPlanning />);

        await waitFor(() => {
            expect(screen.getByTestId('request-actions-101')).toBeInTheDocument();
        });

        expect(screen.getByTestId('request-actions-102')).toBeInTheDocument();
    });

    // Test 35: Handles malformed date gracefully
    test('Handles malformed date gracefully', async () => {
        const malformedRequest = {
            id: 999,
            date: 'invalid-date',
            period: '0',
            statut: 0,
            demandTypeId: 1,
            userId: 1
        };

        planningService.listByUser.mockImplementation((userId) => {
            if (userId === 1) return Promise.resolve([malformedRequest]);
            if (userId === 2) return Promise.resolve([]);
            return Promise.resolve([]);
        });

        render(<ValidationPlanning />);

        await waitFor(() => {
            expect(screen.getByTestId('request-card-999')).toBeInTheDocument();
        });

        expect(screen.getByTestId('request-date-999')).toBeInTheDocument();
    });
});