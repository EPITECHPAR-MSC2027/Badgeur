import authService from './authService';

const vehiculeService = {
    /**
     * Get all vehicules
     * @returns {Promise<Array>} Array of vehicules
     */
    async getAllVehicules() {
        const res = await authService.get('/vehicules');
        if (!res.ok) return [];
        return res.json();
    },

    /**
     * Get a vehicule by ID
     * @param {number} id - Vehicule ID
     * @returns {Promise<Object|null>} Vehicule object or null if not found
     */
    async getVehiculeById(id) {
        const res = await authService.get(`/vehicules/${id}`);
        if (!res.ok) return null;
        return res.json();
    },

    /**
     * Create a new vehicule
     * @param {Object} vehiculeData - Vehicule data
     * @returns {Promise<number|null>} Created vehicule ID or null if failed
     */
    async createVehicule(vehiculeData) {
        const res = await authService.post('/vehicules', vehiculeData);
        if (!res.ok) return null;
        return res.json();
    },

    /**
     * Update a vehicule
     * @param {number} id - Vehicule ID
     * @param {Object} vehiculeData - Vehicule data
     * @returns {Promise<Object|null>} Updated vehicule or null if failed
     */
    async updateVehicule(id, vehiculeData) {
        const res = await authService.put(`/vehicules/${id}`, vehiculeData);
        if (!res.ok) return null;
        return res.json();
    },

    /**
     * Delete a vehicule
     * @param {number} id - Vehicule ID
     * @returns {Promise<boolean>} True if successful, false otherwise
     */
    async deleteVehicule(id) {
        const res = await authService.delete(`/vehicules/${id}`);
        return res.ok;
    },

    /**
     * Get all bookings
     * @returns {Promise<Array>} Array of bookings
     */
    async getAllBookings() {
        const res = await authService.get('/booking-vehicules');
        if (!res.ok) return [];
        return res.json();
    },

    /**
     * Get a booking by ID
     * @param {number} id - Booking ID
     * @returns {Promise<Object|null>} Booking object or null if not found
     */
    async getBookingById(id) {
        const res = await authService.get(`/booking-vehicules/${id}`);
        if (!res.ok) return null;
        return res.json();
    },

    /**
     * Get bookings by user ID
     * @param {number} userId - User ID
     * @returns {Promise<Array>} Array of bookings for the user
     */
    async getBookingsByUserId(userId) {
        const res = await authService.get(`/booking-vehicules/user/${userId}`);
        if (!res.ok) return [];
        return res.json();
    },

    /**
     * Get bookings by vehicule ID
     * @param {number} vehiculeId - Vehicule ID
     * @returns {Promise<Array>} Array of bookings for the vehicule
     */
    async getBookingsByVehiculeId(vehiculeId) {
        const res = await authService.get(`/booking-vehicules/vehicule/${vehiculeId}`);
        if (!res.ok) return [];
        return res.json();
    },

    /**
     * Create a new booking
     * @param {Object} bookingData - Booking data {idVehicule: number, userId: number, startDatetime: Date, endDatetime: Date}
     * @returns {Promise<number|null>} Created booking ID or null if failed
     */
    async createBooking(bookingData) {
        const res = await authService.post('/booking-vehicules', bookingData);
        if (!res.ok) {
            const error = await res.json().catch(() => ({ message: 'Erreur lors de la création de la réservation' }));
            throw new Error(error.message || 'Erreur lors de la création de la réservation');
        }
        return res.json();
    },

    /**
     * Update a booking
     * @param {number} id - Booking ID
     * @param {Object} bookingData - Booking data
     * @returns {Promise<Object|null>} Updated booking or null if failed
     */
    async updateBooking(id, bookingData) {
        const res = await authService.put(`/booking-vehicules/${id}`, bookingData);
        if (!res.ok) return null;
        return res.json();
    },

    /**
     * Delete a booking
     * @param {number} id - Booking ID
     * @returns {Promise<boolean>} True if successful, false otherwise
     */
    async deleteBooking(id) {
        const res = await authService.delete(`/booking-vehicules/${id}`);
        return res.ok;
    }
};

export default vehiculeService;

