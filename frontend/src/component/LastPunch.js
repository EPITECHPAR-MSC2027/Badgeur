import React from 'react'

function LastPunch() {
    const cardStyle = {
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-secondary)',
        borderRadius: '9px',
        padding: '16px 20px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
    }

    const row = { display: 'flex', gap: 12, alignItems: 'center', fontSize: 12, marginTop: 8 }
    const label = { width: 100, color: 'var(--color-second-text)' }

    return (
        <div style={cardStyle}>
            <h2 style={{ margin: 0, fontWeight: 500 }}>Dernier pointage</h2>
            <div style={row}><span style={label}>Dernière action</span><span>Entrée - 08:47</span></div>
            <div style={row}><span style={label}>Date</span><span>Aujourd'hui</span></div>
            <div style={{ marginTop: 16, fontSize: 12, color: 'var(--color-second-text)' }}>Temps de présence aujourd'hui</div>
            <div style={{ marginTop: 6, fontSize: 18, fontWeight: 600 }}>6h 23min</div>
        </div>
    )
}

export default LastPunch


