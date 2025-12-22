import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../index.css'
import icon from '../assets/icon.png'
import authService from '../services/authService'

function Upbar({ currentPage, onNavigate }) {
    const [isActionsOpen, setIsActionsOpen] = useState(false)
    const [hoveredButton, setHoveredButton] = useState(null)
    const navigate = useNavigate()
    const roleId = parseInt(localStorage.getItem('roleId'))
    
    // Détermine la page active en fonction de l'URL si currentPage n'est pas fourni
    const getCurrentPage = () => {
        if (currentPage) return currentPage
        const path = window.location.pathname
        switch (path) {
            case '/home':
                return 'home'
            case '/gerer-equipe':
                return 'gererEquipe'
            case '/admin':
                return 'admin'
            case '/pointage':
                return 'pointage'
            case '/planning':
                return 'planning'
            case '/calendrier':
                return 'calendrier'
            case '/profil':
                return 'profil'
            case '/analytics':
                return 'analytics'
            case '/reservation-vehicule':
                return 'reservationVehicule'
            default:
                return ''
        }
    }
    
    const activePage = getCurrentPage()
    const isActive = (page) => activePage === page
    
    const getButtonStyle = (page) => ({
        background: 'transparent',
        border: 'none',
        color: isActive(page) ? 'var(--highlight4)' : 'var(--color-secondary)',
        padding: '12px 18px',
        fontSize: '16px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontFamily: 'Alata, sans-serif',
        fontWeight: 600,
        textDecoration: isActive(page) ? 'underline' : 'none',
        transition: 'color 0.2s ease, transform 0.1s ease',
        transform: hoveredButton === page ? 'scale(1.05)' : 'scale(1)',
        ...(hoveredButton === page && !isActive(page) ? { color: 'var(--highlight4)', opacity: 0.8 } : {})
    })

    const dropdownStyle = {
        position: 'relative'
    }

    const dropdownMenuStyle = {
        position: 'absolute',
        top: '100%',
        right: 0,
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-secondary)',
        padding: 8,
        borderRadius: 6,
        display: isActionsOpen ? 'flex' : 'none',
        flexDirection: 'column',
        gap: 4,
        boxShadow: '0 6px 18px rgba(0,0,0,0.15)',
        zIndex: 10
    }

    const caretStyle = { marginLeft: 6, fontSize: 12 }

    const routeFor = (pageKey) => {
        switch (pageKey) {
            case 'home':
                return '/home'
            case 'gererEquipe':
                return '/gerer-equipe'
            case 'admin':
                return '/admin'
            case 'pointage':
                return '/pointage'
            case 'planning':
                return '/planning'
            case 'calendrier':
                return '/calendrier'
            case 'profil':
                return '/profil'
            case 'analytics':
                return '/analytics'
            case 'reservationVehicule':
                return '/reservation-vehicule'
            case 'login':
                return '/login'
            default:
                return '/'
        }
    }

    const handleNavigate = (pageKey) => {
        if (typeof onNavigate === 'function') {
            onNavigate(pageKey)
        } else {
            navigate(routeFor(pageKey))
        }
    }

    const handleLogout = () => {
        authService.logout()
        handleNavigate('login')
    }

    return (
        <div className="header" style={{display: 'flex', justifyContent:'space-between', alignItems: 'center', padding: '10px 20px', backgroundColor: 'var(--color-primary)', boxShadow: '0 4px 16px rgba(0,0,0,0.08)'}}>
            {/* Logo + Titre */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <img src={icon} alt="Logo" style={{ height: 55, width: 'auto' }} />
                <h1 style={{ color: 'var(--color-secondary)', fontWeight: '700', letterSpacing: '3px', marginLeft: 10 }}>
                    BADGEUR
                </h1>
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button 
                    onClick={() => handleNavigate('home')} 
                    onMouseEnter={() => setHoveredButton('home')}
                    onMouseLeave={() => setHoveredButton(null)}
                    style={getButtonStyle('home')}
                >
                    Accueil
                </button>

                {roleId === 1 && (
                    <button 
                        onClick={() => handleNavigate('gererEquipe')} 
                        onMouseEnter={() => setHoveredButton('gererEquipe')}
                        onMouseLeave={() => setHoveredButton(null)}
                        style={getButtonStyle('gererEquipe')}
                    >
                        Gérer équipe
                    </button>
                )}

                {roleId === 2 && (
                    <button 
                        onClick={() => handleNavigate('admin')} 
                        onMouseEnter={() => setHoveredButton('admin')}
                        onMouseLeave={() => setHoveredButton(null)}
                        style={getButtonStyle('admin')}
                    >
                        Admin
                    </button>
                )}

                {/* Dropdown Actions */}
                <div className="dropdown" style={dropdownStyle}>
                    <button
                        className="dropdown-toggle"
                        onClick={() => setIsActionsOpen(v => !v)}
                        onMouseEnter={() => setHoveredButton('actions')}
                        onMouseLeave={() => setHoveredButton(null)}
                        style={getButtonStyle('actions')}
                    >
                        Actions <span className="caret" style={caretStyle}>▼</span>
                    </button>

                    <div className={`dropdown-menu ${isActionsOpen ? 'open' : ''}`} style={dropdownMenuStyle}>
                        <button 
                            style={getButtonStyle('pointage')}
                            onMouseEnter={() => setHoveredButton('pointage')}
                            onMouseLeave={() => setHoveredButton(null)}
                            onClick={() => { handleNavigate('pointage'); setIsActionsOpen(false) }}
                        >
                            Pointage
                        </button>
                        <button 
                            style={getButtonStyle('planning')}
                            onMouseEnter={() => setHoveredButton('planning')}
                            onMouseLeave={() => setHoveredButton(null)}
                            onClick={() => { handleNavigate('planning'); setIsActionsOpen(false) }}
                        >
                            Planning
                        </button>
                        <button 
                            style={getButtonStyle('reservationVehicule')}
                            onMouseEnter={() => setHoveredButton('reservationVehicule')}
                            onMouseLeave={() => setHoveredButton(null)}
                            onClick={() => { handleNavigate('reservationVehicule'); setIsActionsOpen(false) }}
                        >
                            Réserver un véhicule
                        </button>
                    </div>
                </div>

                <button 
                    onClick={() => handleNavigate('calendrier')} 
                    onMouseEnter={() => setHoveredButton('calendrier')}
                    onMouseLeave={() => setHoveredButton(null)}
                    style={getButtonStyle('calendrier')}
                >
                    Equipe
                </button>

                <button 
                    onClick={() => handleNavigate('analytics')} 
                    onMouseEnter={() => setHoveredButton('analytics')}
                    onMouseLeave={() => setHoveredButton(null)}
                    style={getButtonStyle('analytics')}
                >
                    Analytics
                </button>

                <button 
                    onClick={() => handleNavigate('profil')} 
                    onMouseEnter={() => setHoveredButton('profil')}
                    onMouseLeave={() => setHoveredButton(null)}
                    style={getButtonStyle('profil')}
                >
                    Profil
                </button>

                <button 
                    style={getButtonStyle('deconnexion')}
                    onMouseEnter={() => setHoveredButton('deconnexion')}
                    onMouseLeave={() => setHoveredButton(null)}
                    onClick={handleLogout}
                >
                    Déconnexion
                </button>
            </div>
        </div>
    )
}

export default Upbar