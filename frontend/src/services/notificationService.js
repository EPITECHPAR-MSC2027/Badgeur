import authService from './authService';

const notificationService = {
    /**
     * Get all notifications for a user
     * @param {number} userId - User ID
     * @returns {Promise<Array>} Array of notifications
     */
    async getNotificationsByUserId(userId) {
        const res = await authService.get(`/notifications/user/${userId}`);
        if (!res.ok) return [];
        return res.json();
    },

    /**
     * Get unread notifications for a user
     * @param {number} userId - User ID
     * @returns {Promise<Array>} Array of unread notifications
     */
    async getUnreadNotificationsByUserId(userId) {
        const res = await authService.get(`/notifications/user/${userId}/unread`);
        if (!res.ok) return [];
        return res.json();
    },

    /**
     * Mark a notification as read
     * @param {number} notificationId - Notification ID
     * @returns {Promise<Object|null>} Updated notification or null if failed
     */
    async markAsRead(notificationId) {
        const res = await authService.put(`/notifications/${notificationId}`, { isRead: true });
        if (!res.ok) return null;
        return res.json();
    },

    /**
     * Mark all notifications as read for a user
     * @param {number} userId - User ID
     * @returns {Promise<boolean>} Success status
     */
    async markAllAsRead(userId) {
        const res = await authService.put(`/notifications/user/${userId}/mark-all-read`);
        return res.ok;
    },

    /**
     * Delete a notification
     * @param {number} notificationId - Notification ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteNotification(notificationId) {
        const res = await authService.delete(`/notifications/${notificationId}`);
        return res.ok;
    }
};

export default notificationService;

