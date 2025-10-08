import React from 'react'

function DayPlanning() {
    const cardStyle = {
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-secondary)',
        borderRadius: '9px',
        padding: '16px 20px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
    }

    return (
        <div style={cardStyle}>
            <h2 style={{ margin: 0, fontWeight: 500 }}>Planning du jour</h2>
            <div style={{ marginTop: 8, fontSize: 12 }}>Lundi</div>
            <div style={{ marginTop: 4, fontSize: 16, fontWeight: 600 }}>7 octobre 2025</div>
            <div style={{ marginTop: 12, fontSize: 12 }}>Heures prévues</div>
            <div style={{ marginTop: 4, fontSize: 12 }}>9h00 - 12h30</div>
            <div style={{ marginTop: 4, fontSize: 12 }}>Pause prévue</div>
            <div style={{ marginTop: 4, fontSize: 12 }}>12h30 - 13h30</div>
            <div style={{ marginTop: 4, fontSize: 12 }}>Mode de travail</div>
        </div>
    )
}

export default DayPlanning


