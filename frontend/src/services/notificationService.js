/**
 * Service de gestion des notifications utilisant localStorage
 * Les notifications sont stockées localement par userId
 */

const STORAGE_KEY_PREFIX = 'notifications_';

/**
 * Récupère la clé de stockage pour un utilisateur
 */
const getStorageKey = (userId) => `${STORAGE_KEY_PREFIX}${userId}`;

/**
 * Génère un ID unique pour une notification
 */
const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Charge les notifications depuis localStorage
 */
const loadNotifications = (userId) => {
    try {
        const key = getStorageKey(userId);
        const data = localStorage.getItem(key);
        if (!data) return [];
        return JSON.parse(data);
    } catch (error) {
        console.error('Erreur lors du chargement des notifications:', error);
        return [];
    }
};

/**
 * Sauvegarde les notifications dans localStorage
 */
const saveNotifications = (userId, notifications) => {
    try {
        const key = getStorageKey(userId);
        localStorage.setItem(key, JSON.stringify(notifications));
        return true;
    } catch (error) {
        console.error('Erreur lors de la sauvegarde des notifications:', error);
        return false;
    }
};

const notificationService = {
    /**
     * Get all notifications for a user
     * @param {number} userId - User ID
     * @returns {Promise<Array>} Array of notifications
     */
    async getNotificationsByUserId(userId) {
        const notifications = loadNotifications(userId);
        // Trier par date de création (plus récentes en premier)
        return notifications.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB - dateA;
        });
    },

    /**
     * Get unread notifications for a user
     * @param {number} userId - User ID
     * @returns {Promise<Array>} Array of unread notifications
     */
    async getUnreadNotificationsByUserId(userId) {
        const notifications = loadNotifications(userId);
        const unread = notifications.filter(n => !n.isRead);
        // Trier par date de création (plus récentes en premier)
        return unread.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB - dateA;
        });
    },

    /**
     * Get a notification by ID
     * @param {number} notificationId - Notification ID
     * @param {number} userId - User ID
     * @returns {Promise<Object|null>} Notification or null if not found
     */
    async getNotificationById(notificationId, userId) {
        const notifications = loadNotifications(userId);
        return notifications.find(n => n.id === notificationId) || null;
    },

    /**
     * Create a new notification
     * @param {Object} notificationData - Notification data
     * @param {number} notificationData.userId - User ID
     * @param {string} notificationData.message - Notification message
     * @param {string} notificationData.type - Notification type
     * @param {number|null} notificationData.relatedId - Related entity ID (optional)
     * @returns {Promise<Object>} Created notification
     */
    async createNotification({ userId, message, type, relatedId = null }) {
        const notifications = loadNotifications(userId);
        const newNotification = {
            id: generateId(),
            userId: userId,
            message: message,
            type: type,
            isRead: false,
            createdAt: new Date().toISOString(),
            relatedId: relatedId
        };
        notifications.push(newNotification);
        saveNotifications(userId, notifications);
        return newNotification;
    },

    /**
     * Mark a notification as read
     * @param {string} notificationId - Notification ID
     * @param {number} userId - User ID
     * @returns {Promise<Object|null>} Updated notification or null if failed
     */
    async markAsRead(notificationId, userId) {
        const notifications = loadNotifications(userId);
        const notification = notifications.find(n => n.id === notificationId);
        if (!notification) return null;
        
        notification.isRead = true;
        saveNotifications(userId, notifications);
        return notification;
    },

    /**
     * Mark all notifications as read for a user
     * @param {number} userId - User ID
     * @returns {Promise<boolean>} Success status
     */
    async markAllAsRead(userId) {
        const notifications = loadNotifications(userId);
        notifications.forEach(n => {
            n.isRead = true;
        });
        return saveNotifications(userId, notifications);
    },

    /**
     * Delete a notification
     * @param {string} notificationId - Notification ID
     * @param {number} userId - User ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteNotification(notificationId, userId) {
        const notifications = loadNotifications(userId);
        const filtered = notifications.filter(n => n.id !== notificationId);
        return saveNotifications(userId, filtered);
    },

    /**
     * Clear all notifications for a user
     * @param {number} userId - User ID
     * @returns {Promise<boolean>} Success status
     */
    async clearAllNotifications(userId) {
        try {
            const key = getStorageKey(userId);
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Erreur lors de la suppression des notifications:', error);
            return false;
        }
    }
};

export default notificationService;

