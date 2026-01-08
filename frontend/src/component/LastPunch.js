import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import statsService from '../services/statsService'

function LastPunch() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [lastAction, setLastAction] = useState(null)
    const [lastTime, setLastTime] = useState(null)
    const [todayDurationMs, setTodayDurationMs] = useState(0)

    useEffect(() => {
        const userId = localStorage.getItem('userId')
        if (!userId) {
            setLoading(false)
            return
        }
        ;(async () => {
            try {
                const today = await statsService.computeTodayStats(userId)
                setLastAction(today.lastAction)
                const lastPunch = today.punches.length > 0 ? today.punches[today.punches.length - 1] : null
                setLastTime(lastPunch ? new Date(lastPunch.badgedAt) : null)
                setTodayDurationMs(today.durationMs)
            } catch (e) {
                console.error('Erreur chargement stats du jour:', e)
            } finally {
                setLoading(false)
            }
        })()
    }, [])

    const cardStyle = {
        background: 'var(--color-primary)',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb'
    }

    const headerStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '20px',
        color: '#6b7280',
        fontSize: '14px',
        fontWeight: 500,
        fontFamily: 'Fustat, sans-serif'
    }

    const timeContainerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '20px',
        borderBottom: '1px solid #e5e7eb',
        marginBottom: '20px'
    }

    const timeStyle = {
        fontSize: '35px',
        fontWeight: 700,
        color: 'var(--color-secondary)',
        fontFamily: 'Spectral, serif',
        lineHeight: '1',
        margin: 0
    }

    const actionLabelStyle = {
        fontSize: '14px',
        color: 'var(--color-text)',
        fontFamily: 'Fustat, sans-serif',
        marginTop: '8px'
    }

    const statusBadgeStyle = {
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        background: lastAction === 'Entrée' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }

    const statusDotStyle = {
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        background: lastAction === 'Entrée' ? '#10b981' : '#ef4444'
    }

    const presenceRowStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
    }

    const presenceLabelStyle = {
        fontSize: '14px',
        color: '#6b7280',
        fontFamily: 'Fustat, sans-serif'
    }

    const durationStyle = {
        fontSize: '24px',
        fontWeight: 700,
        color: 'var(--color-secondary)',
        fontFamily: 'Spectral, serif'
    }

    const buttonStyle = {
        width: '100%',
        background: '#1e3a8a',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '14px 20px',
        fontSize: '16px',
        fontWeight: 600,
        fontFamily: 'Alata, sans-serif',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
    }

    return (
        <div style={cardStyle}>
            <div style={headerStyle}>
                <span>⏱️</span>
                <span>Dernier pointage</span>
            </div>

            <div style={timeContainerStyle}>
                <div>
                    <div style={timeStyle}>
                        {loading ? '...' : (lastTime ? lastTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--:--')}
                    </div>
                    <div style={actionLabelStyle}>
                        {loading ? '...' : (lastAction || 'Aucune action')}
                    </div>
                </div>
                {!loading && lastAction && (
                    <div style={statusBadgeStyle}>
                        <div style={statusDotStyle}></div>
                    </div>
                )}
            </div>

            <div style={presenceRowStyle}>
                <span style={presenceLabelStyle}>Présence aujourd'hui</span>
                <span style={durationStyle}>
                    {loading ? '...' : statsService.formatDuration(todayDurationMs)}
                </span>
            </div>

            <button style={buttonStyle} onClick={() => navigate('/pointage')}>
                <span>⏰</span>
                Pointer maintenant
            </button>
        </div>
    )
}

export default LastPunch;