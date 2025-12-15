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
        return res.json()
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
    }
}

export default bookingRoomService

