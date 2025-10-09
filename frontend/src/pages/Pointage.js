import React, { useEffect, useMemo, useRef, useState } from 'react'

function formatDuration(totalMs) {
    const totalSeconds = Math.floor(totalMs / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    const pad = (n) => String(n).padStart(2, '0')
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

function Pointage() {
    const [mode, setMode] = useState('stopped') // 'stopped' | 'work' | 'break'
    const [workElapsed, setWorkElapsed] = useState(0)
    const [breakElapsed, setBreakElapsed] = useState(0)

    const tickStartRef = useRef(null) // timestamp where current mode started

    // Start ticking when in work or break mode
    useEffect(() => {
        if (mode === 'stopped') {
            tickStartRef.current = null
            return
        }

        tickStartRef.current = performance.now()
        const interval = setInterval(() => {
            const now = performance.now()
            const delta = now - (tickStartRef.current || now)
            tickStartRef.current = now
            if (mode === 'work') {
                setWorkElapsed((prev) => prev + delta)
            } else if (mode === 'break') {
                setBreakElapsed((prev) => prev + delta)
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [mode])

    const statusText = useMemo(() => {
        if (mode === 'work') return 'En travail'
        if (mode === 'break') return 'En pause'
        return 'Prêt à commencer'
    }, [mode])

    const primaryAction = useMemo(() => {
        if (mode === 'stopped') return { label: 'Démarrer le travail', action: () => setMode('work'), kind: 'start' }
        if (mode === 'work') return { label: 'Mettre en pause', action: () => setMode('break'), kind: 'pause' }
        return { label: 'Reprendre le travail', action: () => setMode('work'), kind: 'resume' }
    }, [mode])

    const stopDay = () => {
        setMode('stopped')
    }

    const resetToday = () => {
        setMode('stopped')
        setWorkElapsed(0)
        setBreakElapsed(0)
    }

    return (
        <div>
            <h1>Pointage</h1>
            <p style={{ color: 'var(--color-second-text)', marginTop: -10 }}>Gérez votre temps de travail et vos pauses</p>

            <div className="punch-card">
                <div className="timer-big">{formatDuration(workElapsed)}</div>
                <div className="status-text">{statusText}</div>

                <div className="time-grid">
                    <div className="time-box">
                        <div className="time-box-title">Temps de travail</div>
                        <div className="time-box-value">{formatDuration(workElapsed)}</div>
                    </div>
                    <div className="time-box">
                        <div className="time-box-title">Temps de pause</div>
                        <div className="time-box-value">{formatDuration(breakElapsed)}</div>
                    </div>
                </div>

                <div className="actions-row">
                    <button
                        className={`primary-btn ${primaryAction.kind}`}
                        onClick={primaryAction.action}
                    >
                        {mode === 'stopped' ? '▶' : mode === 'work' ? '⏸' : '▶'} {primaryAction.label}
                    </button>
                    <button className="ghost-btn" onClick={stopDay} disabled={mode === 'stopped'}>
                        Arrêter
                    </button>
                    <button className="ghost-btn" onClick={resetToday}>
                        Réinitialiser
                    </button>
                </div>
            </div>

            <div className="history-card">
                <h2>Historique du jour</h2>
                <div className="history-row">
                    <span className="history-label">Statut actuel</span>
                    <span className="history-value">{mode === 'stopped' ? 'Arrêté' : mode === 'work' ? 'En travail' : 'En pause'}</span>
                </div>
                <div className="history-row">
                    <span className="history-label">Temps total travaillé</span>
                    <span className="history-value">{formatDuration(workElapsed)}</span>
                </div>
                <div className="history-row">
                    <span className="history-label">Temps de pause total</span>
                    <span className="history-value">{formatDuration(breakElapsed)}</span>
                </div>
            </div>
        </div>
    )
}

export default Pointage

