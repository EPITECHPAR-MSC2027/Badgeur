import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TicketsManagement from '../TicketsManagement';
import authService from '../../services/authService';
import notificationService from '../../services/notificationService';

// Mock the services
jest.mock('../../services/authService');
jest.mock('../../services/notificationService');

// Mock CSS imports
jest.mock('../../style/TicketsManagement.css', () => ({}));

describe('TicketsManagement Component', () => {
    const mockTickets = [
        {
            id: 1,
            category: 'Technical',
            userName: 'John',
            userLastName: 'Doe',
            userEmail: 'john.doe@example.com',
            createdAt: '2026-01-08T10:00:00Z',
            status: 'à traiter',
            description: 'Computer not working',
            assignedTo: 'IT support'
        },
        {
            id: 2,
            category: 'HR',
            userName: 'Jane',
            userLastName: 'Smith',
            userEmail: 'jane.smith@example.com',
            createdAt: '2026-01-07T14:30:00Z',
            status: 'traité',
            description: 'Vacation request',
            assignedTo: 'RH'
        },
        {
            id: 3,
            category: 'Technical',
            userName: 'Bob',
            userLastName: 'Johnson',
            userEmail: 'bob.johnson@example.com',
            createdAt: '2026-01-06T09:15:00Z',
            status: 'à traiter',
            description: 'Network issue',
            assignedTo: 'IT support'
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        localStorage.setItem('roleId', '2');

        authService.get.mockResolvedValue({
            ok: true,
            json: async () => mockTickets
        });
    });

    // Test 1: Component renders with loading state
    test('Displays loading message initially', () => {
        authService.get.mockImplementation(() => new Promise(() => { }));

        render(<TicketsManagement />);

        expect(screen.getByTestId('loading-message')).toBeInTheDocument();
    });

    // Test 2: Component renders successfully after loading tickets
    test('Renders tickets management page with title', async () => {
        render(<TicketsManagement />);

        await waitFor(() => {
            expect(screen.getByTestId('page-title')).toBeInTheDocument();
        });
    });

    // Test 3: Fetches tickets on mount
    test('Fetches tickets when component mounts', async () => {
        render(<TicketsManagement />);

        await waitFor(() => {
            expect(authService.get).toHaveBeenCalledWith('/tickets/my');
        });
    });

    // Test 4: Displays tickets list after loading
    test('Displays tickets list after successful fetch', async () => {
        render(<TicketsManagement />);

        await waitFor(() => {
            expect(screen.getByTestId('tickets-list')).toBeInTheDocument();
        });
    });

    // Test 5: Displays correct number of tickets
    test('Displays correct number of ticket cards', async () => {
        localStorage.setItem('roleId', '2');

        render(<TicketsManagement />);

        await waitFor(() => {
            expect(screen.getByTestId('ticket-card-1')).toBeInTheDocument();
        });

        expect(screen.getByTestId('ticket-card-3')).toBeInTheDocument();
    });

    // Test 6: Filters tickets by roleId for IT support
    test('Filters tickets for IT support role', async () => {
        localStorage.setItem('roleId', '2');

        render(<TicketsManagement />);

        await waitFor(() => {
            expect(screen.getByTestId('ticket-card-1')).toBeInTheDocument();
        });

        expect(screen.queryByTestId('ticket-card-2')).not.toBeInTheDocument();
    });

    // Test 7: Filters tickets by roleId for RH
    test('Filters tickets for RH role', async () => {
        localStorage.setItem('roleId', '3');

        render(<TicketsManagement />);

        await waitFor(() => {
            expect(screen.getByTestId('ticket-card-2')).toBeInTheDocument();
        });

        expect(screen.queryByTestId('ticket-card-1')).not.toBeInTheDocument();
    });

    // Test 8: Displays category filter dropdown
    test('Displays category filter dropdown', async () => {
        render(<TicketsManagement />);

        await waitFor(() => {
            expect(screen.getByTestId('category-filter')).toBeInTheDocument();
        });
    });

    // Test 9: Shows all categories in filter dropdown
    test('Shows all unique categories in filter dropdown', async () => {
        render(<TicketsManagement />);

        await waitFor(() => {
            expect(screen.getByTestId('category-option-all')).toBeInTheDocument();
        });

        expect(screen.getByTestId('category-option-Technical')).toBeInTheDocument();
    });

    // Test 10: Filters tickets by category
    test('Filters tickets when category is selected', async () => {
        render(<TicketsManagement />);

        await waitFor(() => {
            expect(screen.getByTestId('category-filter')).toBeInTheDocument();
        });

        const categoryFilter = screen.getByTestId('category-filter');
        fireEvent.change(categoryFilter, { target: { value: 'Technical' } });

        await waitFor(() => {
            expect(screen.getByTestId('ticket-card-1')).toBeInTheDocument();
        });
    });

    // Test 11: Displays ticket information correctly
    test('Displays ticket category correctly', async () => {
        render(<TicketsManagement />);

        await waitFor(() => {
            expect(screen.getByTestId('ticket-category-1')).toBeInTheDocument();
        });
    });

    // Test 12: Displays ticket user information
    test('Displays ticket user name correctly', async () => {
        render(<TicketsManagement />);

        await waitFor(() => {
            expect(screen.getByTestId('ticket-user-1')).toBeInTheDocument();
        });
    });

    // Test 13: Displays ticket date
    test('Displays ticket creation date correctly', async () => {
        render(<TicketsManagement />);

        await waitFor(() => {
            expect(screen.getByTestId('ticket-date-1')).toBeInTheDocument();
        });
    });

    // Test 14: Displays ticket status with correct attribute
    test('Displays ticket status with correct data attribute', async () => {
        render(<TicketsManagement />);

        await waitFor(() => {
            expect(screen.getByTestId('ticket-status-1')).toHaveAttribute('data-status', 'à traiter');
        });
    });

    // Test 15: Expands ticket when header is clicked
    test('Expands ticket details when header is clicked', async () => {
        render(<TicketsManagement />);

        await waitFor(() => {
            expect(screen.getByTestId('ticket-header-1')).toBeInTheDocument();
        });

        const ticketHeader = screen.getByTestId('ticket-header-1');
        fireEvent.click(ticketHeader);

        await waitFor(() => {
            expect(screen.getByTestId('ticket-details-1')).toBeInTheDocument();
        });
    });

    // Test 16: Displays ticket description when expanded
    test('Displays ticket description when ticket is expanded', async () => {
        render(<TicketsManagement />);

        await waitFor(() => {
            expect(screen.getByTestId('ticket-header-1')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('ticket-header-1'));

        await waitFor(() => {
            expect(screen.getByTestId('ticket-description-1')).toBeInTheDocument();
        });
    });

    // Test 17: Shows mark done button for untreated tickets
    test('Shows mark done button for untreated tickets', async () => {
        render(<TicketsManagement />);

        await waitFor(() => {
            expect(screen.getByTestId('ticket-header-1')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('ticket-header-1'));

        await waitFor(() => {
            expect(screen.getByTestId('mark-done-button-1')).toBeInTheDocument();
        });
    });

    // Test 18: Does not show mark done button for treated tickets
    test('Does not show mark done button for treated tickets', async () => {
        localStorage.setItem('roleId', '3');

        render(<TicketsManagement />);

        await waitFor(() => {
            expect(screen.getByTestId('ticket-header-2')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('ticket-header-2'));

        await waitFor(() => {
            expect(screen.getByTestId('ticket-details-2')).toBeInTheDocument();
        });

        expect(screen.queryByTestId('mark-done-button-2')).not.toBeInTheDocument();
    });

    // Test 19: Collapses ticket when header is clicked again
    test('Collapses ticket when header is clicked again', async () => {
        render(<TicketsManagement />);

        await waitFor(() => {
            expect(screen.getByTestId('ticket-header-1')).toBeInTheDocument();
        });

        const ticketHeader = screen.getByTestId('ticket-header-1');
        fireEvent.click(ticketHeader);

        await waitFor(() => {
            expect(screen.getByTestId('ticket-details-1')).toBeInTheDocument();
        });

        fireEvent.click(ticketHeader);

        await waitFor(() => {
            expect(screen.queryByTestId('ticket-details-1')).not.toBeInTheDocument();
        });
    });

    // Test 20: Updates ticket status when mark done is clicked
    test('Updates ticket status when mark done button is clicked', async () => {
        authService.put.mockResolvedValue({ ok: true });
        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => mockTickets
        }).mockResolvedValueOnce({
            ok: true,
            json: async () => [{ id: 1, email: 'john.doe@example.com' }]
        });

        render(<TicketsManagement />);

        await waitFor(() => {
            expect(screen.getByTestId('ticket-header-1')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('ticket-header-1'));

        await waitFor(() => {
            expect(screen.getByTestId('mark-done-button-1')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('mark-done-button-1'));

        await waitFor(() => {
            expect(authService.put).toHaveBeenCalledWith('/tickets/1/status', { status: 'traité' });
        });
    });

    // Test 21: Disables mark done button while updating
    test('Disables mark done button while status is updating', async () => {
        authService.put.mockImplementation(() => new Promise(() => { }));

        render(<TicketsManagement />);

        await waitFor(() => {
            expect(screen.getByTestId('ticket-header-1')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('ticket-header-1'));

        await waitFor(() => {
            expect(screen.getByTestId('mark-done-button-1')).toBeInTheDocument();
        });

        const markDoneButton = screen.getByTestId('mark-done-button-1');
        fireEvent.click(markDoneButton);

        await waitFor(() => {
            expect(markDoneButton).toBeDisabled();
        });
    });

    // Test 22: Creates notification after marking ticket as done
    test('Creates notification after marking ticket as done', async () => {
        authService.put.mockResolvedValue({ ok: true });
        authService.get.mockResolvedValueOnce({
            ok: true,
            json: async () => mockTickets
        }).mockResolvedValueOnce({
            ok: true,
            json: async () => [{ id: 10, email: 'john.doe@example.com' }]
        });
        notificationService.createNotification.mockResolvedValue({});

        render(<TicketsManagement />);

        await waitFor(() => {
            expect(screen.getByTestId('ticket-header-1')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('ticket-header-1'));

        await waitFor(() => {
            expect(screen.getByTestId('mark-done-button-1')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('mark-done-button-1'));

        await waitFor(() => {
            expect(notificationService.createNotification).toHaveBeenCalled();
        });
    });

    // Test 23: Handles error when fetching tickets fails
    test('Displays error message when fetching tickets fails', async () => {
        authService.get.mockResolvedValue({
            ok: false
        });

        render(<TicketsManagement />);

        await waitFor(() => {
            expect(screen.getByTestId('error-message')).toBeInTheDocument();
        });
    });

    // Test 24: Handles error when updating ticket status fails
    test('Displays error message when updating status fails', async () => {
        authService.put.mockResolvedValue({
            ok: false
        });

        render(<TicketsManagement />);

        await waitFor(() => {
            expect(screen.getByTestId('ticket-header-1')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('ticket-header-1'));

        await waitFor(() => {
            expect(screen.getByTestId('mark-done-button-1')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('mark-done-button-1'));

        await waitFor(() => {
            expect(screen.getByTestId('error-message')).toBeInTheDocument();
        });
    });

    // Test 25: Shows empty state when no tickets available
    test('Shows empty state when no tickets are available', async () => {
        authService.get.mockResolvedValue({
            ok: true,
            json: async () => []
        });

        render(<TicketsManagement />);

        await waitFor(() => {
            expect(screen.getByTestId('empty-state')).toBeInTheDocument();
        });
    });

    // Test 26: Changes expand icon when ticket is expanded
    test('Changes expand icon when ticket is expanded', async () => {
        render(<TicketsManagement />);

        await waitFor(() => {
            expect(screen.getByTestId('ticket-expand-icon-1')).toBeInTheDocument();
        });

        const expandIcon = screen.getByTestId('ticket-expand-icon-1');
        fireEvent.click(screen.getByTestId('ticket-header-1'));

        await waitFor(() => {
            expect(expandIcon.textContent).toBe('▼');
        });
    });

    // Test 27: Resets category filter to show all tickets
    test('Resets category filter to show all tickets', async () => {
        render(<TicketsManagement />);

        await waitFor(() => {
            expect(screen.getByTestId('category-filter')).toBeInTheDocument();
        });

        const categoryFilter = screen.getByTestId('category-filter');
        fireEvent.change(categoryFilter, { target: { value: 'Technical' } });

        await waitFor(() => {
            expect(categoryFilter.value).toBe('Technical');
        });

        fireEvent.change(categoryFilter, { target: { value: '' } });

        await waitFor(() => {
            expect(categoryFilter.value).toBe('');
        });
    });

    // Test 28: Handles ticket with missing optional fields
    test('Handles ticket with missing optional fields gracefully', async () => {
        const incompleteTicket = {
            Id: 99,
            Category: 'Test',
            UserName: 'Test',
            UserLastName: 'User',
            CreatedAt: '2026-01-08T10:00:00Z',
            Status: 'à traiter',
            Description: 'Test ticket',
            assignedTo: 'IT support'
        };

        authService.get.mockResolvedValue({
            ok: true,
            json: async () => [incompleteTicket]
        });

        render(<TicketsManagement />);

        await waitFor(() => {
            expect(screen.getByTestId('ticket-card-99')).toBeInTheDocument();
        });
    });

    // Test 29: Maintains expanded state when filtering
    test('Maintains expanded state when filtering tickets', async () => {
        render(<TicketsManagement />);

        await waitFor(() => {
            expect(screen.getByTestId('ticket-header-1')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('ticket-header-1'));

        await waitFor(() => {
            expect(screen.getByTestId('ticket-details-1')).toBeInTheDocument();
        });

        const categoryFilter = screen.getByTestId('category-filter');
        fireEvent.change(categoryFilter, { target: { value: 'Technical' } });

        await waitFor(() => {
            expect(screen.getByTestId('ticket-details-1')).toBeInTheDocument();
        });
    });
});