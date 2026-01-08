import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReservationVehicule from '../ReservationVehicule';
import vehiculeService from '../../services/vehiculeService';
import notificationService from '../../services/notificationService';

// Mock the services
jest.mock('../../services/vehiculeService');
jest.mock('../../services/notificationService');

// Mock CSS imports
jest.mock('../../style/ReservationVehicule.css', () => ({}));
jest.mock('../../index.css', () => ({}));

describe('ReservationVehicule Component', () => {
    const mockVehicules = [
        {
            id: 1,
            name: 'Peugeot 208',
            licensePlate: 'AB-123-CD',
            typeVehicule: 'Citadine',
            transmissionType: 'Manuelle',
            fuelType: 'Essence',
            capacity: 5
        },
        {
            id: 2,
            name: 'Renault Clio',
            licensePlate: 'EF-456-GH',
            typeVehicule: 'Citadine',
            transmissionType: 'Automatique',
            fuelType: 'Diesel',
            capacity: 5
        }
    ];

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();
        localStorage.clear();
        localStorage.setItem('userId', '1');

        // Default mock implementations
        vehiculeService.getAllVehicules.mockResolvedValue(mockVehicules);
        vehiculeService.isVehiculeCurrentlyAvailable.mockResolvedValue(true);
        vehiculeService.checkVehiculeAvailability.mockResolvedValue(true);
        vehiculeService.createBooking.mockResolvedValue(123);
        notificationService.createNotification.mockResolvedValue({});
    });

    // Test 1: Component renders with loading state initially
    it('should display loading message initially', () => {
        render(<ReservationVehicule />);

        const loadingMessage = screen.getByTestId('loading-message');
        expect(loadingMessage).toBeInTheDocument();
    });

    // Test 2: Component loads and displays vehicules successfully
    it('should load and display vehicules after successful fetch', async () => {
        render(<ReservationVehicule />);

        await waitFor(() => {
            expect(vehiculeService.getAllVehicules).toHaveBeenCalledTimes(1);
        });

        await waitFor(() => {
            expect(screen.getByTestId('vehicule-card-1')).toBeInTheDocument();
        });

        expect(screen.getByTestId('vehicule-card-2')).toBeInTheDocument();
        expect(screen.getByTestId('vehicule-name-1')).toBeInTheDocument();
        expect(screen.getByTestId('vehicule-name-2')).toBeInTheDocument();
    });

    // Test 3: Displays no vehicules message when empty array returned
    it('should display no vehicules message when no vehicules available', async () => {
        vehiculeService.getAllVehicules.mockResolvedValue([]);

        render(<ReservationVehicule />);

        await waitFor(() => {
            expect(screen.getByTestId('no-vehicules-message')).toBeInTheDocument();
        });
    });

    // Test 4: Vehicule selection works correctly
    it('should select a vehicule when clicked', async () => {
        render(<ReservationVehicule />);

        await waitFor(() => {
            expect(screen.getByTestId('vehicule-card-1')).toBeInTheDocument();
        });

        const vehiculeCard = screen.getByTestId('vehicule-card-1');
        fireEvent.click(vehiculeCard);

        await waitFor(() => {
            expect(vehiculeCard).toHaveAttribute('data-selected', 'true');
        });
    });

    // Test 5: Submit button is disabled when no vehicule selected
    it('should disable submit button when no vehicule is selected', async () => {
        render(<ReservationVehicule />);

        await waitFor(() => {
            expect(screen.getByTestId('confirm-button')).toBeInTheDocument();
        });

        const submitButton = screen.getByTestId('confirm-button');
        expect(submitButton).toBeDisabled();
    });

    // Test 6: Submit button is enabled when vehicule selected
    it('should enable submit button when vehicule is selected', async () => {
        render(<ReservationVehicule />);

        await waitFor(() => {
            expect(screen.getByTestId('vehicule-card-1')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('vehicule-card-1'));

        await waitFor(() => {
            expect(screen.getByTestId('confirm-button')).not.toBeDisabled();
        });
    });

    // Test 7: Shows error when submitting without destination
    it('should show error message when destination is empty', async () => {
        render(<ReservationVehicule />);

        await waitFor(() => {
            expect(screen.getByTestId('vehicule-card-1')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('vehicule-card-1'));

        const submitButton = screen.getByTestId('confirm-button');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByTestId('feedback-message')).toBeInTheDocument();
        });

        const feedbackMessage = screen.getByTestId('feedback-message');
        expect(feedbackMessage).toHaveAttribute('data-feedback-type', 'error');
    });

    // Test 8: Shows error when submitting without dates
    it('should show error message when dates are missing', async () => {
        render(<ReservationVehicule />);

        await waitFor(() => {
            expect(screen.getByTestId('vehicule-card-1')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('vehicule-card-1'));

        const destinationInput = screen.getByTestId('destination-input');
        fireEvent.change(destinationInput, { target: { value: 'Paris' } });

        const submitButton = screen.getByTestId('confirm-button');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByTestId('feedback-message')).toBeInTheDocument();
        });
    });

    // Test 9: Shows error when start date is after end date
    it('should show error when start date is after or equal to end date', async () => {
        render(<ReservationVehicule />);

        await waitFor(() => {
            expect(screen.getByTestId('vehicule-card-1')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('vehicule-card-1'));

        fireEvent.change(screen.getByTestId('destination-input'), { target: { value: 'Paris' } });
        fireEvent.change(screen.getByTestId('start-date-input'), { target: { value: '2026-12-31' } });
        fireEvent.change(screen.getByTestId('start-time-input'), { target: { value: '14:00' } });
        fireEvent.change(screen.getByTestId('end-date-input'), { target: { value: '2026-12-31' } });
        fireEvent.change(screen.getByTestId('end-time-input'), { target: { value: '10:00' } });

        fireEvent.click(screen.getByTestId('confirm-button'));

        await waitFor(() => {
            expect(screen.getByTestId('feedback-message')).toBeInTheDocument();
        });
    });

    // Test 10: Shows error when vehicule is not available for selected period
    it('should show error when vehicule is not available for selected period', async () => {
        vehiculeService.checkVehiculeAvailability.mockResolvedValue(false);

        render(<ReservationVehicule />);

        await waitFor(() => {
            expect(screen.getByTestId('vehicule-card-1')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('vehicule-card-1'));

        fireEvent.change(screen.getByTestId('destination-input'), { target: { value: 'Paris' } });
        fireEvent.change(screen.getByTestId('start-date-input'), { target: { value: '2026-02-01' } });
        fireEvent.change(screen.getByTestId('start-time-input'), { target: { value: '09:00' } });
        fireEvent.change(screen.getByTestId('end-date-input'), { target: { value: '2026-02-02' } });
        fireEvent.change(screen.getByTestId('end-time-input'), { target: { value: '18:00' } });

        fireEvent.click(screen.getByTestId('confirm-button'));

        await waitFor(() => {
            expect(screen.getByTestId('feedback-message')).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByTestId('feedback-message')).toHaveAttribute('data-feedback-type', 'error');
        });
    });

    // Test 11: Successfully creates booking with valid data
    it('should create booking successfully with valid data', async () => {
        render(<ReservationVehicule />);

        await waitFor(() => {
            expect(screen.getByTestId('vehicule-card-1')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('vehicule-card-1'));

        fireEvent.change(screen.getByTestId('destination-input'), { target: { value: 'Lyon' } });
        fireEvent.change(screen.getByTestId('start-date-input'), { target: { value: '2026-03-15' } });
        fireEvent.change(screen.getByTestId('start-time-input'), { target: { value: '08:00' } });
        fireEvent.change(screen.getByTestId('end-date-input'), { target: { value: '2026-03-16' } });
        fireEvent.change(screen.getByTestId('end-time-input'), { target: { value: '17:00' } });

        fireEvent.click(screen.getByTestId('confirm-button'));

        await waitFor(() => {
            expect(vehiculeService.createBooking).toHaveBeenCalledTimes(1);
        });

        await waitFor(() => {
            expect(screen.getByTestId('feedback-message')).toHaveAttribute('data-feedback-type', 'success');
        });
    });

    // Test 12: Calls notification service after successful booking
    it('should create notification after successful booking', async () => {
        render(<ReservationVehicule />);

        await waitFor(() => {
            expect(screen.getByTestId('vehicule-card-1')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('vehicule-card-1'));

        fireEvent.change(screen.getByTestId('destination-input'), { target: { value: 'Marseille' } });
        fireEvent.change(screen.getByTestId('start-date-input'), { target: { value: '2026-04-20' } });
        fireEvent.change(screen.getByTestId('start-time-input'), { target: { value: '09:00' } });
        fireEvent.change(screen.getByTestId('end-date-input'), { target: { value: '2026-04-21' } });
        fireEvent.change(screen.getByTestId('end-time-input'), { target: { value: '18:00' } });

        fireEvent.click(screen.getByTestId('confirm-button'));

        await waitFor(() => {
            expect(notificationService.createNotification).toHaveBeenCalledTimes(1);
        });
    });

    // Test 13: Resets form after successful booking
    it('should reset form after successful booking', async () => {
        render(<ReservationVehicule />);

        await waitFor(() => {
            expect(screen.getByTestId('vehicule-card-1')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('vehicule-card-1'));

        const destinationInput = screen.getByTestId('destination-input');
        fireEvent.change(destinationInput, { target: { value: 'Bordeaux' } });
        fireEvent.change(screen.getByTestId('start-date-input'), { target: { value: '2026-05-10' } });
        fireEvent.change(screen.getByTestId('start-time-input'), { target: { value: '10:00' } });
        fireEvent.change(screen.getByTestId('end-date-input'), { target: { value: '2026-05-11' } });
        fireEvent.change(screen.getByTestId('end-time-input'), { target: { value: '16:00' } });

        fireEvent.click(screen.getByTestId('confirm-button'));

        await waitFor(() => {
            expect(vehiculeService.createBooking).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(destinationInput.value).toBe('');
        });
    });

    // Test 14: Shows unavailable vehicules with correct styling
    it('should display unavailable vehicules with correct attributes', async () => {
        vehiculeService.isVehiculeCurrentlyAvailable.mockImplementation((id) => {
            return id === 1 ? false : true;
        });

        render(<ReservationVehicule />);

        await waitFor(() => {
            expect(screen.getByTestId('vehicule-card-1')).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByTestId('vehicule-card-1')).toHaveAttribute('data-available', 'false');
        });

        expect(screen.getByTestId('vehicule-card-2')).toHaveAttribute('data-available', 'true');
    });

    // Test 15: Displays correct transmission labels
    it('should display correct transmission labels for vehicules', async () => {
        render(<ReservationVehicule />);

        await waitFor(() => {
            expect(screen.getByTestId('vehicule-transmission-1')).toBeInTheDocument();
        });

        expect(screen.getByTestId('vehicule-transmission-2')).toBeInTheDocument();
    });

    // Test 16: Shows error when localStorage userId is missing
    it('should show error when user is not identified', async () => {
        localStorage.removeItem('userId');

        render(<ReservationVehicule />);

        await waitFor(() => {
            expect(screen.getByTestId('vehicule-card-1')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('vehicule-card-1'));

        fireEvent.change(screen.getByTestId('destination-input'), { target: { value: 'Nice' } });
        fireEvent.change(screen.getByTestId('start-date-input'), { target: { value: '2026-06-15' } });
        fireEvent.change(screen.getByTestId('start-time-input'), { target: { value: '09:00' } });
        fireEvent.change(screen.getByTestId('end-date-input'), { target: { value: '2026-06-16' } });
        fireEvent.change(screen.getByTestId('end-time-input'), { target: { value: '17:00' } });

        fireEvent.click(screen.getByTestId('confirm-button'));

        await waitFor(() => {
            expect(screen.getByTestId('feedback-message')).toHaveAttribute('data-feedback-type', 'error');
        });
    });

    // Test 17: Handles service error gracefully
    it('should handle error when vehicule service fails', async () => {
        vehiculeService.getAllVehicules.mockRejectedValue(new Error('Service error'));

        render(<ReservationVehicule />);

        await waitFor(() => {
            expect(screen.getByTestId('feedback-message')).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByTestId('feedback-message')).toHaveAttribute('data-feedback-type', 'error');
        });
    });

    // Test 18: Displays selection hint when no vehicule selected
    it('should display selection hint when no vehicule is selected', async () => {
        render(<ReservationVehicule />);

        await waitFor(() => {
            expect(screen.getByTestId('selection-hint')).toBeInTheDocument();
        });
    });

    // Test 19: Hides selection hint when vehicule is selected
    it('should hide selection hint when vehicule is selected', async () => {
        render(<ReservationVehicule />);

        await waitFor(() => {
            expect(screen.getByTestId('vehicule-card-1')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('vehicule-card-1'));

        await waitFor(() => {
            expect(screen.queryByTestId('selection-hint')).not.toBeInTheDocument();
        });
    });

    // Test 20: Displays correct vehicule information
    it('should display all vehicule information correctly', async () => {
        render(<ReservationVehicule />);

        await waitFor(() => {
            expect(screen.getByTestId('vehicule-name-1')).toBeInTheDocument();
        });

        expect(screen.getByTestId('vehicule-plate-1')).toBeInTheDocument();
        expect(screen.getByTestId('vehicule-type-1')).toBeInTheDocument();
        expect(screen.getByTestId('vehicule-capacity-1')).toBeInTheDocument();
        expect(screen.getByTestId('vehicule-fuel-1')).toBeInTheDocument();
    });
});