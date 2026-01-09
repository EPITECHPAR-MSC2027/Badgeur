import React, { useCallback, useEffect, useState } from 'react'
import '../index.css'
import notificationService from '../services/notificationService'

function Notifications() {
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const userId = parseInt(localStorage.getItem('userId'))

    const loadNotifications = useCallback(async () => {
        if (!userId) {
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            const data = await notificationService.getNotificationsByUserId(userId)
            // Prendre les 4 plus récentes notifications
            setNotifications(data.slice(0, 4))
        } catch (err) {
            console.error('Erreur lors du chargement des notifications:', err)
        } finally {
            setLoading(false)
        }
    }, [userId])

    useEffect(() => {
        loadNotifications()
    }, [loadNotifications])

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString)
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        } catch {
            return dateString
        }
    }

    const getTypeIcon = (type, message) => {
        // Si c'est une réponse de planning refusée, afficher une croix rouge
        if (type === 'planning_response' && message && message.toLowerCase().includes('refusée')) {
            return '❌'
        }

        switch (type) {
            case 'badgeage':
                return '🕐'
            case 'reservation':
                return '🚗'
            case 'planning_sent':
                return '📤'
            case 'planning_response':
                return '✅'
            case 'planning_request':
                return '📋'
            case 'ticket_status':
                return '🎫'
            default:
                return '🔔'
        }
    }

    const isRefusedPlanning = (notification) => {
        return notification.type === 'planning_response' &&
            notification.message &&
            notification.message.toLowerCase().includes('refusée')
    }

    const cardStyle = {
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-secondary)',
        borderRadius: '9px',
        padding: '16px 20px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        marginTop: '50px'
    }

    const titleStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontFamily: 'Alata, sans-serif',
        marginBottom: '16px'
    }

    const notificationItemStyle = {
        marginTop: 12,
        fontFamily: 'Fustat, sans-serif',
        color: 'var(--color-third)',
        padding: '12px',
        backgroundColor: 'var(--color-background)',
        borderRadius: '6px',
        borderLeft: '3px solid var(--color-secondary)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px'
    }

    const unreadNotificationStyle = {
        ...notificationItemStyle,
        backgroundColor: 'rgba(31, 139, 76, 0.05)',
        fontWeight: 600
    }

    const readNotificationStyle = {
        ...notificationItemStyle,
        opacity: 0.7
    }

    const refusedNotificationStyle = {
        ...notificationItemStyle,
        borderLeft: '3px solid #ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)'
    }

    if (loading) {
        return (
            <div style={cardStyle} data-testid="notifications-container">
                <div style={titleStyle}>
                    <h1 data-testid="notifications-title">Notifications</h1>
                </div>
                <div style={{ fontFamily: 'Fustat, sans-serif', color: 'var(--color-text)' }} data-testid="loading-message">
                    Chargement...
                </div>
            </div>
        )
    }

    return (
        <div style={cardStyle} data-testid="notifications-container">
            <div style={titleStyle}>
                <h1 data-testid="notifications-title">Notifications</h1>
            </div>
            {notifications.length === 0 ? (
                <div style={{ fontFamily: 'Fustat, sans-serif', color: 'var(--color-text)', marginTop: 12 }} data-testid="empty-message">
                    Aucune notification
                </div>
            ) : (
                <div data-testid="notifications-list">
                    {notifications.map(notification => {
                        const isRefused = isRefusedPlanning(notification)
                        const notificationStyle = isRefused
                            ? refusedNotificationStyle
                            : (notification.isRead ? readNotificationStyle : unreadNotificationStyle)

                        return (
                            <div
                                key={notification.id}
                                style={notificationStyle}
                                data-testid={`notification-item-${notification.id}`}
                                data-notification-type={notification.type}
                                data-is-read={notification.isRead}
                                data-is-refused={isRefused}
                            >
                                <span style={{ fontSize: '18px' }} data-testid={`notification-icon-${notification.id}`}>
                                    {getTypeIcon(notification.type, notification.message)}
                                </span>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        marginBottom: '4px',
                                        fontWeight: notification.isRead ? 400 : 600,
                                        color: 'var(--color-secondary)'
                                    }} data-testid={`notification-message-${notification.id}`}>
                                        {notification.message}
                                    </div>
                                    <div style={{
                                        fontSize: '11px',
                                        color: 'var(--color-text)',
                                        marginTop: '4px'
                                    }} data-testid={`notification-date-${notification.id}`}>
                                        {formatDate(notification.createdAt)}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default Notifications