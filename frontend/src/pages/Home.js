import React, { useEffect, useState } from 'react'
import '../index.css'
import '../style/theme.css'
import LastPunch from '../component/LastPunch'
import WeekHours from '../component/WeekHours'
import DayPlanning from '../component/DayPlanning'
import Notifications from '../component/Notifications'
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
        padding: '12px 20px',
        display: 'inline-block',
        color: 'var(--color-background)',
        fontFamily: 'Alata, sans-serif',
        margin: '12px 20px',
        width : '94%',
        height : '110px'
    }

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 20,
        padding: '0 20px'
    }

    return (
        <div className="App">
            <header className="App-header">
                <h1>Tableaux de bord</h1>
                <h2>Bienvenue sur votre espace employé</h2>
            </header>
            <div className="time" style={timeBoxStyle}>
                <h1 style={{ fontSize: '19px', margin:'0', marginLeft: '15px', fontWeight: 500, color: 'var(--color-primary)' }}>Heures et date actuelle</h1>
                <div style={{ fontSize: '38px', fontWeight: 600 }}>{timeText}</div>
                <div style={{ fontSize: '14px' }}>{dateText}</div>
            </div>
            <div style={gridStyle}>
                <LastPunch />
                <WeekHours />
                <DayPlanning />
            </div>
            <div style={{ padding: '20px' }}>
                <Notifications />
            </div>
        </div>
    )
}

export default Home


