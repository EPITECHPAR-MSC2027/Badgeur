import authService from './authService';

const planningService = {
    async list() {
        try {
            const res = await authService.get('/plannings');

            if (!res.ok) {
                if (res.status === 404) return [];
                throw new Error(`Failed to fetch plannings: ${res.status}`);
            }

            return await res.json();
        } catch (error) {
            console.error('Error fetching plannings:', error);
            return [];
        }
    },
    async listByUser(userId) {
        try {
            const res = await authService.get(`/plannings/by-user/${userId}`);

            // 404 is ok here, it means the user has made no plannings yet
            if (res.status === 404) {
                return [];
            }

            if (!res.ok) {
                throw new Error(`Failed to fetch plannings for user ${userId}: ${res.status}`);
            }

            return await res.json();
        } catch (error) {
            console.error(`Error fetching plannings for user ${userId}:`, error);
            return [];
        }
    },
    async create(data) {
        const res = await authService.post('/plannings', data);

        if (!res.ok) {
            const errorText = await res.text().catch(() => 'Unknown error');
            throw new Error(`Failed to create planning: ${errorText}`);
        }

        return await res.json();
    },
    async update(id, data) {
        const res = await authService.put(`/plannings/${id}`, data);

        if (!res.ok) {
            if (res.status === 404) {
                throw new Error('Planning not found');
            }
            const errorText = await res.text().catch(() => 'Unknown error');
            throw new Error(`Failed to update planning: ${errorText}`);
        }

        return await res.json();
    },
    async remove(id) {
        const res = await authService.delete(`/plannings/${id}`);

        if (!res.ok) {
            if (res.status === 404) {
                throw new Error('Planning not found');
            }
            const errorText = await res.text().catch(() => 'Unknown error');
            throw new Error(`Failed to delete planning: ${errorText}`);
        }

        return true;
    }
};

export default planningService;