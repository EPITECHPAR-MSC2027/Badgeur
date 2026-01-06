import authService from './authService'

const bookingRoomService = {
    async list() {
        const res = await authService.get('/booking-rooms')

        if (!res.ok) return []
        return res.json()
    },
    async get(id) {
        const res = await authService.get(`/booking-rooms/${id}`)

        if (!res.ok) return null
        return res.json()
    },
    async create(data) {
        const res = await authService.post('/booking-rooms', data)

        if (!res.ok) throw new Error('Création de réservation échouée')
        const result = await res.json()
        
        console.log('Réponse brute de l\'API:', result)
        
        // Le backend retourne maintenant un objet BookingRoomResponse complet
        // On le retourne tel quel
        return result
    },
    async update(id, data) {
        const res = await authService.put(`/booking-rooms/${id}`, data)

        if (!res.ok) throw new Error('Mise à jour de réservation échouée')
        return res.json()
    },
    async remove(id) {
        const res = await authService.delete(`/booking-rooms/${id}`)

        if (!res.ok) throw new Error('Suppression de réservation échouée')
        return true
    },
    async listParticipants(bookingId) {
        const res = await authService.get(`/booking-rooms/${bookingId}/participants`)

        if (!res.ok) return []
        return res.json()
    },
    async addParticipant(data) {
        const res = await authService.post('/booking-rooms/participants', data)

        if (!res.ok) throw new Error('Ajout de participant échoué')
        return res.json()
    },
    async listByUser(userId) {
        const res = await authService.get(`/booking-rooms/user/${userId}`)

        if (!res.ok) return []
        return res.json()
    },
    async listByRoom(roomId) {
        const res = await authService.get(`/booking-rooms/room/${roomId}`)

        if (!res.ok) return []
        return res.json()
    },
    async updateParticipantStatus(participantId, status) {
        const res = await authService.patch(`/booking-rooms/participants/${participantId}/status`, { status })

        if (!res.ok) throw new Error('Mise à jour du statut échouée')
        return true
    },
    async getMyParticipantStatus(bookingId, userId) {
        const res = await authService.get(`/booking-rooms/${bookingId}/participant/${userId}`)

        if (!res.ok) return null
        return res.json()
    },
    async getRooms() {
        const res = await authService.get('/booking-rooms/rooms')

        if (!res.ok) return []
        return res.json()
    }
}

export default bookingRoomService