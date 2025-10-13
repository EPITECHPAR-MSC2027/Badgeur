import React, { useEffect, useState } from 'react'
import statsService from '../services/statsService'

function LastPunch() {
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
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-secondary)',
        borderRadius: '9px',
        padding: '16px 20px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
    }

    const row = { display: 'flex', gap: 110, alignItems: 'center', fontSize: 12, marginTop: 8 }
    const label = { width: 180, color: 'var(--color-second-text)', fontSize: 15, fontWeight: 700, fontFamily: 'Fustat, sans-serif' }
    const data = { fontSize: 15, fontWeight: 500, fontFamily: 'Fustat, sans-serif', color: 'var(--color-secondary)' }

    return (
        <div style={cardStyle}>
            <h2 style={{ margin: 0, fontWeight: 500,fontSize: 22 }}>Dernier pointage</h2>
            <div style={row}><span style={label}>Dernière action</span><span style={data}>{loading ? '…' : (lastAction ? `${lastAction}${lastTime ? ` - ${lastTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` : ''}` : 'Aucune')}</span></div>
            <div style={row}><span style={label}>Date</span><span style={data}>Aujourd'hui</span></div>
            <div style={{ marginTop: 35, color: 'var(--color-second-text)', fontSize: 15, fontWeight: 700, fontFamily: 'Fustat, sans-serif' }}>Temps de présence aujourd'hui</div>
            <div style={{ marginTop: 6, fontSize: 22, fontWeight: 800, fontFamily: 'Spectral, sans-serif' }}>
                {loading ? '…' : statsService.formatDuration(todayDurationMs)}
            </div>
        </div>
    )
}

export default LastPunch



