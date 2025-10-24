import React from 'react'
import planningService from '../services/planningService'
import teamService from '../services/teamService'

function Calendrier() {
    // Fixed type list and colors (same as Planning.js)
    const fixedTypes = React.useMemo(() => ([
        { id: 1, label: 'Présence au bureau', color: '#0b5fff' },
        { id: 2, label: 'Télétravail', color: '#fbbf24' },
        { id: 3, label: 'Congé payé', color: '#8b5cf6' },
        { id: 4, label: 'Déplacement professionnel', color: '#10b981' },
        { id: 5, label: 'Formation', color: '#06b6d4' }
    ]), [])

    const colorForType = React.useCallback((typeId) => fixedTypes.find(t => t.id === typeId)?.color, [fixedTypes])

    // Time scope
    const today = new Date()
    const [currentYear, setCurrentYear] = React.useState(today.getFullYear())
    const [currentMonthIndex, setCurrentMonthIndex] = React.useState(today.getMonth())

    // Team and plans
    const [members, setMembers] = React.useState([]) // [{id, firstName, lastName}]
    // plansByUserDate[userId]?.[ymd]?.['0'|'1'] => { typeId, statut }
    const [plansByUserDate, setPlansByUserDate] = React.useState({})
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState('')

    // Helpers
    function normalizeDateOnly(d) {
        const n = new Date(d)
        n.setHours(0, 0, 0, 0)
        return n
    }
    function toYMD(d) {
        const n = normalizeDateOnly(d)
        const y = n.getFullYear()
        const m = String(n.getMonth() + 1).padStart(2, '0')
        const day = String(n.getDate()).padStart(2, '0')
        return `${y}-${m}-${day}`
    }

    // Build month grid
    const monthGrid = React.useMemo(() => {
        const year = currentYear
        const monthIndex = currentMonthIndex
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
        const jsDay = (new Date(year, monthIndex, 1).getDay() || 7)
        const leadBlanks = jsDay - 1
        const cells = []
        for (let b = 0; b < leadBlanks; b++) cells.push(null)
        for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, monthIndex, d))
        return { year, monthIndex, cells }
    }, [currentYear, currentMonthIndex])

    // Load team members for current manager via service
    React.useEffect(() => {
        let cancelled = false
        async function loadTeam() {
            setLoading(true)
            setError('')
            try {
                const membersList = await teamService.listMyTeamMembers()
                if (!cancelled) setMembers(membersList)
            } catch (e) {
                if (!cancelled) setError(e.message || 'Erreur')
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        loadTeam()
        return () => { cancelled = true }
    }, [])

    // Load plannings for members - single fetch on mount and month change
    React.useEffect(() => {
        let cancelled = false
        
        async function loadPlans() {
            if (members.length === 0) { 
                setPlansByUserDate({})
                setLoading(false)
                return 
            }
            setLoading(true)
            
            try {
                const entries = await Promise.all(members.map(async (m) => {
                    try {
                        const recs = await planningService.listByUser(m.id)
                        const perDate = {}
                        for (const r of recs) {
                            const d = new Date(r.date ?? r.Date)
                            if (d.getFullYear() !== currentYear || d.getMonth() !== currentMonthIndex) continue
                            const ymd = toYMD(d)
                            const period = String(r.period ?? r.Period)
                            // Backend returns Statut as string, convert to number
                            const statut = Number(r.statut ?? r.Statut ?? 0)
                            // Backend uses DemandTypeId, not TypeDemandeId
                            const typeId = Number(r.demandTypeId ?? r.DemandTypeId ?? r.typeDemandeId ?? r.TypeDemandeId)
                            if (!perDate[ymd]) perDate[ymd] = {}
                            perDate[ymd][period] = { typeId, statut }
                        }
                        return [m.id, perDate]
                    } catch (e) {
                        console.warn(`Failed to load planning for user ${m.id}:`, e)
                        return [m.id, {}]
                    }
                }))
                if (!cancelled) {
                    setPlansByUserDate(Object.fromEntries(entries))
                    setLoading(false)
                }
            } catch (e) {
                console.error('Planning load error:', e)
                if (!cancelled) setLoading(false)
            }
        }
        loadPlans()
        return () => { cancelled = true }
    }, [members, currentYear, currentMonthIndex, toYMD])

    const containerStyle = { padding: 16 }
    const selectStyle = {
        fontFamily: 'Alata, sans-serif',
        fontWeight: 600,
        padding: '8px 10px',
        borderRadius: 10,
        border: '1px solid #d1d5db',
        background: '#f3f4f6',
        color: '#111827',
        outline: 'none',
        cursor: 'pointer'
    }

    return (
        <div className="App" style={containerStyle}>
            <header className="App-header" style={{ marginBottom: 12 }}>
                <h1>Equipe</h1>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <select value={currentMonthIndex} onChange={(e) => setCurrentMonthIndex(Number(e.target.value))} style={selectStyle}>
                        {Array.from({ length: 12 }).map((_, i) => (
                            <option key={i} value={i}>{new Date(2000, i, 1).toLocaleString('fr-FR', { month: 'long' })}</option>
                        ))}
                    </select>
                    <select value={currentYear} onChange={(e) => setCurrentYear(Number(e.target.value))} style={selectStyle}>
                        {Array.from({ length: 5 }).map((_, i) => {
                            const y = today.getFullYear() - 1 + i
                            return <option key={y} value={y}>{y}</option>
                        })}
                    </select>
                </div>
            </header>

            {error && (
                <div style={{ color: '#b91c1c' }}>{error}</div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 12 }}>
                {/* Left: members list */}
                <div>
                    <div style={{ fontWeight: 700, marginBottom: 8 }}>Membres</div>
                    <div style={{ display: 'grid', gap: 8 }}>
                        {members.map(u => (
                            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 8, height: 8, borderRadius: 9999, background: '#a3a3a3' }} />
                                <div style={{ fontFamily: 'Spectral, serif', fontWeight: 600 }}>{u.firstName} {u.lastName}</div>
                            </div>
                        ))}
                        {members.length === 0 && (
                            <div style={{ color: '#6b7280' }}>Aucun membre</div>
                        )}
                    </div>
                    {/* Legend */}
                    <div style={{ marginTop: 30 }}>
                        <div style={{ fontWeight: 700, marginBottom: 8 }}>Légende</div>
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                            {fixedTypes.map(t => (
                                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                                    <span style={{ width: 10, height: 10, borderRadius: 9999, background: t.color }} />
                                    <span>{t.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: month grid per member */}
                <div style={{ overflowX: 'auto' }}>
                    <div style={{ minWidth: 700 }}>
                        {/* Header days */}
                        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${monthGrid.cells.length}, 1fr)`, gap: 6, marginLeft: 4 }}>
                            {monthGrid.cells.map((c, idx) => (
                                <div key={idx} style={{ textAlign: 'center', color: '#6b7280', fontSize: 12 }}>
                                    {c ? c.getDate() : ''}
                                </div>
                            ))}
                        </div>
                        {/* Rows */}
                        <div style={{ display: 'grid', gap: 6 }}>
                            {members.map(u => (
                                <div key={u.id} style={{ display: 'grid', gridTemplateColumns: `repeat(${monthGrid.cells.length}, 1fr)`, gap: 6 }}>
                                    {monthGrid.cells.map((c, idx) => {
                                        if (c === null) return <div key={`b${idx}`} />
                                        const ymd = toYMD(c)
                                        const slot0 = plansByUserDate[u.id]?.[ymd]?.['0']
                                        const slot1 = plansByUserDate[u.id]?.[ymd]?.['1']
                                        const color0 = slot0 ? colorForType(slot0.typeId) : undefined
                                        const color1 = slot1 ? colorForType(slot1.typeId) : undefined
                                        return (
                                            <div key={idx} style={{ height: 34, borderRadius: 6, border: '1px solid #e5e7eb', position: 'relative', background: '#ffffff', overflow: 'hidden' }}>
                                                {(slot0 || slot1) && (
                                                    <>
                                                        <div style={{ position: 'absolute', left: 0, top: 0, right: 0, height: '50%', background: slot0 ? (slot0.statut === 0 ? `${color0}66` : color0) : 'transparent' }} />
                                                        <div style={{ position: 'absolute', left: 0, bottom: 0, right: 0, height: '50%', background: slot1 ? (slot1.statut === 0 ? `${color1}66` : color1) : 'transparent' }} />
                                                    </>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            ))}
                            {members.length === 0 && (
                                <div style={{ color: '#6b7280', padding: 8 }}>Aucun membre à afficher</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Calendrier
