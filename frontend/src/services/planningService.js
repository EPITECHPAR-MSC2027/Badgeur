export default {
	async list() {
		const res = await (await import('./authService')).default.get('/plannings');
		if (!res.ok) return [];
		return res.json();
	},
	async listByUser(userId) {
		const res = await (await import('./authService')).default.get(`/plannings/by-user/${userId}`);
		if (!res.ok) return [];
		return res.json();
	},
	async create(data) {
		const res = await (await import('./authService')).default.post('/plannings', data);
		if (!res.ok) throw new Error('Création planning échouée');
		return res.json();
	},
	async update(id, data) {
		const res = await (await import('./authService')).default.put(`/plannings/${id}`, data);
		if (!res.ok) throw new Error('Mise à jour planning échouée');
		return res.json();
	},
	async remove(id) {
		const res = await (await import('./authService')).default.delete(`/plannings/${id}`);
		if (!res.ok) throw new Error('Suppression planning échouée');
		return true;
	}
};
