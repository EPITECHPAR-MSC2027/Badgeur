import React from 'react'

function DayPlanning() {
    const cardStyle = {
        background: 'linear-gradient(to right, color-mix(in srgb, var(--highlight4) 70%, white), var(--highlight4))',
        color: 'var(--color-secondary)',
        borderRadius: '9px',
        padding: '16px 20px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
    }
    const label = { width: 180, color: 'color-mix(in srgb, var(--highlight4) 70%, black)', fontSize: 15, fontWeight: 700, fontFamily: 'Fustat, sans-serif', marginTop: 8 }
    const data = { fontSize: 15, fontWeight: 500, fontFamily: 'Fustat, sans-serif', color: 'var(--color-primary)' }

    return (
        <div style={cardStyle}>
            <h2 style={{ margin: 0, fontWeight: 500, color: 'var(--color-primary)' }}>Planning du jour</h2>
            <div style={label}>Arrivée</div>
            <div style={data}>9h00 - 12h30</div>
            <div style={label}>Pause prévue</div>
            <div style={data}>12h30 - 13h30</div>
            <div style={label}>Départ</div>
            <div style={data}>13h30 - 18h00</div>
        </div>
    )
}

export default DayPlanning



