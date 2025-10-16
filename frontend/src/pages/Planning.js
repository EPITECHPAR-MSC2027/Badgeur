import React from 'react'

import planningService from '../services/planningService'

function Planning() {
    // Calendar range selection
    const today = new Date()
    const [currentYear, setCurrentYear] = React.useState(today.getFullYear())
    const [currentMonthIndex, setCurrentMonthIndex] = React.useState(today.getMonth()) // 0..11
    const [anchorDate, setAnchorDate] = React.useState(null) // Date object
    const [hoverDate, setHoverDate] = React.useState(null) // Date while dragging
    const [rangeStart, setRangeStart] = React.useState(null) // Date object
    const [rangeEnd, setRangeEnd] = React.useState(null) // Date object

    // Half-day selection like screenshot
    const [startHalf, setStartHalf] = React.useState('0') // '0' matin, '1' après-midi
    const [endHalf, setEndHalf] = React.useState('1')

    // Fixed type list (no fetch)
    const fixedTypes = [
        { id: 1, label: 'Présence au bureau', color: '#0b5fff' },
        { id: 2, label: 'Télétravail', color: '#fbbf24' },
        { id: 3, label: 'Congé payé', color: '#8b5cf6' },
        { id: 4, label: 'Déplacement professionnel', color: '#10b981' },
        { id: 5, label: 'Formation', color: '#06b6d4' }
    ]
    const [selectedTypeId, setSelectedTypeId] = React.useState(null)

    const [submitting, setSubmitting] = React.useState(false)
    const [feedback, setFeedback] = React.useState(null)
    const [submittedDays, setSubmittedDays] = React.useState({}) // key YYYY-MM-DD -> { typeId, statut }

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

    function isBetween(d, a, b) {
        if (!a || !b) return false
        const x = normalizeDateOnly(d).getTime()
        const s = normalizeDateOnly(a).getTime()
        const e = normalizeDateOnly(b).getTime()
        return x >= Math.min(s, e) && x <= Math.max(s, e)
    }

    // Build single month grid for current month
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

    function onDayMouseDown(dateObj) {
        const d = normalizeDateOnly(dateObj)
        setAnchorDate(d)
        setRangeStart(d)
        setRangeEnd(d)
        setHoverDate(d)
    }

    function onDayMouseEnter(dateObj) {
        if (!anchorDate) return
        const d = normalizeDateOnly(dateObj)
        setHoverDate(d)
        setRangeEnd(d)
    }

    function onGridMouseUp() {
        setAnchorDate(null)
    }

    function isWeekend(d) {
        const day = new Date(d).getDay()
        return day === 0 || day === 6
    }

    function getSelectedDates() {
        if (!rangeStart || !rangeEnd) return []
        const s = normalizeDateOnly(rangeStart)
        const e = normalizeDateOnly(rangeEnd)
        const acc = []
        const cursor = new Date(Math.min(s.getTime(), e.getTime()))
        const last = new Date(Math.max(s.getTime(), e.getTime()))
        while (cursor <= last) {
            if (!isWeekend(cursor)) acc.push(toYMD(cursor))
            cursor.setDate(cursor.getDate() + 1)
        }
        return acc
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setFeedback(null)

        const userIdStr = localStorage.getItem('userId')
        const userId = userIdStr ? Number(userIdStr) : null
        if (!userId) {
            setFeedback({ type: 'error', message: "Utilisateur non identifié." })
            return
        }

        const dates = getSelectedDates()
        if (dates.length === 0) {
            setFeedback({ type: 'error', message: "Veuillez choisir une date ou une plage valide." })
            return
        }
        if (!selectedTypeId) {
            setFeedback({ type: 'error', message: "Veuillez choisir un type de présence." })
            return
        }

        // Expand range into daily periods based on startHalf/endHalf
        const sDate = new Date(dates[0])
        const eDate = new Date(dates[dates.length - 1])
        const singleDay = dates.length === 1
        const payloads = []
        if (singleDay) {
            if (startHalf === endHalf) {
                payloads.push({ UserId: userId, Date: `${dates[0]}T00:00:00`, Period: startHalf, Statut: '0', TypeDemandeId: Number(selectedTypeId) })
            } else {
                payloads.push({ UserId: userId, Date: `${dates[0]}T00:00:00`, Period: '0', Statut: '0', TypeDemandeId: Number(selectedTypeId) })
                payloads.push({ UserId: userId, Date: `${dates[0]}T00:00:00`, Period: '1', Statut: '0', TypeDemandeId: Number(selectedTypeId) })
            }
        } else {
            // first day: startHalf only
            payloads.push({ UserId: userId, Date: `${toYMD(sDate)}T00:00:00`, Period: startHalf, Statut: '0', TypeDemandeId: Number(selectedTypeId) })
            // middle days: both halves
            if (dates.length > 2) {
                for (let i = 1; i < dates.length - 1; i++) {
                    payloads.push({ UserId: userId, Date: `${dates[i]}T00:00:00`, Period: '0', Statut: '0', TypeDemandeId: Number(selectedTypeId) })
                    payloads.push({ UserId: userId, Date: `${dates[i]}T00:00:00`, Period: '1', Statut: '0', TypeDemandeId: Number(selectedTypeId) })
                }
            }
            // last day: endHalf only
            payloads.push({ UserId: userId, Date: `${toYMD(eDate)}T00:00:00`, Period: endHalf, Statut: '0', TypeDemandeId: Number(selectedTypeId) })
        }

        setSubmitting(true)
        try {
            const results = await Promise.allSettled(payloads.map(pl => planningService.create(pl)))
            const rejected = results.filter(r => r.status === 'rejected')
            if (rejected.length === 0) {
                setFeedback({ type: 'success', message: "Demande envoyée avec succès." })
                // reset selection but keep mode
                setSelectedTypeId(null)
                setRangeStart(null)
                setRangeEnd(null)
                // mark calendar days with statut 0 (pending) and selected type
                setSubmittedDays(prev => {
                    const next = { ...prev }
                    dates.forEach(d => { next[d] = { typeId: Number(selectedTypeId), statut: 0 } })
                    return next
                })
            } else {
                setFeedback({ type: 'error', message: `${rejected.length}/${results.length} demandes ont échoué.` })
            }
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="App" style={{ padding: 16 }}>
            <header className="App-header" style={{ marginBottom: 16 }}>
                <h1>Demande de planning</h1>
            </header>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16, alignItems: 'start' }}>
                {/* Calendar with controls on the right */}
                <section onMouseUp={onGridMouseUp}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <div />
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <select value={currentMonthIndex} onChange={(e) => setCurrentMonthIndex(Number(e.target.value))}>
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <option key={i} value={i}>{new Date(2000, i, 1).toLocaleString('fr-FR', { month: 'long' })}</option>
                                ))}
                            </select>
                            <select value={currentYear} onChange={(e) => setCurrentYear(Number(e.target.value))}>
                                {Array.from({ length: 5 }).map((_, i) => {
                                    const y = today.getFullYear() - 1 + i
                                    return <option key={y} value={y}>{y}</option>
                                })}
                            </select>
                        </div>
                    </div>

                    <div style={{ minWidth: 260 }}>
                        <div style={{ fontWeight: 700, marginBottom: 8, textTransform: 'capitalize', textAlign: 'right' }}>
                            {new Date(monthGrid.year, monthGrid.monthIndex).toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
                            {['L','M','M','J','V','S','D'].map((d, i) => (
                                <div key={i} style={{ textAlign: 'center', color: '#6b7280', fontSize: 12 }}>{d}</div>
                            ))}
                            {monthGrid.cells.map((c, idx) => {
                                if (c === null) return <div key={`b${idx}`} />
                                const weekend = isWeekend(c)
                                const isSelected = !weekend && isBetween(c, rangeStart, rangeEnd)
                                const isEdge = isSelected && (
                                    normalizeDateOnly(c).getTime() === (rangeStart && normalizeDateOnly(rangeStart).getTime()) ||
                                    normalizeDateOnly(c).getTime() === (rangeEnd && normalizeDateOnly(rangeEnd).getTime())
                                )
                                // status coloring
                                const dayKey = toYMD(c)
                                const status = submittedDays[dayKey]
                                const color = status ? fixedTypes.find(t => t.id === status.typeId)?.color : undefined
                                const bg = status ? (status.statut === 0 ? `${color}22` : color) : (isSelected ? '#ede9fe' : '#ffffff')
                                const border = isEdge ? '2px solid #7c3aed' : '1px solid #e5e7eb'
                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        disabled={weekend}
                                        onMouseDown={() => !weekend && onDayMouseDown(c)}
                                        onMouseEnter={() => !weekend && onDayMouseEnter(c)}
                                        style={{
                                            height: 34,
                                            borderRadius: 6,
                                            border,
                                            background: bg,
                                            color: weekend ? '#9ca3af' : undefined,
                                            cursor: weekend ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        {c.getDate()}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </section>

                {/* Selection summary and half-days */}
                <section style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 12 }}>
                    <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
                        <div>
                            <div style={{ color: '#6b7280', fontSize: 12 }}>du</div>
                            <div style={{ fontWeight: 700 }}>{rangeStart ? toYMD(rangeStart) : '—'}</div>
                            <label style={{ display: 'block', marginTop: 8 }}>
                                <input type="radio" name="startHalf" value="0" checked={startHalf === '0'} onChange={() => setStartHalf('0')} /> <span style={{ marginLeft: 6 }}>Matin</span>
                            </label>
                            <label>
                                <input type="radio" name="startHalf" value="1" checked={startHalf === '1'} onChange={() => setStartHalf('1')} /> <span style={{ marginLeft: 6 }}>Après midi</span>
                            </label>
                        </div>
                        <div>
                            <div style={{ color: '#6b7280', fontSize: 12 }}>au</div>
                            <div style={{ fontWeight: 700 }}>{rangeEnd ? toYMD(rangeEnd) : '—'}</div>
                            <label style={{ display: 'block', marginTop: 8 }}>
                                <input type="radio" name="endHalf" value="0" checked={endHalf === '0'} onChange={() => setEndHalf('0')} /> <span style={{ marginLeft: 6 }}>Matin</span>
                            </label>
                            <label>
                                <input type="radio" name="endHalf" value="1" checked={endHalf === '1'} onChange={() => setEndHalf('1')} /> <span style={{ marginLeft: 6 }}>Après midi</span>
                            </label>
                        </div>
                    </div>
                </section>

                {/* Fixed type options + legend */}
                <section style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        {fixedTypes.map(t => (
                            <label key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #e5e7eb', padding: '8px 10px', borderRadius: 8, cursor: 'pointer' }}>
                                <input type="radio" name="typeId" value={t.id} checked={selectedTypeId === t.id} onChange={() => setSelectedTypeId(t.id)} />
                                <span style={{ width: 10, height: 10, borderRadius: 9999, background: t.color }} />
                                <span>{t.label}</span>
                            </label>
                        ))}
                    </div>
                </section>

                {feedback && (
                    <div style={{ color: feedback.type === 'error' ? '#b91c1c' : '#065f46' }}>
                        {feedback.message}
                    </div>
                )}

                <div>
                    <button type="submit" disabled={submitting} style={{ padding: '10px 16px', borderRadius: 8, background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer' }}>
                        {submitting ? 'Envoi...' : 'Valider la demande'}
                    </button>
                </div>
            </form>

            {/* No modal now; types inline */}
        </div>
    )
}

export default Planning
