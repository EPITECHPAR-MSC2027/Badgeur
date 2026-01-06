import React from 'react'
import roomService from '../services/roomService'
import bookingRoomService from '../services/bookingRoomService'
import teamService from '../services/teamService'

const tagStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 8px',
    borderRadius: 999,
    background: '#ecf2ff',
    color: '#1d4ed8',
    fontSize: 12,
    fontWeight: 700
}

function FeatureTag({ icon, label }) {
    return (
        <span style={tagStyle}>
            <span aria-hidden>{icon}</span>
            {label}
        </span>
    )
}

function BookingRoom() {
    const [rooms, setRooms] = React.useState([])
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState('')
    const [selectedRoom, setSelectedRoom] = React.useState(null)
    const [title, setTitle] = React.useState('')
    const [start, setStart] = React.useState('')
    const [end, setEnd] = React.useState('')
    const [submitting, setSubmitting] = React.useState(false)
    const [feedback, setFeedback] = React.useState(null)
    
    // Participants
    const [allUsers, setAllUsers] = React.useState([])
    const [searchQuery, setSearchQuery] = React.useState('')
    const [selectedParticipants, setSelectedParticipants] = React.useState([])
    const [showUserSearch, setShowUserSearch] = React.useState(false)

    React.useEffect(() => {
        let cancelled = false
        async function load() {
            setLoading(true)
            setError('')
            try {
                const [roomsData, usersData] = await Promise.all([
                    roomService.getAllRooms(),
                    teamService.listUsers()
                ])
                if (!cancelled) {
                    setRooms(roomsData)
                    setAllUsers(usersData || [])
                }
            } catch (e) {
                if (!cancelled) setError(e.message || 'Chargement impossible.')
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => { cancelled = true }
    }, [])

    function defaultDateTime(offsetHours = 1) {
        const d = new Date()
        d.setHours(d.getHours() + offsetHours)
        d.setMinutes(0, 0, 0)
        const iso = d.toISOString()
        return iso.slice(0, 16)
    }

    React.useEffect(() => {
        setStart(defaultDateTime(1))
        setEnd(defaultDateTime(2))
    }, [])

    const cardStyle = {
        border: '1px solid #e5e7eb',
        borderRadius: 10,
        padding: 12,
        display: 'grid',
        gap: 8,
        cursor: 'pointer',
        background: 'white',
        boxShadow: '0 6px 14px rgba(0,0,0,0.06)'
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setFeedback(null)
        const userId = Number(localStorage.getItem('userId'))
        if (!userId) {
            setFeedback({ type: 'error', message: 'Utilisateur non identifié.' })
            return
        }
        if (!selectedRoom) {
            setFeedback({ type: 'error', message: 'Choisissez une salle.' })
            return
        }
        if (!title.trim()) {
            setFeedback({ type: 'error', message: 'Indiquez un titre.' })
            return
        }
        if (!start || !end) {
            setFeedback({ type: 'error', message: 'Définissez un créneau.' })
            return
        }
        const startDate = new Date(start)
        const endDate = new Date(end)
        if (endDate <= startDate) {
            setFeedback({ type: 'error', message: 'Fin doit être après début.' })
            return
        }

        setSubmitting(true)
        try {
            // Créer la réservation
            const bookingResponse = await bookingRoomService.create({
                UserId: userId,
                RoomId: selectedRoom.id ?? selectedRoom.Id,
                Title: title.trim(),
                StartDatetime: startDate.toISOString(),
                EndDatetime: endDate.toISOString()
            })
            
            console.log('Réponse complète du backend:', bookingResponse)
            
            // Récupérer l'ID depuis la réponse
            const bookingId = bookingResponse; // Booking response is the ID directly
            
            if (isNaN(bookingId)) {
                console.error('Impossible de récupérer l\'ID. Résultat reçu:', bookingResponse)
                throw new Error('Impossible de récupérer l\'ID de la réservation.')
            }
            
            console.log('✅ ID de la réservation récupéré:', bookingId)
            
            // Créer le participant organisateur (créateur)
            await bookingRoomService.addParticipant({
                BookingId: bookingId,
                UserId: userId,
                Role: 'organisateur',
                Status: 'accepté'
            })
            
            // Créer les participants invités
            if (selectedParticipants.length > 0) {
                const participantPromises = selectedParticipants.map(p => 
                    bookingRoomService.addParticipant({
                        BookingId: bookingId,
                        UserId: p.userId,
                        Role: p.role,
                        Status: 'non répondu'
                    })
                )
                await Promise.all(participantPromises)
            }
            
            setFeedback({ type: 'success', message: 'Réservation créée avec succès.' })
            setTitle('')
            setSelectedParticipants([])
            setSelectedRoom(null)
        } catch (err) {
            setFeedback({ type: 'error', message: err.message || 'Erreur lors de la réservation.' })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div style={{ padding: 16 }}>
            <header style={{ marginBottom: 50 }}>
                <h1 style={{ margin: 0 }}>Réserver une salle</h1>
                <p style={{ margin: 0, color: '#6b7280' }}>Choisissez une salle puis définissez le créneau.</p>
            </header>

            {error && <div style={{ color: '#b91c1c', marginBottom: 12 }}>{error}</div>}
            {loading && <div style={{ color: '#6b7280', marginBottom: 12 }}>Chargement...</div>}

            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '2fr 1fr' }}>
                <div>
                    <h3 style={{ margin: '0 0 8px 0' }}>Salles</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
                        {rooms.map(r => {
                            const id = r.id ?? r.Id
                            const isSelected = selectedRoom && (selectedRoom.id ?? selectedRoom.Id) === id
                            return (
                                <div
                                    key={id}
                                    onClick={() => setSelectedRoom(r)}
                                    style={{
                                        ...cardStyle,
                                        border: isSelected ? '2px solid #2563eb' : cardStyle.border,
                                        boxShadow: isSelected ? '0 8px 18px rgba(37,99,235,0.18)' : cardStyle.boxShadow
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontWeight: 700 }}>{r.name ?? r.Name}</div>
                                        <div style={{ color: '#6b7280', fontSize: 13 }}>Capacité {r.capacity ?? r.Capacity}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        {(r.has_largescreen ?? r.hasLargeScreen ?? r.HasLargeScreen) && <FeatureTag icon="🖥️" label="Écran" />}
                                        {(r.has_board ?? r.hasBoard ?? r.HasBoard) && <FeatureTag icon="🧑‍🏫" label="Tableau" />}
                                        {(r.has_mic ?? r.hasMic ?? r.HasMic) && <FeatureTag icon="🎤" label="Micro" />}
                                    </div>
                                    <div style={{ color: '#6b7280', fontSize: 13 }}>Étage: {r.id_floor ?? r.IdFloor}</div>
                                </div>
                            )
                        })}
                        {rooms.length === 0 && !loading && (
                            <div style={{ color: '#9ca3af' }}>Aucune salle disponible.</div>
                        )}
                    </div>
                </div>

                <div>
                    <h3 style={{ margin: '0 0 8px 0' }}>Créneau</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 10, border: '1px solid #e5e7eb', borderRadius: 10, padding: 12 }}>
                        <div style={{ display: 'grid', gap: 6 }}>
                            <label style={{ fontWeight: 700 }}>Titre</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Réunion projet"
                                style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }}
                            />
                        </div>
                        <div style={{ display: 'grid', gap: 6 }}>
                            <label style={{ fontWeight: 700 }}>Début</label>
                            <input
                                type="datetime-local"
                                value={start}
                                onChange={(e) => setStart(e.target.value)}
                                style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }}
                            />
                        </div>
                        <div style={{ display: 'grid', gap: 6 }}>
                            <label style={{ fontWeight: 700 }}>Fin</label>
                            <input
                                type="datetime-local"
                                value={end}
                                onChange={(e) => setEnd(e.target.value)}
                                style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }}
                            />
                        </div>
                        
                        {/* Section Participants */}
                        <div style={{ display: 'grid', gap: 8, borderTop: '1px solid #e5e7eb', paddingTop: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label style={{ fontWeight: 700 }}>Participants</label>
                                <button
                                    type="button"
                                    onClick={() => setShowUserSearch(!showUserSearch)}
                                    style={{
                                        padding: '6px 12px',
                                        borderRadius: 6,
                                        border: '1px solid #d1d5db',
                                        background: 'white',
                                        cursor: 'pointer',
                                        fontSize: 13
                                    }}
                                >
                                    {showUserSearch ? 'Masquer' : '+ Ajouter'}
                                </button>
                            </div>
                            
                            {showUserSearch && (
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        placeholder="Rechercher un employé..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: 8,
                                            borderRadius: 6,
                                            border: '1px solid #d1d5db',
                                            fontSize: 14
                                        }}
                                    />
                                    {searchQuery && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: 0,
                                            right: 0,
                                            background: 'white',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: 6,
                                            marginTop: 4,
                                            maxHeight: 200,
                                            overflowY: 'auto',
                                            zIndex: 10,
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }}>
                                            {allUsers
                                                .filter(u => {
                                                    const query = searchQuery.toLowerCase()
                                                    const name = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase()
                                                    const email = (u.email || '').toLowerCase()
                                                    return (name.includes(query) || email.includes(query)) &&
                                                           !selectedParticipants.some(p => p.userId === (u.id || u.Id))
                                                })
                                                .slice(0, 10)
                                                .map(u => (
                                                    <div
                                                        key={u.id || u.Id}
                                                        onClick={() => {
                                                            const newParticipant = {
                                                                userId: u.id || u.Id,
                                                                firstName: u.firstName,
                                                                lastName: u.lastName,
                                                                email: u.email,
                                                                role: 'invité'
                                                            }
                                                            setSelectedParticipants([...selectedParticipants, newParticipant])
                                                            setSearchQuery('')
                                                        }}
                                                        style={{
                                                            padding: '8px 12px',
                                                            cursor: 'pointer',
                                                            borderBottom: '1px solid #f3f4f6'
                                                        }}
                                                        onMouseEnter={(e) => e.target.style.background = '#f9fafb'}
                                                        onMouseLeave={(e) => e.target.style.background = 'white'}
                                                    >
                                                        <div style={{ fontWeight: 600, fontSize: 14 }}>
                                                            {u.firstName} {u.lastName}
                                                        </div>
                                                        <div style={{ fontSize: 12, color: '#6b7280' }}>{u.email}</div>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {selectedParticipants.length > 0 && (
                                <div style={{ display: 'grid', gap: 6 }}>
                                    {selectedParticipants.map((p, idx) => (
                                        <div
                                            key={idx}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: 8,
                                                background: '#f9fafb',
                                                borderRadius: 6,
                                                border: '1px solid #e5e7eb'
                                            }}
                                        >
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: 14 }}>
                                                    {p.firstName} {p.lastName}
                                                </div>
                                                <div style={{ fontSize: 12, color: '#6b7280' }}>{p.email}</div>
                                            </div>
                                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                                <select
                                                    value={p.role}
                                                    onChange={(e) => {
                                                        const updated = [...selectedParticipants]
                                                        updated[idx].role = e.target.value
                                                        setSelectedParticipants(updated)
                                                    }}
                                                    style={{
                                                        padding: '4px 8px',
                                                        borderRadius: 4,
                                                        border: '1px solid #d1d5db',
                                                        fontSize: 13,
                                                        background: 'white'
                                                    }}
                                                >
                                                    <option value="obligatoire">Obligatoire</option>
                                                    <option value="optionnel">Optionnel</option>
                                                </select>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedParticipants(selectedParticipants.filter((_, i) => i !== idx))
                                                    }}
                                                    style={{
                                                        padding: '4px 8px',
                                                        borderRadius: 4,
                                                        border: '1px solid #dc2626',
                                                        background: 'white',
                                                        color: '#dc2626',
                                                        cursor: 'pointer',
                                                        fontSize: 12
                                                    }}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        {selectedRoom && (
                            <div style={{ padding: 10, borderRadius: 8, background: '#f3f4f6', color: '#374151', fontSize: 14 }}>
                                Salle sélectionnée : <strong>{selectedRoom.name ?? selectedRoom.Name}</strong>
                            </div>
                        )}
                        {feedback && (
                            <div style={{ color: feedback.type === 'error' ? '#b91c1c' : '#065f46' }}>
                                {feedback.message}
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={submitting}
                            style={{ padding: '10px 16px', borderRadius: 8, background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer' }}
                        >
                            {submitting ? 'Réservation...' : 'Réserver'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default BookingRoom