import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../style/theme.css'
import '../index.css'

function Profil() {
    const [userData, setUserData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        roleId: null
    })
    const [loading, setLoading] = useState(true)
    const [selectedTheme, setSelectedTheme] = useState(() => localStorage.getItem('theme') || 'main')
    const [dyslexicMode, setDyslexicMode] = useState(() => localStorage.getItem('dyslexicMode') === 'true')
    const [mfaEnabled, setMfaEnabled] = useState(false) // TODO: Check actual MFA status from backend

    const navigate = useNavigate()

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

    useEffect(() => {
        if (dyslexicMode) {
            document.body.classList.add('dyslexic-mode')
        } else {
            document.body.classList.remove('dyslexic-mode')
        }
        localStorage.setItem('dyslexicMode', dyslexicMode.toString())
    }, [dyslexicMode])

    const loadUserData = async () => {
        try {
            // Récupérer les données depuis localStorage (déjà stockées lors de la connexion)
            const firstName = localStorage.getItem('firstName') || ''
            const lastName = localStorage.getItem('lastName') || ''
            const email = localStorage.getItem('email') || ''
            const roleId = localStorage.getItem('roleId') || null

            setUserData({ firstName, lastName, email, roleId: parseInt(roleId) })

            // TODO: Check MFA status from backend
            // const accessToken = localStorage.getItem('accessToken')
            // const response = await fetch(`${API_URL}/login/mfa-status`, {
            //     headers: { 'Authorization': `Bearer ${accessToken}` }
            // })
            // if (response.ok) {
            //     const data = await response.json()
            //     setMfaEnabled(data.mfaEnabled)
            // }
        } catch (error) {
            console.error('Erreur lors du chargement des données utilisateur:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleMfaSetup = () => {
        navigate('/login/mfa-setup')
    }

    const cardStyle = {
        backgroundColor: 'var(--color-primary)',
        borderRadius: 12,
        padding: 20,
        boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
        marginTop: 16
    }

    const labelStyle = {
        color: 'var(--color-second-text)',
        fontSize: 14,
        marginBottom: 8,
        fontWeight: 600
    }

    const valueStyle = {
        color: 'var(--color-third)',
        fontSize: 16,
        marginBottom: 16,
        padding: '8px 12px',
        backgroundColor: 'var(--color-background)',
        borderRadius: 6,
        border: '1px solid #e0e0e0'
    }

    const buttonStyle = {
        padding: '10px 20px',
        fontSize: '16px',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 600,
        transition: 'all 0.3s ease',
        backgroundColor: 'var(--color-secondary)',
        color: 'var(--color-primary)',
        width: '100%',
        marginTop: 10
    }

    const handleThemeChange = (event) => {
        setSelectedTheme(event.target.value)
    }

    const handleDyslexicModeToggle = (event) => {
        setDyslexicMode(event.target.checked)
    }

    if (loading) {
        return (
            <div>
                <h1>Profil</h1>
                <div style={cardStyle}>
                    <p>Chargement des données...</p>
                </div>
            </div>
        )
    }

    return (
        <div>
            <h1 style={{ marginTop: '1.5em' }}>Profil</h1>

            {/* Container flex pour afficher les sections côte à côte */}
            <div style={{
                display: 'flex',
                gap: 24,
                marginTop: 16,
                flexWrap: 'wrap'
            }}>
                {/* Section Informations personnelles */}
                <div style={{ ...cardStyle, flex: '1', minWidth: 300 }}>
                    <h2 style={{ marginTop: 0, marginBottom: 20 }}>Informations personnelles</h2>

                    <div>
                        <div style={labelStyle}>Prénom</div>
                        <div style={valueStyle}>{userData.firstName}</div>
                    </div>

                    <div>
                        <div style={labelStyle}>Nom</div>
                        <div style={valueStyle}>{userData.lastName}</div>
                    </div>

                    <div>
                        <div style={labelStyle}>Email</div>
                        <div style={valueStyle}>{userData.email}</div>
                    </div>

                    <div>
                        <div style={labelStyle}>Rôle</div>
                        <div style={valueStyle}>
                            {userData.roleId === 1 ? 'Manager' : 'Employé'}
                        </div>
                    </div>
                </div>

                {/* Section Paramètres */}
                <div style={{ ...cardStyle, flex: '1', minWidth: 300 }}>
                    <h2 style={{ marginTop: 0, marginBottom: 20 }}>Paramètres</h2>

                    <div style={{ marginBottom: 30 }}>
                        <h3 style={{ marginTop: 0, marginBottom: 10, color: 'var(--color-third)' }}>Thème</h3>
                        <p style={{ marginBottom: 12, color: 'var(--color-second-text)', fontSize: 14 }}>
                            Choisissez votre thème préféré :
                        </p>
                        <select
                            value={selectedTheme}
                            onChange={handleThemeChange}
                            style={{
                                padding: '8px 12px',
                                fontSize: '16px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                backgroundColor: 'var(--color-background)',
                                color: 'var(--color-secondary)',
                                width: '100%',
                                maxWidth: 300
                            }}
                        >
                            {themes.map(theme => (
                                <option key={theme.value} value={theme.value}>
                                    {theme.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: 30 }}>
                        <h3 style={{ marginTop: 0, marginBottom: 10, color: 'var(--color-third)' }}>Accessibilité</h3>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px',
                            backgroundColor: 'var(--color-background)',
                            borderRadius: '8px',
                            border: '1px solid var(--color-third)',
                            marginBottom: 10
                        }}>
                            <input
                                type="checkbox"
                                id="dyslexicMode"
                                checked={dyslexicMode}
                                onChange={handleDyslexicModeToggle}
                                style={{
                                    width: '20px',
                                    height: '20px',
                                    cursor: 'pointer',
                                    accentColor: 'var(--color-secondary)'
                                }}
                            />
                            <label
                                htmlFor="dyslexicMode"
                                style={{
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    color: 'var(--color-secondary)',
                                    margin: 0
                                }}
                            >
                                Mode dyslexique (police adaptée)
                            </label>
                        </div>
                        <p style={{ marginTop: 0, fontSize: '14px', color: 'var(--color-second-text)' }}>
                            Active une police spécialement conçue pour faciliter la lecture aux personnes dyslexiques
                        </p>
                    </div>

                    {/* Section Sécurité / MFA */}
                    <div>
                        <h3 style={{ marginTop: 0, marginBottom: 10, color: 'var(--color-third)' }}>Sécurité</h3>
                        <div style={{
                            padding: '15px',
                            backgroundColor: 'var(--color-background)',
                            borderRadius: '8px',
                            border: '1px solid var(--color-third)',
                            marginBottom: 10
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: 10
                            }}>
                                <div>
                                    <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-secondary)' }}>
                                        🔐 Authentification à deux facteurs
                                    </div>
                                    <div style={{ fontSize: '14px', color: 'var(--color-second-text)', marginTop: 5 }}>
                                        {mfaEnabled ? 'Activée' : 'Désactivée'}
                                    </div>
                                </div>
                                <div style={{
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    backgroundColor: mfaEnabled ? '#d4edda' : '#f8d7da',
                                    color: mfaEnabled ? '#155724' : '#721c24',
                                    fontSize: '12px',
                                    fontWeight: 600
                                }}>
                                    {mfaEnabled ? '✓ Active' : '○ Inactive'}
                                </div>
                            </div>
                            <p style={{ margin: '10px 0', fontSize: '14px', color: 'var(--color-second-text)' }}>
                                Ajoutez une couche de sécurité supplémentaire à votre compte avec un code de vérification temporaire.
                            </p>
                            <button
                                onClick={handleMfaSetup}
                                style={buttonStyle}
                                onMouseOver={(e) => e.target.style.opacity = '0.9'}
                                onMouseOut={(e) => e.target.style.opacity = '1'}
                            >
                                {mfaEnabled ? 'Gérer MFA' : 'Configurer MFA'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profil