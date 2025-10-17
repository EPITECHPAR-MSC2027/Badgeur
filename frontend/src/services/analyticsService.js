import authService from './authService';

// Service centralisant les appels pour l'analytics (employé et manager)
const analyticsService = {
    async getMyKPIs() {
        const res = await authService.get('/kpis/me');
        if (res.status === 404) return null;
        if (!res.ok) throw new Error(`Erreur KPI: ${res.status}`);
        return res.json();
    },

    async getUserKPIs(userId) {
        const res = await authService.get(`/kpis/${userId}`);
        if (res.status === 404) return null;
        if (!res.ok) throw new Error(`Erreur KPI utilisateur ${userId}: ${res.status}`);
        return res.json();
    },

    async getUserBadgeEvents(userId) {
        const res = await authService.get(`/badgeLogEvent/user/${userId}`);
        if (res.status === 404) return [];
        if (!res.ok) throw new Error(`Erreur événements utilisateur ${userId}: ${res.status}`);
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    },

    async getTeamUsers(teamId) {
        const res = await authService.get(`/users/${teamId}/team`);
        if (res.status === 404) return [];
        if (!res.ok) throw new Error(`Erreur utilisateurs équipe ${teamId}: ${res.status}`);
        return res.json();
    },

    async getAllTeams() {
        const res = await authService.get('/teams/');
        if (res.status === 404) return [];
        if (!res.ok) throw new Error(`Erreur récupération équipes: ${res.status}`);
        return res.json();
    }
};

export default analyticsService;


