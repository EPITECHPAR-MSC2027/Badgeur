import React, { useEffect, useState } from 'react'
import '../index.css'
import '../style/theme.css'
import LastPunch from '../component/LastPunch'
import WeekHours from '../component/WeekHours'
import DayPlanning from '../component/DayPlanning'
import Notifications from '../component/Notifications'

function Home() {
    const [now, setNow] = useState(new Date())
    const [userData] = useState({
        firstName: localStorage.getItem('firstName'),
        lastName: localStorage.getItem('lastName'),
        roleId: parseInt(localStorage.getItem('roleId'))
    })

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
        backgroundColor: 'var(--color-primary)',
        borderRadius: '9px',
        padding: '12px 20px',
        color: 'var(--color-background)',
        fontFamily: 'Alata, sans-serif',
        height: '110px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
    }

    const containerStyle = {
        padding: '0 20px',
        marginBottom: '20px'
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
                <h2>Bienvenue {userData.firstName} {userData.lastName}</h2>
            </header>
            <div style={containerStyle}>
                <div className="time" style={timeBoxStyle}>
                    <h1 style={{ fontSize: '19px', margin:'0', marginLeft: '15px', fontWeight: 500, color: 'var(--color-secondary)' }}>Heures et date actuelle</h1>
                    <div style={{ fontSize: '38px', fontWeight: 600, color: 'var(--color-secondary)' }}>{timeText}</div>
                    <div style={{ fontSize: '14px', color: 'var(--color-secondary)' }}>{dateText}</div>
                </div>
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