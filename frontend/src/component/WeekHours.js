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
    const data = { fontSize: 15, fontWeight: 500, fontFamily: 'Fustat, sans-serif', color: 'var(--color-secondary)' }
    const label = { width: 180, color: 'var(--color-second-text)', fontSize: 15, fontWeight: 700, fontFamily: 'Fustat, sans-serif' }


    return (
        <div style={cardStyle}>
            <h2 style={{ margin: 0, fontWeight: 500 }}>Cette semaine</h2>
            <div style={{ marginTop: 12, marginBottom:7, display: 'flex', justifyContent: 'space-between' }}>
                <span style={label}>Heures travaillées</span>
                <span style={data}>32h / 35h</span>
            </div>
            <div style={barBg}>
                <div style={barFill} />
            </div>
            <div style={{ marginTop: 12, fontSize: 12, lineHeight: '18px' }}>
                <div><p style={data}>4 jours complets</p></div>
                <div><p style={data}>1 absence non justifiée</p></div>
                <div><p style={data}>0 badgeage manqué</p></div>
            </div>
        </div>
    )
}

export default WeekHours



