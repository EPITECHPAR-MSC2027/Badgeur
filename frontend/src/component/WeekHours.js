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

    const hoursWorked = useMemo(() => {
        const totalSeconds = Math.floor(totalWeekMs / 1000)
        const totalHours = Math.floor(totalSeconds / 3600)
        const totalMinutes = Math.floor((totalSeconds % 3600) / 60)
        return { hours: totalHours, minutes: totalMinutes }
    }, [totalWeekMs])

    const targetHours = useMemo(() => Math.floor(targetMs / 3600000), [targetMs])

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

    const bigNumberStyle = {
        fontSize: '35px',
        fontWeight: 700,
        color: 'var(--color-secondary)',
        fontFamily: 'Spectral, serif',
        lineHeight: '1',
        margin: 0
    }

    const subTextStyle = {
        fontSize: '14px',
        color: '#6b7280',
        fontFamily: 'Fustat, sans-serif',
        marginTop: '8px',
        marginBottom: '20px'
    }

    const progressContainerStyle = {
        marginBottom: '16px'
    }

    const progressBarBgStyle = {
        height: '8px',
        background: '#e5e7eb',
        borderRadius: '999px',
        overflow: 'hidden',
        marginBottom: '12px'
    }

    const progressBarFillStyle = {
        height: '100%',
        background: '#1e3a8a',
        borderRadius: '999px',
        width: `${Math.round((loading ? 0 : progress) * 100)}%`,
        transition: 'width 300ms ease'
    }

    const progressInfoStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '14px',
        color: '#6b7280',
        fontFamily: 'Fustat, sans-serif'
    }

    const daysGridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '8px',
        marginTop: '20px'
    }

    const dayBoxStyle = (isCompleted) => ({
        height: '50px',
        background: isCompleted ? '#1e3a8a' : '#e5e7eb',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '8px',
        color: isCompleted ? 'white' : '#6b7280',
        fontSize: '12px',
        fontWeight: 600,
        fontFamily: 'Fustat, sans-serif'
    })

    const weekDays = ['L', 'M', 'M', 'J', 'V']

    return (
        <div style={cardStyle}>
            <div style={headerStyle}>
                <span>📅</span>
                <span>Cette semaine</span>
            </div>

            <div>
                <div style={bigNumberStyle}>
                    {loading ? '...' : `${hoursWorked.hours}.${Math.round(hoursWorked.minutes / 6)}`}
                    <span style={{ fontSize: '30px' }}>h</span>
                </div>
                <div style={subTextStyle}>
                    sur {targetHours}h prévues
                </div>
            </div>

            <div style={progressContainerStyle}>
                <div style={progressBarBgStyle}>
                    <div style={progressBarFillStyle} />
                </div>
                <div style={progressInfoStyle}>
                    <span>{loading ? '...' : `${Math.round(progress * 100)}% complété`}</span>
                    <span>{loading ? '...' : `${fullDays}/5 jours`}</span>
                </div>
            </div>

            <div style={daysGridStyle}>
                {weekDays.map((day, index) => (
                    <div key={index} style={dayBoxStyle(index < fullDays)}>
                        {day}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default WeekHours;