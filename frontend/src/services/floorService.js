import authService from './authService';

const floorService = {
    /**
     * Get all floors
     * @returns {Promise<Array>} Array of floors
     */
    async getAllFloors() {
        const res = await authService.get('/floors');
        if (!res.ok) return [];
        return res.json();
    },

    /**
     * Get a floor by ID
     * @param {number} id - Floor ID
     * @returns {Promise<Object|null>} Floor object or null if not found
     */
    async getFloorById(id) {
        const res = await authService.get(`/floors/${id}`);
        if (!res.ok) return null;
        return res.json();
    },

    /**
     * Create a new floor
     * @param {Object} floorData - Floor data {floorNumber: number}
     * @returns {Promise<number|null>} Created floor ID or null if failed
     */
    async createFloor(floorData) {
        const res = await authService.post('/floors', floorData);
        if (!res.ok) return null;
        return res.json();
    },

    /**
     * Update a floor
     * @param {number} id - Floor ID
     * @param {Object} floorData - Floor data {floorNumber: number}
     * @returns {Promise<Object|null>} Updated floor or null if failed
     */
    async updateFloor(id, floorData) {
        const res = await authService.put(`/floors/${id}`, floorData);
        if (!res.ok) return null;
        return res.json();
    },

    /**
     * Delete a floor
     * @param {number} id - Floor ID
     * @returns {Promise<boolean>} True if successful, false otherwise
     */
    async deleteFloor(id) {
        const res = await authService.delete(`/floors/${id}`);
        return res.ok;
    }
};

export default floorService;

