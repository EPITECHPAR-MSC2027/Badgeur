import React, { useEffect, useRef, useState } from 'react'
import authService from '../services/authService'
import '../style/pointage.css'

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
    const [loading, setLoading] = useState(false)

    const toastTimerRef = useRef(null)

    // Charger l'historique des badgeages au montage du composant
    useEffect(() => {
        loadBadgeHistory()
    }, [])

    const loadBadgeHistory = async () => {
        try {
            const userId = localStorage.getItem('userId')
            console.log('User ID:', userId)
            
            if (!userId) {
                console.error('ID utilisateur non trouvé')
                return
            }
            
            console.log('Chargement de l\'historique pour l\'utilisateur:', userId)
            const response = await authService.get(`/badgeLogEvent/user/${userId}`)
            console.log('Réponse historique:', response.status)
            
            if (response.ok) {
                const data = await response.json()
                console.log('Données reçues:', data)
                setHistory(data.map(item => ({ time: new Date(item.badgedAt) })))
            } else {
                const errorText = await response.text()
                console.error('Erreur lors du chargement de l\'historique:', response.status, errorText)
            }
        } catch (error) {
            console.error('Erreur lors du chargement de l\'historique:', error)
        }
    }

    const onBadge = async () => {
        setLoading(true)
        try {
            const userId = localStorage.getItem('userId')
            console.log('User ID pour badgeage:', userId)
            
            if (!userId) {
                throw new Error('ID utilisateur non trouvé')
            }
            
            const now = new Date()
            const requestData = {
                badgedAt: now.toISOString(),
                userId: parseInt(userId)
            }
            console.log('Données de badgeage:', requestData)
            
            const response = await authService.post('/badgeLogEvent/', requestData)
            console.log('Réponse badgeage:', response.status)
            
            if (response.ok) {
                const result = await response.json()
                console.log('Badgeage réussi, ID:', result)
                setHistory((prev) => [{ time: now }, ...prev])
                setShowToast(true)
                if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
                toastTimerRef.current = setTimeout(() => setShowToast(false), 2500)
            } else {
                const errorText = await response.text()
                console.error('Erreur API:', response.status, errorText)
                throw new Error(`Erreur lors du badgeage: ${response.status} - ${errorText}`)
            }
        } catch (error) {
            console.error('Erreur lors du badgeage:', error)
            alert(error.message || 'Erreur lors du badgeage. Veuillez réessayer.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => () => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }, [])


    return (
        <div className="pointage-container">
            <main className="pointage-main">
                <div className="pointage-header">
                    <h1 className="pointage-title">Badgeage</h1>
                    <p className="pointage-date">{formatDate(new Date())}</p>
                    <div className="pointage-info-card">
                        <p className="pointage-info-text">
                            Pensez à badger à <span className="pointage-highlight">chaque moment clé</span> de votre journée :
                            votre arrivée le matin, avant votre pause déjeuner, lors de votre retour de pause, et avant votre départ en fin de journée.
                        </p>
                    </div>
                </div>

                {/* Moments de la journée */}
                <div className="pointage-moments">
                    {[
                        { label: 'Arrivée Matin', time: '08h00', icon: '☀️' },
                        { label: 'Pause déj. Midi', time: '12h00', icon: '☕' },
                        { label: 'Reprise Après-midi', time: '13h00', icon: '🔄' },
                        { label: 'Départ Soir', time: '17h00', icon: '🌙' }
                    ].map((moment, index) => (
                        <div
                            key={index}
                            className="pointage-moment"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="pointage-moment-icon">
                                {moment.icon}
                            </div>
                            <div className="pointage-moment-text">
                                <p className="pointage-moment-label">
                                    {moment.label}
                                </p>
                                <p className="pointage-moment-time">
                                    {moment.time}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pointage-badge-container">
                    <button 
                        className="pointage-badge-button"
                        onClick={onBadge} 
                        disabled={loading}
                    >
                        <div className="pointage-badge-icon">👆</div>
                        <span className="pointage-badge-text">BADGER</span>
                    </button>
                </div>

                <div className="pointage-history-card">
                    <div className="pointage-history-header">
                        <h2 className="pointage-history-title">Historique du jour</h2>
                        <p className="pointage-history-description">
                            {history.length === 0
                                ? "Aucun badgeage effectué aujourd'hui"
                                : `${history.length} badgeage${history.length > 1 ? "s" : ""} effectué${history.length > 1 ? "s" : ""}`}
                        </p>
                    </div>
                    <div className="pointage-history-content">
                        {history.length === 0 ? (
                            <div className="pointage-empty-state">
                                <div className="pointage-empty-icon">👆</div>
                                <p>Effectuez votre premier badgeage</p>
                            </div>
                        ) : (
                            <div>
                                {[...history].reverse().map((item, index) => (
                                    <div
                                        key={index}
                                        className="pointage-badge-item"
                                    >
                                        <div className="pointage-badge-info">
                                            <div className="pointage-badge-indicator" />
                                            <div>
                                                <p className="pointage-badge-type">Badgeage</p>
                                                <p className="pointage-badge-time">
                                                    {formatDate(new Date(item.time))} à {formatTime(new Date(item.time))}
                                                </p>
                                            </div>
                                        </div>
                                        {index === 0 && (
                                            <span className="pointage-last-badge">Dernier</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {showToast && (
                <div className="pointage-toast">Vous avez badgé !</div>
            )}
        </div>
    )
}

export default Pointage

