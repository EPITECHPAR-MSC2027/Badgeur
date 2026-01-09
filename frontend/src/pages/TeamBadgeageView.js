import React, { useState, useEffect, useCallback } from 'react'
import statsService from '../services/statsService'
import profilImg from '../assets/profil.png'

function TeamBadgeageView({ teamMembers }) {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
    const [loading, setLoading] = useState(false)
    const [badgeagesByUser, setBadgeagesByUser] = useState({}) // { [userId]: [{badgedAt, isLate}] }
    const [error, setError] = useState('')

    // Fonction pour vérifier si un badgeage est en retard
    const isLate = (badgeTime) => {
        const hours = badgeTime.getHours()
        const minutes = badgeTime.getMinutes()
        const totalMinutes = hours * 60 + minutes

        // Retard matin : entre 8h10 (490 min) et 11h55 (715 min)
        const morningLateStart = 8 * 60 + 10 // 8h10
        const morningLateEnd = 11 * 60 + 55 // 11h55

        // Retard après-midi : entre 14h10 (850 min) et 16h55 (1015 min)
        const afternoonLateStart = 14 * 60 + 10 // 14h10
        const afternoonLateEnd = 16 * 60 + 55 // 16h55

        return (totalMinutes >= morningLateStart && totalMinutes <= morningLateEnd) ||
               (totalMinutes >= afternoonLateStart && totalMinutes <= afternoonLateEnd)
    }

    // Fonction pour vérifier si c'est un badgeage matin ou après-midi
    const getBadgeType = (badgeTime) => {
        const hours = badgeTime.getHours()
        const minutes = badgeTime.getMinutes()
        const totalMinutes = hours * 60 + minutes

        // Matin : avant 12h
        if (totalMinutes < 12 * 60) {
            return 'matin'
        }
        // Après-midi : à partir de 12h
        return 'après-midi'
    }

    const loadBadgeages = useCallback(async () => {
        if (!teamMembers || teamMembers.length === 0) {
            setBadgeagesByUser({})
            return
        }

        setLoading(true)
        setError('')
        
        try {
            const selectedDateObj = new Date(selectedDate)
            selectedDateObj.setHours(0, 0, 0, 0)
            const nextDay = new Date(selectedDateObj)
            nextDay.setDate(nextDay.getDate() + 1)

            const entries = await Promise.all(
                teamMembers.map(async (member) => {
                    try {
                        const events = await statsService.fetchUserBadgeEvents(member.id)
                        if (!Array.isArray(events)) return [member.id, []]

                        // Filtrer les événements du jour sélectionné
                        const dayEvents = events
                            .filter(e => {
                                const eventDate = new Date(e.badgedAt)
                                return eventDate >= selectedDateObj && eventDate < nextDay
                            })
                            .map(e => {
                                const badgeTime = new Date(e.badgedAt)
                                return {
                                    ...e,
                                    badgeTime,
                                    isLate: isLate(badgeTime),
                                    type: getBadgeType(badgeTime)
                                }
                            })
                            .sort((a, b) => a.badgeTime - b.badgeTime)

                        return [member.id, dayEvents]
                    } catch (e) {
                        console.warn('Erreur chargement badgeages pour user', member.id, e)
                        return [member.id, []]
                    }
                })
            )

            setBadgeagesByUser(Object.fromEntries(entries))
        } catch (e) {
            console.error('Erreur lors du chargement des badgeages:', e)
            setError(e.message || 'Erreur de chargement')
        } finally {
            setLoading(false)
        }
    }, [teamMembers, selectedDate])

    useEffect(() => {
        loadBadgeages()
    }, [loadBadgeages])

    const formatTime = (date) => {
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    }

    return (
        <div data-testid="team-badgeage-view" style={{ marginTop: 18 }}>
            <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
                <label style={{ fontSize: 16, fontWeight: 600, fontFamily: 'Fustat, sans-serif', color: 'var(--color-text)' }}>
                    Date :
                </label>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid var(--color-third-text)',
                        fontSize: 15,
                        fontFamily: 'Fustat, sans-serif',
                        background: 'var(--color-primary)',
                        color: 'var(--color-text)',
                        cursor: 'pointer'
                    }}
                />
            </div>

            {error && (
                <div style={{ 
                    color: '#b10000', 
                    background: '#fff5f5', 
                    border: '1px solid #f2c0c0', 
                    borderRadius: 8, 
                    padding: 10, 
                    marginBottom: 16 
                }}>
                    {error}
                </div>
            )}

            {loading && (
                <div style={{ textAlign: 'center', padding: 20, color: 'var(--color-third-text)' }}>
                    Chargement...
                </div>
            )}

            {!loading && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 16 }}>
                    {teamMembers.map(member => {
                        const badgeages = badgeagesByUser[member.id] || []
                        const hasLateBadgeage = badgeages.some(b => b.isLate)

                        return (
                            <div
                                key={member.id}
                                data-testid={`member-badgeage-card-${member.id}`}
                                style={{
                                    background: 'var(--color-primary)',
                                    borderRadius: 10,
                                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                                    padding: 16,
                                    border: hasLateBadgeage ? '2px solid #F26A02' : 'none'
                                }}
                            >
                                <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
                                    <img
                                        src={profilImg}
                                        alt="Profil"
                                        style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' }}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: 18, fontFamily: 'Spectral, serif' }}>
                                            {member.firstName} {member.lastName}
                                        </div>
                                        <div style={{ fontSize: 13, color: 'var(--color-third-text)', fontWeight: 600, marginTop: 4, fontFamily: 'Fustat, sans-serif' }}>
                                            {member.email}
                                        </div>
                                    </div>
                                </div>

                                {badgeages.length === 0 ? (
                                    <div style={{ color: 'var(--color-third-text)', fontStyle: 'italic', fontFamily: 'Fustat, sans-serif' }}>
                                        Aucun badgeage ce jour
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {badgeages.map((badgeage, index) => (
                                            <div
                                                key={badgeage.id || index}
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '8px 12px',
                                                    background: badgeage.isLate ? '#fff5f5' : 'var(--color-background)',
                                                    borderRadius: 6,
                                                    border: badgeage.isLate ? '1px solid #F26A02' : 'none'
                                                }}
                                            >
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                    <span style={{ fontWeight: 600, fontSize: 15, fontFamily: 'Fustat, sans-serif' }}>
                                                        {formatTime(badgeage.badgeTime)}
                                                    </span>
                                                    <span style={{ fontSize: 12, color: 'var(--color-third-text)', fontFamily: 'Fustat, sans-serif' }}>
                                                        {badgeage.type === 'matin' ? 'Matin' : 'Après-midi'}
                                                    </span>
                                                </div>
                                                {badgeage.isLate && (
                                                    <span style={{
                                                        background: '#F26A02',
                                                        color: 'white',
                                                        padding: '4px 8px',
                                                        borderRadius: 4,
                                                        fontSize: 12,
                                                        fontWeight: 600,
                                                        fontFamily: 'Fustat, sans-serif'
                                                    }}>
                                                        Retard
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    })}

                    {teamMembers.length === 0 && (
                        <div style={{ color: 'var(--color-second-text)', fontFamily: 'Fustat, sans-serif' }}>
                            Aucun membre dans l'équipe
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default TeamBadgeageView
