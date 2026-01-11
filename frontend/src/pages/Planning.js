import React from 'react'
import '../index.css'

import planningService from '../services/planningService'
import notificationService from '../services/notificationService'
import teamService from '../services/teamService'

function Planning() {
    const today = new Date()
    const [currentYear, setCurrentYear] = React.useState(today.getFullYear())
    const [currentMonthIndex, setCurrentMonthIndex] = React.useState(today.getMonth()) // 0..11
    const [anchorDate, setAnchorDate] = React.useState(null) // Date object
    const [, setHoverDate] = React.useState(null) // Date while dragging
    const [rangeStart, setRangeStart] = React.useState(null) // Date object
    const [rangeEnd, setRangeEnd] = React.useState(null) // Date object

    const [startHalf, setStartHalf] = React.useState('0') // '0' matin, '1' après-midi
    const [endHalf, setEndHalf] = React.useState('1')

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
    const [submittedSlots, setSubmittedSlots] = React.useState({})
    const [refreshToggle, setRefreshToggle] = React.useState(false)

    const normalizeDateOnly = React.useCallback((d) => {
        const n = new Date(d)
        n.setHours(0, 0, 0, 0)
        return n
    }, [])

    const toYMD = React.useCallback((d) => {
        const n = normalizeDateOnly(d)
        const y = n.getFullYear()
        const m = String(n.getMonth() + 1).padStart(2, '0')
        const day = String(n.getDate()).padStart(2, '0')
        return `${y}-${m}-${day}`
    }, [normalizeDateOnly])

    const isBetween = (d, a, b) => {
        if (!a || !b) return false
        const x = normalizeDateOnly(d).getTime()
        const s = normalizeDateOnly(a).getTime()
        const e = normalizeDateOnly(b).getTime()
        return x >= Math.min(s, e) && x <= Math.max(s, e)
    }

    const isWeekend = (d) => {
        const day = new Date(d).getDay()
        return day === 0 || day === 6
    }

    const appStyle = {
        padding: 16,
        alignItems: 'start',
        marginTop: 16,
        width: '100%',
        boxSizing: 'border-box'
    }

    const formRowStyle = { display: 'flex', gap: 94, alignItems: 'flex-start', height: '100%', width: '100%', maxWidth: '1200px', padding: '0px 100px' }
    const leftColStyle = { flex: '1 1 0' }
    const rightColStyle = { width: 500, display: 'grid', gap: 16 }
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

    React.useEffect(() => {
        const userIdStr = localStorage.getItem('userId')
        const userId = userIdStr ? Number(userIdStr) : null
        if (!userId) return
        let cancelled = false
        async function load() {
            try {
                const records = await planningService.listByUser(userId)
                if (cancelled) return
                const perSlot = {}

                for (const r of records) {
                    const d = new Date(r.date ?? r.Date)
                    const ymd = toYMD(d)
                    const period = String(r.period ?? r.Period)
                    const statut = Number(r.statut ?? r.Statut ?? 0)
                    const typeId = Number(r.demandTypeId ?? r.DemandTypeId ?? r.typeDemandeId ?? r.TypeDemandeId)
                    if (!perSlot[ymd]) perSlot[ymd] = {}
                    perSlot[ymd][period] = { typeId, statut }
                }
                setSubmittedSlots(perSlot)
            } catch (_) {
                // ignore
            }
        }
        load()
        return () => { cancelled = true }
    }, [currentYear, currentMonthIndex, refreshToggle, toYMD])

    const onDayMouseDown = (dateObj) => {
        const d = normalizeDateOnly(dateObj)
        setAnchorDate(d)
        setRangeStart(d)
        setRangeEnd(d)
        setHoverDate(d)
    }

    const onDayMouseEnter = (dateObj) => {
        if (!anchorDate) return
        const d = normalizeDateOnly(dateObj)
        setHoverDate(d)
        setRangeEnd(d)
    }

    const onGridMouseUp = () => {
        setAnchorDate(null)
    }

    const getSelectedDates = () => {
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

    const getSelectedHalfSlots = () => {
        if (!rangeStart || !rangeEnd) return []
        const start = normalizeDateOnly(rangeStart)
        const end = normalizeDateOnly(rangeEnd)
        let d = new Date(Math.min(start.getTime(), end.getTime()))
        const endDate = new Date(Math.max(start.getTime(), end.getTime()))
        let half = Number(startHalf)
        const endHalfNum = Number(endHalf)
        const slots = []
        while (true) {
            if (!isWeekend(d)) slots.push({ date: toYMD(d), period: String(half) })
            if (toYMD(d) === toYMD(endDate) && half === endHalfNum) break
            half = (half + 1) % 2
            if (half === 0) {
                d = new Date(d)
                d.setDate(d.getDate() + 1)
            }
        }
        return slots
    }

    const handleSubmit = async (e) => {
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

        const slots = getSelectedHalfSlots()
        const roleId = Number(localStorage.getItem('roleId') || 0)
        const statutValue = roleId === 1 ? '1' : '0'

        const payloads = slots.map(s => ({
            UserId: userId,
            Date: `${s.date}T12:00:00`,
            Period: s.period,
            Statut: statutValue,
            TypeDemandeId: Number(selectedTypeId)
        }))

        setSubmitting(true)
        try {
            const results = await Promise.allSettled(payloads.map(pl => planningService.create(pl)))
            const rejected = results.filter(r => r.status === 'rejected')
            if (rejected.length === 0) {
                setFeedback({ type: 'success', message: "Demande envoyée avec succès." })

                if (roleId === 0) {
                    try {
                        const allUsers = await teamService.listUsers()
                        const managers = allUsers.filter(u => u.roleId === 1)
                        const employeeFirstName = localStorage.getItem('firstName') || ''
                        const employeeLastName = localStorage.getItem('lastName') || ''
                        const employeeName = `${employeeFirstName} ${employeeLastName}`.trim() || 'Un employé'
                        const typeLabel = fixedTypes.find(t => t.id === selectedTypeId)?.label || 'demande'
                        const slotsCount = slots.length
                        const message = `${employeeName} a fait une nouvelle demande de planning : ${typeLabel} (${slotsCount} créneau${slotsCount > 1 ? 'x' : ''})`

                        await Promise.all(managers.map(manager =>
                            notificationService.createNotification({
                                userId: manager.id,
                                message: message,
                                type: 'planning_request',
                                relatedId: userId
                            }).catch(err => console.error(`Erreur notification manager ${manager.id}:`, err))
                        ))
                    } catch (notifError) {
                        console.error('Erreur lors de la création des notifications:', notifError)
                    }
                }

                setSelectedTypeId(null)
                setRangeStart(null)
                setRangeEnd(null)
                setRefreshToggle(t => !t)
            } else {
                setFeedback({ type: 'error', message: `${rejected.length}/${results.length} demandes ont échoué.` })
            }
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="App" style={appStyle} data-testid="planning-container">
            <header className="App-header" style={{ marginBottom: 16 }}>
                <h1 data-testid="planning-title">Demande de planning</h1>
            </header>

            <form onSubmit={handleSubmit} style={formRowStyle} data-testid="planning-form">
                <section style={leftColStyle} onMouseUp={onGridMouseUp} data-testid="calendar-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <div />
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', color:'var(--color-text)' }}>
                            <select
                                value={currentMonthIndex}
                                onChange={(e) => setCurrentMonthIndex(Number(e.target.value))}
                                style={selectStyle}
                                data-testid="month-select"
                            >
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <option key={i} value={i}>{new Date(2000, i, 1).toLocaleString('fr-FR', { month: 'long' })}</option>
                                ))}
                            </select>
                            <select
                                value={currentYear}
                                onChange={(e) => setCurrentYear(Number(e.target.value))}
                                style={selectStyle}
                                data-testid="year-select"
                            >
                                {Array.from({ length: 5 }).map((_, i) => {
                                    const y = today.getFullYear() - 1 + i
                                    return <option key={y} value={y}>{y}</option>
                                })}
                            </select>
                        </div>
                    </div>

                    <div style={{ minWidth: 260 }}>
                        <div style={{ fontWeight: 700, marginBottom: 8, textTransform: 'capitalize', textAlign: 'right', fontFamily: 'Alata, sans-serif' }} data-testid="current-month-display">
                            {new Date(monthGrid.year, monthGrid.monthIndex).toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }} data-testid="calendar-grid">
                            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                                <div key={i} style={{ textAlign: 'center', color: 'var(--color-text)', fontSize: 12 }} data-testid={`day-header-${i}`}>{d}</div>
                            ))}
                            {monthGrid.cells.map((c, idx) => {
                                if (c === null) return <div key={`b${idx}`} data-testid={`blank-cell-${idx}`} />
                                const weekend = isWeekend(c)
                                const isSelected = !weekend && isBetween(c, rangeStart, rangeEnd)
                                const isEdge = isSelected && (
                                    normalizeDateOnly(c).getTime() === (rangeStart && normalizeDateOnly(rangeStart).getTime()) ||
                                    normalizeDateOnly(c).getTime() === (rangeEnd && normalizeDateOnly(rangeEnd).getTime())
                                )
                                const dayKey = toYMD(c)
                                const slot0 = submittedSlots[dayKey]?.['0']
                                const slot1 = submittedSlots[dayKey]?.['1']
                                const color0 = slot0 && slot0.statut !== 2 ? fixedTypes.find(t => t.id === slot0.typeId)?.color : undefined
                                const color1 = slot1 && slot1.statut !== 2 ? fixedTypes.find(t => t.id === slot1.typeId)?.color : undefined
                                const bgDefault = isSelected ? '#ede9fe' : '#ffffff'
                                const border = isEdge ? '2px solid #7c3aed' : '1px solid #e5e7eb'
                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        disabled={weekend}
                                        onMouseDown={() => !weekend && onDayMouseDown(c)}
                                        onMouseEnter={() => !weekend && onDayMouseEnter(c)}
                                        style={{
                                            height: 65,
                                            borderRadius: 6,
                                            border,
                                            background: bgDefault,
                                            position: 'relative',
                                            color: weekend ? '#9ca3af' : undefined,
                                            cursor: weekend ? 'not-allowed' : 'pointer',
                                            overflow: 'hidden'
                                        }}
                                        data-testid={`calendar-day-${c.getDate()}`}
                                        data-weekend={weekend}
                                        data-selected={isSelected}
                                    >
                                        {(slot0 || slot1) && (
                                            <>
                                                <div style={{ position: 'absolute', left: 0, top: 0, right: 0, height: '50%', background: color0 ? (slot0.statut === 0 ? `${color0}66` : color0) : 'transparent' }} data-testid={`day-${c.getDate()}-morning-slot`} />
                                                <div style={{ position: 'absolute', left: 0, bottom: 0, right: 0, height: '50%', background: color1 ? (slot1.statut === 0 ? `${color1}66` : color1) : 'transparent' }} data-testid={`day-${c.getDate()}-afternoon-slot`} />
                                            </>
                                        )}
                                        <span style={{ position: 'relative' }}>{c.getDate()}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </section>

                <div style={rightColStyle} data-testid="controls-section">
                    <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 12 }} data-testid="date-range-selector">
                        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
                            <div>
                                <div style={{ color: 'var(--color-third-text)', fontSize: 14, fontFamily: 'Fustat, sans-serif' }}>du</div>
                                <div style={{ fontWeight: 700,color:'var(--color-text)' }} data-testid="range-start-display">{rangeStart ? toYMD(rangeStart) : '—'}</div>
                                <label style={{ display: 'block', marginTop: 8,color:'var(--color-text)' }}>
                                    <input type="radio" name="startHalf" value="0" checked={startHalf === '0'} onChange={() => setStartHalf('0')} data-testid="start-half-morning" /> <span style={{ marginLeft: 6, fontFamily: 'Fustat, sans-serif' }}>Matin</span>
                                </label>
                                <label style={{color:'var(--color-text)'}}>
                                    <input type="radio" name="startHalf" value="1" checked={startHalf === '1'} onChange={() => setStartHalf('1')} data-testid="start-half-afternoon" /> <span style={{ marginLeft: 6, fontFamily: 'Fustat, sans-serif' }}>Après midi</span>
                                </label>
                            </div>
                            <div>
                                <div style={{ color: 'var(--color-third-text)', fontSize: 14, fontFamily: 'Fustat, sans-serif' }}>au</div>
                                <div style={{ fontWeight: 700,color:'var(--color-text)' }} data-testid="range-end-display">{rangeEnd ? toYMD(rangeEnd) : '—'}</div>
                                <label style={{ display: 'block', marginTop: 8,color:'var(--color-text)' }}>
                                    <input type="radio" name="endHalf" value="0" checked={endHalf === '0'} onChange={() => setEndHalf('0')} data-testid="end-half-morning" /> <span style={{ marginLeft: 6, fontFamily: 'Fustat, sans-serif' }}>Matin</span>
                                </label>
                                <label style={{color:'var(--color-text)'}}>
                                    <input type="radio" name="endHalf" value="1" checked={endHalf === '1'} onChange={() => setEndHalf('1')} data-testid="end-half-afternoon" /> <span style={{ marginLeft: 6, fontFamily: 'Fustat, sans-serif' }}>Après midi</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }} data-testid="type-selector">
                        <p style={{ fontFamily: 'Fustat, sans-serif', color: 'var(--color-third-text)', margin: '0' }}>Type de demande</p>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            {fixedTypes.map(t => (
                                <label key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #d0d1d3ff', padding: '8px 10px', borderRadius: 8, cursor: 'pointer', fontFamily: 'Fustat, sans-serif',color:'var(--color-text)' }} data-testid={`type-option-${t.id}`}>
                                    <input type="radio" name="typeId" value={t.id} checked={selectedTypeId === t.id} onChange={() => setSelectedTypeId(t.id)} data-testid={`type-radio-${t.id}`} />
                                    <span style={{ width: 10, height: 10, borderRadius: 9999, background: t.color }} />
                                    <span>{t.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {feedback && (
                        <div style={{ color: feedback.type === 'error' ? '#b91c1c' : '#065f46' }} data-testid="feedback-message" data-feedback-type={feedback.type}>
                            {feedback.message}
                        </div>
                    )}

                    <div>
                        <button type="submit" disabled={submitting} style={{ padding: '10px 16px', borderRadius: 8, background: 'var(--color-primary)', color: 'var(--color-text)', border: 'none', cursor: 'pointer' }} data-testid="submit-button">
                            {submitting ? 'Envoi...' : 'Valider la demande'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default Planning