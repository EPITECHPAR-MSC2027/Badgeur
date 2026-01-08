import React, { useEffect, useState } from 'react'

function DayPlanning() {
    const [currentTime, setCurrentTime] = useState(new Date())

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date())
        }, 60000)
        return () => clearInterval(interval)
    }, [])

    const schedule = [
        { label: 'Début de journée', time: '08:00' },
        { label: '☕ Pause déjeuner', time: '12:00' },
        { label: 'Reprise', time: '14:00' },
        { label: 'Fin de journée', time: '17:00' }
    ]

    const getCurrentIndex = () => {
        const now =
            currentTime.getHours() * 60 + currentTime.getMinutes()

        if (now >= 17 * 60) return schedule.length - 1
        if (now < 8 * 60) return 0

        for (let i = schedule.length - 1; i >= 0; i--) {
            const [h, m] = schedule[i].time.split(':').map(Number)
            if (now >= h * 60 + m) return i
        }

        return 0
    }

    const getStatusByIndex = (index) => {
        const currentIndex = getCurrentIndex()
        if (index < currentIndex) return 'completed'
        if (index === currentIndex) return 'current'
        return 'upcoming'
    }

    /* Styles */
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

    /* Conteneur global de la timeline */
    const timelineStyle = {
        marginTop: '15px',
        position: 'relative'
    }

    /* Barre verticale */
    const verticalLineStyle = {
        position: 'absolute',
        left: '11px',
        top: '0',
        bottom: '0',
        width: '2px',
        background: '#d1d5db'
    }

    const itemStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '18px',
        marginBottom: '25px',
        position: 'relative',
        zIndex: 1
    }

    const getIconStyle = (status) => {
        const baseStyle = {
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            background: '#e5e7eb',
            border: '2px solid #d1d5db',
            zIndex: 2
        }

        if (status === 'completed') {
            return { ...baseStyle, background: '#1e3a8a', border: 'none' }
        }

        if (status === 'current') {
            return { ...baseStyle, background: '#10b981', border: 'none' }
        }

        return baseStyle
    }

    const innerDotStyle = {
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: 'white'
    }

    const getLabelStyle = (status) => ({
        flex: 1,
        fontSize: '14px',
        fontWeight: status === 'current' ? 700 : 500,
        color:
            status === 'current'
                ? 'var(--color-secondary)'
                : '#6b7280',
        fontFamily: 'Fustat, sans-serif'
    })

    const getTimeStyle = (status) => ({
        fontSize: '14px',
        fontWeight: 600,
        color: status === 'current' ? '#10b981' : '#6b7280',
        fontFamily: 'Fustat, sans-serif'
    })

    return (
        <div style={cardStyle}>
            <div style={headerStyle}>
                <span>⏰</span>
                <span>Planning du jour</span>
            </div>

            <div style={timelineStyle}>
                <div style={verticalLineStyle} />

                {schedule.map((item, index) => {
                    const status = getStatusByIndex(index)

                    return (
                        <div key={index} style={itemStyle}>
                            <div style={getIconStyle(status)}>
                                <div style={innerDotStyle} />
                            </div>

                            <div style={getLabelStyle(status)}>
                                {item.label}
                            </div>

                            <div style={getTimeStyle(status)}>
                                {item.time}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default DayPlanning;
