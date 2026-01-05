import authService from './authService';

const announcementService = {
    /**
     * Get all announcements
     * @returns {Promise<Array>} Array of announcements
     */
    async getAllAnnouncements() {
        const res = await authService.get('/announcements');
        if (!res.ok) return [];
        return res.json();
    },

    /**
     * Get an announcement by ID
     * @param {number} id - Announcement ID
     * @returns {Promise<Object|null>} Announcement or null if failed
     */
    async getAnnouncementById(id) {
        const res = await authService.get(`/announcements/${id}`);
        if (!res.ok) return null;
        return res.json();
    },

    /**
     * Create a new announcement
     * @param {Object} announcementData - Announcement data {title: string, message: string, authorId: number}
     * @returns {Promise<number|null>} Created announcement ID or null if failed
     */
    async createAnnouncement(announcementData) {
        const res = await authService.post('/announcements', announcementData);
        if (!res.ok) {
            const error = await res.json().catch(() => ({ message: 'Erreur lors de la création de l\'annonce' }));
            throw new Error(error.message || 'Erreur lors de la création de l\'annonce');
        }
        return res.json();
    },

    /**
     * Update an announcement
     * @param {number} id - Announcement ID
     * @param {Object} announcementData - Announcement data
     * @returns {Promise<Object|null>} Updated announcement or null if failed
     */
    async updateAnnouncement(id, announcementData) {
        const res = await authService.put(`/announcements/${id}`, announcementData);
        if (!res.ok) return null;
        return res.json();
    },

    /**
     * Delete an announcement
     * @param {number} id - Announcement ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteAnnouncement(id) {
        const res = await authService.delete(`/announcements/${id}`);
        return res.ok;
    }
};

export default announcementService;

