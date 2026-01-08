import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MyReservations from '../MyReservations';
import bookingRoomService from '../../services/bookingRoomService';
import vehiculeService from '../../services/vehiculeService';
import teamService from '../../services/teamService';
import roomService from '../../services/roomService';

// Mock services
jest.mock('../../services/bookingRoomService');
jest.mock('../../services/vehiculeService');
jest.mock('../../services/teamService');
jest.mock('../../services/roomService');

// Mock FullCalendar
jest.mock('@fullcalendar/react', () => {
    return function MockFullCalendar({ events, eventClick }) {
        return (
            <div data-testid="fullcalendar-mock">
                {events.map((event, index) => (
                    <div
                        key={event.id}
                        data-testid={`calendar-event-${index}`}
                        onClick={() => eventClick({ event })}
                        style={{ cursor: 'pointer' }}
                    >
                        {event.title}
                    </div>
                ))}
            </div>
        );
    };
});

// Mock CSS
jest.mock('../../style/MyReservations.css', () => ({}));

describe('MyReservations Component', () => {
    const mockUserId = 1;

    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        localStorage.setItem('userId', String(mockUserId));

        // Default mock implementations
        teamService.listUsers.mockResolvedValue([
            { id: 1, firstName: 'John', lastName: 'Doe' },
            { id: 2, firstName: 'Jane', lastName: 'Smith' }
        ]);

        roomService.getAllRooms.mockResolvedValue([
            { id: 1, name: 'Salle A' },
            { id: 2, name: 'Salle B' }
        ]);

        vehiculeService.getBookingsByUserId.mockResolvedValue([]);
        bookingRoomService.list.mockResolvedValue([]);
        bookingRoomService.listParticipants.mockResolvedValue([]);
    });

    // Test 1: Component renders with title and subtitle
    test('Renders reservations page with title and subtitle', async () => {
        render(<MyReservations />);

        await waitFor(() => {
            expect(screen.getByTestId('page-title')).toBeInTheDocument();
        });

        expect(screen.getByTestId('page-subtitle')).toBeInTheDocument();
        expect(screen.getByTestId('reservations-header')).toBeInTheDocument();
    });

    // Test 2: Shows loading state initially
    test('Displays loading spinner while fetching data', () => {
        teamService.listUsers.mockImplementation(() => new Promise(() => { }));

        render(<MyReservations />);

        expect(screen.getByTestId('loading-container')).toBeInTheDocument();
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
        expect(screen.getByTestId('loading-text')).toBeInTheDocument();
    });

    // Test 3: Loads and displays calendar after data fetch
    test('Loads calendar after successful data fetch', async () => {
        render(<MyReservations />);

        await waitFor(() => {
            expect(screen.getByTestId('calendar-wrapper')).toBeInTheDocument();
        });

        expect(screen.queryByTestId('loading-container')).not.toBeInTheDocument();
    });

    // Test 4: Displays vehicle bookings in calendar
    test('Displays vehicle bookings in calendar', async () => {
        vehiculeService.getBookingsByUserId.mockResolvedValue([
            {
                idBookingVehicule: 1,
                destination: 'Paris',
                startDatetime: '2026-02-15T09:00:00',
                endDatetime: '2026-02-15T17:00:00',
                idVehicule: 1
            }
        ]);

        render(<MyReservations />);

        await waitFor(() => {
            expect(screen.getByTestId('calendar-wrapper')).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(vehiculeService.getBookingsByUserId).toHaveBeenCalledWith(mockUserId);
        });
    });

    // Test 5: Displays room bookings in calendar
    test('Displays room bookings in calendar', async () => {
        bookingRoomService.list.mockResolvedValue([
            {
                id: 1,
                title: 'Team Meeting',
                roomId: 1,
                userId: mockUserId,
                startDatetime: '2026-02-20T10:00:00',
                endDatetime: '2026-02-20T11:00:00'
            }
        ]);

        bookingRoomService.listParticipants.mockResolvedValue([]);

        render(<MyReservations />);

        await waitFor(() => {
            expect(bookingRoomService.list).toHaveBeenCalled();
        });
    });

    // Test 6: Opens modal when clicking on event
    test('Opens modal when clicking on calendar event', async () => {
        vehiculeService.getBookingsByUserId.mockResolvedValue([
            {
                idBookingVehicule: 1,
                destination: 'Lyon',
                startDatetime: '2026-03-10T08:00:00',
                endDatetime: '2026-03-10T18:00:00',
                idVehicule: 1
            }
        ]);

        render(<MyReservations />);

        await waitFor(() => {
            expect(screen.getByTestId('calendar-event-0')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('calendar-event-0'));

        await waitFor(() => {
            expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
        });

        expect(screen.getByTestId('modal-content')).toBeInTheDocument();
        expect(screen.getByTestId('modal-header')).toBeInTheDocument();
        expect(screen.getByTestId('modal-body')).toBeInTheDocument();
    });

    // Test 7: Modal displays vehicle event details correctly
    test('Modal displays vehicle event details correctly', async () => {
        vehiculeService.getBookingsByUserId.mockResolvedValue([
            {
                idBookingVehicule: 1,
                destination: 'Marseille',
                startDatetime: '2026-03-15T09:00:00',
                endDatetime: '2026-03-15T17:00:00',
                idVehicule: 1
            }
        ]);

        render(<MyReservations />);

        await waitFor(() => {
            expect(screen.getByTestId('calendar-event-0')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('calendar-event-0'));

        await waitFor(() => {
            expect(screen.getByTestId('event-type-row')).toBeInTheDocument();
        });

        expect(screen.getByTestId('destination-row')).toBeInTheDocument();
        expect(screen.getByTestId('destination-value')).toHaveTextContent('Marseille');
    });

    // Test 8: Modal displays room event details correctly
    test('Modal displays room event details correctly', async () => {
        bookingRoomService.list.mockResolvedValue([
            {
                id: 1,
                title: 'Sprint Planning',
                roomId: 1,
                userId: mockUserId,
                startDatetime: '2026-03-20T14:00:00',
                endDatetime: '2026-03-20T16:00:00'
            }
        ]);

        bookingRoomService.listParticipants.mockResolvedValue([
            { id: 1, userId: mockUserId, status: 'accepted' }
        ]);

        render(<MyReservations />);

        await waitFor(() => {
            expect(screen.getByTestId('calendar-event-0')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('calendar-event-0'));

        await waitFor(() => {
            expect(screen.getByTestId('room-name-row')).toBeInTheDocument();
        });

        expect(screen.getByTestId('room-name-value')).toHaveTextContent('Salle A');
        expect(screen.getByTestId('participants-section')).toBeInTheDocument();
    });

    // Test 9: Closes modal when clicking close button
    test('Closes modal when clicking close button', async () => {
        vehiculeService.getBookingsByUserId.mockResolvedValue([
            {
                idBookingVehicule: 1,
                destination: 'Bordeaux',
                startDatetime: '2026-04-01T10:00:00',
                endDatetime: '2026-04-01T18:00:00',
                idVehicule: 1
            }
        ]);

        render(<MyReservations />);

        await waitFor(() => {
            expect(screen.getByTestId('calendar-event-0')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('calendar-event-0'));

        await waitFor(() => {
            expect(screen.getByTestId('modal-close-button')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('modal-close-button'));

        await waitFor(() => {
            expect(screen.queryByTestId('modal-overlay')).not.toBeInTheDocument();
        });
    });

    // Test 10: Closes modal when clicking overlay
    test('Closes modal when clicking overlay', async () => {
        vehiculeService.getBookingsByUserId.mockResolvedValue([
            {
                idBookingVehicule: 1,
                destination: 'Nice',
                startDatetime: '2026-04-05T09:00:00',
                endDatetime: '2026-04-05T17:00:00',
                idVehicule: 1
            }
        ]);

        render(<MyReservations />);

        await waitFor(() => {
            expect(screen.getByTestId('calendar-event-0')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('calendar-event-0'));

        await waitFor(() => {
            expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('modal-overlay'));

        await waitFor(() => {
            expect(screen.queryByTestId('modal-overlay')).not.toBeInTheDocument();
        });
    });

    // Test 11: Shows delete button for vehicle bookings
    test('Shows delete button for vehicle bookings', async () => {
        vehiculeService.getBookingsByUserId.mockResolvedValue([
            {
                idBookingVehicule: 1,
                destination: 'Toulouse',
                startDatetime: '2026-04-10T08:00:00',
                endDatetime: '2026-04-10T16:00:00',
                idVehicule: 1
            }
        ]);

        render(<MyReservations />);

        await waitFor(() => {
            expect(screen.getByTestId('calendar-event-0')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('calendar-event-0'));

        await waitFor(() => {
            expect(screen.getByTestId('delete-button')).toBeInTheDocument();
        });
    });

    // Test 12: Shows delete button for room bookings created by user
    test('Shows delete button for room bookings created by user', async () => {
        bookingRoomService.list.mockResolvedValue([
            {
                id: 1,
                title: 'My Meeting',
                roomId: 1,
                userId: mockUserId,
                startDatetime: '2026-04-15T13:00:00',
                endDatetime: '2026-04-15T14:00:00'
            }
        ]);

        bookingRoomService.listParticipants.mockResolvedValue([]);

        render(<MyReservations />);

        await waitFor(() => {
            expect(screen.getByTestId('calendar-event-0')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('calendar-event-0'));

        await waitFor(() => {
            expect(screen.getByTestId('delete-button')).toBeInTheDocument();
        });
    });

    // Test 13: Hides delete button for room bookings not created by user
    test('Hides delete button for room bookings not created by user', async () => {
        bookingRoomService.list.mockResolvedValue([
            {
                id: 1,
                title: 'Other Meeting',
                roomId: 1,
                userId: 99,
                startDatetime: '2026-04-20T10:00:00',
                endDatetime: '2026-04-20T11:00:00'
            }
        ]);

        bookingRoomService.listParticipants.mockResolvedValue([
            { id: 1, userId: mockUserId, status: 'accepted' }
        ]);

        render(<MyReservations />);

        await waitFor(() => {
            expect(screen.getByTestId('calendar-event-0')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('calendar-event-0'));

        await waitFor(() => {
            expect(screen.getByTestId('modal-content')).toBeInTheDocument();
        });

        expect(screen.queryByTestId('delete-button')).not.toBeInTheDocument();
    });

    // Test 14: Deletes vehicle booking successfully
    test('Deletes vehicle booking successfully', async () => {
        window.confirm = jest.fn(() => true);
        vehiculeService.deleteBooking.mockResolvedValue({});

        vehiculeService.getBookingsByUserId.mockResolvedValue([
            {
                idBookingVehicule: 1,
                destination: 'Nantes',
                startDatetime: '2026-05-01T09:00:00',
                endDatetime: '2026-05-01T17:00:00',
                idVehicule: 1
            }
        ]);

        render(<MyReservations />);

        await waitFor(() => {
            expect(screen.getByTestId('calendar-event-0')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('calendar-event-0'));

        await waitFor(() => {
            expect(screen.getByTestId('delete-button')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('delete-button'));

        await waitFor(() => {
            expect(vehiculeService.deleteBooking).toHaveBeenCalledWith(1);
        });

        await waitFor(() => {
            expect(screen.getByTestId('feedback-banner')).toBeInTheDocument();
        });

        expect(screen.getByTestId('feedback-banner')).toHaveAttribute('data-feedback-type', 'success');
    });

    // Test 15: Deletes room booking successfully
    test('Deletes room booking successfully', async () => {
        window.confirm = jest.fn(() => true);
        bookingRoomService.remove.mockResolvedValue({});

        bookingRoomService.list.mockResolvedValue([
            {
                id: 1,
                title: 'Delete Test',
                roomId: 1,
                userId: mockUserId,
                startDatetime: '2026-05-05T14:00:00',
                endDatetime: '2026-05-05T15:00:00'
            }
        ]);

        bookingRoomService.listParticipants.mockResolvedValue([]);

        render(<MyReservations />);

        await waitFor(() => {
            expect(screen.getByTestId('calendar-event-0')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('calendar-event-0'));

        await waitFor(() => {
            expect(screen.getByTestId('delete-button')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('delete-button'));

        await waitFor(() => {
            expect(bookingRoomService.remove).toHaveBeenCalledWith(1);
        });
    });

    // Test 16: Cancels deletion when user clicks cancel
    test('Cancels deletion when user clicks cancel in confirmation', async () => {
        window.confirm = jest.fn(() => false);

        vehiculeService.getBookingsByUserId.mockResolvedValue([
            {
                idBookingVehicule: 1,
                destination: 'Lille',
                startDatetime: '2026-05-10T08:00:00',
                endDatetime: '2026-05-10T16:00:00',
                idVehicule: 1
            }
        ]);

        render(<MyReservations />);

        await waitFor(() => {
            expect(screen.getByTestId('calendar-event-0')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('calendar-event-0'));

        await waitFor(() => {
            expect(screen.getByTestId('delete-button')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('delete-button'));

        expect(vehiculeService.deleteBooking).not.toHaveBeenCalled();
    });

    // Test 17: Displays participants for room bookings
    test('Displays participants list for room bookings', async () => {
        bookingRoomService.list.mockResolvedValue([
            {
                id: 1,
                title: 'Team Standup',
                roomId: 1,
                userId: mockUserId,
                startDatetime: '2026-05-15T09:00:00',
                endDatetime: '2026-05-15T09:30:00'
            }
        ]);

        bookingRoomService.listParticipants.mockResolvedValue([
            { id: 1, userId: 1, status: 'accepted' },
            { id: 2, userId: 2, status: 'pending' }
        ]);

        render(<MyReservations />);

        await waitFor(() => {
            expect(screen.getByTestId('calendar-event-0')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('calendar-event-0'));

        await waitFor(() => {
            expect(screen.getByTestId('participants-list')).toBeInTheDocument();
        });

        expect(screen.getByTestId('participant-item-0')).toBeInTheDocument();
        expect(screen.getByTestId('participant-item-1')).toBeInTheDocument();
    });

    // Test 18: Shows accept/decline buttons for pending invitations
    test('Shows accept and decline buttons for pending invitations', async () => {
        bookingRoomService.list.mockResolvedValue([
            {
                id: 1,
                title: 'Invitation Test',
                roomId: 1,
                userId: 99,
                startDatetime: '2026-05-20T10:00:00',
                endDatetime: '2026-05-20T11:00:00'
            }
        ]);

        bookingRoomService.listParticipants.mockResolvedValue([
            { id: 1, userId: mockUserId, status: 'pending' }
        ]);

        render(<MyReservations />);

        await waitFor(() => {
            expect(screen.getByTestId('calendar-event-0')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('calendar-event-0'));

        await waitFor(() => {
            expect(screen.getByTestId('participant-actions-0')).toBeInTheDocument();
        });

        expect(screen.getByTestId('accept-button-0')).toBeInTheDocument();
        expect(screen.getByTestId('decline-button-0')).toBeInTheDocument();
    });

    // Test 19: Accepts participant invitation successfully
    test('Accepts participant invitation successfully', async () => {
        bookingRoomService.updateParticipantStatus.mockResolvedValue({});

        bookingRoomService.list.mockResolvedValue([
            {
                id: 1,
                title: 'Accept Test',
                roomId: 1,
                userId: 99,
                startDatetime: '2026-05-25T11:00:00',
                endDatetime: '2026-05-25T12:00:00'
            }
        ]);

        bookingRoomService.listParticipants.mockResolvedValue([
            { id: 1, userId: mockUserId, status: 'pending' }
        ]);

        render(<MyReservations />);

        await waitFor(() => {
            expect(screen.getByTestId('calendar-event-0')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('calendar-event-0'));

        await waitFor(() => {
            expect(screen.getByTestId('accept-button-0')).toBeInTheDocument();
        });

        bookingRoomService.listParticipants.mockResolvedValue([
            { id: 1, userId: mockUserId, status: 'accepted' }
        ]);

        fireEvent.click(screen.getByTestId('accept-button-0'));

        await waitFor(() => {
            expect(bookingRoomService.updateParticipantStatus).toHaveBeenCalledWith(1, 'accepted');
        });
    });

    // Test 20: Declines participant invitation successfully
    test('Declines participant invitation successfully', async () => {
        bookingRoomService.updateParticipantStatus.mockResolvedValue({});

        bookingRoomService.list.mockResolvedValue([
            {
                id: 1,
                title: 'Decline Test',
                roomId: 1,
                userId: 99,
                startDatetime: '2026-05-30T15:00:00',
                endDatetime: '2026-05-30T16:00:00'
            }
        ]);

        bookingRoomService.listParticipants.mockResolvedValue([
            { id: 1, userId: mockUserId, status: 'pending' }
        ]);

        render(<MyReservations />);

        await waitFor(() => {
            expect(screen.getByTestId('calendar-event-0')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('calendar-event-0'));

        await waitFor(() => {
            expect(screen.getByTestId('decline-button-0')).toBeInTheDocument();
        });

        bookingRoomService.listParticipants.mockResolvedValue([
            { id: 1, userId: mockUserId, status: 'declined' }
        ]);

        fireEvent.click(screen.getByTestId('decline-button-0'));

        await waitFor(() => {
            expect(bookingRoomService.updateParticipantStatus).toHaveBeenCalledWith(1, 'declined');
        });
    });

    // Test 21: Displays error feedback on data load failure
    test('Displays error feedback when data loading fails', async () => {
        teamService.listUsers.mockRejectedValue(new Error('Network error'));

        render(<MyReservations />);

        await waitFor(() => {
            expect(screen.getByTestId('feedback-banner')).toBeInTheDocument();
        });

        expect(screen.getByTestId('feedback-banner')).toHaveAttribute('data-feedback-type', 'error');
    });

    // Test 22: Closes feedback banner when clicking close button
    test('Closes feedback banner when clicking close button', async () => {
        teamService.listUsers.mockRejectedValue(new Error('Network error'));

        render(<MyReservations />);

        await waitFor(() => {
            expect(screen.getByTestId('feedback-banner')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('feedback-close-button'));

        await waitFor(() => {
            expect(screen.queryByTestId('feedback-banner')).not.toBeInTheDocument();
        });
    });

    // Test 23: Displays duration correctly
    test('Displays event duration correctly in modal', async () => {
        vehiculeService.getBookingsByUserId.mockResolvedValue([
            {
                idBookingVehicule: 1,
                destination: 'Strasbourg',
                startDatetime: '2026-06-01T09:00:00',
                endDatetime: '2026-06-01T11:30:00',
                idVehicule: 1
            }
        ]);

        render(<MyReservations />);

        await waitFor(() => {
            expect(screen.getByTestId('calendar-event-0')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('calendar-event-0'));

        await waitFor(() => {
            expect(screen.getByTestId('duration-row')).toBeInTheDocument();
        });

        expect(screen.getByTestId('duration-value')).toBeInTheDocument();
    });

    // Test 24: Displays organizer name for room bookings
    test('Displays organizer name for room bookings', async () => {
        bookingRoomService.list.mockResolvedValue([
            {
                id: 1,
                title: 'Organizer Test',
                roomId: 1,
                userId: 2,
                startDatetime: '2026-06-05T14:00:00',
                endDatetime: '2026-06-05T15:00:00'
            }
        ]);

        bookingRoomService.listParticipants.mockResolvedValue([
            { id: 1, userId: mockUserId, status: 'accepted' }
        ]);

        render(<MyReservations />);

        await waitFor(() => {
            expect(screen.getByTestId('calendar-event-0')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('calendar-event-0'));

        await waitFor(() => {
            expect(screen.getByTestId('organizer-row')).toBeInTheDocument();
        });

        expect(screen.getByTestId('organizer-name')).toHaveTextContent('Jane Smith');
    });

    // Test 25: Disables action buttons during loading
    test('Disables action buttons during loading state', async () => {
        bookingRoomService.updateParticipantStatus.mockImplementation(() => new Promise(() => { }));

        bookingRoomService.list.mockResolvedValue([
            {
                id: 1,
                title: 'Loading Test',
                roomId: 1,
                userId: 99,
                startDatetime: '2026-06-10T10:00:00',
                endDatetime: '2026-06-10T11:00:00'
            }
        ]);

        bookingRoomService.listParticipants.mockResolvedValue([
            { id: 1, userId: mockUserId, status: 'pending' }
        ]);

        render(<MyReservations />);

        await waitFor(() => {
            expect(screen.getByTestId('calendar-event-0')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('calendar-event-0'));

        await waitFor(() => {
            expect(screen.getByTestId('accept-button-0')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('accept-button-0'));

        await waitFor(() => {
            expect(screen.getByTestId('accept-button-0')).toBeDisabled();
        });

        expect(screen.getByTestId('decline-button-0')).toBeDisabled();
    });
});