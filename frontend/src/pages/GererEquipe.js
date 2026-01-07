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
                                <div style={{display: 'flex', gap: 8, fontSize: 15,marginTop: 14 }}>
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

    const AllTeamsView = () => {
        const getTypeLabel = (typeId) => {
            const types = {
                1: 'Présence au bureau',
                2: 'Télétravail',
                3: 'Congé payé',
                4: 'Déplacement professionnel',
                5: 'Formation'
            };
            return types[typeId] || 'Inconnu';
        };

        const getStatutColor = (statut) => {
            const s = Number(statut);
            if (s === 0) return '#fbbf24';
            if (s === 1) return '#10b981';
            if (s === 2) return '#ef4444';
            return '#6b7280';
        };

        const formatDate = (dateStr) => {
            try {
                return new Date(dateStr).toLocaleDateString('fr-FR', {
                    weekday: 'short',
                    day: '2-digit',
                    month: 'short'
                });
            } catch {
                return dateStr;
            }
        };

        return (
            <div>
                <h3 style={{ marginTop: 0 }}>Toutes les équipes et leurs membres</h3>
                {allTeams.map(team => {
                    const manager = allUsers.find(u => u.id === team.managerId);
                    const members = allUsers.filter(u => (u.teamId || 0) === team.id);
                    
                    return (
                        <div key={team.id} style={{ 
                            marginBottom: '32px',
                            border: '2px solid var(--color-secondary)',
                            borderRadius: '12px',
                            padding: '20px',
                            background: 'var(--color-primary)'
                        }}>
                            <h4 style={{ 
                                margin: '0 0 16px 0',
                                color: 'var(--color-secondary)',
                                fontFamily: 'Alata, sans-serif',
                                fontSize: '20px'
                            }}>
                                {team.teamName || `Équipe ${team.id}`}
                            </h4>
                            {manager && (
                                <p style={{ 
                                    margin: '0 0 16px 0',
                                    color: 'var(--color-text)',
                                    fontSize: '14px'
                                }}>
                                    Manager: {manager.firstName} {manager.lastName}
                                </p>
                            )}
                            
                            <div style={{ display: 'grid', gap: '16px' }}>
                                {members.map(user => {
                                    const plannings = userPlannings[user.id] || [];
                                    return (
                                        <div key={user.id} style={{
                                            background: 'var(--color-primary)',
                                            borderRadius: '8px',
                                            padding: '16px',
                                            border: '1px solid var(--color-primary)'
                                        }}>
                                            <div style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '12px',
                                                marginBottom: '12px'
                                            }}>
                                                <img 
                                                    src={profilImg} 
                                                    alt="Profil" 
                                                    style={{ 
                                                        width: 50, 
                                                        height: 50, 
                                                        borderRadius: '50%', 
                                                        objectFit: 'cover' 
                                                    }} 
                                                />
                                                <div>
                                                    <div style={{ 
                                                        fontWeight: 700, 
                                                        fontSize: 16,
                                                        fontFamily: 'Fustat, sans-serif'
                                                    }}>
                                                        {user.firstName} {user.lastName}
                                                    </div>
                                                    <div style={{ 
                                                        fontSize: 12, 
                                                        color: 'var(--color-third-text)',
                                                        fontFamily: 'Fustat, sans-serif'
                                                    }}>
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {plannings.length > 0 ? (
                                                <div>
                                                    <div style={{ 
                                                        fontSize: '14px',
                                                        fontWeight: 600,
                                                        color: 'var(--color-text)',
                                                        marginBottom: '8px'
                                                    }}>
                                                        Plannings ({plannings.length})
                                                    </div>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                        {plannings.slice(0, 5).map((planning, idx) => {
                                                            const date = planning.date ?? planning.Date;
                                                            const period = planning.period ?? planning.Period;
                                                            const statut = planning.statut ?? planning.Statut;
                                                            const typeId = planning.demandTypeId ?? planning.DemandTypeId ?? planning.typeDemandeId ?? planning.TypeDemandeId;
                                                            
                                                            return (
                                                                <div key={idx} style={{
                                                                    padding: '6px 12px',
                                                                    borderRadius: '6px',
                                                                    background: getStatutColor(statut),
                                                                    color: 'white',
                                                                    fontSize: '12px',
                                                                    fontWeight: 600
                                                                }}>
                                                                    {formatDate(date)} {period === '0' ? 'M' : 'AM'} - {getTypeLabel(typeId)}
                                                                </div>
                                                            );
                                                        })}
                                                        {plannings.length > 5 && (
                                                            <div style={{
                                                                padding: '6px 12px',
                                                                borderRadius: '6px',
                                                                background: '#6b7280',
                                                                color: 'white',
                                                                fontSize: '12px',
                                                                fontWeight: 600
                                                            }}>
                                                                +{plannings.length - 5} autres
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div style={{ 
                                                    color: 'var(--color-second-text)',
                                                    fontSize: '14px',
                                                    fontStyle: 'italic'
                                                }}>
                                                    Aucun planning
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                {members.length === 0 && (
                                    <div style={{ 
                                        color: 'var(--color-second-text)',
                                        fontStyle: 'italic',
                                        padding: '16px'
                                    }}>
                                        Aucun membre dans cette équipe
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                {allTeams.length === 0 && (
                    <div style={{ color: 'var(--color-second-text)' }}>
                        Aucune équipe trouvée
                    </div>
                )}
            </div>
        );
    };

    const DashboardView = () => {
        return (
            <div style={{ marginTop: 18 }}>
                <ManagerAnalytics />
            </div>
        )
    }

    return (
        <div className="App">
            <header className="App-header">
                <h1>{isRH ? 'Gestion RH' : 'Gérer équipe'}</h1>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    {isRH ? (
                        <>
                            {tabButton('all-teams', 'Toutes les équipes')}
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
                <div style={{ color: '#b10000', background: '#fff5f5', border: '1px solid #f2c0c0', borderRadius: 8, padding: 10, margin: '12px 20px 0' }}>
                    {error}
                </div>
            )}

            <div style={{ padding: 20, opacity: loading ? 0.6 : 1 }}>
                {tab === 'manage' && <ManageView />}
                {tab === 'validation' && <ValidationPlanning />}
                {tab === 'dashboard' && <DashboardView />}
                {tab === 'all-teams' && isRH && <AllTeamsView />}
            </div>
        </div>
    )
}

export default GererEquipe