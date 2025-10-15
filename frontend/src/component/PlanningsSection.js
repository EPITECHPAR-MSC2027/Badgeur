import React, { useEffect, useState } from 'react';
import planningService from '../services/planningService';

function PlanningsSection() {
	const [items, setItems] = useState([]);
	const [form, setForm] = useState({ userId: '', date: '', period: '', statut: '', typeDemandeId: '' });
	const [editingId, setEditingId] = useState(null);
	const [editForm, setEditForm] = useState({ date: '', period: '', statut: '', typeDemandeId: '' });

	const load = async () => {
		try {
			const list = await planningService.list();
			setItems(Array.isArray(list) ? list : []);
		} catch (e) {
			console.error(e);
			alert("Impossible de charger les plannings");
		}
	};

	useEffect(() => { load(); }, []);

	const onChange = (e) => {
		const { name, value } = e.target;
		setForm(prev => ({ ...prev, [name]: value }));
	};

	const onCreate = async (e) => {
		e.preventDefault();
		try {
			const payload = {
				userId: Number(form.userId),
				date: new Date(form.date).toISOString(),
				period: form.period,
				statut: form.statut,
				typeDemandeId: Number(form.typeDemandeId)
			};
			await planningService.create(payload);
			setForm({ userId: '', date: '', period: '', statut: '', typeDemandeId: '' });
			await load();
		} catch (e) {
			console.error(e);
			alert("Création échouée");
		}
	};

	const onStartEdit = (item) => {
		setEditingId(item.id);
		setEditForm({
			date: item.date?.substring(0,10) ?? '',
			period: item.period ?? '',
			statut: item.statut ?? '',
			typeDemandeId: String(item.typeDemandeId ?? '')
		});
	};

	const onChangeEdit = (e) => {
		const { name, value } = e.target;
		setEditForm(prev => ({ ...prev, [name]: value }));
	};

	const onSave = async (id) => {
		try {
			const payload = {
				date: new Date(editForm.date).toISOString(),
				period: editForm.period,
				statut: editForm.statut,
				typeDemandeId: Number(editForm.typeDemandeId)
			};
			await planningService.update(id, payload);
			setEditingId(null);
			await load();
		} catch (e) {
			console.error(e);
			alert("Mise à jour échouée");
		}
	};

	const onDelete = async (id) => {
		if (!window.confirm('Supprimer ce planning ?')) return;
		try {
			await planningService.remove(id);
			await load();
		} catch (e) {
			console.error(e);
			alert("Suppression échouée");
		}
	};

	return (
		<div>
			<h2>Plannings</h2>
			<form onSubmit={onCreate} style={{ marginBottom: 16 }}>
				<input name="userId" value={form.userId} onChange={onChange} placeholder="ID utilisateur" />
				<input name="date" type="date" value={form.date} onChange={onChange} />
				<input name="period" value={form.period} onChange={onChange} placeholder="Période" />
				<input name="statut" value={form.statut} onChange={onChange} placeholder="Statut" />
				<input name="typeDemandeId" value={form.typeDemandeId} onChange={onChange} placeholder="ID type demande" />
				<button type="submit">Ajouter</button>
			</form>

			<table className="admin-table">
				<thead>
					<tr>
						<th>ID</th>
						<th>User</th>
						<th>Date</th>
						<th>Periode</th>
						<th>Statut</th>
						<th>TypeDemande</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{items.map(item => (
						<tr key={item.id} className={editingId === item.id ? 'edit-row' : ''}>
							<td>{item.id}</td>
							<td>{item.userId}</td>
							<td>
								{editingId === item.id ? (
									<input name="date" type="date" value={editForm.date} onChange={onChangeEdit} />
								) : (new Date(item.date).toLocaleDateString())}
							</td>
							<td>
								{editingId === item.id ? (
									<input name="period" value={editForm.period} onChange={onChangeEdit} />
								) : item.period}
							</td>
							<td>
								{editingId === item.id ? (
									<input name="statut" value={editForm.statut} onChange={onChangeEdit} />
								) : item.statut}
							</td>
							<td>
								{editingId === item.id ? (
									<input name="typeDemandeId" value={editForm.typeDemandeId} onChange={onChangeEdit} />
								) : item.typeDemandeId}
							</td>
							<td>
								{editingId === item.id ? (
									<div className="edit-actions">
										<button className="btn-save" onClick={() => onSave(item.id)}>Enregistrer</button>
										<button className="btn-cancel" onClick={() => setEditingId(null)}>Annuler</button>
									</div>
								) : (
									<div className="action-buttons">
										<button className="btn-edit" onClick={() => onStartEdit(item)}>Modifier</button>
										<button className="btn-delete" onClick={() => onDelete(item.id)}>Supprimer</button>
									</div>
								)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export default PlanningsSection;
