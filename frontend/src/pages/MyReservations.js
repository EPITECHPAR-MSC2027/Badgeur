/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import bookingRoomService from '../services/bookingRoomService'
import vehiculeService from '../services/vehiculeService'
import teamService from '../services/teamService'
import roomService from '../services/roomService'
import '../style/MyReservations.css'

function MyReservations() {
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedEvent, setSelectedEvent] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [participants, setParticipants] = useState([])
    const [allUsers, setAllUsers] = useState([])
    const [allRooms, setAllRooms] = useState([])
    const [feedback, setFeedback] = useState(null)
    const [actionLoading, setActionLoading] = useState(false)

    const userId = parseInt(localStorage.getItem('userId'))

    const loadData = useCallback(async () => {
        setLoading(true)
        try {
            const users = await teamService.listUsers()
            setAllUsers(users)

            const rooms = await roomService.getAllRooms()
            setAllRooms(rooms)

            const vehicleBookings = await vehiculeService.getBookingsByUserId(userId)

            const allRoomBookings = await bookingRoomService.list()

            // Filter room bookings where user is creator or participant
            const participantChecks = await Promise.all(
                allRoomBookings.map(async (booking) => {
                    // Check if user is participant
                    const participants = await bookingRoomService.listParticipants(booking.id)
                    const isParticipant = participants.some(p => p.userId === userId)
                    const isCreator = booking.userId === userId

                    if (isCreator || isParticipant) {
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

            const roomEvents = myRoomBookings.map(booking => {
                const room = rooms.find(r => r.id === booking.roomId)
                const roomName = room ? room.name : 'Salle inconnue'

                return {
                    id: `room-${booking.id}`,
                    title: `📅 ${booking.title} - ${roomName}`,
                    start: booking.startDatetime,
                    end: booking.endDatetime,
                    backgroundColor: '#8b5cf6',
                    borderColor: '#7c3aed',
                    extendedProps: {
                        type: 'room',
                        bookingId: booking.id,
                        roomId: booking.roomId,
                        roomName: roomName,
                        creatorId: booking.userId,
                        participants: booking.participants || []
                    }
                }
            })

            setEvents([...vehicleEvents, ...roomEvents])
        } catch (error) {
            console.error('Error loading calendar data:', error)
            setFeedback({ type: 'error', message: 'Erreur de chargement des réservations' })
        } finally {
            setLoading(false)
        }
    }, [userId])

    useEffect(() => {
        loadData()
    }, [loadData])

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

    const formatDateTime = (date) => {
        return new Date(date).toLocaleString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getDuration = (start, end) => {
        const diffMs = new Date(end) - new Date(start)
        const diffMins = Math.floor(diffMs / 60000)
        const hours = Math.floor(diffMins / 60)
        const minutes = diffMins % 60

        if (hours > 0 && minutes > 0) {
            return `${hours}h${minutes.toString().padStart(2, '0')}`
        } else if (hours > 0) {
            return `${hours}h`
        } else {
            return `${minutes} min`
        }
    }

    // Custom event content renderer to show time range
    const renderEventContent = (eventInfo) => {
        const startTime = formatTime(eventInfo.event.start)
        const endTime = formatTime(eventInfo.event.end)

        return (
            <div className="custom-event-content">
                <div className="event-time-range">{startTime} - {endTime}</div>
                <div className="event-title">{eventInfo.event.title}</div>
            </div>
        )
    }

    return (
        <div className="my-reservations-container" data-testid="reservations-container">
            <header className="reservations-header" data-testid="reservations-header">
                <h1 data-testid="page-title">Mes Réservations</h1>
                <p className="reservations-subtitle" data-testid="page-subtitle">
                    Calendrier unifié de vos véhicules et salles de réunion
                </p>
            </header>

            {feedback && (
                <div className={`feedback-banner ${feedback.type}`} data-testid="feedback-banner" data-feedback-type={feedback.type}>
                    <span data-testid="feedback-message">{feedback.message}</span>
                    <button onClick={() => setFeedback(null)} data-testid="feedback-close-button">✕</button>
                </div>
            )}

            {loading ? (
                <div className="loading-container" data-testid="loading-container">
                    <div className="loading-spinner" data-testid="loading-spinner"></div>
                    <p data-testid="loading-text">Chargement du calendrier...</p>
                </div>
            ) : (
                <div className="calendar-wrapper" data-testid="calendar-wrapper">
                    <FullCalendar
                        data-testid="fullcalendar"
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                        initialView="dayGridMonth"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek,listWeek'
                        }}
                        events={events}
                        eventClick={handleEventClick}
                        eventContent={renderEventContent}
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
                <div className="modal-overlay" onClick={() => setShowModal(false)} data-testid="modal-overlay">
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} data-testid="modal-content">
                        <div className="modal-header" data-testid="modal-header">
                            <h2 data-testid="modal-title">{selectedEvent.title}</h2>
                            <button onClick={() => setShowModal(false)} className="modal-close" data-testid="modal-close-button">✕</button>
                        </div>

                        <div className="modal-body" data-testid="modal-body">
                            <div className="event-info" data-testid="event-info">
                                <div className="info-row" data-testid="event-type-row">
                                    <span className="info-label" data-testid="type-label">Type:</span>
                                    <span className="info-value" data-testid="type-value">
                                        {selectedEvent.type === 'vehicle' ? '🚗 Véhicule' : '📅 Salle de réunion'}
                                    </span>
                                </div>

                                {selectedEvent.type === 'room' && (
                                    <div className="info-row" data-testid="room-name-row">
                                        <span className="info-label" data-testid="room-label">Salle:</span>
                                        <span className="info-value" data-testid="room-name-value">{selectedEvent.roomName}</span>
                                    </div>
                                )}

                                {selectedEvent.type === 'vehicle' && (
                                    <div className="info-row" data-testid="destination-row">
                                        <span className="info-label" data-testid="destination-label">Destination:</span>
                                        <span className="info-value" data-testid="destination-value">{selectedEvent.destination}</span>
                                    </div>
                                )}

                                <div className="info-row" data-testid="start-datetime-row">
                                    <span className="info-label" data-testid="start-label">Début:</span>
                                    <span className="info-value" data-testid="start-datetime-value">
                                        {formatDateTime(selectedEvent.start)}
                                    </span>
                                </div>

                                <div className="info-row" data-testid="end-datetime-row">
                                    <span className="info-label" data-testid="end-label">Fin:</span>
                                    <span className="info-value" data-testid="end-datetime-value">
                                        {formatDateTime(selectedEvent.end)}
                                    </span>
                                </div>

                                <div className="info-row" data-testid="duration-row">
                                    <span className="info-label" data-testid="duration-label">Durée:</span>
                                    <span className="info-value" data-testid="duration-value">
                                        {getDuration(selectedEvent.start, selectedEvent.end)}
                                    </span>
                                </div>

                                {selectedEvent.type === 'room' && (
                                    <>
                                        <div className="info-row" data-testid="organizer-row">
                                            <span className="info-label" data-testid="organizer-label">Organisateur:</span>
                                            <span className="info-value" data-testid="organizer-name">{getUserName(selectedEvent.creatorId)}</span>
                                        </div>

                                        <div className="participants-section" data-testid="participants-section">
                                            <h3 data-testid="participants-heading">Participants ({participants.length})</h3>
                                            <div className="participants-list" data-testid="participants-list">
                                                {participants.map((p, index) => (
                                                    <div key={p.id} className="participant-item" data-testid={`participant-item-${index}`}>
                                                        <div className="participant-info" data-testid={`participant-info-${index}`}>
                                                            <span className="participant-name" data-testid={`participant-name-${index}`}>{getUserName(p.userId)}</span>
                                                            <span className={`participant-status ${p.status}`} data-testid={`participant-status-${index}`} data-status={p.status}>
                                                                {p.status === 'accepted' && '✅ Accepté'}
                                                                {p.status === 'declined' && '❌ Refusé'}
                                                                {p.status === 'pending' && '⏳ En attente'}
                                                            </span>
                                                        </div>

                                                        {p.userId === userId && p.status === 'pending' && (
                                                            <div className="participant-actions" data-testid={`participant-actions-${index}`}>
                                                                <button
                                                                    onClick={() => handleParticipantResponse(p.id, 'accepted')}
                                                                    disabled={actionLoading}
                                                                    className="btn-accept"
                                                                    data-testid={`accept-button-${index}`}
                                                                >
                                                                    ✓ Accepter
                                                                </button>
                                                                <button
                                                                    onClick={() => handleParticipantResponse(p.id, 'declined')}
                                                                    disabled={actionLoading}
                                                                    className="btn-decline"
                                                                    data-testid={`decline-button-${index}`}
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

                        <div className="modal-footer" data-testid="modal-footer">
                            {(selectedEvent.type === 'vehicle' || selectedEvent.creatorId === userId) && (
                                <button
                                    onClick={handleDeleteEvent}
                                    disabled={actionLoading}
                                    className="btn-delete-reservation"
                                    data-testid="delete-button"
                                >
                                    🗑️ Supprimer la réservation
                                </button>
                            )}
                            <button onClick={() => setShowModal(false)} className="btn-close-modal" data-testid="close-modal-button">
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