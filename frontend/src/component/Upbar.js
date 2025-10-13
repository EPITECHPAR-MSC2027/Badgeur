import React, { useState } from 'react'
import '../index.css'
import icon from '../assets/icon.png'
import authService from '../services/authService'

 function Upbar({ currentPage, onNavigate }) {
    const [isActionsOpen, setIsActionsOpen] = useState(false)
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

    const handleLogout = () => {
        authService.logout()
        onNavigate('login')
    }

    return (
        <div className="header">
            <div style={{display: 'flex', alignItems: 'center', paddingLeft: 25}}>
                <img src={icon} alt="Logo" style={{height: 55, width: 'auto'}}/>
                <h1 style={{color:'var(--color-secondary)', fontWeight:'700', letterSpacing:'3px', paddingLeft:'10px'}}>BADGEUR</h1>
            </div>

            <div style={{display: 'flex', alignItems: 'center', gap: 16, paddingRight: 16 }}>
                <button onClick={() => onNavigate('home')} style={{ ...buttonStyle, ...isActive('home') }}>Homepage</button>

                {/* Afficher "Gérer équipe" uniquement pour les managers */}
                {roleId === 1 && (
                    <button onClick={() => onNavigate('gererEquipe')} style={{ ...buttonStyle, ...isActive('gererEquipe') }}>
                        Gérer équipe
                    </button>
                )}

                <div className="dropdown" style={dropdownStyle}>
                    <button className="dropdown-toggle" onClick={() => setIsActionsOpen(v => !v)} style={{ ...buttonStyle, ...isActive('actions') }}>
                        Actions <span className="caret" style={caretStyle}>▼</span>
                    </button>
                    <div className={`dropdown-menu ${isActionsOpen ? 'open' : ''}`} style={dropdownMenuStyle}>
                        <button style={buttonStyle} onClick={() => { onNavigate('pointage'); setIsActionsOpen(false) }}>Pointage</button>
                        <button style={buttonStyle} onClick={() => { onNavigate('planning'); setIsActionsOpen(false) }}>Planning</button>
                    </div>
                </div>

                <button onClick={() => onNavigate('calendrier')} style={{ ...buttonStyle, ...isActive('calendrier') }}>Calendrier</button>
                <button onClick={() => onNavigate('profil')} style={{ ...buttonStyle, ...isActive('profil') }}>Profil</button>
                <button onClick={() => onNavigate('parameter')} style={{ ...buttonStyle, ...isActive('parameter') }}>Paramètres</button>
                <button style={buttonStyle} onClick={handleLogout}>Déconnexion</button>
            </div>
        </div>
    )
}

export default Upbar


