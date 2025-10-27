import React, { useState, useEffect } from 'react'
import '../style/theme.css'
import '../index.css'

function Profil() {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  })
  const [loading, setLoading] = useState(true)
  const [selectedTheme, setSelectedTheme] = useState(() => localStorage.getItem('theme') || 'main')

  const themes = [
    { value: 'main', label: 'Principal' },
    { value: 'azure', label: 'Azure' },
    { value: 'pink-matcha', label: 'Rose Matcha' },
    { value: 'coffee', label: 'Café' },
    { value: 'deep-blue', label: 'Bleu Profond' },
    { value: 'cyber', label: 'Cyber' },
    { value: 'warm', label: 'Chaleureux' },
    { value: 'desert', label: 'Désert' },
    { value: 'starlight', label: 'Lumière des Étoiles' }
  ]

  useEffect(() => {
    loadUserData()
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', selectedTheme)
    localStorage.setItem('theme', selectedTheme)
  }, [selectedTheme])

  const loadUserData = () => {
    try {
      const firstName = localStorage.getItem('firstName') || ''
      const lastName = localStorage.getItem('lastName') || ''
      const email = localStorage.getItem('email') || ''
      setUserData({ firstName, lastName, email })
    } catch (error) {
      console.error('Erreur lors du chargement des données utilisateur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleThemeChange = (event) => {
    setSelectedTheme(event.target.value)
  }

  // 🔹 Styles
  const pageContainer = {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: '30px',
    marginLeft: '40px',
    marginTop: '40px',
    flexWrap: 'wrap'
  }

  const sectionStyle = {
    flex: 1,
    minWidth: '300px',
    backgroundColor: 'var(--color-primary)',
    borderRadius: 12,
    padding: 25,
    boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
    maxWidth: 500,
    textAlign: 'center'
  }

  const infoContainer = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    marginTop: 20
  }

  const fieldBox = {
    width: '80%',
    marginBottom: 18,
    textAlign: 'left'
  }

  const labelStyle = {
    color: 'var(--color-second-text)',
    fontSize: 15,
    fontWeight: 600,
    marginBottom: 4
  }

  const valueStyle = {
    color: 'var(--color-third)',
    fontSize: 16
  }

  if (loading) {
    return (
      <div style={{ marginLeft: '40px', marginTop: '40px' }}>
        <h1>Profil</h1>
        <p>Chargement des données...</p>
      </div>
    )
  }

  return (
    <div style={pageContainer}>
      {/* -------- Section Profil -------- */}
      <div style={sectionStyle}>
        <h1 style={{ marginBottom: 20 }}>Profil</h1>
        <h2 style={{ marginBottom: 10, color: 'var(--color-second-text)' }}>
          Informations personnelles
        </h2>

        {/* Champs verticaux sans input */}
        <div style={infoContainer}>
          <div style={fieldBox}>
            <div style={labelStyle}>Prénom</div>
            <div style={valueStyle}>{userData.firstName || '—'}</div>
          </div>

          <div style={fieldBox}>
            <div style={labelStyle}>Nom</div>
            <div style={valueStyle}>{userData.lastName || '—'}</div>
          </div>

          <div style={fieldBox}>
            <div style={labelStyle}>Email</div>
            <div style={valueStyle}>{userData.email || '—'}</div>
          </div>
        </div>
      </div>

      {/* -------- Section Paramètres / Thème -------- */}
      <div style={sectionStyle}>
        <h1 style={{ marginBottom: 20 }}>Paramètres</h1>
        <h2 style={{ marginBottom: 10 }}>Thème</h2>
        <p style={{ marginBottom: 8 }}>Choisissez votre thème préféré :</p>

        <select
          value={selectedTheme}
          onChange={handleThemeChange}
          style={{
            padding: '8px 12px',
            fontSize: '16px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            backgroundColor: 'var(--color-background)',
            color: 'var(--color-secondary)',
            cursor: 'pointer'
          }}
        >
          {themes.map((theme) => (
            <option key={theme.value} value={theme.value}>
              {theme.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default Profil
