import React, { useEffect, useState } from 'react'
import '../index.css'
import '../style/theme.css'
import LastPunch from '../component/LastPunch'
import WeekHours from '../component/WeekHours'
import DayPlanning from '../component/DayPlanning'
import Notifications from '../component/Notifications'

function Home() {
  const [now, setNow] = useState(new Date())
  const [weather, setWeather] = useState(null)
  const [userData] = useState({
    firstName: localStorage.getItem('firstName'),
    lastName: localStorage.getItem('lastName'),
    roleId: parseInt(localStorage.getItem('roleId'))
  })

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    fetchWeather()
    return () => clearInterval(timer)
  }, [])

  // 🔹 Météo Paris
  const fetchWeather = async () => {
    try {
      const response = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=48.8566&longitude=2.3522&current_weather=true'
      )
      const data = await response.json()
      setWeather(data.current_weather)
    } catch (error) {
      console.error('Erreur de chargement météo :', error)
    }
  }

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

  // 🔹 Styles
  const headerContainer = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center', // ✅ centrage vertical parfait
    padding: '20px 40px',
  }

  const headerLeft = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  }

  const weatherBox = {
    color: 'var(--color-third)',
    textAlign: 'right',
    lineHeight: 1.6,
    marginTop: '4px', // ✅ petit ajustement pour aligner visuellement
  }

  const timeBoxStyle = {
    backgroundColor: 'var(--color-third)',
    borderRadius: '9px',
    padding: '12px 20px',
    display: 'inline-block',
    color: 'var(--color-background)',
    fontFamily: 'Alata, sans-serif',
    margin: '12px 20px',
    width: '94%',
    height: '110px'
  }

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 20,
    padding: '0 20px'
  }

  return (
    <div className="App">
      {/* -------- Haut de page avec météo -------- */}
      <div style={headerContainer}>
        <div style={headerLeft}>
          <h1>Tableaux de bord</h1>
          <h2>
            Bienvenue {userData.firstName} {userData.lastName}
          </h2>
          <h3>Vous êtes {userData.roleId === 1 ? 'Manager' : 'Employé'}</h3>
        </div>

        {/* 🌤️ Météo alignée parfaitement en miroir */}
        <div style={weatherBox}>
          <h3 style={{ marginBottom: 4 }}>🌤️ Météo (Paris)</h3>
          {weather ? (
            <>
              <div style={{ fontSize: '18px', fontWeight: 600 }}>
                {weather.temperature}°C
              </div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>
                Vent : {weather.windspeed} km/h
              </div>
            </>
          ) : (
            <div>Chargement...</div>
          )}
        </div>
      </div>

      {/* -------- Heure et date actuelle -------- */}
      <div className="time" style={timeBoxStyle}>
        <h1
          style={{
            fontSize: '19px',
            margin: '0',
            marginLeft: '15px',
            fontWeight: 500,
            color: 'var(--color-primary)'
          }}
        >
          Heures et date actuelle
        </h1>
        <div style={{ fontSize: '38px', fontWeight: 600 }}>{timeText}</div>
        <div style={{ fontSize: '14px' }}>{dateText}</div>
      </div>

      {/* -------- Contenu principal -------- */}
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
