import React from 'react'
import '../index.css'

function Upbar({ currentPage, onNavigate }) {
    const isActive = (page) => currentPage === page ? { textDecoration: 'underline' } : {}

    return (
        <div className="App-header" style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'flex-start' }}>
            <button onClick={() => onNavigate('home')} style={isActive('home')}>Homepage</button>

            <div style={{ position: 'relative' }}>
                <button style={isActive('actions')}>Actions</button>
                <div style={{ position: 'absolute', top: '100%', left: 0, background: 'var(--color-background)', padding: '8px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <button onClick={() => onNavigate('pointage')}>Pointage</button>
                    <button onClick={() => onNavigate('planning')}>Planning</button>
                </div>
            </div>

            <button onClick={() => onNavigate('calendrier')} style={isActive('calendrier')}>Planning</button>
            <button onClick={() => onNavigate('profil')} style={isActive('profil')}>Profil</button>
            <button onClick={() => onNavigate('parametre')} style={isActive('parametre')}>Paramètre</button>
        </div>
    )
}

export default Upbar


