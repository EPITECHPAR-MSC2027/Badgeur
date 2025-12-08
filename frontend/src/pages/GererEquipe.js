import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../services/authService'
import statsService from '../services/statsService'
import profilImg from '../assets/profil.png'

function GererEquipe() {
    const navigate = useNavigate()
    const [tab, setTab] = useState('manage') // 'manage' | 'dashboard'
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [teamMembers, setTeamMembers] = useState([]) // [{id, firstName, lastName, email, roleId, teamId}]
    const [lastPunchByUserId, setLastPunchByUserId] = useState({}) // { [userId]: Date | null }

    const loadData = async () => {
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
        } catch (e) {
            console.error(e)
            setError(e.message || 'Erreur de chargement')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const teamUserIds = useMemo(() => new Set(teamMembers.map(u => u.id)), [teamMembers])

    const tabButton = (key, label) => (
        <button
            onClick={() => setTab(key)}
            style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid #ddd',
                background: tab === key ? 'var(--color-third)' : 'var(--color-background)',
                color: tab === key ? 'white' : 'var(--color-secondary)',
                cursor: 'pointer',
                fontWeight: 700
            }}
        >
            {label}
        </button>
    )

    const ManageView = () => (
        <div>
            <h3 style={{ marginTop: 0 }}>Mon équipe</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {teamMembers.map(u => {
                    const lastPunch = lastPunchByUserId[u.id]
                    const timeText = lastPunch ? lastPunch.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—'
                    const dateText = lastPunch ? lastPunch.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Aucun pointage'
                    return (
                        <div key={u.id} style={{ background: 'var(--color-primary)', borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', padding: 14, display: 'flex', gap: 30, alignItems: 'center' }}>
                            <img src={profilImg} alt="Profil" style={{ width: 70, height: 70, borderRadius: '50%', objectFit: 'cover' }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: 20, fontFamily:'Spectral, serif'}}>{u.firstName} {u.lastName}</div>
                                <div style={{ fontSize: 14, color: 'var(--color-second-text)', fontWeight: 600,marginTop: 7, fontFamily: 'Fustat, sans-serif'}}>{u.email}</div>
                                <div style={{ marginTop: 8, display: 'flex', gap: 8, fontSize: 15,marginTop: 14 }}>
                                    <span style={{ color: 'var(--color-second-text)', fontFamily: 'Fustat, sans-serif'}}>Dernier pointage:</span>
                                    <span style={{ fontWeight: 600, fontFamily: 'Fustat, sans-serif' }}>{timeText}</span>
                                    <span style={{ color: 'var(--color-second-text)' }}>•</span>
                                    <span style ={{fontFamily: 'Fustat, sans-serif'}}>{dateText}</span>
                                </div>
                            </div>
                        </div>
                    )
                })}
                {teamMembers.length === 0 && (
                    <div style={{ color: 'var(--color-second-text)' }}>Votre équipe est vide</div>
                )}
            </div>
        </div>
    )

    const DashboardView = () => {
        const total = teamMembers.length
        const managers = teamMembers.filter(u => u.roleId === 1).length
        const employees = Math.max(0, total - managers)
        return (
            <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <div style={{ background: 'var(--color-primary)', padding: 16, borderRadius: 10 }}>
                        <div style={{ color: 'var(--color-second-text)', fontSize: 12 }}>Membres</div>
                        <div style={{ fontSize: 24, fontWeight: 800 }}>{total}</div>
                    </div>
                    <div style={{ background: 'var(--color-primary)', padding: 16, borderRadius: 10 }}>
                        <div style={{ color: 'var(--color-second-text)', fontSize: 12 }}>Managers</div>
                        <div style={{ fontSize: 24, fontWeight: 800 }}>{managers}</div>
                    </div>
                    <div style={{ background: 'var(--color-primary)', padding: 16, borderRadius: 10 }}>
                        <div style={{ color: 'var(--color-second-text)', fontSize: 12 }}>Employés</div>
                        <div style={{ fontSize: 24, fontWeight: 800 }}>{employees}</div>
                    </div>
                </div>
                <div style={{ marginTop: 18, background: 'var(--color-primary)', padding: 16, borderRadius: 10 }}>
                    <div style={{ color: 'var(--color-second-text)', fontSize: 14, marginBottom: 8 }}>Aperçu</div>
                    <p style={{ margin: '0 0 16px 0' }}>Ce tableau de bord présentera des KPIs (absences, retards, temps hebdo, etc.).</p>
                    <button 
                        onClick={() => navigate('/admin?tab=analytics')}
                        style={{
                            background: 'var(--color-third)',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.background = 'var(--color-secondary)'
                            e.target.style.transform = 'translateY(-2px)'
                        }}
                        onMouseOut={(e) => {
                            e.target.style.background = 'var(--color-third)'
                            e.target.style.transform = 'translateY(0)'
                        }}
                    >
                        📊 Voir Analytics Équipe
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="App">
            <header className="App-header">
                <h1>Gérer équipe</h1>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    {tabButton('manage', 'Membres')}
                    {tabButton('dashboard', 'Dashboard')}
                </div>
            </header>

            {error && (
                <div style={{ color: '#b10000', background: '#fff5f5', border: '1px solid #f2c0c0', borderRadius: 8, padding: 10, margin: '12px 20px 0' }}>
                    {error}
                </div>
            )}

            <div style={{ padding: 20, opacity: loading ? 0.6 : 1 }}>
                {tab === 'manage' ? <ManageView /> : <DashboardView />}
            </div>
        </div>
    )
}

export default GererEquipe



