import React, { useEffect, useState, useCallback } from 'react'
import '../index.css'
import '../style/theme.css'
import LastPunch from '../component/LastPunch'
import WeekHours from '../component/WeekHours'
import DayPlanning from '../component/DayPlanning'
import Notifications from '../component/Notifications'
import Announcements from '../component/Announcements'
import authService from '../services/authService'
import bankhead from '../assets/bankhead.png'
import icon from '../assets/primebank.png';


function Home() {
    const [now, setNow] = useState(new Date())
    const [userData] = useState(() => {
        const teamIdStr = localStorage.getItem('teamId');
        const teamId = teamIdStr && teamIdStr !== '' ? parseInt(teamIdStr, 10) : null;
        return {
            firstName: localStorage.getItem('firstName'),
            lastName: localStorage.getItem('lastName'),
            roleId: parseInt(localStorage.getItem('roleId') || '0', 10),
            teamId: isNaN(teamId) ? null : teamId
        };
    })
    const [managerName, setManagerName] = useState(null)
    const [loadingManager, setLoadingManager] = useState(true)

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    const loadManager = useCallback(async () => {
        // Debug : afficher les données utilisateur
        console.log('userData:', userData)
        console.log('teamId:', userData.teamId)
        
        // Charger le manager pour tous les utilisateurs qui ont une équipe
        if (userData.teamId && !isNaN(userData.teamId)) {
            try {
                setLoadingManager(true)
                
                // Récupérer les équipes et les utilisateurs en parallèle
                const [teamsResponse, usersResponse] = await Promise.all([
                    authService.get('/teams'),
                    authService.get('/users')
                ])
                
                console.log('teamsResponse.ok:', teamsResponse.ok)
                console.log('usersResponse.ok:', usersResponse.ok)
                
                if (teamsResponse.ok && usersResponse.ok) {
                    const teams = await teamsResponse.json()
                    const users = await usersResponse.json()
                    
                    console.log('teams:', teams)
                    console.log('users:', users)
                    
                    // Trouver l'équipe de l'utilisateur
                    const userTeam = Array.isArray(teams) 
                        ? teams.find(t => t.id === userData.teamId)
                        : null
                    
                    console.log('userTeam:', userTeam)
                    
                    if (userTeam && userTeam.managerId) {
                        // Trouver le manager dans la liste des utilisateurs
                        const manager = Array.isArray(users)
                            ? users.find(u => u.id === userTeam.managerId)
                            : null
                        
                        console.log('manager:', manager)
                        
                        if (manager) {
                            setManagerName(`${manager.firstName} ${manager.lastName}`)
                        } else {
                            console.log('Manager non trouvé pour managerId:', userTeam.managerId)
                        }
                    } else {
                        console.log('userTeam non trouvée ou pas de managerId')
                    }
                } else {
                    console.error('Erreur dans les réponses API')
                }
            } catch (error) {
                console.error('Erreur lors du chargement du manager:', error)
            } finally {
                setLoadingManager(false)
            }
        } else {
            console.log('Pas de teamId valide:', userData.teamId)
            setLoadingManager(false)
        }
    }, [userData])

    useEffect(() => {
        loadManager()
    }, [loadManager])

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

    const AppHeader = {
        backgroundImage: `url(${bankhead})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        padding: '60px 40px 0px 40px',
        borderRadius: '12px',
        margin: '20px',
        position: 'relative',
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
    }

    const headerContentStyle = {
        position: 'relative',
        color: 'white',
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
        marginBottom: '20px'
    }

    const h1Style = {
        margin: '0 0 12px 0',
        fontSize: '42px',
        fontWeight: '700',
        fontFamily: 'Alata, sans-serif',
        color:'var(--color-primary)'
    }

    const h2Style = {
        margin: '0',
        fontSize: '24px',
        fontWeight: '500',
        fontFamily: 'Alata, sans-serif',
        opacity: 0.95,
        color:'var(--color-primary)'
    }

    const managerBoxStyle = {
        backgroundColor: 'var(--color-second-text)',
        padding: '20px 24px',
        alignItems: 'center',
        gap: '16px',
        boxShadow: '0 4px 8px rgba(26, 26, 26, 0.2)',
        borderRadius: '0 0 12px 12px',
        margin: '0 -40px',
        marginTop:'20px'
    }

    const managerTextStyle = {
        margin: '0',
        fontSize: '18px',
        fontWeight: '600',
        fontFamily: 'Alata, sans-serif',
        color: 'var(--color-secondary)'
    }

    const iconStyle = {
        height: '40px',
        width: 'auto'
    }

    return (
        <div className="App">
            <header className="App-header" style={AppHeader}>
                <div style={headerContentStyle}>
                    <h1 data-testid="page-title" style={h1Style}>Tableaux de bord</h1>
                    <h2 data-testid="welcome-message" style={h2Style}>Bienvenue {userData.firstName} {userData.lastName}</h2>
                </div>
                
                {!loadingManager && userData.teamId && (
                    <div style={managerBoxStyle}>
                        <img src={icon} alt="Icon" style={iconStyle} />
                        <p style={managerTextStyle}>
                            {managerName ? `Mon manager : ${managerName}` : 'Aucun manager assigné'}
                        </p>
                    </div>
                )}
            </header>
            <div style={containerStyle} data-testid="time-container">
                <div className="time" style={timeBoxStyle} data-testid="time-box">
                    <h1
                        style={{ fontSize: '19px', margin: '0', marginLeft: '15px', fontWeight: 500, color: 'var(--color-secondary)' }}
                        data-testid="time-box-title"
                    >
                        Heures et date actuelle
                    </h1>
                    <div
                        style={{ fontSize: '38px', fontWeight: 600, color: 'var(--color-secondary)' }}
                        data-testid="current-time"
                    >
                        {timeText}
                    </div>
                    <div
                        style={{ fontSize: '14px', color: 'var(--color-secondary)' }}
                        data-testid="current-date"
                    >
                        {dateText}
                    </div>
                </div>
            </div>
            <div style={gridStyle} data-testid="dashboard-grid">
                <LastPunch />
                <WeekHours />
                <DayPlanning />
            </div>
            <div
                style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}
                data-testid="announcements-notifications-grid"
            >
                <Announcements />
                <Notifications />
            </div>
        </div>
    )
}

export default Home;