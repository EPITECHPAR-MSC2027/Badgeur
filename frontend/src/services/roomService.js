import authService from './authService';

const roomService = {
    /**
     * Get all rooms
     * @returns {Promise<Array>} Array of rooms
     */
    async getAllRooms() {
        const res = await authService.get('/rooms');
        if (!res.ok) return [];
        return res.json();
    },

    /**
     * Get a room by ID
     * @param {number} id - Room ID
     * @returns {Promise<Object|null>} Room object or null if not found
     */
    async getRoomById(id) {
        const res = await authService.get(`/rooms/${id}`);
        if (!res.ok) return null;
        return res.json();
    },

    /**
     * Get all rooms for a specific floor
     * @param {number} floorId - Floor ID
     * @returns {Promise<Array>} Array of rooms for the floor
     */
    async getRoomsByFloorId(floorId) {
        const res = await authService.get(`/rooms/floor/${floorId}`);
        if (!res.ok) return [];
        return res.json();
    },

    /**
     * Create a new room
     * @param {Object} roomData - Room data {name: string, idFloor: number}
     * @returns {Promise<number|null>} Created room ID or null if failed
     */
    async createRoom(roomData) {
        const res = await authService.post('/rooms', roomData);
        if (!res.ok) return null;
        return res.json();
    },

    /**
     * Update a room
     * @param {number} id - Room ID
     * @param {Object} roomData - Room data {name: string, idFloor: number}
     * @returns {Promise<Object|null>} Updated room or null if failed
     */
    async updateRoom(id, roomData) {
        const res = await authService.put(`/rooms/${id}`, roomData);
        if (!res.ok) return null;
        return res.json();
    },

    /**
     * Delete a room
     * @param {number} id - Room ID
     * @returns {Promise<boolean>} True if successful, false otherwise
     */
    async deleteRoom(id) {
        const res = await authService.delete(`/rooms/${id}`);
        return res.ok;
    }
};

export default roomService;

