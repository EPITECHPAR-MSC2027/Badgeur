import React, { useState } from 'react'
import '../index.css'

 function Upbar({ currentPage, onNavigate }) {
    const [isActionsOpen, setIsActionsOpen] = useState(false)
    const isActive = (page) => currentPage === page ? { textDecoration: 'underline' } : {}

    return (
        <div className="header">
            <button onClick={() => onNavigate('home')} style={isActive('home')}>Homepage</button>

            <div className="dropdown">
                <button className="dropdown-toggle" onClick={() => setIsActionsOpen(v => !v)} style={isActive('actions')}>
                    Actions <span className="caret">▼</span>
                </button>
                <div className={`dropdown-menu ${isActionsOpen ? 'open' : ''}`}>
                    <button onClick={() => { onNavigate('pointage'); setIsActionsOpen(false) }}>Pointage</button>
                    <button onClick={() => { onNavigate('planning'); setIsActionsOpen(false) }}>Planning</button>
                </div>
            </div>

             <button onClick={() => onNavigate('calendrier')} style={isActive('calendrier')}>Calendrier</button>
            <button onClick={() => onNavigate('profil')} style={isActive('profil')}>Profil</button>
            <button onClick={() => onNavigate('parametre')} style={isActive('parametre')}>Paramètre</button>
            <button>Déconnexion</button>
        </div>
    )
}

export default Upbar


