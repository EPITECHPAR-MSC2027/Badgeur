import React, { useEffect, useState } from 'react'
import '../index.css'
import '../style/theme.css'
function Home() {
    const [now, setNow] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    const timeFormatter = new Intl.DateTimeFormat('fr-FR', {
        timeZone: 'Europe/Paris',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    })

    const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
        timeZone: 'Europe/Paris',
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    })

    const parisNow = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Paris' }))
    const timeText = timeFormatter.format(parisNow)
    const dateText = dateFormatter.format(parisNow)

    const timeBoxStyle = {
        backgroundColor: 'var(--color-third)',
        borderRadius: '9px',
        padding: '16px 20px',
        display: 'inline-block',
        color: 'var(--color-primary)',
        fontFamily: 'Alata, sans-serif',
        margin: '12px 0'
    }

    return (
        <div className="App">
            <header className="App-header">
                <h1>Tableaux de bord</h1>
                <h2>Bienvenue sur votre espace employé</h2>
            </header>
            <div className="time" style={timeBoxStyle}>
                <div style={{ fontSize: '24px', fontWeight: 600 }}>{timeText}</div>
                <div style={{ fontSize: '16px' }}>{dateText}</div>
            </div>
            <div className="summary">Summary</div>
            <div>Notification</div>
        </div>
    )
}

export default Home


