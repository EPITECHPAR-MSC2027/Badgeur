import React from 'react'

function LastPunch() {
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
            <div style={row}><span style={label}>Dernière action</span><span style={data}>Entrée - 08:47</span></div>
            <div style={row}><span style={label}>Date</span><span style={data}>Aujourd'hui</span></div>
            <div style={{ marginTop: 35, color: 'var(--color-second-text)', fontSize: 15, fontWeight: 700, fontFamily: 'Fustat, sans-serif' }}>Temps de présence aujourd'hui</div>
            <div style={{ marginTop: 6, fontSize: 22, fontWeight: 800, fontFamily: 'Spectral, sans-serif' }}>6h 23min</div>
        </div>
    )
}

export default LastPunch



