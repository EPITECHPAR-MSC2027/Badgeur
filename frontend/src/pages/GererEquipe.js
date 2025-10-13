import React, { useEffect, useMemo, useState } from 'react'
import authService from '../services/authService'

function GererEquipe() {
    const [tab, setTab] = useState('manage') // 'manage' | 'dashboard'
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [teamMembers, setTeamMembers] = useState([]) // [{id, firstName, lastName, email, roleId, teamId}]

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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
                {teamMembers.map(u => (
                    <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', border: '1px solid #eee', borderRadius: 8 }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 700 }}>{u.firstName} {u.lastName}</span>
                            <span style={{ fontSize: 12, color: 'var(--color-second-text)' }}>{u.email}</span>
                        </div>
                    </div>
                ))}
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
                    <p style={{ margin: 0 }}>Ce tableau de bord présentera des KPIs (absences, retards, temps hebdo, etc.).</p>
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



