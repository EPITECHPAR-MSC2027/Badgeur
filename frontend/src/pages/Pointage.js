import React, { useEffect, useMemo, useRef, useState } from 'react'

function formatTime(date) {
    const pad = (n) => String(n).padStart(2, '0')
    const h = pad(date.getHours())
    const m = pad(date.getMinutes())
    const s = pad(date.getSeconds())
    return `${h}:${m}:${s}`
}

function formatDate(date) {
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function Pointage() {
    const [showToast, setShowToast] = useState(false)
    const [history, setHistory] = useState([]) // [{time: Date}]

    const toastTimerRef = useRef(null)

    const onBadge = () => {
        const now = new Date()
        setHistory((prev) => [{ time: now }, ...prev])
        setShowToast(true)
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
        toastTimerRef.current = setTimeout(() => setShowToast(false), 2500)
    }

    useEffect(() => () => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }, [])

    const cardStyle = {
        backgroundColor: 'var(--color-primary)',
        borderRadius: 12,
        padding: 20,
        boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
        marginTop: 16
    }

    const buttonStyle = {
        backgroundColor: '#181818',
        color: '#fff',
        border: 'none',
        borderRadius: 10,
        padding: '14px 18px',
        fontWeight: 700,
        width: '100%',
        cursor: 'pointer'
    }

    const toastStyle = {
        position: 'fixed',
        right: 24,
        bottom: 24,
        backgroundColor: '#1f8b4c',
        color: 'white',
        padding: '12px 16px',
        borderRadius: 8,
        boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
    }

    return (
        <div>
            <h1>Pointage</h1>
            <div style={cardStyle}>
                <h2 style={{ marginTop: 0 }}>Badger</h2>
                <p style={{ color: 'var(--color-second-text)', marginTop: -6 }}>Appuyez pour enregistrer un badgeage.</p>
                <button style={buttonStyle} onClick={onBadge}>Badger</button>
            </div>

            <div style={{ ...cardStyle, marginTop: 20 }}>
                <h2 style={{ marginTop: 0 }}>Historique des badgeages</h2>
                {history.length === 0 ? (
                    <p style={{ color: 'var(--color-second-text)' }}>Aucun badgeage pour l’instant.</p>
                ) : (
                    <div>
                        {history.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                                <span>{formatDate(new Date(item.time))}</span>
                                <span style={{ fontWeight: 700 }}>{formatTime(new Date(item.time))}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showToast && (
                <div style={toastStyle}>Vous avez badgé !</div>
            )}
        </div>
    )
}

export default Pointage

