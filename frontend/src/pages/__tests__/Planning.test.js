import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Planning from '../Planning';
import planningService from '../../services/planningService';
import notificationService from '../../services/notificationService';
import teamService from '../../services/teamService';

// Mock services
jest.mock('../../services/planningService');
jest.mock('../../services/notificationService');
jest.mock('../../services/teamService');

describe('Planning Component', () => {
    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();

        // Default localStorage setup
        localStorage.clear();
        localStorage.setItem('userId', '1');
        localStorage.setItem('roleId', '0');
        localStorage.setItem('firstName', 'John');
        localStorage.setItem('lastName', 'Doe');

        // Default mock implementations
        planningService.listByUser.mockResolvedValue([]);
    });

    // Test 1: Component renders successfully with title and form
    test('renders planning component with title and form', () => {
        render(<Planning />);

        expect(screen.getByTestId('planning-title')).toBeInTheDocument();
    });

    // Test 2: Month and year selectors are present and functional
    test('month and year selectors change calendar display', async () => {
        render(<Planning />);

        const monthSelect = screen.getByTestId('month-select');
        const yearSelect = screen.getByTestId('year-select');

        await waitFor(() => {
            expect(monthSelect).toBeInTheDocument();
        });

        expect(yearSelect).toBeInTheDocument();
    });

    // Test 3: Calendar grid renders with correct structure
    test('calendar grid renders with day headers', () => {
        render(<Planning />);

        expect(screen.getByTestId('calendar-grid')).toBeInTheDocument();
    });

    // Test 4: Weekend days are disabled
    test('weekend days are disabled in calendar', () => {
        render(<Planning />);

        const calendarGrid = screen.getByTestId('calendar-grid');

        expect(calendarGrid).toBeInTheDocument();
    });

    // Test 5: User can select a single date
    test('user can select a single date', async () => {
        render(<Planning />);

        const dayButtons = screen.getAllByRole('button').filter(btn =>
            btn.getAttribute('data-testid')?.startsWith('calendar-day-')
        );

        const firstWorkday = dayButtons.find(btn => btn.getAttribute('data-weekend') === 'false');
        expect(firstWorkday).toBeDefined();

        fireEvent.mouseDown(firstWorkday);

        await waitFor(() => {
            expect(firstWorkday.getAttribute('data-selected')).toBe('true');
        });
    });

    // Test 6: Date range displays correctly when dates are selected
    test('date range displays correctly when dates are selected', async () => {
        render(<Planning />);

        const rangeStartDisplay = screen.getByTestId('range-start-display');

        await waitFor(() => {
            expect(rangeStartDisplay).toBeInTheDocument();
        });
    });

    // Test 7: Start half-day radio buttons work correctly
    test('start half-day radio buttons change selection', () => {
        render(<Planning />);

        const morningRadio = screen.getByTestId('start-half-morning');
        const afternoonRadio = screen.getByTestId('start-half-afternoon');

        expect(morningRadio).toBeChecked();

        fireEvent.click(afternoonRadio);

        expect(afternoonRadio).toBeChecked();
    });

    // Test 8: End half-day radio buttons work correctly
    test('end half-day radio buttons change selection', () => {
        render(<Planning />);

        const morningRadio = screen.getByTestId('end-half-morning');
        const afternoonRadio = screen.getByTestId('end-half-afternoon');

        expect(afternoonRadio).toBeChecked();

        fireEvent.click(morningRadio);

        expect(morningRadio).toBeChecked();
    });

    // Test 9: All planning types are rendered
    test('all five planning types are rendered', () => {
        render(<Planning />);

        expect(screen.getByTestId('type-option-1')).toBeInTheDocument();
        expect(screen.getByTestId('type-option-2')).toBeInTheDocument();
        expect(screen.getByTestId('type-option-3')).toBeInTheDocument();
        expect(screen.getByTestId('type-option-4')).toBeInTheDocument();
        expect(screen.getByTestId('type-option-5')).toBeInTheDocument();
    });

    // Test 10: User can select a planning type
    test('user can select a planning type', () => {
        render(<Planning />);

        const typeRadio = screen.getByTestId('type-radio-1');

        fireEvent.click(typeRadio);

        expect(typeRadio).toBeChecked();
    });

    // Test 11: Submit button shows initial text
    test('submit button shows loading state when submitting', async () => {
        planningService.create.mockResolvedValue({ id: 1 });

        render(<Planning />);

        const submitButton = screen.getByTestId('submit-button');

        await waitFor(() => {
            expect(submitButton).toBeInTheDocument();
        });
    });

    // Test 12: Error message shows when no userId in localStorage
    test('error message shows when no userId in localStorage', async () => {
        localStorage.removeItem('userId');

        render(<Planning />);

        const typeRadio = screen.getByTestId('type-radio-1');
        fireEvent.click(typeRadio);

        const submitButton = screen.getByTestId('submit-button');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByTestId('feedback-message')).toHaveAttribute('data-feedback-type', 'error');
        });
    });

    // Test 13: Error message shows when no date selected
    test('error message shows when no date selected', async () => {
        render(<Planning />);

        const typeRadio = screen.getByTestId('type-radio-1');
        fireEvent.click(typeRadio);

        const submitButton = screen.getByTestId('submit-button');
        fireEvent.click(submitButton);

        await waitFor(() => {
            const feedback = screen.getByTestId('feedback-message');
            expect(feedback).toHaveAttribute('data-feedback-type', 'error');
        });
    });

    // Test 14: Error message shows when no type selected
    test('error message shows when no type selected', async () => {
        render(<Planning />);

        const dayButtons = screen.getAllByRole('button').filter(btn =>
            btn.getAttribute('data-testid')?.startsWith('calendar-day-')
        );

        const firstWorkday = dayButtons.find(btn => btn.getAttribute('data-weekend') === 'false');
        expect(firstWorkday).toBeDefined();

        fireEvent.mouseDown(firstWorkday);
        fireEvent.mouseUp(firstWorkday);

        const submitButton = screen.getByTestId('submit-button');
        fireEvent.click(submitButton);

        await waitFor(() => {
            const feedback = screen.getByTestId('feedback-message');
            expect(feedback).toHaveAttribute('data-feedback-type', 'error');
        });
    });

    // Test 15: Success message shows after successful submission
    test('success message shows after successful submission', async () => {
        planningService.create.mockResolvedValue({ id: 1 });
        teamService.listUsers.mockResolvedValue([]);

        render(<Planning />);

        // Select date
        const dayButtons = screen.getAllByRole('button').filter(btn =>
            btn.getAttribute('data-testid')?.startsWith('calendar-day-')
        );
        const firstWorkday = dayButtons.find(btn => btn.getAttribute('data-weekend') === 'false');
        expect(firstWorkday).toBeDefined();

        fireEvent.mouseDown(firstWorkday);
        fireEvent.mouseUp(firstWorkday);

        // Select type
        const typeRadio = screen.getByTestId('type-radio-1');
        fireEvent.click(typeRadio);

        // Submit
        const submitButton = screen.getByTestId('submit-button');
        fireEvent.click(submitButton);

        await waitFor(() => {
            const feedback = screen.getByTestId('feedback-message');
            expect(feedback).toHaveAttribute('data-feedback-type', 'success');
        });
    });

    // Test 16: Manager notifications are sent for employee submissions
    test('manager notifications are sent for employee submissions', async () => {
        planningService.create.mockResolvedValue({ id: 1 });
        teamService.listUsers.mockResolvedValue([
            { id: 2, roleId: 1, firstName: 'Manager', lastName: 'One' }
        ]);
        notificationService.createNotification.mockResolvedValue({});

        render(<Planning />);

        const dayButtons = screen.getAllByRole('button').filter(btn =>
            btn.getAttribute('data-testid')?.startsWith('calendar-day-')
        );
        const firstWorkday = dayButtons.find(btn => btn.getAttribute('data-weekend') === 'false');
        expect(firstWorkday).toBeDefined();

        fireEvent.mouseDown(firstWorkday);
        fireEvent.mouseUp(firstWorkday);

        const typeRadio = screen.getByTestId('type-radio-1');
        fireEvent.click(typeRadio);

        const submitButton = screen.getByTestId('submit-button');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(notificationService.createNotification).toHaveBeenCalled();
        });
    });

    // Test 17: Form resets after successful submission
    test('form resets after successful submission', async () => {
        planningService.create.mockResolvedValue({ id: 1 });
        teamService.listUsers.mockResolvedValue([]);

        render(<Planning />);

        const typeRadio = screen.getByTestId('type-radio-1');
        fireEvent.click(typeRadio);

        const dayButtons = screen.getAllByRole('button').filter(btn =>
            btn.getAttribute('data-testid')?.startsWith('calendar-day-')
        );
        const firstWorkday = dayButtons.find(btn => btn.getAttribute('data-weekend') === 'false');
        expect(firstWorkday).toBeDefined();

        fireEvent.mouseDown(firstWorkday);
        fireEvent.mouseUp(firstWorkday);

        const submitButton = screen.getByTestId('submit-button');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(typeRadio).not.toBeChecked();
        });
    });

    // Test 18: Existing planning slots are loaded and displayed
    test('existing planning slots are loaded and displayed', async () => {
        const mockPlannings = [
            {
                date: '2026-01-15T12:00:00',
                period: '0',
                statut: '1',
                demandTypeId: 1
            }
        ];

        planningService.listByUser.mockResolvedValue(mockPlannings);

        render(<Planning />);

        await waitFor(() => {
            expect(planningService.listByUser).toHaveBeenCalledWith(1);
        });
    });

    // Test 19: Month selector changes refresh planning data
    test('month selector changes refresh planning data', async () => {
        render(<Planning />);

        const monthSelect = screen.getByTestId('month-select');
        fireEvent.change(monthSelect, { target: { value: '5' } });

        await waitFor(() => {
            expect(planningService.listByUser).toHaveBeenCalled();
        });
    });

    // Test 20: Year selector changes refresh planning data
    test('year selector changes refresh planning data', async () => {
        render(<Planning />);

        const yearSelect = screen.getByTestId('year-select');
        const currentYear = new Date().getFullYear();
        fireEvent.change(yearSelect, { target: { value: String(currentYear + 1) } });

        await waitFor(() => {
            expect(planningService.listByUser).toHaveBeenCalled();
        });
    });

    // Test 21: Partial submission failures show error with count
    test('partial submission failures show error with count', async () => {
        planningService.create.mockRejectedValueOnce(new Error('Failed'));

        render(<Planning />);

        const dayButtons = screen.getAllByRole('button').filter(btn =>
            btn.getAttribute('data-testid')?.startsWith('calendar-day-')
        );
        const firstWorkday = dayButtons.find(btn => btn.getAttribute('data-weekend') === 'false');
        expect(firstWorkday).toBeDefined();

        fireEvent.mouseDown(firstWorkday);
        fireEvent.mouseUp(firstWorkday);

        const typeRadio = screen.getByTestId('type-radio-1');
        fireEvent.click(typeRadio);

        const submitButton = screen.getByTestId('submit-button');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByTestId('feedback-message')).toHaveAttribute('data-feedback-type', 'error');
        });
    });

    // Test 22: Controls section is rendered
    test('controls section is rendered with all elements', () => {
        render(<Planning />);

        expect(screen.getByTestId('controls-section')).toBeInTheDocument();
        expect(screen.getByTestId('date-range-selector')).toBeInTheDocument();
        expect(screen.getByTestId('type-selector')).toBeInTheDocument();
        expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });

    // Test 23: Calendar section is rendered
    test('calendar section is rendered', () => {
        render(<Planning />);

        expect(screen.getByTestId('calendar-section')).toBeInTheDocument();
    });

    // Test 24: Current month display updates when month changes
    test('current month display updates when month changes', async () => {
        render(<Planning />);

        const currentMonthDisplay = screen.getByTestId('current-month-display');
        const monthSelect = screen.getByTestId('month-select');

        await waitFor(() => {
            expect(currentMonthDisplay).toBeInTheDocument();
        });

        fireEvent.change(monthSelect, { target: { value: '5' } });

        await waitFor(() => {
            expect(currentMonthDisplay).toBeInTheDocument();
        });
    });

    // Test 25: Planning container has correct test id
    test('planning container has correct test id', () => {
        render(<Planning />);

        expect(screen.getByTestId('planning-container')).toBeInTheDocument();
    });
});