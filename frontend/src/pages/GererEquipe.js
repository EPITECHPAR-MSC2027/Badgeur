import React, { useEffect, useState, useCallback } from 'react'
import authService from '../services/authService'
import statsService from '../services/statsService'
import planningService from '../services/planningService'
import profilImg from '../assets/profil.png'
import ValidationPlanning from './ValidationPlanning'
import ManagerAnalytics from './ManagerAnalytics'

function GererEquipe() {
    const roleId = parseInt(localStorage.getItem('roleId') || 0)
    const isRH = roleId === 3
    const [tab, setTab] = useState('manage') // 'manage' | 'dashboard' | 'validation' | 'all-teams'
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [teamMembers, setTeamMembers] = useState([]) // [{id, firstName, lastName, email, roleId, teamId}]
    const [lastPunchByUserId, setLastPunchByUserId] = useState({}) // { [userId]: Date | null }
    const [allTeams, setAllTeams] = useState([]) // Pour le RH
    const [allUsers, setAllUsers] = useState([]) // Pour le RH
    const [userPlannings, setUserPlannings] = useState({}) // { [userId]: [plannings] } Pour le RH

    const loadData = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const [usersRes, teamsRes] = await Promise.all([
                authService.get('/users'),
                authService.get('/teams')
            ])
            if (!usersRes.ok) throw new Error(`Erreur chargement utilisateurs: ${usersRes.status}`)
            if (!teamsRes.ok) throw new Error(`Erreur chargement équipes: ${teamsRes.status}`)
            const users = await usersRes.json()
            const teams = await teamsRes.json()

            // Pour le RH, charger toutes les équipes et tous les utilisateurs
            if (isRH) {
                setAllTeams(Array.isArray(teams) ? teams : [])
                setAllUsers(Array.isArray(users) ? users : [])

                // Charger les plannings de tous les utilisateurs
                const planningEntries = await Promise.all(users.map(async (u) => {
                    try {
                        const plannings = await planningService.listByUser(u.id)
                        return [u.id, Array.isArray(plannings) ? plannings : []]
                    } catch (e) {
                        console.warn('Erreur chargement planning user', u.id, e)
                        return [u.id, []]
                    }
                }))
                setUserPlannings(Object.fromEntries(planningEntries))
            } else {
                // Pour les managers, charger seulement leur équipe
                const currentUserId = parseInt(localStorage.getItem('userId'))
                const myTeam = Array.isArray(teams) ? teams.find(t => t.managerId === currentUserId) : null
                const members = myTeam ? users.filter(u => (u.teamId || 0) === myTeam.id) : []
                setTeamMembers(members)

                // Fetch last punch for each member
                const entries = await Promise.all(members.map(async (u) => {
                    try {
                        const events = await statsService.fetchUserBadgeEvents(u.id)
                        if (!Array.isArray(events) || events.length === 0) return [u.id, null]
                        const latest = events.reduce((acc, e) => {
                            const t = new Date(e.badgedAt)
                            return !acc || t > acc ? t : acc
                        }, null)
                        return [u.id, latest]
                    } catch (e) {
                        console.warn('Erreur last punch pour user', u.id, e)
                        return [u.id, null]
                    }
                }))
                setLastPunchByUserId(Object.fromEntries(entries))
            }
        } catch (e) {
            console.error(e)
            setError(e.message || 'Erreur de chargement')
        } finally {
            setLoading(false)
        }
    }, [isRH])

    useEffect(() => {
        loadData()
    }, [loadData])

    const tabButton = (key, label) => (
        <button
            data-testid={`tab-button-${key}`}
            onClick={() => setTab(key)}
            style={{
                padding: '8px 12px',
                borderRadius: 8,
                background: tab === key ? 'var(--color-secondary)' : 'var(--color-primary)',
                color: tab === key ? 'var(--color-primary)' : 'var(--color-secondary)',
                cursor: 'pointer',
                fontWeight: 700
            }}
        >
            {label}
        </button>
    )

    const ManageView = () => (
        <div data-testid="manage-view">
            <h2 data-testid="team-title" style={{ marginTop: 0, fontSize: '28px', fontWeight: '700' }}>Mon équipe</h2>
            <div data-testid="team-members-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {teamMembers.map(u => {
                    const lastPunch = lastPunchByUserId[u.id]
                    const timeText = lastPunch ? lastPunch.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—'
                    const dateText = lastPunch ? lastPunch.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Aucun pointage'
                    return (
                        <div key={u.id} data-testid={`team-member-card-${u.id}`} style={{ background: 'var(--color-primary)', borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', padding: 14, display: 'flex', gap: 30, alignItems: 'center' }}>
                            <img data-testid={`member-avatar-${u.id}`} src={profilImg} alt="Profil" style={{ width: 70, height: 70, borderRadius: '50%', objectFit: 'cover' }} />
                            <div style={{ flex: 1 }}>
                                <div data-testid={`member-name-${u.id}`} style={{ fontWeight: 700, fontSize: 20, fontFamily: 'Spectral, serif' }}>{u.firstName} {u.lastName}</div>
                                <div data-testid={`member-email-${u.id}`} style={{ fontSize: 14, color: 'var(--color-third-text)', fontWeight: 600, marginTop: 7, fontFamily: 'Fustat, sans-serif' }}>{u.email}</div>
                                <div data-testid={`member-last-punch-${u.id}`} style={{ display: 'flex', gap: 8, fontSize: 15, marginTop: 14 }}>
                                    <span style={{ color: 'var(--color-third-text)', fontFamily: 'Fustat, sans-serif' }}>Dernier pointage:</span>
                                    <span data-testid={`member-punch-time-${u.id}`} style={{ fontWeight: 600, fontFamily: 'Fustat, sans-serif' }}>{timeText}</span>
                                    <span style={{ color: 'var(--color-third-text)' }}>•</span>
                                    <span data-testid={`member-punch-date-${u.id}`} style={{ fontFamily: 'Fustat, sans-serif' }}>{dateText}</span>
                                </div>
                            </div>
                        </div>
                    )
                })}
                {teamMembers.length === 0 && (
                    <div data-testid="empty-team-message" style={{ color: 'var(--color-second-text)' }}>Votre équipe est vide</div>
                )}
            </div>
        </div>
    )

    const DashboardView = () => {
        return (
            <div data-testid="dashboard-view" style={{ marginTop: 18 }}>
                <ManagerAnalytics />
            </div>
        )
    }

    return (
        <div data-testid="gerer-equipe-page" className="App">
            <header data-testid="page-header" className="App-header">
                <h1 data-testid="page-title">{isRH ? 'Gestion RH' : 'Gérer équipe'}</h1>
                <div data-testid="tab-buttons" style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    {isRH ? (
                        <>
                            {tabButton('validation', 'Validation plannings')}
                        </>
                    ) : (
                        <>
                            {tabButton('manage', 'Membres')}
                            {tabButton('validation', 'Validation plannings')}
                            {tabButton('dashboard', 'Dashboard')}
                        </>
                    )}
                </div>
            </header>

            {error && (
                <div data-testid="error-message" style={{ color: '#b10000', background: '#fff5f5', border: '1px solid #f2c0c0', borderRadius: 8, padding: 10, margin: '12px 20px 0' }}>
                    {error}
                </div>
            )}

            <div data-testid="content-container" style={{ padding: 20, opacity: loading ? 0.6 : 1 }}>
                {tab === 'manage' && <ManageView />}
                {tab === 'validation' && <ValidationPlanning />}
                {tab === 'dashboard' && <DashboardView />}
            </div>
        </div>
    )
}

export default GererEquipe