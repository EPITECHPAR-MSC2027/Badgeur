import React, { useEffect, useMemo, useState } from 'react'
import statsService from '../services/statsService'

function WeekHours() {
    const [loading, setLoading] = useState(true)
    const [totalWeekMs, setTotalWeekMs] = useState(0)
    const [targetMs, setTargetMs] = useState(35 * 60 * 60 * 1000)
    const [progress, setProgress] = useState(0)
    const [fullDays, setFullDays] = useState(0)
    const [absences, setAbsences] = useState(0)

    useEffect(() => {
        const userId = localStorage.getItem('userId')
        if (!userId) {
            setLoading(false)
            return
        }
        ;(async () => {
            try {
                const week = await statsService.computeWeekStats(userId)
                setTotalWeekMs(week.totalWeekMs)
                setTargetMs(week.targetMs)
                setProgress(week.progress)
                setFullDays(week.fullDays)
                setAbsences(week.absences)
            } catch (e) {
                console.error('Erreur chargement stats semaine:', e)
            } finally {
                setLoading(false)
            }
        })()
    }, [])

    const hoursWorkedText = useMemo(() => {
        const totalSeconds = Math.floor(totalWeekMs / 1000)
        const totalHours = Math.floor(totalSeconds / 3600)
        const totalMinutes = Math.floor((totalSeconds % 3600) / 60)
        const targetHours = Math.floor(targetMs / 3600000)
        return `${totalHours}h${totalMinutes > 0 ? ` ${totalMinutes}min` : ''} / ${targetHours}h`
    }, [totalWeekMs, targetMs])
    const cardStyle = {
        background: 'linear-gradient(to right, color-mix(in srgb, var(--highlight2) 70%, white), var(--highlight2))',
        color: 'var(--color-primary)',
        borderRadius: '9px',
        padding: '16px 20px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    }

    const barBg = { height: 8, background: 'var(--color-background)', borderRadius: 999 }
    const barFill = { height: 8, background: 'var(--color-secondary)', borderRadius: 999, width: `${Math.round((loading ? 0 : progress) * 100)}%`, transition: 'width 300ms ease' }
    const data = { fontSize: 15, fontWeight: 500, fontFamily: 'Fustat, sans-serif', color: 'var(--color-primary)' }
    const label = { width: 180, color: 'color-mix(in srgb, var(--highlight2) 70%, black)', fontSize: 15, fontWeight: 700, fontFamily: 'Fustat, sans-serif' }


    return (
        <div style={cardStyle}>
            <h2 style={{ margin: 0, fontWeight: 500, color: 'var(--color-primary)' }}>Cette semaine</h2>
            <div style={{ marginTop: 12, marginBottom:7, display: 'flex', justifyContent: 'space-between' }}>
                <span style={label}>Heures travaillées</span>
                <span style={data}>{loading ? '…' : hoursWorkedText}</span>
            </div>
            <div style={barBg}>
                <div style={barFill} />
            </div>
            <div style={{ marginTop: 12, fontSize: 12, lineHeight: '18px' }}>
                <div><p style={data}>{loading ? '…' : `${fullDays} jours complets`}</p></div>
                <div><p style={data}>{loading ? '…' : `${absences} absence${absences > 1 ? 's' : ''}`}</p></div>
                <div><p style={data}>0 badgeage manqué</p></div>
            </div>
        </div>
    )
}

export default WeekHours



