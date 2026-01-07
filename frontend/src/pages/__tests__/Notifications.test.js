import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import Notifications from '../Notifications'
import notificationService from '../../services/notificationService'

// Mock the notification service
jest.mock('../../services/notificationService')

describe('Notifications Component', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks()
        // Set default userId in localStorage
        localStorage.setItem('userId', '1')
    })

    afterEach(() => {
        localStorage.clear()
    })

    // Test 1: Renders loading state initially
    test('renders loading state when fetching notifications', () => {
        notificationService.getNotificationsByUserId.mockImplementation(() => new Promise(() => { }))

        render(<Notifications />)

        expect(screen.getByTestId('loading-message')).toHaveTextContent('Chargement...')
    })

    // Test 2: Renders empty state when no notifications exist
    test('renders empty message when there are no notifications', async () => {
        notificationService.getNotificationsByUserId.mockResolvedValue([])

        render(<Notifications />)

        await waitFor(() => {
            expect(screen.getByTestId('empty-message')).toHaveTextContent('Aucune notification')
        })
    })

    // Test 3: Renders notifications list when notifications exist
    test('renders notifications list with multiple notifications', async () => {
        const mockNotifications = [
            {
                id: 1,
                userId: 1,
                message: 'Vous avez badgé avec succès',
                type: 'badgeage',
                isRead: false,
                createdAt: '2024-01-15T08:30:00Z'
            },
            {
                id: 2,
                userId: 1,
                message: 'Votre réservation a été confirmée',
                type: 'reservation',
                isRead: true,
                createdAt: '2024-01-14T10:00:00Z'
            }
        ]

        notificationService.getNotificationsByUserId.mockResolvedValue(mockNotifications)

        render(<Notifications />)

        await waitFor(() => {
            expect(screen.getByTestId('notifications-list')).toBeInTheDocument()
        })
    })

    // Test 4: Displays correct notification count (max 4)
    test('limits notifications to 4 most recent items', async () => {
        const mockNotifications = Array.from({ length: 10 }, (_, i) => ({
            id: i + 1,
            userId: 1,
            message: `Notification ${i + 1}`,
            type: 'badgeage',
            isRead: false,
            createdAt: new Date().toISOString()
        }))

        notificationService.getNotificationsByUserId.mockResolvedValue(mockNotifications)

        render(<Notifications />)

        await waitFor(() => {
            expect(screen.getAllByTestId(/^notification-item-/)).toHaveLength(4)
        })
    })

    // Test 5: Renders notification with badgeage icon
    test('displays correct icon for badgeage notification type', async () => {
        const mockNotifications = [
            {
                id: 1,
                userId: 1,
                message: 'Vous avez badgé',
                type: 'badgeage',
                isRead: false,
                createdAt: '2024-01-15T08:30:00Z'
            }
        ]

        notificationService.getNotificationsByUserId.mockResolvedValue(mockNotifications)

        render(<Notifications />)

        await waitFor(() => {
            expect(screen.getByTestId('notification-icon-1')).toHaveTextContent('🕐')
        })
    })

    // Test 6: Renders notification with reservation icon
    test('displays correct icon for reservation notification type', async () => {
        const mockNotifications = [
            {
                id: 1,
                userId: 1,
                message: 'Réservation confirmée',
                type: 'reservation',
                isRead: false,
                createdAt: '2024-01-15T10:00:00Z'
            }
        ]

        notificationService.getNotificationsByUserId.mockResolvedValue(mockNotifications)

        render(<Notifications />)

        await waitFor(() => {
            expect(screen.getByTestId('notification-icon-1')).toHaveTextContent('🚗')
        })
    })

    // Test 7: Renders notification with planning_sent icon
    test('displays correct icon for planning_sent notification type', async () => {
        const mockNotifications = [
            {
                id: 1,
                userId: 1,
                message: 'Planning envoyé',
                type: 'planning_sent',
                isRead: false,
                createdAt: '2024-01-15T09:00:00Z'
            }
        ]

        notificationService.getNotificationsByUserId.mockResolvedValue(mockNotifications)

        render(<Notifications />)

        await waitFor(() => {
            expect(screen.getByTestId('notification-icon-1')).toHaveTextContent('📤')
        })
    })

    // Test 8: Renders notification with planning_response icon
    test('displays correct icon for planning_response notification type', async () => {
        const mockNotifications = [
            {
                id: 1,
                userId: 1,
                message: 'Planning approuvé',
                type: 'planning_response',
                isRead: false,
                createdAt: '2024-01-15T11:00:00Z'
            }
        ]

        notificationService.getNotificationsByUserId.mockResolvedValue(mockNotifications)

        render(<Notifications />)

        await waitFor(() => {
            expect(screen.getByTestId('notification-icon-1')).toHaveTextContent('✅')
        })
    })

    // Test 9: Renders refused planning notification with special icon
    test('displays cross icon for refused planning notification', async () => {
        const mockNotifications = [
            {
                id: 1,
                userId: 1,
                message: 'Votre demande de planning a été refusée',
                type: 'planning_response',
                isRead: false,
                createdAt: '2024-01-15T11:00:00Z'
            }
        ]

        notificationService.getNotificationsByUserId.mockResolvedValue(mockNotifications)

        render(<Notifications />)

        await waitFor(() => {
            expect(screen.getByTestId('notification-icon-1')).toHaveTextContent('❌')
        })
    })

    // Test 10: Renders notification with planning_request icon
    test('displays correct icon for planning_request notification type', async () => {
        const mockNotifications = [
            {
                id: 1,
                userId: 1,
                message: 'Nouvelle demande de planning',
                type: 'planning_request',
                isRead: false,
                createdAt: '2024-01-15T12:00:00Z'
            }
        ]

        notificationService.getNotificationsByUserId.mockResolvedValue(mockNotifications)

        render(<Notifications />)

        await waitFor(() => {
            expect(screen.getByTestId('notification-icon-1')).toHaveTextContent('📋')
        })
    })

    // Test 11: Renders notification with ticket_status icon
    test('displays correct icon for ticket_status notification type', async () => {
        const mockNotifications = [
            {
                id: 1,
                userId: 1,
                message: 'Statut du ticket mis à jour',
                type: 'ticket_status',
                isRead: false,
                createdAt: '2024-01-15T13:00:00Z'
            }
        ]

        notificationService.getNotificationsByUserId.mockResolvedValue(mockNotifications)

        render(<Notifications />)

        await waitFor(() => {
            expect(screen.getByTestId('notification-icon-1')).toHaveTextContent('🎫')
        })
    })

    // Test 12: Renders notification with default icon for unknown type
    test('displays default icon for unknown notification type', async () => {
        const mockNotifications = [
            {
                id: 1,
                userId: 1,
                message: 'Notification générale',
                type: 'unknown_type',
                isRead: false,
                createdAt: '2024-01-15T14:00:00Z'
            }
        ]

        notificationService.getNotificationsByUserId.mockResolvedValue(mockNotifications)

        render(<Notifications />)

        await waitFor(() => {
            expect(screen.getByTestId('notification-icon-1')).toHaveTextContent('🔔')
        })
    })

    // Test 13: Displays notification message correctly
    test('renders notification message text correctly', async () => {
        const mockNotifications = [
            {
                id: 1,
                userId: 1,
                message: 'Test notification message',
                type: 'badgeage',
                isRead: false,
                createdAt: '2024-01-15T08:30:00Z'
            }
        ]

        notificationService.getNotificationsByUserId.mockResolvedValue(mockNotifications)

        render(<Notifications />)

        await waitFor(() => {
            expect(screen.getByTestId('notification-message-1')).toHaveTextContent('Test notification message')
        })
    })

    // Test 14: Formats notification date correctly
    test('formats and displays notification date correctly', async () => {
        const mockNotifications = [
            {
                id: 1,
                userId: 1,
                message: 'Test notification',
                type: 'badgeage',
                isRead: false,
                createdAt: '2024-01-15T08:30:00Z'
            }
        ]

        notificationService.getNotificationsByUserId.mockResolvedValue(mockNotifications)

        render(<Notifications />)

        await waitFor(() => {
            expect(screen.getByTestId('notification-date-1')).toBeInTheDocument()
        })

        const dateElement = screen.getByTestId('notification-date-1')
        expect(dateElement.textContent).not.toBe('')
    })

    // Test 15: Applies correct styling for unread notification
    test('applies unread styling to unread notifications', async () => {
        const mockNotifications = [
            {
                id: 1,
                userId: 1,
                message: 'Unread notification',
                type: 'badgeage',
                isRead: false,
                createdAt: '2024-01-15T08:30:00Z'
            }
        ]

        notificationService.getNotificationsByUserId.mockResolvedValue(mockNotifications)

        render(<Notifications />)

        await waitFor(() => {
            expect(screen.getByTestId('notification-item-1')).toHaveAttribute('data-is-read', 'false')
        })
    })

    // Test 16: Applies correct styling for read notification
    test('applies read styling to read notifications', async () => {
        const mockNotifications = [
            {
                id: 1,
                userId: 1,
                message: 'Read notification',
                type: 'badgeage',
                isRead: true,
                createdAt: '2024-01-15T08:30:00Z'
            }
        ]

        notificationService.getNotificationsByUserId.mockResolvedValue(mockNotifications)

        render(<Notifications />)

        await waitFor(() => {
            expect(screen.getByTestId('notification-item-1')).toHaveAttribute('data-is-read', 'true')
        })
    })

    // Test 17: Applies special styling for refused planning notification
    test('applies refused styling to refused planning notifications', async () => {
        const mockNotifications = [
            {
                id: 1,
                userId: 1,
                message: 'Votre demande a été refusée',
                type: 'planning_response',
                isRead: false,
                createdAt: '2024-01-15T11:00:00Z'
            }
        ]

        notificationService.getNotificationsByUserId.mockResolvedValue(mockNotifications)

        render(<Notifications />)

        await waitFor(() => {
            expect(screen.getByTestId('notification-item-1')).toHaveAttribute('data-is-refused', 'true')
        })
    })

    // Test 18: Handles missing userId in localStorage
    test('renders empty state when userId is not in localStorage', async () => {
        localStorage.removeItem('userId')

        render(<Notifications />)

        await waitFor(() => {
            expect(screen.getByTestId('empty-message')).toHaveTextContent('Aucune notification')
        })
    })

    // Test 19: Handles API error gracefully
    test('renders empty state when API call fails', async () => {
        notificationService.getNotificationsByUserId.mockRejectedValue(new Error('API Error'))

        render(<Notifications />)

        await waitFor(() => {
            expect(screen.getByTestId('empty-message')).toHaveTextContent('Aucune notification')
        })
    })

    // Test 20: Renders notifications container with correct title
    test('renders notifications container with title', async () => {
        notificationService.getNotificationsByUserId.mockResolvedValue([])

        render(<Notifications />)

        await waitFor(() => {
            expect(screen.getByTestId('notifications-title')).toHaveTextContent('Notifications')
        })
    })

    // Test 21: Renders badgeage notification icon correctly in mixed list
    test('renders badgeage icon correctly in mixed notification types', async () => {
        const mockNotifications = [
            {
                id: 1,
                userId: 1,
                message: 'Badgeage effectué',
                type: 'badgeage',
                isRead: false,
                createdAt: '2024-01-15T08:30:00Z'
            },
            {
                id: 2,
                userId: 1,
                message: 'Réservation confirmée',
                type: 'reservation',
                isRead: false,
                createdAt: '2024-01-15T09:00:00Z'
            },
            {
                id: 3,
                userId: 1,
                message: 'Planning envoyé',
                type: 'planning_sent',
                isRead: true,
                createdAt: '2024-01-15T10:00:00Z'
            }
        ]

        notificationService.getNotificationsByUserId.mockResolvedValue(mockNotifications)

        render(<Notifications />)

        await waitFor(() => {
            expect(screen.getByTestId('notification-icon-1')).toHaveTextContent('🕐')
        })
    })

    // Test 22: Renders reservation notification icon correctly in mixed list
    test('renders reservation icon correctly in mixed notification types', async () => {
        const mockNotifications = [
            {
                id: 1,
                userId: 1,
                message: 'Badgeage effectué',
                type: 'badgeage',
                isRead: false,
                createdAt: '2024-01-15T08:30:00Z'
            },
            {
                id: 2,
                userId: 1,
                message: 'Réservation confirmée',
                type: 'reservation',
                isRead: false,
                createdAt: '2024-01-15T09:00:00Z'
            },
            {
                id: 3,
                userId: 1,
                message: 'Planning envoyé',
                type: 'planning_sent',
                isRead: true,
                createdAt: '2024-01-15T10:00:00Z'
            }
        ]

        notificationService.getNotificationsByUserId.mockResolvedValue(mockNotifications)

        render(<Notifications />)

        await waitFor(() => {
            expect(screen.getByTestId('notification-icon-2')).toHaveTextContent('🚗')
        })
    })

    // Test 23: Renders planning_sent notification icon correctly in mixed list
    test('renders planning_sent icon correctly in mixed notification types', async () => {
        const mockNotifications = [
            {
                id: 1,
                userId: 1,
                message: 'Badgeage effectué',
                type: 'badgeage',
                isRead: false,
                createdAt: '2024-01-15T08:30:00Z'
            },
            {
                id: 2,
                userId: 1,
                message: 'Réservation confirmée',
                type: 'reservation',
                isRead: false,
                createdAt: '2024-01-15T09:00:00Z'
            },
            {
                id: 3,
                userId: 1,
                message: 'Planning envoyé',
                type: 'planning_sent',
                isRead: true,
                createdAt: '2024-01-15T10:00:00Z'
            }
        ]

        notificationService.getNotificationsByUserId.mockResolvedValue(mockNotifications)

        render(<Notifications />)

        await waitFor(() => {
            expect(screen.getByTestId('notification-icon-3')).toHaveTextContent('📤')
        })
    })

    // Test 24: Renders notification type attribute correctly
    test('sets correct notification type data attribute', async () => {
        const mockNotifications = [
            {
                id: 1,
                userId: 1,
                message: 'Test notification',
                type: 'badgeage',
                isRead: false,
                createdAt: '2024-01-15T08:30:00Z'
            }
        ]

        notificationService.getNotificationsByUserId.mockResolvedValue(mockNotifications)

        render(<Notifications />)

        await waitFor(() => {
            expect(screen.getByTestId('notification-item-1')).toHaveAttribute('data-notification-type', 'badgeage')
        })
    })
})