import React, { useState, useEffect } from 'react';
import announcementService from '../services/announcementService';
import '../index.css';
import '../style/theme.css';

function Announcements() {
    const [announcements, setAnnouncements] = useState([]);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadAnnouncements();
    }, []);

    const loadAnnouncements = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await announcementService.getAllAnnouncements();
            setAnnouncements(data);
        } catch (err) {
            console.error('Error loading announcements:', err);
            setError('Erreur lors du chargement des annonces');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    const containerStyle = {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px'
    };

    const headerStyle = {
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '2px solid var(--color-primary)'
    };

    const listStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    };

    const announcementCardStyle = {
        background: 'var(--color-background)',
        border: '2px solid var(--color-primary)',
        borderRadius: '12px',
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    };

    const announcementCardHoverStyle = {
        ...announcementCardStyle,
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    };

    const detailPanelStyle = {
        background: 'var(--color-background)',
        border: '2px solid var(--color-primary)',
        borderRadius: '12px',
        padding: '24px',
        marginTop: '24px'
    };

    const titleStyle = {
        fontSize: '18px',
        fontWeight: 600,
        color: 'var(--color-secondary)',
        marginBottom: '8px',
        fontFamily: 'Alata, sans-serif'
    };

    const metaStyle = {
        fontSize: '14px',
        color: 'var(--color-second-text)',
        marginTop: '8px'
    };

    const messageStyle = {
        marginTop: '16px',
        padding: '16px',
        background: 'rgba(31, 139, 76, 0.05)',
        borderRadius: '8px',
        border: '1px solid var(--color-primary)',
        whiteSpace: 'pre-wrap',
        lineHeight: '1.6',
        color: 'var(--color-third)',
        fontFamily: 'inherit'
    };

    if (loading) {
        return (
            <div style={containerStyle}>
                <p>Chargement des annonces...</p>
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
                    Annonces
                </h1>
                <p style={{ color: 'var(--color-second-text)', marginTop: '8px' }}>
                    Consultez toutes les annonces de l'entreprise
                </p>
            </div>

            {announcements.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-second-text)' }}>
                    <p>Aucune annonce disponible</p>
                </div>
            ) : (
                <>
                    <div style={listStyle}>
                        {announcements.map(announcement => (
                            <div
                                key={announcement.id}
                                onClick={() => setSelectedAnnouncement(announcement)}
                                style={selectedAnnouncement?.id === announcement.id ? announcementCardHoverStyle : announcementCardStyle}
                                onMouseEnter={(e) => {
                                    if (selectedAnnouncement?.id !== announcement.id) {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (selectedAnnouncement?.id !== announcement.id) {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }
                                }}
                            >
                                <h3 style={titleStyle}>{announcement.title}</h3>
                                <p style={metaStyle}>
                                    Par {announcement.authorFirstName} {announcement.authorLastName} • {formatDate(announcement.createdAt)}
                                </p>
                            </div>
                        ))}
                    </div>

                    {selectedAnnouncement && (
                        <div style={detailPanelStyle}>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'flex-start',
                                marginBottom: '16px',
                                paddingBottom: '16px',
                                borderBottom: '2px solid var(--color-primary)'
                            }}>
                                <div>
                                    <h2 style={{ 
                                        margin: '0 0 8px 0', 
                                        color: 'var(--color-secondary)',
                                        fontFamily: 'Alata, sans-serif'
                                    }}>
                                        {selectedAnnouncement.title}
                                    </h2>
                                    <p style={metaStyle}>
                                        Par {selectedAnnouncement.authorFirstName} {selectedAnnouncement.authorLastName} • {formatDate(selectedAnnouncement.createdAt)}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedAnnouncement(null)}
                                    style={{
                                        background: 'var(--color-primary)',
                                        color: 'var(--color-third)',
                                        border: 'none',
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontFamily: 'Alata, sans-serif',
                                        fontWeight: 600
                                    }}
                                >
                                    Fermer
                                </button>
                            </div>
                            <div style={messageStyle}>
                                {selectedAnnouncement.message}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default Announcements;

