import React from 'react'

function Notifications() {
    const cardStyle = {
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-secondary)',
        borderRadius: '9px',
        padding: '16px 20px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
    }

    const titleStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontFamily: 'Alata, sans-serif'
    }

    const itemStyle = { marginTop: 12, fontFamily: 'Fustat, sans-serif' }

    return (
        <div style={cardStyle}>
            <div style={titleStyle}>
                <span style={{ fontSize: 18 }}>🔔</span>
                <h2 style={{ margin: 0, fontWeight: 500 }}>Notifications</h2>
            </div>
            <div style={itemStyle}>Votre demande de congé a été approuvée.</div>
            <div style={itemStyle}>N'oubliez pas de pointer avant 9h00.</div>
        </div>
    )
}

export default Notifications



