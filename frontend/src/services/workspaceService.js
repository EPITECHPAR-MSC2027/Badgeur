import authService from './authService';

const workspaceService = {
    /**
     * Get all workspaces
     * @returns {Promise<Array>} Array of workspaces
     */
    async getAllWorkspaces() {
        const res = await authService.get('/workspaces');
        if (!res.ok) return [];
        return res.json();
    },

    /**
     * Get a workspace by ID
     * @param {number} id - Workspace ID
     * @returns {Promise<Object|null>} Workspace object or null if not found
     */
    async getWorkspaceById(id) {
        const res = await authService.get(`/workspaces/${id}`);
        if (!res.ok) return null;
        return res.json();
    },

    /**
     * Get all workspaces for a specific floor
     * @param {number} floorId - Floor ID
     * @returns {Promise<Array>} Array of workspaces for the floor
     */
    async getWorkspacesByFloorId(floorId) {
        const res = await authService.get(`/workspaces/floor/${floorId}`);
        if (!res.ok) return [];
        return res.json();
    },

    /**
     * Create a new workspace
     * @param {Object} workspaceData - Workspace data {number: number, idFloor: number}
     * @returns {Promise<number|null>} Created workspace ID or null if failed
     */
    async createWorkspace(workspaceData) {
        const res = await authService.post('/workspaces', workspaceData);
        if (!res.ok) return null;
        return res.json();
    },

    /**
     * Update a workspace
     * @param {number} id - Workspace ID
     * @param {Object} workspaceData - Workspace data {number: number, idFloor: number}
     * @returns {Promise<Object|null>} Updated workspace or null if failed
     */
    async updateWorkspace(id, workspaceData) {
        const res = await authService.put(`/workspaces/${id}`, workspaceData);
        if (!res.ok) return null;
        return res.json();
    },

    /**
     * Delete a workspace
     * @param {number} id - Workspace ID
     * @returns {Promise<boolean>} True if successful, false otherwise
     */
    async deleteWorkspace(id) {
        const res = await authService.delete(`/workspaces/${id}`);
        return res.ok;
    }
};

export default workspaceService;

