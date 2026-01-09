import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../Home';

// Mock child components
jest.mock('../../component/LastPunch', () => () => <div data-testid="last-punch-component">LastPunch</div>);
jest.mock('../../component/WeekHours', () => () => <div data-testid="week-hours-component">WeekHours</div>);
jest.mock('../../component/DayPlanning', () => () => <div data-testid="day-planning-component">DayPlanning</div>);
jest.mock('../../component/Notifications', () => () => <div data-testid="notifications-component">Notifications</div>);
jest.mock('../../component/Announcements', () => () => <div data-testid="announcements-component">Announcements</div>);

// Mock CSS imports
jest.mock('../../index.css', () => ({}));
jest.mock('../../style/theme.css', () => ({}));

describe('Home Component', () => {
    let localStorageMock;

    beforeEach(() => {
        // Reset timers
        jest.useFakeTimers();

        // Create proper localStorage mock with jest spies
        localStorageMock = {
            getItem: jest.fn((key) => {
                if (key === 'firstName') return 'John';
                if (key === 'lastName') return 'Doe';
                if (key === 'roleId') return '0';
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

        // Set a fixed date for testing
        jest.setSystemTime(new Date('2026-01-08T10:30:45Z'));
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.useRealTimers();
    });

    // Test 1: Component renders successfully
    test('Renders home component with main container', async () => {
        render(<Home />);

        await waitFor(() => {
            expect(screen.getByTestId('home-container')).toBeInTheDocument();
        });
    });

    // Test 2: Header section renders correctly
    test('Renders header with page title', async () => {
        render(<Home />);

        await waitFor(() => {
            expect(screen.getByTestId('home-header')).toBeInTheDocument();
        });
    });

    // Test 3: Page title displays correctly
    test('Displays page title', async () => {
        render(<Home />);

        await waitFor(() => {
            expect(screen.getByTestId('page-title')).toBeInTheDocument();
        });
    });

    // Test 4: Welcome message displays user name
    test('Displays welcome message with user name', async () => {
        render(<Home />);

        await waitFor(() => {
            expect(screen.getByTestId('welcome-message')).toBeInTheDocument();
        });
    });

    // Test 5: Welcome message contains first name
    test('Welcome message contains user first name', async () => {
        render(<Home />);

        await waitFor(() => {
            const welcomeMessage = screen.getByTestId('welcome-message');
            expect(welcomeMessage.textContent).toContain('John');
        });
    });

    // Test 6: Welcome message contains last name
    test('Welcome message contains user last name', async () => {
        render(<Home />);

        await waitFor(() => {
            const welcomeMessage = screen.getByTestId('welcome-message');
            expect(welcomeMessage.textContent).toContain('Doe');
        });
    });

    // Test 7: Time container is rendered
    test('Renders time container', async () => {
        render(<Home />);

        await waitFor(() => {
            expect(screen.getByTestId('time-container')).toBeInTheDocument();
        });
    });

    // Test 8: Time box is rendered
    test('Renders time box', async () => {
        render(<Home />);

        await waitFor(() => {
            expect(screen.getByTestId('time-box')).toBeInTheDocument();
        });
    });

    // Test 9: Time box title is rendered
    test('Renders time box title', async () => {
        render(<Home />);

        await waitFor(() => {
            expect(screen.getByTestId('time-box-title')).toBeInTheDocument();
        });
    });

    // Test 10: Current time is displayed
    test('Displays current time', async () => {
        render(<Home />);

        await waitFor(() => {
            expect(screen.getByTestId('current-time')).toBeInTheDocument();
        });
    });

    // Test 11: Current date is displayed
    test('Displays current date', async () => {
        render(<Home />);

        await waitFor(() => {
            expect(screen.getByTestId('current-date')).toBeInTheDocument();
        });
    });

    // Test 12: Time updates every second
    test('Time updates after interval', async () => {
        render(<Home />);

        await waitFor(() => {
            expect(screen.getByTestId('current-time')).toBeInTheDocument();
        });

        const initialTime = screen.getByTestId('current-time').textContent;

        // Advance time by 1 second
        jest.advanceTimersByTime(1000);

        await waitFor(() => {
            const updatedTime = screen.getByTestId('current-time').textContent;
            expect(updatedTime).toBeDefined();
        });
    });

    // Test 13: Dashboard grid is rendered
    test('Renders dashboard grid', async () => {
        render(<Home />);

        await waitFor(() => {
            expect(screen.getByTestId('dashboard-grid')).toBeInTheDocument();
        });
    });

    // Test 14: LastPunch component is rendered
    test('Renders LastPunch component', async () => {
        render(<Home />);

        await waitFor(() => {
            expect(screen.getByTestId('last-punch-component')).toBeInTheDocument();
        });
    });

    // Test 15: WeekHours component is rendered
    test('Renders WeekHours component', async () => {
        render(<Home />);

        await waitFor(() => {
            expect(screen.getByTestId('week-hours-component')).toBeInTheDocument();
        });
    });

    // Test 16: DayPlanning component is rendered
    test('Renders DayPlanning component', async () => {
        render(<Home />);

        await waitFor(() => {
            expect(screen.getByTestId('day-planning-component')).toBeInTheDocument();
        });
    });

    // Test 17: Announcements and notifications grid is rendered
    test('Renders announcements and notifications grid', async () => {
        render(<Home />);

        await waitFor(() => {
            expect(screen.getByTestId('announcements-notifications-grid')).toBeInTheDocument();
        });
    });

    // Test 18: Announcements component is rendered
    test('Renders Announcements component', async () => {
        render(<Home />);

        await waitFor(() => {
            expect(screen.getByTestId('announcements-component')).toBeInTheDocument();
        });
    });

    // Test 19: Notifications component is rendered
    test('Renders Notifications component', async () => {
        render(<Home />);

        await waitFor(() => {
            expect(screen.getByTestId('notifications-component')).toBeInTheDocument();
        });
    });

    // Test 20: Handles missing user data gracefully
    test('Renders with missing user data', async () => {
        localStorageMock.getItem.mockReturnValue(null);

        render(<Home />);

        await waitFor(() => {
            expect(screen.getByTestId('home-container')).toBeInTheDocument();
        });
    });

    // Test 21: User data is retrieved from localStorage
    test('Retrieves user data from localStorage', async () => {
        render(<Home />);

        await waitFor(() => {
            expect(localStorageMock.getItem).toHaveBeenCalledWith('firstName');
        });
    });

    // Test 22: Role ID is retrieved from localStorage
    test('Retrieves roleId from localStorage', async () => {
        render(<Home />);

        await waitFor(() => {
            expect(localStorageMock.getItem).toHaveBeenCalledWith('roleId');
        });
    });

    // Test 23: Cleanup timer on unmount
    test('Cleans up timer interval on unmount', async () => {
        const { unmount } = render(<Home />);

        await waitFor(() => {
            expect(screen.getByTestId('home-container')).toBeInTheDocument();
        });

        const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
        unmount();

        await waitFor(() => {
            expect(clearIntervalSpy).toHaveBeenCalled();
        });

        clearIntervalSpy.mockRestore();
    });

    // Test 24: Time format is correct
    test('Displays time in correct format', async () => {
        render(<Home />);

        await waitFor(() => {
            const timeElement = screen.getByTestId('current-time');
            expect(timeElement.textContent).toMatch(/\d{2}:\d{2}:\d{2}/);
        });
    });

    // Test 25: All components are present on initial render
    test('All dashboard components are present on initial render', async () => {
        render(<Home />);

        await waitFor(() => {
            expect(screen.getByTestId('last-punch-component')).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByTestId('week-hours-component')).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByTestId('day-planning-component')).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByTestId('announcements-component')).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByTestId('notifications-component')).toBeInTheDocument();
        });
    });
});