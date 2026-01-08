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

    function renderBadge(period, planId) {
        return period === '0'
            ? <span style={{ padding: '2px 8px', borderRadius: 6, background: '#FFE1AA', fontSize: 12, fontFamily: 'Fustat, sans-serif' }} data-testid={`badge-morning-${planId}`}>Matin</span>
            : <span style={{ padding: '2px 8px', borderRadius: 6, background: '#C4C6F0', fontSize: 12, fontFamily: 'Fustat, sans-serif' }} data-testid={`badge-afternoon-${planId}`}>Après-midi</span>
    }

    return (
        <div style={{ padding: 16 }} data-testid="validation-planning-container">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }} data-testid="validation-planning-header">
                <div>
                    <h2 style={{ margin: 0, fontSize: '28px', fontFamily: 'Spectral, serif', fontWeight: '700' }} data-testid="validation-planning-title">Validation des plannings</h2>
                    <p style={{ margin: 0, color: 'var(--color-third-text)', fontWeight: '700', fontSize: '15px' }} data-testid="validation-planning-subtitle">Validez ou refusez les demandes de vos collaborateurs</p>
                </div>
            </header>

            {error && <div style={{ color: '#b91c1c', marginBottom: 12 }} data-testid="error-message">{error}</div>}
            {loading && <div style={{ color: 'var(--highlight3)' }} data-testid="loading-message">Chargement...</div>}

            {!loading && members.map(user => {
                const requests = pendingByUser[user.id] || []
                return (
                    <div key={user.id} style={{ backgroundColor: 'var(--color-primary)', borderRadius: 10, padding: 12, marginBottom: 12 }} data-testid={`user-section-${user.id}`}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <div>
                                <div style={{ fontWeight: 700, fontFamily: 'Fustat, sans-serif' }} data-testid={`user-name-${user.id}`}>{user.firstName} {user.lastName}</div>
                                <div style={{ color: 'var(--color-third-text)', fontSize: 13, fontFamily: 'Fustat, sans-serif' }} data-testid={`user-pending-count-${user.id}`}>{requests.length} en attente</div>
                            </div>
                        </div>

                        {requests.length === 0 && (
                            <div style={{ color: 'var(--highlight4)' }} data-testid={`no-requests-${user.id}`}>Aucune demande en attente</div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }} data-testid={`requests-grid-${user.id}`}>
                            {requests.map(plan => {
                                const typeLabel = fixedTypes.find(t => t.id === plan.typeId)?.label || 'Type inconnu'
                                const typeColor = colorForType(plan.typeId)
                                return (
                                    <div key={plan.id} style={{ backgroundColor: 'var(--color-background)', borderRadius: 8, padding: 10, display: 'grid', gap: 6 }} data-testid={`request-card-${plan.id}`}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ fontWeight: 700, fontFamily: 'Fustat, sans-serif' }} data-testid={`request-date-${plan.id}`}>{formatDateFr(plan.date)}</div>
                                            {renderBadge(plan.period, plan.id)}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ width: 10, height: 10, borderRadius: 9999, fontSize: 12, fontWeight: 700, fontFamily: 'Fustat, sans-serif', background: typeColor }} data-testid={`request-type-indicator-${plan.id}`} />
                                            <span style={{ fontFamily: 'Fustat, sans-serif', fontSize: '14px' }} data-testid={`request-type-label-${plan.id}`}>{typeLabel}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: 8 }} data-testid={`request-actions-${plan.id}`}>
                                            <button
                                                type="button"
                                                onClick={() => updateStatut(plan, 2)}
                                                disabled={savingId === plan.id}
                                                style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid #ef4444', background: '#fef2f2', color: '#b91c1c', cursor: 'pointer' }}
                                                data-testid={`reject-button-${plan.id}`}
                                            >
                                                Refuser
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => updateStatut(plan, 1)}
                                                disabled={savingId === plan.id}
                                                style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid #22c55e', background: '#ecfdf3', color: '#15803d', cursor: 'pointer' }}
                                                data-testid={`approve-button-${plan.id}`}
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