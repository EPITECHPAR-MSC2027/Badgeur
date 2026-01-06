import React, { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import bookingRoomService from '../services/bookingRoomService'
import vehiculeService from '../services/vehiculeService'
import teamService from '../services/teamService'
import '../style/MyReservations.css'

function MyReservations() {
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedEvent, setSelectedEvent] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [participants, setParticipants] = useState([])
    const [allUsers, setAllUsers] = useState([])
    const [feedback, setFeedback] = useState(null)
    const [actionLoading, setActionLoading] = useState(false)

    const userId = parseInt(localStorage.getItem('userId'))

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            // Load users for participant names
            const users = await teamService.listUsers()
            setAllUsers(users)

            // Load vehicle bookings
            const vehicleBookings = await vehiculeService.getBookingsByUserId(userId)

            // Load room bookings (all bookings, then filter)
            const allRoomBookings = await bookingRoomService.list()

            // Filter room bookings where user is creator or participant
            const myRoomBookingIds = new Set()
            const participantChecks = await Promise.all(
                allRoomBookings.map(async (booking) => {
                    // Check if user is participant
                    const participants = await bookingRoomService.listParticipants(booking.id)
                    const isParticipant = participants.some(p => p.userId === userId)
                    const isCreator = booking.userId === userId

                    if (isCreator || isParticipant) {
                        myRoomBookingIds.add(booking.id)
                        return { ...booking, participants }
                    }
                    return null
                })
            )

            const myRoomBookings = participantChecks.filter(b => b !== null)

            // Convert to calendar events
            const vehicleEvents = vehicleBookings.map(booking => ({
                id: `vehicle-${booking.idBookingVehicule}`,
                title: `🚗 ${booking.destination}`,
                start: booking.startDatetime,
                end: booking.endDatetime,
                backgroundColor: '#3b82f6',
                borderColor: '#2563eb',
                extendedProps: {
                    type: 'vehicle',
                    bookingId: booking.idBookingVehicule,
                    destination: booking.destination,
                    vehiculeId: booking.idVehicule
                }
            }))

            const roomEvents = myRoomBookings.map(booking => ({
                id: `room-${booking.id}`,
                title: `📅 ${booking.title}`,
                start: booking.startDatetime,
                end: booking.endDatetime,
                backgroundColor: '#8b5cf6',
                borderColor: '#7c3aed',
                extendedProps: {
                    type: 'room',
                    bookingId: booking.id,
                    roomId: booking.roomId,
                    creatorId: booking.userId,
                    participants: booking.participants || []
                }
            }))

            setEvents([...vehicleEvents, ...roomEvents])
        } catch (error) {
            console.error('Error loading calendar data:', error)
            setFeedback({ type: 'error', message: 'Erreur de chargement des réservations' })
        } finally {
            setLoading(false)
        }
    }

    const handleEventClick = async (info) => {
        const event = info.event
        const props = event.extendedProps

        setSelectedEvent({
            id: event.id,
            title: event.title,
            start: event.start,
            end: event.end,
            type: props.type,
            ...props
        })

        // Load participants if it's a room booking
        if (props.type === 'room') {
            const participantList = await bookingRoomService.listParticipants(props.bookingId)
            setParticipants(participantList)
        }

        setShowModal(true)
    }

    const handleDeleteEvent = async () => {
        if (!selectedEvent) return

        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) {
            return
        }

        setActionLoading(true)
        try {
            if (selectedEvent.type === 'vehicle') {
                await vehiculeService.deleteBooking(selectedEvent.bookingId)
            } else {
                await bookingRoomService.remove(selectedEvent.bookingId)
            }

            setFeedback({ type: 'success', message: 'Réservation supprimée' })
            setShowModal(false)
            setSelectedEvent(null)
            await loadData()
        } catch (error) {
            setFeedback({ type: 'error', message: 'Erreur lors de la suppression' })
        } finally {
            setActionLoading(false)
        }
    }

    const handleParticipantResponse = async (participantId, status) => {
        setActionLoading(true)
        try {
            await bookingRoomService.updateParticipantStatus(participantId, status)

            // Reload participants
            const updated = await bookingRoomService.listParticipants(selectedEvent.bookingId)
            setParticipants(updated)

            setFeedback({
                type: 'success',
                message: status === 'accepted' ? 'Invitation acceptée' : 'Invitation refusée'
            })
        } catch (error) {
            setFeedback({ type: 'error', message: 'Erreur lors de la mise à jour' })
        } finally {
            setActionLoading(false)
        }
    }

    const getUserName = (userId) => {
        const user = allUsers.find(u => u.id === userId)
        return user ? `${user.firstName} ${user.lastName}` : 'Utilisateur inconnu'
    }

    const getMyParticipantStatus = () => {
        const myParticipant = participants.find(p => p.userId === userId)
        return myParticipant || null
    }

    return (
        <div className="my-reservations-container">
            <header className="reservations-header">
                <h1>Mes Réservations</h1>
                <p className="reservations-subtitle">
                    Calendrier unifié de vos véhicules et salles de réunion
                </p>
            </header>

            {feedback && (
                <div className={`feedback-banner ${feedback.type}`}>
                    {feedback.message}
                    <button onClick={() => setFeedback(null)}>✕</button>
                </div>
            )}

            {loading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Chargement du calendrier...</p>
                </div>
            ) : (
                <div className="calendar-wrapper">
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                        initialView="dayGridMonth"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek,listWeek'
                        }}
                        events={events}
                        eventClick={handleEventClick}
                        height="auto"
                        locale="fr"
                        buttonText={{
                            today: "Aujourd'hui",
                            month: 'Mois',
                            week: 'Semaine',
                            list: 'Liste'
                        }}
                        slotLabelFormat={{
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                        }}
                        eventTimeFormat={{
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                        }}
                    />
                </div>
            )}

            {/* Event Details Modal */}
            {showModal && selectedEvent && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{selectedEvent.title}</h2>
                            <button onClick={() => setShowModal(false)} className="modal-close">✕</button>
                        </div>

                        <div className="modal-body">
                            <div className="event-info">
                                <div className="info-row">
                                    <span className="info-label">Type:</span>
                                    <span className="info-value">
                                        {selectedEvent.type === 'vehicle' ? '🚗 Véhicule' : '📅 Salle de réunion'}
                                    </span>
                                </div>

                                <div className="info-row">
                                    <span className="info-label">Début:</span>
                                    <span className="info-value">
                                        {new Date(selectedEvent.start).toLocaleString('fr-FR')}
                                    </span>
                                </div>

                                <div className="info-row">
                                    <span className="info-label">Fin:</span>
                                    <span className="info-value">
                                        {new Date(selectedEvent.end).toLocaleString('fr-FR')}
                                    </span>
                                </div>

                                {selectedEvent.type === 'vehicle' && (
                                    <div className="info-row">
                                        <span className="info-label">Destination:</span>
                                        <span className="info-value">{selectedEvent.destination}</span>
                                    </div>
                                )}

                                {selectedEvent.type === 'room' && (
                                    <>
                                        <div className="info-row">
                                            <span className="info-label">Organisateur:</span>
                                            <span className="info-value">{getUserName(selectedEvent.creatorId)}</span>
                                        </div>

                                        <div className="participants-section">
                                            <h3>Participants ({participants.length})</h3>
                                            <div className="participants-list">
                                                {participants.map(p => (
                                                    <div key={p.id} className="participant-item">
                                                        <div className="participant-info">
                                                            <span className="participant-name">{getUserName(p.userId)}</span>
                                                            <span className={`participant-status ${p.status}`}>
                                                                {p.status === 'accepted' && '✅ Accepté'}
                                                                {p.status === 'declined' && '❌ Refusé'}
                                                                {p.status === 'pending' && '⏳ En attente'}
                                                            </span>
                                                        </div>

                                                        {p.userId === userId && p.status === 'pending' && (
                                                            <div className="participant-actions">
                                                                <button
                                                                    onClick={() => handleParticipantResponse(p.id, 'accepted')}
                                                                    disabled={actionLoading}
                                                                    className="btn-accept"
                                                                >
                                                                    ✓ Accepter
                                                                </button>
                                                                <button
                                                                    onClick={() => handleParticipantResponse(p.id, 'declined')}
                                                                    disabled={actionLoading}
                                                                    className="btn-decline"
                                                                >
                                                                    ✕ Refuser
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="modal-footer">
                            {(selectedEvent.type === 'vehicle' || selectedEvent.creatorId === userId) && (
                                <button
                                    onClick={handleDeleteEvent}
                                    disabled={actionLoading}
                                    className="btn-delete-reservation"
                                >
                                    🗑️ Supprimer la réservation
                                </button>
                            )}
                            <button onClick={() => setShowModal(false)} className="btn-close-modal">
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MyReservations