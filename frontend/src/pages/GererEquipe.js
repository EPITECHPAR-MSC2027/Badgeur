import React, { useEffect, useMemo, useState } from 'react'
import authService from '../services/authService'

function GererEquipe() {
    const [tab, setTab] = useState('manage') // 'manage' | 'dashboard'
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [allUsers, setAllUsers] = useState([]) // [{id, firstName, lastName, email, roleId}]
    const [teamMembers, setTeamMembers] = useState([]) // same shape
    const [query, setQuery] = useState('')

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

            setAllUsers(Array.isArray(users) ? users : [])

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

    const filteredUsers = useMemo(() => {
        const q = query.trim().toLowerCase()
        const base = allUsers.filter(u => !teamUserIds.has(u.id))
        if (!q) return base
        return base.filter(u =>
            `${u.firstName || ''} ${u.lastName || ''} ${u.email || ''}`.toLowerCase().includes(q)
        )
    }, [allUsers, teamUserIds, query])

    const onAddToTeam = async (userId) => {
        try {
            setLoading(true)
            // Find my team id first
            const teamsRes = await authService.get('/teams')
            if (!teamsRes.ok) throw new Error(`Erreur chargement équipes: ${teamsRes.status}`)
            const teams = await teamsRes.json()
            const currentUserId = parseInt(localStorage.getItem('userId'))
            const myTeam = Array.isArray(teams) ? teams.find(t => t.managerId === currentUserId) : null
            if (!myTeam) throw new Error("Aucune équipe pour ce manager")

            const res = await authService.put(`/users/${userId}/team`, { newTeamId: myTeam.id })
            if (!res.ok) {
                const t = await res.text()
                throw new Error(`Ajout impossible: ${res.status} - ${t}`)
            }
            await loadData()
        } catch (e) {
            console.error(e)
            alert(e.message || 'Erreur lors de l\'ajout dans l\'équipe')
        } finally {
            setLoading(false)
        }
    }

    const onRemoveFromTeam = async (userId) => {
        try {
            setLoading(true)
            const res = await authService.put(`/users/${userId}/team`, { newTeamId: null })
            if (!res.ok) {
                const t = await res.text()
                throw new Error(`Suppression impossible: ${res.status} - ${t}`)
            }
            await loadData()
        } catch (e) {
            console.error(e)
            alert(e.message || 'Erreur lors de la suppression de l\'équipe')
        } finally {
            setLoading(false)
        }
    }

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
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                    placeholder="Rechercher un utilisateur (nom, prénom, email)"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={{
                        flex: 1,
                        padding: '8px 10px',
                        borderRadius: 8,
                        border: '1px solid #e0e0e0'
                    }}
                />
            </div>

            <h3 style={{ marginTop: 18 }}>Ajouter à mon équipe</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
                {filteredUsers.slice(0, 50).map(u => (
                    <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', border: '1px solid #eee', borderRadius: 8 }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 700 }}>{u.firstName} {u.lastName}</span>
                            <span style={{ fontSize: 12, color: 'var(--color-second-text)' }}>{u.email}</span>
                        </div>
                        <button onClick={() => onAddToTeam(u.id)} style={{ padding: '6px 10px', borderRadius: 6, border: 'none', background: '#1f8b4c', color: 'white', cursor: 'pointer' }}>Ajouter</button>
                    </div>
                ))}
                {filteredUsers.length === 0 && (
                    <div style={{ color: 'var(--color-second-text)' }}>Aucun utilisateur disponible</div>
                )}
            </div>

            <h3 style={{ marginTop: 24 }}>Mon équipe</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
                {teamMembers.map(u => (
                    <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', border: '1px solid #eee', borderRadius: 8 }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 700 }}>{u.firstName} {u.lastName}</span>
                            <span style={{ fontSize: 12, color: 'var(--color-second-text)' }}>{u.email}</span>
                        </div>
                        <button onClick={() => onRemoveFromTeam(u.id)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #f2c0c0', background: '#fff5f5', color: '#b10000', cursor: 'pointer' }}>Retirer</button>
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



