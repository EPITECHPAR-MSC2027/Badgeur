const typeDemandeService = {
	async list() {
		const res = await (await import('./authService')).default.get('/type-demandes');
		if (!res.ok) return [];
		return res.json();
	},
	async create(data) {
		const res = await (await import('./authService')).default.post('/type-demandes', data);
		if (!res.ok) throw new Error('Création type de demande échouée');
		return res.json();
	},
	async update(id, data) {
		const res = await (await import('./authService')).default.put(`/type-demandes/${id}`, data);
		if (!res.ok) throw new Error('Mise à jour type de demande échouée');
		return res.json();
	},
	async remove(id) {
		const res = await (await import('./authService')).default.delete(`/type-demandes/${id}`);
		if (!res.ok) throw new Error('Suppression type de demande échouée');
		return true;
	}
};

export default typeDemandeService;
