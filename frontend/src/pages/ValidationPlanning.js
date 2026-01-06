import React from 'react'
import planningService from '../services/planningService'
import teamService from '../services/teamService'
import notificationService from '../services/notificationService'


// Page manager : validation / refus des demandes de planning
function ValidationPlanning() {
    const fixedTypes = React.useMemo(() => ([
        { id: 1, label: 'Présence au bureau', color: '#0b5fff' },
        { id: 2, label: 'Télétravail', color: '#fbbf24' },
        { id: 3, label: 'Congé payé', color: '#8b5cf6' },
        { id: 4, label: 'Déplacement professionnel', color: '#10b981' },
        { id: 5, label: 'Formation', color: '#06b6d4' }
    ]), [])

    const [members, setMembers] = React.useState([])
    const [pendingByUser, setPendingByUser] = React.useState({})
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState('')
    const [savingId, setSavingId] = React.useState(null)

    function colorForType(id) {
        return fixedTypes.find(t => t.id === id)?.color
    }

    function formatDateFr(dateStr) {
        try {
            return new Date(dateStr).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' })
        } catch {
            return dateStr
        }
    }

    React.useEffect(() => {
        let cancelled = false
        async function load() {
            setLoading(true)
            setError('')
            try {
                const team = await teamService.listMyTeamMembers()
                if (!cancelled) setMembers(team)
                const entries = await Promise.all(team.map(async (m) => {
                    try {
                        const recs = await planningService.listByUser(m.id)
                        const pending = recs
                            .map(r => ({
                                id: r.id ?? r.Id,
                                date: r.date ?? r.Date,
                                period: String(r.period ?? r.Period ?? '0'),
                                statut: Number(r.statut ?? r.Statut ?? 0),
                                typeId: Number(r.demandTypeId ?? r.DemandTypeId ?? r.typeDemandeId ?? r.TypeDemandeId),
                                raw: r
                            }))
                            .filter(p => p.statut === 0)
                            .sort((a, b) => new Date(a.date) - new Date(b.date))
                        return [m.id, pending]
                    } catch (e) {
                        console.warn('Erreur chargement planning membre', m.id, e)
                        return [m.id, []]
                    }
                }))
                if (!cancelled) setPendingByUser(Object.fromEntries(entries))
            } catch (e) {
                if (!cancelled) setError(e.message || 'Impossible de charger les demandes.')
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => { cancelled = true }
    }, [])

    async function updateStatut(plan, newStatut) {
        setSavingId(plan.id)
        try {
            await planningService.update(plan.id, {
                Date: plan.raw?.date ?? plan.raw?.Date ?? plan.date,
                Period: plan.period,
                Statut: String(newStatut),
                TypeDemandeId: plan.raw?.demandTypeId ?? plan.raw?.DemandTypeId ?? plan.raw?.typeDemandeId ?? plan.raw?.TypeDemandeId ?? plan.typeId
            })
            
            // Trouver l'utilisateur concerné par cette demande
            // D'abord essayer depuis plan.raw, sinon chercher dans pendingByUser
            const planUserId = plan.raw?.userId ?? plan.raw?.UserId ?? 
                Object.keys(pendingByUser).find(uid => 
                    pendingByUser[uid].some(p => p.id === plan.id)
                )
            
            // Créer une notification pour l'employé (seulement si roleId = 0)
            if (planUserId) {
                const userIdNum = Number(planUserId)
                const user = members.find(m => m.id === userIdNum)
                if (user && user.roleId === 0) {
                    try {
                        const typeLabel = fixedTypes.find(t => t.id === plan.typeId)?.label || 'demande'
                        const periodLabel = plan.period === '0' ? 'matin' : 'après-midi'
                        const dateStr = formatDateFr(plan.date)
                        const message = newStatut === 1 
                            ? `Votre demande de planning (${typeLabel}, ${dateStr} ${periodLabel}) a été validée`
                            : `Votre demande de planning (${typeLabel}, ${dateStr} ${periodLabel}) a été refusée`
                        
                        await notificationService.createNotification({
                            userId: userIdNum,
                            message: message,
                            type: 'planning_response',
                            relatedId: plan.id
                        })
                    } catch (notifError) {
                        console.error('Erreur lors de la création de la notification:', notifError)
                    }
                }
            }
            
            // retrait immédiat de la liste locale
            setPendingByUser(prev => {
                const clone = { ...prev }
                for (const key of Object.keys(clone)) {
                    clone[key] = clone[key].filter(p => p.id !== plan.id)
                }
                return clone
            })
        } catch (e) {
            setError(e.message || 'Mise à jour impossible.')
        } finally {
            setSavingId(null)
        }
    }

    function renderBadge(period) {
        return period === '0'
            ? <span style={{ padding: '2px 8px', borderRadius: 6, background: 'var(--color-primary)', fontSize: 12 }}>Matin</span>
            : <span style={{ padding: '2px 8px', borderRadius: 6, background: 'var(--color-primary)', fontSize: 12 }}>Après-midi</span>
    }

    return (
        <div style={{ padding: 16 }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                    <h2 style={{ margin: 0 }}>Validation des plannings</h2>
                    <p style={{ margin: 0, color: 'var(--highlight2)', fontWeight:'700', fontSize:'10px' }}>Validez ou refusez les demandes de vos collaborateurs</p>
                </div>
            </header>

            {error && <div style={{ color: '#b91c1c', marginBottom: 12 }}>{error}</div>}
            {loading && <div style={{ color: 'var(--highlight3)' }}>Chargement...</div>}

            {!loading && members.map(user => {
                const requests = pendingByUser[user.id] || []
                return (
                    <div key={user.id} style={{ border: '1px solid var(--color-secondary)', borderRadius: 10, padding: 12, marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <div>
                                <div style={{ fontWeight: 700 }}>{user.firstName} {user.lastName}</div>
                                <div style={{ color: 'var(--highlight3)', fontSize: 13 }}>{requests.length} en attente</div>
                            </div>
                        </div>

                        {requests.length === 0 && (
                            <div style={{ color: 'var(--highlight4)' }}>Aucune demande en attente</div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
                            {requests.map(plan => {
                                const typeColor = colorForType(plan.typeId)
                                const typeLabel = fixedTypes.find(t => t.id === plan.typeId)?.label || 'Type inconnu'
                                return (
                                    <div key={plan.id} style={{ border: '1px solid var(--color-secondary)', borderRadius: 8, padding: 10, display: 'grid', gap: 6 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ fontWeight: 700 }}>{formatDateFr(plan.date)}</div>
                                            {renderBadge(plan.period)}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ width: 10, height: 10, borderRadius: 9999, background: typeColor }} />
                                            <span>{typeLabel}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button
                                                type="button"
                                                onClick={() => updateStatut(plan, 2)}
                                                disabled={savingId === plan.id}
                                                style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid #ef4444', background: '#fef2f2', color: '#b91c1c', cursor: 'pointer' }}
                                            >
                                                Refuser
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => updateStatut(plan, 1)}
                                                disabled={savingId === plan.id}
                                                style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid #22c55e', background: '#ecfdf3', color: '#15803d', cursor: 'pointer' }}
                                            >
                                                Valider
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default ValidationPlanning

