import React, { useEffect, useState } from 'react';
import typeDemandeService from '../services/typeDemandeService';

function TypeDemandesSection() {
	const [items, setItems] = useState([]);
	const [nom, setNom] = useState('');
	const [editing, setEditing] = useState(null);
	const [editNom, setEditNom] = useState('');

	const load = async () => {
		try {
			const list = await typeDemandeService.list();
			setItems(Array.isArray(list) ? list : []);
		} catch (e) {
			console.error(e);
			alert("Impossible de charger les types de demande");
		}
	};

	useEffect(() => { load(); }, []);

	const onCreate = async (e) => {
		e.preventDefault();
		try {
			if (!nom.trim()) return;
			await typeDemandeService.create({ nom });
			setNom('');
			await load();
		} catch (e) {
			console.error(e);
			alert("Création échouée");
		}
	};

	const onStartEdit = (item) => {
		setEditing(item.id);
		setEditNom(item.nom);
	};

	const onSave = async (id) => {
		try {
			await typeDemandeService.update(id, { nom: editNom });
			setEditing(null);
			await load();
		} catch (e) {
			console.error(e);
			alert("Mise à jour échouée");
		}
	};

	const onDelete = async (id) => {
		if (!window.confirm('Supprimer ce type de demande ?')) return;
		try {
			await typeDemandeService.remove(id);
			await load();
		} catch (e) {
			console.error(e);
			alert("Suppression échouée");
		}
	};

	return (
		<div>
			<h2>Types de demande</h2>
			<form onSubmit={onCreate} style={{ marginBottom: 16 }}>
				<input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Nom" />
				<button type="submit">Ajouter</button>
			</form>
			<table className="admin-table">
				<thead>
					<tr>
						<th>ID</th>
						<th>Nom</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{items.map(item => (
						<tr key={item.id} className={editing === item.id ? 'edit-row' : ''}>
							<td>{item.id}</td>
							<td>
								{editing === item.id ? (
									<input value={editNom} onChange={(e) => setEditNom(e.target.value)} />
								) : item.nom}
							</td>
							<td>
								{editing === item.id ? (
									<div className="edit-actions">
										<button className="btn-save" onClick={() => onSave(item.id)}>Enregistrer</button>
										<button className="btn-cancel" onClick={() => setEditing(null)}>Annuler</button>
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

export default TypeDemandesSection;
