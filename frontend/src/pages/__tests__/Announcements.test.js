import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Announcements from '../Announcements';
import announcementService from '../../services/announcementService';

// Mock the announcementService
jest.mock('../../services/announcementService');

describe('Announcements Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test 1: Component renders loading state initially
    test('renders loading state initially', () => {
        announcementService.getAllAnnouncements.mockImplementation(() => new Promise(() => { }));

        render(<Announcements />);

        expect(screen.getByTestId('loading-message')).toBeInTheDocument();
    });

    // Test 2: Component displays announcements after loading
    test('displays announcements after loading', async () => {
        const mockAnnouncements = [
            {
                id: 1,
                title: 'Test Announcement 1',
                message: 'This is a test message',
                authorFirstName: 'John',
                authorLastName: 'Doe',
                createdAt: '2024-01-15T10:30:00Z'
            },
            {
                id: 2,
                title: 'Test Announcement 2',
                message: 'Another test message',
                authorFirstName: 'Jane',
                authorLastName: 'Smith',
                createdAt: '2024-01-16T14:45:00Z'
            }
        ];

        announcementService.getAllAnnouncements.mockResolvedValue(mockAnnouncements);

        render(<Announcements />);

        await waitFor(() => {
            expect(screen.getByTestId('announcements-list')).toBeInTheDocument();
        });
    });

    // Test 3: Component displays correct number of announcements
    test('displays correct number of announcements', async () => {
        const mockAnnouncements = [
            {
                id: 1,
                title: 'Announcement 1',
                message: 'Message 1',
                authorFirstName: 'John',
                authorLastName: 'Doe',
                createdAt: '2024-01-15T10:30:00Z'
            },
            {
                id: 2,
                title: 'Announcement 2',
                message: 'Message 2',
                authorFirstName: 'Jane',
                authorLastName: 'Smith',
                createdAt: '2024-01-16T14:45:00Z'
            },
            {
                id: 3,
                title: 'Announcement 3',
                message: 'Message 3',
                authorFirstName: 'Bob',
                authorLastName: 'Johnson',
                createdAt: '2024-01-17T09:00:00Z'
            }
        ];

        announcementService.getAllAnnouncements.mockResolvedValue(mockAnnouncements);

        render(<Announcements />);

        await waitFor(() => {
            expect(screen.getByTestId('announcement-card-1')).toBeInTheDocument();
        });

        expect(screen.getByTestId('announcement-card-2')).toBeInTheDocument();
        expect(screen.getByTestId('announcement-card-3')).toBeInTheDocument();
    });

    // Test 4: Component displays announcement titles correctly
    test('displays announcement titles correctly', async () => {
        const mockAnnouncements = [
            {
                id: 1,
                title: 'Important Update',
                message: 'Test message',
                authorFirstName: 'John',
                authorLastName: 'Doe',
                createdAt: '2024-01-15T10:30:00Z'
            }
        ];

        announcementService.getAllAnnouncements.mockResolvedValue(mockAnnouncements);

        render(<Announcements />);

        await waitFor(() => {
            expect(screen.getByTestId('announcement-title-1')).toHaveTextContent('Important Update');
        });
    });

    // Test 5: Component displays author names correctly
    test('displays author names correctly', async () => {
        const mockAnnouncements = [
            {
                id: 1,
                title: 'Test Title',
                message: 'Test message',
                authorFirstName: 'Alice',
                authorLastName: 'Brown',
                createdAt: '2024-01-15T10:30:00Z'
            }
        ];

        announcementService.getAllAnnouncements.mockResolvedValue(mockAnnouncements);

        render(<Announcements />);

        await waitFor(() => {
            expect(screen.getByTestId('announcement-meta-1')).toHaveTextContent('Par Alice Brown');
        });
    });

    // Test 6: Component displays empty state when no announcements
    test('displays empty state when no announcements', async () => {
        announcementService.getAllAnnouncements.mockResolvedValue([]);

        render(<Announcements />);

        await waitFor(() => {
            expect(screen.getByTestId('empty-state')).toBeInTheDocument();
        });
    });

    // Test 7: Component displays empty message text correctly
    test('displays empty message text correctly', async () => {
        announcementService.getAllAnnouncements.mockResolvedValue([]);

        render(<Announcements />);

        await waitFor(() => {
            expect(screen.getByTestId('empty-message')).toHaveTextContent('Aucune annonce disponible');
        });
    });

    // Test 8: Component displays error message on API failure
    test('displays error message on API failure', async () => {
        announcementService.getAllAnnouncements.mockRejectedValue(new Error('API Error'));

        render(<Announcements />);

        await waitFor(() => {
            expect(screen.getByTestId('error-message')).toBeInTheDocument();
        });
    });

    // Test 9: Component displays correct error text
    test('displays correct error text', async () => {
        announcementService.getAllAnnouncements.mockRejectedValue(new Error('API Error'));

        render(<Announcements />);

        await waitFor(() => {
            expect(screen.getByTestId('error-message')).toHaveTextContent('Erreur lors du chargement des annonces');
        });
    });

    // Test 10: Component expands announcement details on click
    test('expands announcement details on click', async () => {
        const mockAnnouncements = [
            {
                id: 1,
                title: 'Test Announcement',
                message: 'Detailed message content',
                authorFirstName: 'John',
                authorLastName: 'Doe',
                createdAt: '2024-01-15T10:30:00Z'
            }
        ];

        announcementService.getAllAnnouncements.mockResolvedValue(mockAnnouncements);

        render(<Announcements />);

        await waitFor(() => {
            expect(screen.getByTestId('announcement-card-1')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('announcement-card-1'));

        await waitFor(() => {
            expect(screen.getByTestId('announcement-detail-1')).toBeInTheDocument();
        });
    });

    // Test 11: Component displays full message in detail view
    test('displays full message in detail view', async () => {
        const mockAnnouncements = [
            {
                id: 1,
                title: 'Test Announcement',
                message: 'This is the full detailed message',
                authorFirstName: 'John',
                authorLastName: 'Doe',
                createdAt: '2024-01-15T10:30:00Z'
            }
        ];

        announcementService.getAllAnnouncements.mockResolvedValue(mockAnnouncements);

        render(<Announcements />);

        await waitFor(() => {
            expect(screen.getByTestId('announcement-card-1')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('announcement-card-1'));

        await waitFor(() => {
            expect(screen.getByTestId('announcement-message-1')).toHaveTextContent('This is the full detailed message');
        });
    });

    // Test 12: Component closes announcement details on close button click
    test('closes announcement details on close button click', async () => {
        const mockAnnouncements = [
            {
                id: 1,
                title: 'Test Announcement',
                message: 'Detailed message',
                authorFirstName: 'John',
                authorLastName: 'Doe',
                createdAt: '2024-01-15T10:30:00Z'
            }
        ];

        announcementService.getAllAnnouncements.mockResolvedValue(mockAnnouncements);

        render(<Announcements />);

        await waitFor(() => {
            expect(screen.getByTestId('announcement-card-1')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('announcement-card-1'));

        await waitFor(() => {
            expect(screen.getByTestId('announcement-detail-1')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('close-button-1'));

        await waitFor(() => {
            expect(screen.queryByTestId('announcement-detail-1')).not.toBeInTheDocument();
        });
    });

    // Test 13: Component toggles announcement details on card re-click
    test('toggles announcement details on card re-click', async () => {
        const mockAnnouncements = [
            {
                id: 1,
                title: 'Test Announcement',
                message: 'Detailed message',
                authorFirstName: 'John',
                authorLastName: 'Doe',
                createdAt: '2024-01-15T10:30:00Z'
            }
        ];

        announcementService.getAllAnnouncements.mockResolvedValue(mockAnnouncements);

        render(<Announcements />);

        await waitFor(() => {
            expect(screen.getByTestId('announcement-card-1')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('announcement-card-1'));

        await waitFor(() => {
            expect(screen.getByTestId('announcement-detail-1')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('announcement-card-1'));

        await waitFor(() => {
            expect(screen.queryByTestId('announcement-detail-1')).not.toBeInTheDocument();
        });
    });

    // Test 14: Component displays page title correctly
    test('displays page title correctly', async () => {
        announcementService.getAllAnnouncements.mockResolvedValue([]);

        render(<Announcements />);

        await waitFor(() => {
            expect(screen.getByTestId('page-title')).toHaveTextContent('Annonces');
        });
    });

    // Test 15: Component displays page description correctly
    test('displays page description correctly', async () => {
        announcementService.getAllAnnouncements.mockResolvedValue([]);

        render(<Announcements />);

        await waitFor(() => {
            expect(screen.getByTestId('page-description')).toHaveTextContent('Consultez toutes les annonces de l\'entreprise');
        });
    });

    // Test 16: Component shows only one announcement detail at a time
    test('shows only one announcement detail at a time', async () => {
        const mockAnnouncements = [
            {
                id: 1,
                title: 'First Announcement',
                message: 'First message',
                authorFirstName: 'John',
                authorLastName: 'Doe',
                createdAt: '2024-01-15T10:30:00Z'
            },
            {
                id: 2,
                title: 'Second Announcement',
                message: 'Second message',
                authorFirstName: 'Jane',
                authorLastName: 'Smith',
                createdAt: '2024-01-16T14:45:00Z'
            }
        ];

        announcementService.getAllAnnouncements.mockResolvedValue(mockAnnouncements);

        render(<Announcements />);

        await waitFor(() => {
            expect(screen.getByTestId('announcement-card-1')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('announcement-card-1'));

        await waitFor(() => {
            expect(screen.getByTestId('announcement-detail-1')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('announcement-card-2'));

        await waitFor(() => {
            expect(screen.queryByTestId('announcement-detail-1')).not.toBeInTheDocument();
        });

        expect(screen.getByTestId('announcement-detail-2')).toBeInTheDocument();
    });

    // Test 17: Component renders header when announcements exist
    test('renders header when announcements exist', async () => {
        const mockAnnouncements = [
            {
                id: 1,
                title: 'Test',
                message: 'Test message',
                authorFirstName: 'John',
                authorLastName: 'Doe',
                createdAt: '2024-01-15T10:30:00Z'
            }
        ];

        announcementService.getAllAnnouncements.mockResolvedValue(mockAnnouncements);

        render(<Announcements />);

        await waitFor(() => {
            expect(screen.getByTestId('announcements-header')).toBeInTheDocument();
        });
    });

    // Test 18: Component renders container in all states
    test('renders container in all states', async () => {
        announcementService.getAllAnnouncements.mockResolvedValue([]);

        render(<Announcements />);

        await waitFor(() => {
            expect(screen.getByTestId('announcements-container')).toBeInTheDocument();
        });
    });

    // Test 19: Component calls API on mount
    test('calls API on mount', async () => {
        announcementService.getAllAnnouncements.mockResolvedValue([]);

        render(<Announcements />);

        await waitFor(() => {
            expect(announcementService.getAllAnnouncements).toHaveBeenCalledTimes(1);
        });
    });

    // Test 20: Component displays detail title matching card title
    test('displays detail title matching card title', async () => {
        const mockAnnouncements = [
            {
                id: 1,
                title: 'Matching Title',
                message: 'Test message',
                authorFirstName: 'John',
                authorLastName: 'Doe',
                createdAt: '2024-01-15T10:30:00Z'
            }
        ];

        announcementService.getAllAnnouncements.mockResolvedValue(mockAnnouncements);

        render(<Announcements />);

        await waitFor(() => {
            expect(screen.getByTestId('announcement-card-1')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('announcement-card-1'));

        await waitFor(() => {
            expect(screen.getByTestId('announcement-detail-title-1')).toHaveTextContent('Matching Title');
        });
    });
});