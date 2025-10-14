import React, { useEffect, useMemo, useState } from 'react';
import authService from '../services/authService';

function PointagesSection() {
    const [users, setUsers] = useState([]);
    const [pointages, setPointages] = useState([]);
    const [editing, setEditing] = useState(null); // { id, badgedAt, userId } | null
    const [form, setForm] = useState({
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        userId: ''
    });
    const [filters, setFilters] = useState({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        userId: ''
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        fetchPointages();
    }, [filters.startDate, filters.endDate, filters.userId]);

    const fetchUsers = async () => {
        try {
            const response = await authService.get('/users');
            if (response.status === 404) { setUsers([]); return; }
            if (!response.ok) throw new Error('Erreur lors du chargement des utilisateurs');
            const data = await response.json();
            setUsers(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
            alert('Impossible de charger les utilisateurs');
        }
    };

    const fetchPointages = async () => {
        try {
            let response;
            if (filters.userId) {
                response = await authService.get(`/badgeLogEvent/user/${filters.userId}`);
            } else {
                response = await authService.get('/badgeLogEvent');
            }
            if (response.status === 404) { setPointages([]); return; }
            if (!response.ok) throw new Error('Erreur lors du chargement des pointages');
            const data = await response.json();

            const start = new Date(filters.startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(filters.endDate);
            end.setHours(23, 59, 59, 999);

            const filtered = (Array.isArray(data) ? data : []).filter(p => {
                const t = new Date(p.badgedAt);
                return t >= start && t <= end;
            });
            setPointages(filtered);
        } catch (e) {
            console.error(e);
        }
    };

    const handleDeletePointage = async (pointageId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce pointage ?')) return;
        try {
            const response = await authService.delete(`/badgeLogEvent/${pointageId}`);
            if (!response.ok && response.status !== 204) throw new Error('Erreur lors de la suppression');
            await fetchPointages();
        } catch (e) {
            console.error(e);
        }
    };

    const buildBadgedAtLocalString = (dateStr, timeStr) => {
        const normalizedTime = timeStr.length === 5 ? `${timeStr}:00` : timeStr;
        return `${dateStr}T${normalizedTime}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const badgedAtLocal = buildBadgedAtLocalString(form.date, form.time);
        const payload = { BadgedAt: badgedAtLocal, UserId: Number(form.userId) };
        try {
            let response;
            if (editing) {
                response = await authService.put(`/badgeLogEvent/${editing.id}`, payload);
            } else {
                response = await authService.post('/badgeLogEvent/', payload);
            }
            if (!response.ok) throw new Error(await response.text());
            setEditing(null);
            setForm({ date: new Date().toISOString().split('T')[0], time: '09:00', userId: '' });
            await fetchPointages();
        } catch (e) {
            console.error(e);
            alert("Erreur lors de l'enregistrement du pointage");
        }
    };

    const startEditById = (id) => {
        const p = pointages.find(evt => evt.id === id);
        if (!p) return;
        const d = new Date(p.badgedAt);
        const date = d.toISOString().split('T')[0];
        const time = d.toTimeString().slice(0, 5);
        setEditing({ id });
        setForm({ date, time, userId: String(p.userId) });
    };

    const pointageRows = useMemo(() => {
        return pointages.map(p => {
            const date = new Date(p.badgedAt);
            const user = users.find(u => u.id === p.userId);
            return {
                id: p.id,
                dateText: date.toLocaleDateString('fr-FR'),
                timeText: date.toLocaleTimeString('fr-FR'),
                userText: user ? `${user.firstName} ${user.lastName}` : 'Utilisateur inconnu'
            };
        });
    }, [pointages, users]);

    return (
        <div className="admin-table-container">
            <h2>Historique des pointages</h2>
            <form onSubmit={handleSubmit} className="admin-form-container" style={{ marginBottom: 16 }}>
                <h3>{editing ? 'Modifier un pointage' : 'Ajouter un pointage'}</h3>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                    <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
                    <select value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })}>
                        <option value="">Sélectionner un utilisateur</option>
                        {users.map(u => (
                            <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                        ))}
                    </select>
                </div>
                <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                    <button type="submit">{editing ? 'Enregistrer' : 'Ajouter'}</button>
                    {editing && <button type="button" onClick={() => { setEditing(null); setForm({ date: new Date().toISOString().split('T')[0], time: '09:00', userId: '' }); }}>Annuler</button>}
                </div>
            </form>
            <div className="filters-container">
                <div className="filter-group">
                    <label>Du :</label>
                    <input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
                </div>
                <div className="filter-group">
                    <label>Au :</label>
                    <input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
                </div>
                <div className="filter-group">
                    <label>Utilisateur :</label>
                    <select value={filters.userId} onChange={(e) => setFilters({ ...filters, userId: e.target.value })}>
                        <option value="">Tous les utilisateurs</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>{user.firstName} {user.lastName}</option>
                        ))}
                    </select>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Heure</th>
                        <th>Utilisateur</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {pointageRows.map((row) => (
                        <tr key={row.id}>
                            <td>{row.dateText}</td>
                            <td>{row.timeText}</td>
                            <td>{row.userText}</td>
                            <td className="action-buttons">
                                <button className="btn-edit" onClick={() => startEditById(row.id)}>Modifier</button>
                                <button className="btn-delete" onClick={() => handleDeletePointage(row.id)}>Supprimer</button>
                            </td>
                        </tr>
                    ))}
                    {pointageRows.length === 0 && (
                        <tr>
                            <td colSpan={4}>Aucun pointage pour la période sélectionnée</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default PointagesSection;


