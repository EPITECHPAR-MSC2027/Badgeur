import authService from './authService'

// Utilities for date boundaries
function toStartOfDay(date) {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d
}

function toEndOfDay(date) {
    const d = new Date(date)
    d.setHours(23, 59, 59, 999)
    return d
}

// Monday as first day of week (ISO-like)
function startOfISOWeek(date) {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    const day = d.getDay() === 0 ? 7 : d.getDay() // 1..7 (Mon..Sun)
    const diff = day - 1
    d.setDate(d.getDate() - diff)
    return d
}

function endOfISOWeek(date) {
    const start = startOfISOWeek(date)
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    end.setHours(23, 59, 59, 999)
    return end
}

function isSameDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function groupEventsByDay(events) {
    return events.reduce((map, e) => {
        const d = new Date(e.badgedAt)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        if (!map[key]) map[key] = []
        map[key].push(e)
        return map
    }, {})
}

function sortByTimeAsc(events) {
    return [...events].sort((a, b) => new Date(a.badgedAt) - new Date(b.badgedAt))
}

// Compute day worked duration in milliseconds according to the rule:
// - Consider punches in the same day only
// - Sum (2nd - 1st) + (4th - 3rd) if present; ignore incomplete pairs beyond that
export function computeDayDurationMs(dayEvents) {
    const sorted = sortByTimeAsc(dayEvents)
    if (sorted.length < 2) return 0

    const times = sorted.map(e => new Date(e.badgedAt).getTime())
    let total = 0
    if (times[1] !== undefined) total += Math.max(0, times[1] - times[0])
    if (times[3] !== undefined && times[2] !== undefined) total += Math.max(0, times[3] - times[2])
    return total
}

// Label last action for the day based on count
// 1 -> "Entrée"; 2 -> "Pause déjeuné"; 3 -> "Après-midi"; 4 -> "Départ"; >4 -> derive by parity
export function getLastActionLabel(dayEvents) {
    const count = dayEvents.length
    if (count <= 0) return null
    if (count === 1) return 'Entrée'
    if (count === 2) return 'Pause déjeuné'
    if (count === 3) return 'Après-midi'
    if (count === 4) return 'Départ'
    // For more than 4 punches, alternate: odd -> return from break, even -> leaving
    return count % 2 === 1 ? 'Après-midi' : 'Départ'
}

export function computeWeekSummary(events, anyDateInWeek = new Date()) {
    const weekStart = startOfISOWeek(anyDateInWeek)
    const weekEnd = endOfISOWeek(anyDateInWeek)

    const weekEvents = events.filter(e => {
        const t = new Date(e.badgedAt)
        return t >= weekStart && t <= weekEnd
    })

    // Build per-day map
    const byDay = groupEventsByDay(weekEvents)

    // Ensure all 7 days of the week exist in the map
    for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart)
        d.setDate(weekStart.getDate() + i)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        if (!byDay[key]) byDay[key] = []
    }

    const daySummaries = Object.entries(byDay).map(([dayKey, dayEvents]) => {
        const sorted = sortByTimeAsc(dayEvents)
        const durationMs = computeDayDurationMs(sorted)
        const lastAction = getLastActionLabel(sorted)
        return { dayKey, punches: sorted, durationMs, lastAction }
    }).sort((a, b) => a.dayKey.localeCompare(b.dayKey))

    const totalWeekMs = daySummaries.reduce((acc, d) => acc + d.durationMs, 0)
    const fullDays = daySummaries.filter(d => d.punches.length === 4).length
    const absences = daySummaries.filter(d => d.punches.length === 0).length

    const targetMs = 35 * 60 * 60 * 1000 // 35h in ms
    const progress = targetMs > 0 ? Math.min(1, totalWeekMs / targetMs) : 0

    return {
        weekStart,
        weekEnd,
        totalWeekMs,
        targetMs,
        progress,
        fullDays,
        absences,
        daySummaries
    }
}

export async function fetchUserBadgeEvents(userId) {
    const response = await authService.get(`/badgeLogEvent/user/${userId}`)
    if (!response.ok) {
        const text = await response.text()
        throw new Error(`Erreur lors du chargement des événements: ${response.status} - ${text}`)
    }
    const data = await response.json()
    // Normalize structure: ensure { badgedAt, ... }
    return data
}

export async function computeTodayStats(userId, today = new Date()) {
    const all = await fetchUserBadgeEvents(userId)
    const eventsToday = all.filter(e => isSameDay(new Date(e.badgedAt), today))
    const durationMs = computeDayDurationMs(eventsToday)
    const lastAction = getLastActionLabel(eventsToday)
    return { durationMs, lastAction, punches: sortByTimeAsc(eventsToday) }
}

export async function computeWeekStats(userId, anyDateInWeek = new Date()) {
    const all = await fetchUserBadgeEvents(userId)
    return computeWeekSummary(all, anyDateInWeek)
}

export function formatDuration(ms) {
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    const pad = (n) => String(n).padStart(2, '0')
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

export default {
    fetchUserBadgeEvents,
    computeDayDurationMs,
    getLastActionLabel,
    computeWeekSummary,
    computeTodayStats,
    computeWeekStats,
    formatDuration
}


