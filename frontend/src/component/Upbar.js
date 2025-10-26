import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../index.css'
import icon from '../assets/icon.png'
import authService from '../services/authService'

function Upbar({ currentPage, onNavigate }) {
    const [isActionsOpen, setIsActionsOpen] = useState(false)
    const navigate = useNavigate()
    const roleId = parseInt(localStorage.getItem('roleId'))
    const isActive = (page) => currentPage === page ? { textDecoration: 'underline' } : {}

    const buttonStyle = {
        background: 'transparent',
        border: 'none',
        color: 'var(--color-third)',
        padding: '12px 18px',
        fontSize: '16px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontFamily: 'Alata, sans-serif',
        fontWeight: 600
    }

    const dropdownStyle = {
        position: 'relative'
    }

    const dropdownMenuStyle = {
        position: 'absolute',
        top: '100%',
        right: 0,
        background: 'var(--color-primary)',
        color: 'var(--color-third)',
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
            case 'parameter':
                return '/parametre'
            case 'analytics':
                return '/analytics'
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
        <div className="header" style={{display: 'flex', justifyContent:'space-between', alignItems: 'center', padding: '10px 20px'}}>
            {/* Logo + Titre */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <img src={icon} alt="Logo" style={{ height: 55, width: 'auto' }} />
                <h1 style={{ color: 'var(--color-secondary)', fontWeight: '700', letterSpacing: '3px', marginLeft: 10 }}>
                    BADGEUR
                </h1>
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button onClick={() => handleNavigate('home')} style={{ ...buttonStyle, ...isActive('home') }}>
                    Homepage
                </button>

                {roleId === 1 && (
                    <button onClick={() => handleNavigate('gererEquipe')} style={{ ...buttonStyle, ...isActive('gererEquipe') }}>
                        Gérer équipe
                    </button>
                )}

                {roleId === 2 && (
                    <button onClick={() => handleNavigate('admin')} style={{ ...buttonStyle, ...isActive('admin') }}>
                        Admin
                    </button>
                )}

                {/* Dropdown Actions */}
                <div className="dropdown" style={dropdownStyle}>
                    <button
                        className="dropdown-toggle"
                        onClick={() => setIsActionsOpen(v => !v)}
                        style={{ ...buttonStyle, ...isActive('actions') }}
                    >
                        Actions <span className="caret" style={caretStyle}>▼</span>
                    </button>

                    <div className={`dropdown-menu ${isActionsOpen ? 'open' : ''}`} style={dropdownMenuStyle}>
                        <button style={buttonStyle} onClick={() => { handleNavigate('pointage'); setIsActionsOpen(false) }}>
                            Pointage
                        </button>
                        <button style={buttonStyle} onClick={() => { handleNavigate('planning'); setIsActionsOpen(false) }}>
                            Planning
                        </button>
                    </div>
                </div>

                <button onClick={() => handleNavigate('calendrier')} style={{ ...buttonStyle, ...isActive('calendrier') }}>
                    Equipe
                </button>

                <button onClick={() => handleNavigate('analytics')} style={{ ...buttonStyle, ...isActive('analytics') }}>
                    Analytics
                </button>

                <button onClick={() => handleNavigate('profil')} style={{ ...buttonStyle, ...isActive('profil') }}>
                    Profil
                </button>

                <button onClick={() => handleNavigate('parameter')} style={{ ...buttonStyle, ...isActive('parameter') }}>
                    Paramètres
                </button>

                <button style={buttonStyle} onClick={handleLogout}>
                    Déconnexion
                </button>
            </div>
        </div>
    )
}

export default Upbar
