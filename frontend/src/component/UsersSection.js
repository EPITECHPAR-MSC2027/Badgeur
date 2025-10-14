import React, { useEffect, useState } from 'react';
import authService from '../services/authService';

function UsersSection() {
    const [users, setUsers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [userForm, setUserForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        telephone: '',
        roleId: '',
        teamId: ''
    });

    const [filters, setFilters] = useState({
        roleId: '',
        teamId: ''
    });
    const [sortConfig, setSortConfig] = useState({ key: 'lastName', direction: 'asc' });

    useEffect(() => {
        fetchUsers();
        fetchTeams();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await authService.get('/users');
            if (response.status === 404) { setUsers([]); return; }
            if (!response.ok) throw new Error('Erreur lors du chargement des utilisateurs');
            const data = await response.json();
            setUsers(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
            alert('Impossible de charger la liste des utilisateurs');
        }
    };

    const fetchTeams = async () => {
        try {
            const response = await authService.get('/teams');
            if (response.status === 404) { setTeams([]); return; }
            if (!response.ok) throw new Error('Erreur lors du chargement des équipes');
            const data = await response.json();
            setTeams(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
            alert("Impossible de charger la liste des équipes");
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                FirstName: userForm.firstName,
                LastName: userForm.lastName,
                Email: userForm.email,
                Telephone: userForm.telephone,
                RoleId: userForm.roleId === '' ? 0 : Number(userForm.roleId),
                TeamId: userForm.teamId === '' ? null : Number(userForm.teamId)
            };
            const response = await authService.post('/users/', payload);
            if (!response.ok) throw new Error(await response.text());
            await fetchUsers();
            setUserForm({ firstName: '', lastName: '', email: '', telephone: '', roleId: '', teamId: '' });
        } catch (e) {
            console.error(e);
            alert("Erreur lors de la création de l'utilisateur");
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!editingUser) return;
        try {
            const payload = {
                FirstName: userForm.firstName,
                LastName: userForm.lastName,
                Telephone: userForm.telephone,
                RoleId: userForm.roleId === '' ? 0 : Number(userForm.roleId),
                TeamId: userForm.teamId === '' ? null : Number(userForm.teamId)
            };
            const response = await authService.put(`/users/${editingUser.id}`, payload);
            if (!response.ok) throw new Error(await response.text());
            await fetchUsers();
            setEditingUser(null);
            setUserForm({ firstName: '', lastName: '', email: '', telephone: '', roleId: '', teamId: '' });
        } catch (e) {
            console.error(e);
            alert("Erreur lors de la mise à jour de l'utilisateur");
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
        try {
            const response = await authService.delete(`/users/${userId}`);
            if (!response.ok && response.status !== 204) throw new Error('Erreur lors de la suppression');
            await fetchUsers();
        } catch (e) {
            console.error(e);
            alert('Suppression impossible');
        }
    };

    const startEdit = (user) => {
        setEditingUser(user);
        setUserForm({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            telephone: user.telephone || '',
            roleId: String(user.roleId ?? ''),
            teamId: user.teamId === 0 || user.teamId === undefined || user.teamId === null ? '' : String(user.teamId)
        });
    };

    const handleSort = (key) => {
        setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
    };

    const filteredAndSortedUsers = users
        .filter(u => (filters.roleId === '' || u.roleId === Number(filters.roleId)) && (filters.teamId === '' || u.teamId === Number(filters.teamId)))
        .sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];
            if (aVal === bVal) return 0;
            if (sortConfig.direction === 'asc') return aVal > bVal ? 1 : -1;
            return aVal < bVal ? 1 : -1;
        });

    return (
        <>
            <div className="admin-form-container">
                <h2>{editingUser ? 'Modifier un utilisateur' : 'Créer un utilisateur'}</h2>
                <form onSubmit={editingUser ? handleUpdate : handleCreate}>
                    <input type="text" placeholder="Prénom" value={userForm.firstName} onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })} />
                    <input type="text" placeholder="Nom" value={userForm.lastName} onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })} />
                    <input type="email" placeholder="Email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
                    <input type="text" placeholder="Téléphone" value={userForm.telephone} onChange={(e) => setUserForm({ ...userForm, telephone: e.target.value })} />
                    <select value={userForm.roleId} onChange={(e) => setUserForm({ ...userForm, roleId: e.target.value })}>
                        <option value="">Sélectionner un rôle</option>
                        <option value="0">Utilisateur</option>
                        <option value="1">Manager</option>
                        <option value="2">Administrateur</option>
                    </select>
                    <select value={userForm.teamId} onChange={(e) => setUserForm({ ...userForm, teamId: e.target.value })}>
                        <option value="">Aucune équipe</option>
                        {teams.map(t => (
                            <option key={t.id} value={t.id}>{t.teamName}</option>
                        ))}
                    </select>
                    <button type="submit">{editingUser ? 'Modifier' : 'Créer'} l'utilisateur</button>
                    {editingUser && (
                        <button type="button" onClick={() => { setEditingUser(null); setUserForm({ firstName: '', lastName: '', email: '', telephone: '', roleId: '', teamId: '' }); }}>Annuler</button>
                    )}
                </form>
            </div>

            <div className="admin-table-container">
                <h2>Liste des utilisateurs</h2>
                <div className="filters-container">
                    <div className="filter-group">
                        <label>Filtrer par rôle :</label>
                        <select value={filters.roleId} onChange={(e) => setFilters({ ...filters, roleId: e.target.value })}>
                            <option value="">Tous les rôles</option>
                            <option value="0">Utilisateur</option>
                            <option value="1">Manager</option>
                            <option value="2">Administrateur</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Filtrer par équipe :</label>
                        <select value={filters.teamId} onChange={(e) => setFilters({ ...filters, teamId: e.target.value })}>
                            <option value="">Toutes les équipes</option>
                            {teams.map(team => (
                                <option key={team.id} value={team.id}>{team.teamName}</option>
                            ))}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Trier par :</label>
                        <select value={`${sortConfig.key}-${sortConfig.direction}`} onChange={(e) => { const [key, direction] = e.target.value.split('-'); setSortConfig({ key, direction }); }}>
                            <option value="lastName-asc">Nom (A-Z)</option>
                            <option value="lastName-desc">Nom (Z-A)</option>
                            <option value="firstName-asc">Prénom (A-Z)</option>
                            <option value="firstName-desc">Prénom (Z-A)</option>
                            <option value="email-asc">Email (A-Z)</option>
                            <option value="email-desc">Email (Z-A)</option>
                        </select>
                    </div>
                </div>
                {filteredAndSortedUsers.length === 0 ? (
                    <div>Aucun utilisateur correspondant aux filtres</div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('firstName')}>Prénom</th>
                                <th onClick={() => handleSort('lastName')}>Nom</th>
                                <th onClick={() => handleSort('email')}>Email</th>
                                <th onClick={() => handleSort('telephone')}>Téléphone</th>
                                <th>Équipe</th>
                                <th onClick={() => handleSort('roleId')}>Rôle</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAndSortedUsers.map(user => (
                                <tr key={user.id}>
                                    <td>{user.firstName}</td>
                                    <td>{user.lastName}</td>
                                    <td>{user.email}</td>
                                    <td>{user.telephone}</td>
                                    <td>{user.teamId ?? ''}</td>
                                    <td>{user.roleId === 0 ? 'Utilisateur' : user.roleId === 1 ? 'Manager' : user.roleId === 2 ? 'Administrateur' : ''}</td>
                                    <td className="action-buttons">
                                        <button className="btn-edit" onClick={() => startEdit(user)}>Modifier</button>
                                        <button className="btn-delete" onClick={() => handleDelete(user.id)}>Supprimer</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
}

export default UsersSection;


