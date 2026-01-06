import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import announcementService from '../services/announcementService'

function Announcements() {
    const [announcements, setAnnouncements] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        loadAnnouncements()
    }, [])

    const loadAnnouncements = async () => {
        try {
            setLoading(true)
            const data = await announcementService.getAllAnnouncements()
            // Prendre les 3 plus récentes annonces (déjà triées par date décroissante depuis le backend)
            setAnnouncements(data.slice(0, 3))
        } catch (err) {
            console.error('Erreur lors du chargement des annonces:', err)
        } finally {
            setLoading(false)
        }
    }

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

    const cardStyle = {
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-secondary)',
        borderRadius: '9px',
        padding: '16px 20px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
    }

    const titleStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontFamily: 'Alata, sans-serif',
        marginBottom: '16px'
    }

    const announcementItemStyle = {
        marginTop: 12,
        fontFamily: 'Fustat, sans-serif',
        padding: '12px',
        backgroundColor: 'var(--color-background)',
        borderRadius: '6px',
        borderLeft: '3px solid var(--color-secondary)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
    }

    const titleTextStyle = {
        fontWeight: 600,
        color: 'var(--color-secondary)',
        fontSize: '14px',
        margin: 0
    }

    const dateStyle = {
        fontSize: '11px',
        color: 'var(--color-text)',
        margin: 0
    }

    const buttonStyle = {
        background: 'var(--color-background)',
        color: 'var(--color-secondary)',
        border: '1px solid var(--color-secondary)',
        padding: '6px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontFamily: 'Alata, sans-serif',
        fontWeight: 500,
        fontSize: '12px',
        transition: 'all 0.2s ease'
    }

    if (loading) {
        return (
            <div style={cardStyle}>
                <div style={titleStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>📢</span>
                        <h2 style={{ margin: 0, fontWeight: 500, color: 'var(--color-secondary)' }}>Annonces</h2>
                    </div>
                </div>
                <div style={{ fontFamily: 'Fustat, sans-serif', color: 'var(--color-text)' }}>
                    Chargement...
                </div>
            </div>
        )
    }

    return (
        <div style={cardStyle}>
            <div style={titleStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>📢</span>
                    <h2 style={{ margin: 0, fontWeight: 500, color: 'var(--color-secondary)' }}>Annonces</h2>
                </div>
                {announcements.length > 0 && (
                    <button
                        style={buttonStyle}
                        onClick={() => navigate('/announcements')}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--color-secondary)'
                            e.currentTarget.style.color = 'var(--color-background)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'var(--color-background)'
                            e.currentTarget.style.color = 'var(--color-secondary)'
                        }}
                    >
                        Voir tout
                    </button>
                )}
            </div>
            {announcements.length === 0 ? (
                <div style={{ fontFamily: 'Fustat, sans-serif', color: 'var(--color-text)', marginTop: 12 }}>
                    Aucune annonce
                </div>
            ) : (
                announcements.map(announcement => (
                    <div key={announcement.id} style={announcementItemStyle}>
                        <p style={titleTextStyle}>{announcement.title}</p>
                        <p style={dateStyle}>{formatDate(announcement.createdAt)}</p>
                    </div>
                ))
            )}
        </div>
    )
}

export default Announcements
