import React from 'react'

function WeekHours() {
    const cardStyle = {
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-secondary)',
        borderRadius: '9px',
        padding: '16px 20px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    }

    const barBg = { height: 8, background: 'var(--color-background)', borderRadius: 999 }
    const barFill = { height: 8, background: 'var(--color-third)', borderRadius: 999, width: '90%' }

    return (
        <div style={cardStyle}>
            <h2 style={{ margin: 0, fontWeight: 500 }}>Cette semaine</h2>
            <div style={{ marginTop: 12, fontSize: 12, display: 'flex', justifyContent: 'space-between' }}>
                <span>Heures travaillées</span>
                <span>32h / 35h</span>
            </div>
            <div style={barBg}>
                <div style={barFill} />
            </div>
            <div style={{ marginTop: 12, fontSize: 12, lineHeight: '18px' }}>
                <div><p>4 jours complets</p></div>
                <div><p>1 absence non justifiée</p></div>
                <div><p>0 badgeage manqué</p></div>
            </div>
        </div>
    )
}

export default WeekHours



