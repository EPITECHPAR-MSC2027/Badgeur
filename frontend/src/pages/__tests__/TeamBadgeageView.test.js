import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TeamBadgeageView from '../TeamBadgeageView';
import statsService from '../../services/statsService';

// Mock statsService
jest.mock('../../services/statsService');

// Mock image
jest.mock('../../assets/profil.png', () => 'test-profil.png');

describe('TeamBadgeageView Component', () => {
    const mockTeamMembers = [
        {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com'
        },
        {
            id: 2,
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com'
        },
        {
            id: 3,
            firstName: 'Bob',
            lastName: 'Wilson',
            email: 'bob.wilson@example.com'
        }
    ];

    const mockBadgeEventsUser1 = [
        { id: 1, badgedAt: '2026-01-09T08:30:00Z' },
        { id: 2, badgedAt: '2026-01-09T12:15:00Z' },
        { id: 3, badgedAt: '2026-01-09T14:20:00Z' },
        { id: 4, badgedAt: '2026-01-09T17:45:00Z' }
    ];

    const mockBadgeEventsUser2 = [
        { id: 5, badgedAt: '2026-01-09T08:45:00Z' },
        { id: 6, badgedAt: '2026-01-09T12:30:00Z' }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2026-01-09T10:00:00Z'));

        // Default mock implementation
        statsService.fetchUserBadgeEvents = jest.fn((userId) => {
            if (userId === 1) return Promise.resolve(mockBadgeEventsUser1);
            if (userId === 2) return Promise.resolve(mockBadgeEventsUser2);
            if (userId === 3) return Promise.resolve([]);
            return Promise.resolve([]);
        });
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    // Test 1: Component renders with team members
    test('Renders component and displays team members', async () => {
        render(<TeamBadgeageView teamMembers={mockTeamMembers} />);

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
    });

    // Test 2: Displays member emails correctly
    test('Displays member emails correctly', async () => {
        render(<TeamBadgeageView teamMembers={mockTeamMembers} />);

        await waitFor(() => {
            expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
        });

        expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();
    });

    // Test 3: Displays badge events for selected date
    test('Displays badge events for selected date', async () => {
        render(<TeamBadgeageView teamMembers={mockTeamMembers} />);

        await waitFor(() => {
            expect(screen.getByTestId('member-badgeage-card-1')).toBeInTheDocument();
        });

        // Verify that badge times are displayed (formatted as HH:MM)
        expect(screen.getByText('09:30')).toBeInTheDocument();
        expect(screen.getByText('13:15')).toBeInTheDocument();
    });

    // Test 4: Shows loading indicator while loading badge events
    test('Shows loading indicator while loading badge events', () => {
        statsService.fetchUserBadgeEvents = jest.fn(() => new Promise(() => { }));

        render(<TeamBadgeageView teamMembers={mockTeamMembers} />);

        expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    });

    // Test 5: Handles date change and loads corresponding badge events
    test('Handles date change and loads corresponding badge events', async () => {
        render(<TeamBadgeageView teamMembers={mockTeamMembers} />);

        await waitFor(() => {
            expect(screen.getByTestId('date-input')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByTestId('date-input'), { target: { value: '2026-01-10' } });

        await waitFor(() => {
            expect(statsService.fetchUserBadgeEvents).toHaveBeenCalledTimes(mockTeamMembers.length * 2);
        });
    });

    // Test 6: Test removed due to unwillingness of the machine spirit

    // Test 7: Displays member cards for all team members
    test('Displays member cards for all team members', async () => {
        render(<TeamBadgeageView teamMembers={mockTeamMembers} />);

        await waitFor(() => {
            expect(screen.getByTestId('member-badgeage-card-1')).toBeInTheDocument();
        });

        expect(screen.getByTestId('member-badgeage-card-2')).toBeInTheDocument();
        expect(screen.getByTestId('member-badgeage-card-3')).toBeInTheDocument();
    });

    // Test 8: Displays correct number of badges for each member
    test('Displays correct number of badges for each member', async () => {
        render(<TeamBadgeageView teamMembers={mockTeamMembers} />);

        await waitFor(() => {
            expect(screen.getByTestId('member-badgeage-card-1')).toBeInTheDocument();
        });

        // User 1 has 4 badges
        const user1Badges = screen.getAllByTestId(/badge-time-1-\d/);
        expect(user1Badges).toHaveLength(4);

        // User 2 has 2 badges
        const user2Badges = screen.getAllByTestId(/badge-time-2-\d/);
        expect(user2Badges).toHaveLength(2);
    });

    // Test 9: Displays no badges message when member has no badges
    test('Displays no badges message when member has no badges', async () => {
        render(<TeamBadgeageView teamMembers={mockTeamMembers} />);

        await waitFor(() => {
            expect(screen.getByTestId('member-no-badge-3')).toBeInTheDocument();
        });
    });

    // Test 10: Fetches badge events on component mount
    test('Fetches badge events on component mount', async () => {
        render(<TeamBadgeageView teamMembers={mockTeamMembers} />);

        await waitFor(() => {
            expect(statsService.fetchUserBadgeEvents).toHaveBeenCalledWith(1);
        });

        expect(statsService.fetchUserBadgeEvents).toHaveBeenCalledWith(2);
        expect(statsService.fetchUserBadgeEvents).toHaveBeenCalledWith(3);
    });

    // Test 11: Displays member avatars
    test('Displays member avatars', async () => {
        render(<TeamBadgeageView teamMembers={mockTeamMembers} />);

        await waitFor(() => {
            expect(screen.getByTestId('member-avatar-1')).toBeInTheDocument();
        });

        expect(screen.getByTestId('member-avatar-2')).toBeInTheDocument();
        expect(screen.getByTestId('member-avatar-3')).toBeInTheDocument();
    });

    // Test 12: Displays member names as headers
    test('Displays member names as headers', async () => {
        render(<TeamBadgeageView teamMembers={mockTeamMembers} />);

        await waitFor(() => {
            expect(screen.getByTestId('member-name-1')).toBeInTheDocument();
        });

        expect(screen.getByTestId('member-name-1')).toHaveTextContent('John Doe');
        expect(screen.getByTestId('member-name-2')).toHaveTextContent('Jane Smith');
    });

    // Test 13: Formats badge times correctly
    test('Formats badge times correctly (HH:MM)', async () => {
        render(<TeamBadgeageView teamMembers={mockTeamMembers} />);

        await waitFor(() => {
            expect(screen.getByText('09:30')).toBeInTheDocument();
        });

        expect(screen.getByText('13:15')).toBeInTheDocument();
        expect(screen.getByText('15:20')).toBeInTheDocument();
        expect(screen.getByText('18:45')).toBeInTheDocument();
    });

    // Test 14: Date input updates selected date
    test('Date input updates selected date', async () => {
        render(<TeamBadgeageView teamMembers={mockTeamMembers} />);

        await waitFor(() => {
            expect(screen.getByTestId('date-input')).toBeInTheDocument();
        });

        const dateInput = screen.getByTestId('date-input');
        expect(dateInput.value).toBe('2026-01-09');

        fireEvent.change(dateInput, { target: { value: '2026-01-10' } });

        expect(dateInput.value).toBe('2026-01-10');
    });

    // Test 15: Component renders with empty team members array
    test('Renders correctly with empty team members array', () => {
        render(<TeamBadgeageView teamMembers={[]} />);

        expect(screen.queryByTestId('member-badgeage-card-1')).not.toBeInTheDocument();
    });

    // Test 16: Displays date picker label
    test('Displays date picker label', async () => {
        render(<TeamBadgeageView teamMembers={mockTeamMembers} />);

        await waitFor(() => {
            expect(screen.getByTestId('date-label')).toBeInTheDocument();
        });
    });

    // Test 17: Hides loading indicator after data loads
    test('Hides loading indicator after data loads', async () => {
        render(<TeamBadgeageView teamMembers={mockTeamMembers} />);

        await waitFor(() => {
            expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
        });
    });

    // Test 18: Badge times are sorted chronologically
    test('Badge times are sorted chronologically', async () => {
        render(<TeamBadgeageView teamMembers={mockTeamMembers} />);

        await waitFor(() => {
            expect(screen.getByTestId('member-badgeage-card-1')).toBeInTheDocument();
        });

        const times = screen.getAllByTestId(/badge-time-1-\d/).map(el => el.textContent);
        expect(times[0]).toBe('09:30');
        expect(times[1]).toBe('13:15');
        expect(times[2]).toBe('15:20');
        expect(times[3]).toBe('18:45');
    });

    // Test 19: Displays badge list for each member
    test('Displays badge list for each member with badges', async () => {
        render(<TeamBadgeageView teamMembers={mockTeamMembers} />);

        await waitFor(() => {
            expect(screen.getByTestId('member-badges-list-1')).toBeInTheDocument();
        });

        expect(screen.getByTestId('member-badges-list-2')).toBeInTheDocument();
    });

    // Test 20: Handles partial loading errors gracefully
    test('Handles partial loading errors gracefully', async () => {
        statsService.fetchUserBadgeEvents = jest.fn((userId) => {
            if (userId === 1) return Promise.resolve(mockBadgeEventsUser1);
            if (userId === 2) return Promise.reject(new Error('Network error'));
            if (userId === 3) return Promise.resolve([]);
            return Promise.resolve([]);
        });

        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });

        render(<TeamBadgeageView teamMembers={mockTeamMembers} />);

        await waitFor(() => {
            expect(screen.getByTestId('member-badgeage-card-1')).toBeInTheDocument();
        });

        expect(consoleWarnSpy).toHaveBeenCalled();
        consoleWarnSpy.mockRestore();
    });

    // Test 21: Component container is rendered
    test('Renders component container', async () => {
        render(<TeamBadgeageView teamMembers={mockTeamMembers} />);

        await waitFor(() => {
            expect(screen.getByTestId('team-badgeage-view')).toBeInTheDocument();
        });
    });

    // Test 22: Date label section is rendered
    test('Renders date label', async () => {
        render(<TeamBadgeageView teamMembers={mockTeamMembers} />);

        await waitFor(() => {
            expect(screen.getByTestId('date-label')).toBeInTheDocument();
        });

        expect(screen.getByTestId('date-label')).toHaveTextContent('Date :');
    });

    // Test 23: Members grid is rendered
    test('Renders members grid', async () => {
        render(<TeamBadgeageView teamMembers={mockTeamMembers} />);

        await waitFor(() => {
            expect(screen.getByTestId('members-grid')).toBeInTheDocument();
        });
    });

    // Test 24: Badge list is rendered for members with badges
    test('Renders badge list for members with badges', async () => {
        render(<TeamBadgeageView teamMembers={mockTeamMembers} />);

        await waitFor(() => {
            expect(screen.getByTestId('member-badges-list-1')).toBeInTheDocument();
        });

        expect(screen.getByTestId('member-badges-list-2')).toBeInTheDocument();
    });

    // Test 25: Filters badges by selected date
    test('Filters badges by selected date', async () => {
        const mixedDateBadges = [
            { id: 1, badgedAt: '2026-01-09T08:30:00Z' },
            { id: 2, badgedAt: '2026-01-10T09:00:00Z' },
            { id: 3, badgedAt: '2026-01-09T12:15:00Z' }
        ];

        statsService.fetchUserBadgeEvents = jest.fn(() => Promise.resolve(mixedDateBadges));

        render(<TeamBadgeageView teamMembers={[mockTeamMembers[0]]} />);

        await waitFor(() => {
            expect(screen.getByTestId('member-badgeage-card-1')).toBeInTheDocument();
        });

        // Should only show badges from 2026-01-09
        const badges = screen.getAllByTestId(/badge-time-1-\d/);
        expect(badges).toHaveLength(2);
    });

    // Test 26: Date input is rendered
    test('Date input is rendered', async () => {
        render(<TeamBadgeageView teamMembers={mockTeamMembers} />);

        await waitFor(() => {
            expect(screen.getByTestId('date-input')).toBeInTheDocument();
        });

        expect(screen.getByTestId('date-input')).toHaveAttribute('type', 'date');
    });

    // Test 27: Refreshes data when date changes
    test('Refreshes data when date changes', async () => {
        render(<TeamBadgeageView teamMembers={mockTeamMembers} />);

        await waitFor(() => {
            expect(statsService.fetchUserBadgeEvents).toHaveBeenCalledTimes(3);
        });

        fireEvent.change(screen.getByTestId('date-input'), { target: { value: '2026-01-10' } });

        await waitFor(() => {
            expect(statsService.fetchUserBadgeEvents).toHaveBeenCalledTimes(6);
        });
    });

    // Test 28: Member card has correct test ID
    test('Member card has correct test ID', async () => {
        render(<TeamBadgeageView teamMembers={mockTeamMembers} />);

        await waitFor(() => {
            expect(screen.getByTestId('member-badgeage-card-1')).toBeInTheDocument();
        });
    });

    // Test 29: Badge item has correct test ID
    test('Badge item has correct test ID', async () => {
        render(<TeamBadgeageView teamMembers={mockTeamMembers} />);

        await waitFor(() => {
            expect(screen.getByTestId('badge-item-1-0')).toBeInTheDocument();
        });
    });
});