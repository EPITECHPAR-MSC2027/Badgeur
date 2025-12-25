import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import notificationService from '../services/notificationService';
import '../index.css';
import '../style/theme.css';

function Notifications() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const userId = parseInt(localStorage.getItem('userId'));

    useEffect(() => {
        if (!userId) {
            setError('Utilisateur non identifié');
            setLoading(false);
            return;
        }
        loadNotifications();
    }, [userId]);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await notificationService.getNotificationsByUserId(userId);
            setNotifications(data);
        } catch (err) {
            console.error('Erreur lors du chargement des notifications:', err);
            setError('Erreur lors du chargement des notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await notificationService.markAsRead(notificationId);
            setNotifications(prev => 
                prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
            );
        } catch (err) {
            console.error('Erreur lors de la mise à jour:', err);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead(userId);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error('Erreur lors de la mise à jour:', err);
        }
    };

    const handleDelete = async (notificationId) => {
        try {
            await notificationService.deleteNotification(notificationId);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
        } catch (err) {
            console.error('Erreur lors de la suppression:', err);
        }
    };

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'badgeage':
                return '🕐';
            case 'reservation':
                return '🚗';
            case 'planning_sent':
                return '📤';
            case 'planning_response':
                return '✅';
            case 'planning_request':
                return '📋';
            default:
                return '🔔';
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const containerStyle = {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px'
    };

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '2px solid var(--color-primary)'
    };

    const buttonStyle = {
        background: 'var(--color-primary)',
        color: 'var(--color-third)',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontFamily: 'Alata, sans-serif',
        fontWeight: 600,
        fontSize: '14px'
    };

    const notificationItemStyle = {
        background: 'var(--color-background)',
        border: '1px solid var(--color-primary)',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        transition: 'all 0.2s ease',
        opacity: 1
    };

    const unreadStyle = {
        ...notificationItemStyle,
        borderLeft: '4px solid var(--color-primary)',
        background: 'rgba(31, 139, 76, 0.05)'
    };

    const readStyle = {
        ...notificationItemStyle,
        opacity: 0.7
    };

    if (loading) {
        return (
            <div style={containerStyle}>
                <p>Chargement des notifications...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={containerStyle}>
                <p style={{ color: 'red' }}>{error}</p>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <h1 style={{ color: 'var(--color-secondary)', fontFamily: 'Alata, sans-serif' }}>
                    Notifications {unreadCount > 0 && `(${unreadCount} non lues)`}
                </h1>
                {unreadCount > 0 && (
                    <button style={buttonStyle} onClick={handleMarkAllAsRead}>
                        Tout marquer comme lu
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-second-text)' }}>
                    <p>Aucune notification</p>
                </div>
            ) : (
                <div>
                    {notifications.map(notification => (
                        <div
                            key={notification.id}
                            style={notification.isRead ? readStyle : unreadStyle}
                        >
                            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                <span style={{ fontSize: '24px' }}>{getTypeIcon(notification.type)}</span>
                                <div style={{ flex: 1 }}>
                                    <p style={{ 
                                        margin: '0 0 8px 0', 
                                        fontWeight: notification.isRead ? 400 : 600,
                                        color: 'var(--color-third)',
                                        fontSize: '16px'
                                    }}>
                                        {notification.message}
                                    </p>
                                    <p style={{ 
                                        margin: 0, 
                                        fontSize: '12px', 
                                        color: 'var(--color-second-text)' 
                                    }}>
                                        {formatDate(notification.createdAt)}
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {!notification.isRead && (
                                    <button
                                        style={{
                                            ...buttonStyle,
                                            background: 'transparent',
                                            color: 'var(--color-primary)',
                                            border: '1px solid var(--color-primary)',
                                            padding: '6px 12px',
                                            fontSize: '12px'
                                        }}
                                        onClick={() => handleMarkAsRead(notification.id)}
                                    >
                                        Marquer comme lu
                                    </button>
                                )}
                                <button
                                    style={{
                                        ...buttonStyle,
                                        background: 'transparent',
                                        color: 'red',
                                        border: '1px solid red',
                                        padding: '6px 12px',
                                        fontSize: '12px'
                                    }}
                                    onClick={() => handleDelete(notification.id)}
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Notifications;

