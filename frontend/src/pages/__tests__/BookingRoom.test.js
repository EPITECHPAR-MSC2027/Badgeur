import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BookingRoom from '../BookingRoom';
import roomService from '../../services/roomService';
import bookingRoomService from '../../services/bookingRoomService';
import teamService from '../../services/teamService';

// Mock services
jest.mock('../../services/roomService');
jest.mock('../../services/bookingRoomService');
jest.mock('../../services/teamService');

describe('BookingRoom', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();

        // Mock localStorage
        Storage.prototype.getItem = jest.fn((key) => {
            if (key === 'userId') return '1';
            return null;
        });
    });

    // Test 1: Component renders successfully
    test('renders booking room page with title and description', () => {
        roomService.getAllRooms.mockResolvedValue([]);
        teamService.listUsers.mockResolvedValue([]);

        render(<BookingRoom />);

        expect(screen.getByTestId('page-title')).toBeInTheDocument();
        expect(screen.getByTestId('page-description')).toBeInTheDocument();
    });

    // Test 2: Shows loading message while fetching data
    test('displays loading message while fetching rooms and users', () => {
        roomService.getAllRooms.mockImplementation(() => new Promise(() => { }));
        teamService.listUsers.mockImplementation(() => new Promise(() => { }));

        render(<BookingRoom />);

        expect(screen.getByTestId('loading-message')).toBeInTheDocument();
    });

    // Test 3: Displays error message when data fetch fails
    test('displays error message when rooms fetch fails', async () => {
        const errorMessage = 'Chargement impossible.';
        roomService.getAllRooms.mockRejectedValue(new Error(errorMessage));
        teamService.listUsers.mockResolvedValue([]);

        render(<BookingRoom />);

        await waitFor(() => {
            expect(screen.getByTestId('error-message')).toBeInTheDocument();
        });
    });

    // Test 4: Renders list of rooms successfully
    test('renders list of rooms when data is loaded', async () => {
        const mockRooms = [
            { id: 1, name: 'Salle A', Name: 'Salle A', capacity: 10, Capacity: 10, hasLargeScreen: true, hasBoard: false, hasMic: true },
            { id: 2, name: 'Salle B', Name: 'Salle B', capacity: 20, Capacity: 20, hasLargeScreen: false, hasBoard: true, hasMic: false }
        ];
        roomService.getAllRooms.mockResolvedValue(mockRooms);
        teamService.listUsers.mockResolvedValue([]);

        render(<BookingRoom />);

        await waitFor(() => {
            expect(screen.getByTestId('room-card-1')).toBeInTheDocument();
        });

        expect(screen.getByTestId('room-name-1')).toBeInTheDocument();
        expect(screen.getByTestId('room-capacity-1')).toBeInTheDocument();
    });

    // Test 5: Displays "no rooms" message when rooms list is empty
    test('displays no rooms message when rooms list is empty', async () => {
        roomService.getAllRooms.mockResolvedValue([]);
        teamService.listUsers.mockResolvedValue([]);

        render(<BookingRoom />);

        await waitFor(() => {
            expect(screen.getByTestId('no-rooms-message')).toBeInTheDocument();
        });
    });

    // Test 6: Selects a room when clicked
    test('selects a room when clicked', async () => {
        const mockRooms = [
            { id: 1, name: 'Salle A', capacity: 10, hasLargeScreen: true }
        ];
        roomService.getAllRooms.mockResolvedValue(mockRooms);
        teamService.listUsers.mockResolvedValue([]);

        render(<BookingRoom />);

        await waitFor(() => {
            expect(screen.getByTestId('room-card-1')).toBeInTheDocument();
        });

        const roomCard = screen.getByTestId('room-card-1');
        fireEvent.click(roomCard);

        expect(roomCard).toHaveAttribute('data-selected', 'true');
        expect(screen.getByTestId('selected-room-info')).toBeInTheDocument();
    });

    // Test 7: Title input updates correctly
    test('updates title input value when user types', async () => {
        roomService.getAllRooms.mockResolvedValue([]);
        teamService.listUsers.mockResolvedValue([]);

        render(<BookingRoom />);

        await waitFor(() => {
            expect(screen.getByTestId('title-input')).toBeInTheDocument();
        });

        const titleInput = screen.getByTestId('title-input');
        fireEvent.change(titleInput, { target: { value: 'Reunion projet' } });

        expect(titleInput).toHaveValue('Reunion projet');
    });

    // Test 8: Validates required fields on submit
    test('shows error when submitting without selecting a room', async () => {
        roomService.getAllRooms.mockResolvedValue([]);
        teamService.listUsers.mockResolvedValue([]);

        render(<BookingRoom />);

        await waitFor(() => {
            expect(screen.getByTestId('submit-button')).toBeInTheDocument();
        });

        const submitButton = screen.getByTestId('submit-button');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByTestId('feedback-message')).toBeInTheDocument();
        });

        expect(screen.getByTestId('feedback-message')).toHaveAttribute('data-feedback-type', 'error');
    });

    // Test 9: Validates title field is not empty
    test('shows error when submitting without a title', async () => {
        const mockRooms = [{ id: 1, name: 'Salle A', capacity: 10 }];
        roomService.getAllRooms.mockResolvedValue(mockRooms);
        teamService.listUsers.mockResolvedValue([]);

        render(<BookingRoom />);

        await waitFor(() => {
            expect(screen.getByTestId('room-card-1')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('room-card-1'));

        const submitButton = screen.getByTestId('submit-button');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByTestId('feedback-message')).toBeInTheDocument();
        });

        expect(screen.getByTestId('feedback-message')).toHaveAttribute('data-feedback-type', 'error');
    });

    // Test 10: Validates end time is after start time
    test('shows error when end time is before start time', async () => {
        const mockRooms = [{ id: 1, name: 'Salle A', capacity: 10 }];
        roomService.getAllRooms.mockResolvedValue(mockRooms);
        teamService.listUsers.mockResolvedValue([]);

        render(<BookingRoom />);

        await waitFor(() => {
            expect(screen.getByTestId('room-card-1')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('room-card-1'));
        fireEvent.change(screen.getByTestId('title-input'), { target: { value: 'Test' } });

        const now = new Date();
        const startTime = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16);
        const endTime = new Date(now.getTime() + 1 * 60 * 60 * 1000).toISOString().slice(0, 16);

        fireEvent.change(screen.getByTestId('start-input'), { target: { value: startTime } });
        fireEvent.change(screen.getByTestId('end-input'), { target: { value: endTime } });

        fireEvent.click(screen.getByTestId('submit-button'));

        await waitFor(() => {
            expect(screen.getByTestId('feedback-message')).toBeInTheDocument();
        });

        expect(screen.getByTestId('feedback-message')).toHaveAttribute('data-feedback-type', 'error');
    });

    // Test 11: Successfully creates booking
    test('successfully creates a booking with valid data', async () => {
        const mockRooms = [{ id: 1, name: 'Salle A', capacity: 10 }];
        const bookingId = 123;

        roomService.getAllRooms.mockResolvedValue(mockRooms);
        teamService.listUsers.mockResolvedValue([]);
        bookingRoomService.create.mockResolvedValue(bookingId);
        bookingRoomService.addParticipant.mockResolvedValue(true);

        render(<BookingRoom />);

        await waitFor(() => {
            expect(screen.getByTestId('room-card-1')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('room-card-1'));
        fireEvent.change(screen.getByTestId('title-input'), { target: { value: 'Reunion test' } });
        fireEvent.click(screen.getByTestId('submit-button'));

        await waitFor(() => {
            expect(screen.getByTestId('feedback-message')).toBeInTheDocument();
        });

        expect(screen.getByTestId('feedback-message')).toHaveAttribute('data-feedback-type', 'success');
    });

    // Test 12: Toggles user search visibility
    test('toggles user search when add participant button is clicked', async () => {
        roomService.getAllRooms.mockResolvedValue([]);
        teamService.listUsers.mockResolvedValue([]);

        render(<BookingRoom />);

        await waitFor(() => {
            expect(screen.getByTestId('toggle-user-search-button')).toBeInTheDocument();
        });

        expect(screen.queryByTestId('user-search-container')).not.toBeInTheDocument();

        fireEvent.click(screen.getByTestId('toggle-user-search-button'));

        expect(screen.getByTestId('user-search-container')).toBeInTheDocument();
    });

    // Test 13: Searches and filters users
    test('filters users based on search query', async () => {
        const mockUsers = [
            { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
            { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' }
        ];

        roomService.getAllRooms.mockResolvedValue([]);
        teamService.listUsers.mockResolvedValue(mockUsers);

        render(<BookingRoom />);

        await waitFor(() => {
            expect(screen.getByTestId('toggle-user-search-button')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('toggle-user-search-button'));

        const searchInput = screen.getByTestId('user-search-input');
        fireEvent.change(searchInput, { target: { value: 'John' } });

        await waitFor(() => {
            expect(screen.getByTestId('user-result-1')).toBeInTheDocument();
        });

        expect(screen.queryByTestId('user-result-2')).not.toBeInTheDocument();
    });

    // Test 14: Adds participant to selected list
    test('adds participant to selected list when clicked', async () => {
        const mockUsers = [
            { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com' }
        ];

        roomService.getAllRooms.mockResolvedValue([]);
        teamService.listUsers.mockResolvedValue(mockUsers);

        render(<BookingRoom />);

        await waitFor(() => {
            expect(screen.getByTestId('toggle-user-search-button')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('toggle-user-search-button'));
        fireEvent.change(screen.getByTestId('user-search-input'), { target: { value: 'John' } });

        await waitFor(() => {
            expect(screen.getByTestId('user-result-1')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('user-result-1'));

        expect(screen.getByTestId('selected-participants-list')).toBeInTheDocument();
        expect(screen.getByTestId('participant-name-0')).toBeInTheDocument();
    });

    // Test 15: Removes participant from selected list
    test('removes participant when remove button is clicked', async () => {
        const mockUsers = [
            { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com' }
        ];

        roomService.getAllRooms.mockResolvedValue([]);
        teamService.listUsers.mockResolvedValue(mockUsers);

        render(<BookingRoom />);

        await waitFor(() => {
            expect(screen.getByTestId('toggle-user-search-button')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('toggle-user-search-button'));
        fireEvent.change(screen.getByTestId('user-search-input'), { target: { value: 'John' } });

        await waitFor(() => {
            expect(screen.getByTestId('user-result-1')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('user-result-1'));

        await waitFor(() => {
            expect(screen.getByTestId('remove-participant-button-0')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('remove-participant-button-0'));

        expect(screen.queryByTestId('selected-participants-list')).not.toBeInTheDocument();
    });

    // Test 16: Changes participant role
    test('changes participant role when select is changed', async () => {
        const mockUsers = [
            { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com' }
        ];

        roomService.getAllRooms.mockResolvedValue([]);
        teamService.listUsers.mockResolvedValue(mockUsers);

        render(<BookingRoom />);

        await waitFor(() => {
            expect(screen.getByTestId('toggle-user-search-button')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('toggle-user-search-button'));
        fireEvent.change(screen.getByTestId('user-search-input'), { target: { value: 'John' } });

        await waitFor(() => {
            expect(screen.getByTestId('user-result-1')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('user-result-1'));

        await waitFor(() => {
            expect(screen.getByTestId('participant-role-select-0')).toBeInTheDocument();
        });

        const roleSelect = screen.getByTestId('participant-role-select-0');
        fireEvent.change(roleSelect, { target: { value: 'optionnel' } });

        expect(roleSelect).toHaveValue('optionnel');
    });

    // Test 17: Displays room features correctly
    test('displays room features with correct icons', async () => {
        const mockRooms = [
            { id: 1, name: 'Salle A', capacity: 10, hasLargeScreen: true, hasBoard: true, hasMic: true }
        ];

        roomService.getAllRooms.mockResolvedValue(mockRooms);
        teamService.listUsers.mockResolvedValue([]);

        render(<BookingRoom />);

        await waitFor(() => {
            expect(screen.getByTestId('room-card-1')).toBeInTheDocument();
        });

        // Use normalized test IDs without accents
        expect(screen.getByTestId('feature-tag-ecran')).toBeInTheDocument();
        expect(screen.getByTestId('feature-tag-tableau')).toBeInTheDocument();
        expect(screen.getByTestId('feature-tag-micro')).toBeInTheDocument();
    });

    // Test 18: Submitting button shows loading state
    test('submit button shows loading state during submission', async () => {
        const mockRooms = [{ id: 1, name: 'Salle A', capacity: 10 }];

        roomService.getAllRooms.mockResolvedValue(mockRooms);
        teamService.listUsers.mockResolvedValue([]);
        bookingRoomService.create.mockImplementation(() => new Promise(() => { }));

        render(<BookingRoom />);

        await waitFor(() => {
            expect(screen.getByTestId('room-card-1')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('room-card-1'));
        fireEvent.change(screen.getByTestId('title-input'), { target: { value: 'Test' } });

        const submitButton = screen.getByTestId('submit-button');
        fireEvent.click(submitButton);

        expect(submitButton).toBeDisabled();
    });

    // Test 19: Shows error feedback on booking creation failure
    test('shows error feedback when booking creation fails', async () => {
        const mockRooms = [{ id: 1, name: 'Salle A', capacity: 10 }];

        roomService.getAllRooms.mockResolvedValue(mockRooms);
        teamService.listUsers.mockResolvedValue([]);
        bookingRoomService.create.mockRejectedValue(new Error('Erreur serveur'));

        render(<BookingRoom />);

        await waitFor(() => {
            expect(screen.getByTestId('room-card-1')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('room-card-1'));
        fireEvent.change(screen.getByTestId('title-input'), { target: { value: 'Test' } });
        fireEvent.click(screen.getByTestId('submit-button'));

        await waitFor(() => {
            expect(screen.getByTestId('feedback-message')).toBeInTheDocument();
        });

        expect(screen.getByTestId('feedback-message')).toHaveAttribute('data-feedback-type', 'error');
    });

    // Test 20: Clears form after successful submission
    test('clears form fields after successful booking creation', async () => {
        const mockRooms = [{ id: 1, name: 'Salle A', capacity: 10 }];
        const bookingId = 123;

        roomService.getAllRooms.mockResolvedValue(mockRooms);
        teamService.listUsers.mockResolvedValue([]);
        bookingRoomService.create.mockResolvedValue(bookingId);
        bookingRoomService.addParticipant.mockResolvedValue(true);

        render(<BookingRoom />);

        await waitFor(() => {
            expect(screen.getByTestId('room-card-1')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('room-card-1'));
        fireEvent.change(screen.getByTestId('title-input'), { target: { value: 'Reunion test' } });
        fireEvent.click(screen.getByTestId('submit-button'));

        await waitFor(() => {
            expect(screen.getByTestId('feedback-message')).toBeInTheDocument();
        });

        expect(screen.getByTestId('title-input')).toHaveValue('');
        expect(screen.queryByTestId('selected-room-info')).not.toBeInTheDocument();
    });
});