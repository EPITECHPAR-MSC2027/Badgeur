import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../index.css'
import icon from '../assets/icon.png'
import icons from '../icons'


function Upbar({ currentPage, onNavigate }) {
    const [isPresenceOpen, setIsPresenceOpen] = useState(false)
    const [isReservationsOpen, setIsReservationsOpen] = useState(false)
    const [isAdminOpen, setIsAdminOpen] = useState(false)
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
            case '/manager-analytics':
                return 'managerAnalytics'
            case '/reservation-vehicule':
                return 'reservationVehicule'
            case '/support':
                return 'supportTicket'
            case '/tickets-management':
                return 'ticketsManagement'
            case '/my-reservations':
                return 'myReservations'
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

    const iconButtonStyle = (page) => ({
        ...getButtonStyle(page),
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    })

    const dropdownStyle = {
        position: 'relative'
    }

    const getDropdownMenuStyle = (isOpen) => ({
        position: 'absolute',
        top: '100%',
        right: 0,
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-secondary)',
        padding: 8,
        borderRadius: 6,
        display: isOpen ? 'flex' : 'none',
        flexDirection: 'column',
        gap: 4,
        boxShadow: '0 6px 18px rgba(0,0,0,0.15)',
        zIndex: 10
    })

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
            case 'bookingRoom':
                return '/booking-room'
            case 'calendrier':
                return '/calendrier'
            case 'profil':
                return '/profil'
            case 'analytics':
                return '/analytics'
            case 'managerAnalytics':
                return '/manager-analytics'
            case 'reservationVehicule':
                return '/reservation-vehicule'
            case 'createAnnouncement':
                return '/create-announcement'
            case 'announcements':
                return '/announcements'
            case 'notification':
                return '/notification'
            case 'trombinoscope':
                return '/trombinoscope'
            case 'supportTicket':
                return '/support'
            case 'ticketsManagement':
                return '/tickets-management'
            case 'login':
                return '/login'
            case 'myReservations':
                return '/my-reservations'
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

                {roleId === 3 && (
                    <div className="dropdown" style={dropdownStyle}>
                        <button
                            className="dropdown-toggle"
                            onClick={() => setIsAdminOpen(v => !v)}
                            onMouseEnter={() => setHoveredButton('adminDropdown')}
                            onMouseLeave={() => setHoveredButton(null)}
                            style={getButtonStyle('adminDropdown')}
                        >
                            RH <span className="caret" style={caretStyle}>▼</span>
                        </button>

                        <div className={`dropdown-menu ${isAdminOpen ? 'open' : ''}`} style={getDropdownMenuStyle(isAdminOpen)}>
                            <button
                                style={getButtonStyle('createAnnouncement')}
                                onMouseEnter={() => setHoveredButton('createAnnouncement')}
                                onMouseLeave={() => setHoveredButton(null)}
                                onClick={() => { handleNavigate('createAnnouncement'); setIsAdminOpen(false) }}
                            >
                                Faire une Annonce
                            </button>
                            <button
                                style={getButtonStyle('ticketsManagement')}
                                onMouseEnter={() => setHoveredButton('ticketsManagement')}
                                onMouseLeave={() => setHoveredButton(null)}
                                onClick={() => { handleNavigate('ticketsManagement'); setIsAdminOpen(false) }}
                            >
                                Gérer mes tickets
                            </button>
                        </div>
                    </div>
                )}

                {roleId === 2 && (
                    <button 
                        onClick={() => handleNavigate('ticketsManagement')} 
                        onMouseEnter={() => setHoveredButton('ticketsManagement')}
                        onMouseLeave={() => setHoveredButton(null)}
                        style={getButtonStyle('ticketsManagement')}
                    >
                        Tickets
                    </button>
                )}

                <button 
                    onClick={() => handleNavigate('trombinoscope')} 
                    onMouseEnter={() => setHoveredButton('trombinoscope')}
                    onMouseLeave={() => setHoveredButton(null)}
                    style={getButtonStyle('trombinoscope')}
                >
                    Trombinoscope
                </button>

                {/* Dropdown Présence */}
                <div className="dropdown" style={dropdownStyle}>
                    <button
                        className="dropdown-toggle"
                        onClick={() => setIsPresenceOpen(v => !v)}
                        onMouseEnter={() => setHoveredButton('presence')}
                        onMouseLeave={() => setHoveredButton(null)}
                        style={getButtonStyle('presence')}
                    >
                        Présence <span className="caret" style={caretStyle}>▼</span>
                    </button>

                    <div className={`dropdown-menu ${isPresenceOpen ? 'open' : ''}`} style={getDropdownMenuStyle(isPresenceOpen)}>
                        <button 
                            style={getButtonStyle('pointage')}
                            onMouseEnter={() => setHoveredButton('pointage')}
                            onMouseLeave={() => setHoveredButton(null)}
                            onClick={() => { handleNavigate('pointage'); setIsPresenceOpen(false) }}
                        >
                            Pointage
                        </button>
                        <button 
                            style={getButtonStyle('planning')}
                            onMouseEnter={() => setHoveredButton('planning')}
                            onMouseLeave={() => setHoveredButton(null)}
                            onClick={() => { handleNavigate('planning'); setIsPresenceOpen(false) }}
                        >
                            Planning
                        </button>
                        <button 
                            onClick={() => { handleNavigate('calendrier'); setIsPresenceOpen(false) }}
                            onMouseEnter={() => setHoveredButton('calendrier')}
                            onMouseLeave={() => setHoveredButton(null)}
                            style={getButtonStyle('calendrier')}
                        >
                            Equipe
                        </button>
                    </div>
                </div>

                {/* Dropdown Réservations */}
                <div className="dropdown" style={dropdownStyle}>
                    <button
                        className="dropdown-toggle"
                        onClick={() => setIsReservationsOpen(v => !v)}
                        onMouseEnter={() => setHoveredButton('reservations')}
                        onMouseLeave={() => setHoveredButton(null)}
                        style={getButtonStyle('reservations')}
                    >
                        Réservations <span className="caret" style={caretStyle}>▼</span>
                    </button>

                    <div className={`dropdown-menu ${isReservationsOpen ? 'open' : ''}`} style={getDropdownMenuStyle(isReservationsOpen)}>
                        <button
                            style={getButtonStyle('myReservations')}
                            onMouseEnter={() => setHoveredButton('myReservations')}
                            onMouseLeave={() => setHoveredButton(null)}
                            onClick={() => { handleNavigate('myReservations'); setIsReservationsOpen(false) }}>
                            Voir mes réservations
                        </button>
                        <button 
                            style={getButtonStyle('reservationVehicule')}
                            onMouseEnter={() => setHoveredButton('reservationVehicule')}
                            onMouseLeave={() => setHoveredButton(null)}
                            onClick={() => { handleNavigate('reservationVehicule'); setIsReservationsOpen(false) }}
                        >
                            Véhicule
                        </button>

                        <button
                            style={getButtonStyle('bookingRoom')}
                            onMouseEnter={() => setHoveredButton('bookingRoom')}
                            onMouseLeave={() => setHoveredButton(null)}
                            onClick={() => { handleNavigate('bookingRoom'); setIsReservationsOpen(false) }}
                        >
                            Salle
                        </button>
                    </div>
                </div>

                <button 
                    onClick={() => handleNavigate('analytics')} 
                    onMouseEnter={() => setHoveredButton('analytics')}
                    onMouseLeave={() => setHoveredButton(null)}
                    style={getButtonStyle('analytics')}
                >
                    <img 
                        src={icons.dashboard.url} 
                        alt={icons.dashboard.alt}
                    />
                </button>
                
                <button 
                    onClick={() => handleNavigate('notification')} 
                    onMouseEnter={() => setHoveredButton('notification')}
                    onMouseLeave={() => setHoveredButton(null)}
                    style={iconButtonStyle('notification')}
                    title="Notifications"
                >
                    <img 
                        src={icons.notification.url} 
                        alt={icons.notification.alt}
                    />
                </button>

                <button 
                    onClick={() => handleNavigate('profil')} 
                    onMouseEnter={() => setHoveredButton('profil')}
                    onMouseLeave={() => setHoveredButton(null)}
                    style={iconButtonStyle('profil')}
                    title="Profil"
                >
                    <img 
                        src={icons.profil.url} 
                        alt={icons.profil.alt}
                    />
                </button>
            </div>
        </div>
    )
}

export default Upbar;