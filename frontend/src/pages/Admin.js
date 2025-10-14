import React, { useState, useEffect } from 'react';
import '../style/Admin.css';
import authService from '../services/authService';

function Admin() {
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

    const [editingTeam, setEditingTeam] = useState(null); // when set, we're updating manager
    const [teamForm, setTeamForm] = useState({
        teamName: '',
        managerId: ''
    });

    const [activeSection, setActiveSection] = useState('users'); // nouvelle état pour la navigation

    // Charger les utilisateurs
    useEffect(() => {
        fetchUsers();
        fetchTeams();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await authService.get('/users');
            if (response.status === 404) { // backend returns 404 when empty
                setUsers([]);
                return;
            }
            if (!response.ok) {
                throw new Error('Erreur lors du chargement des utilisateurs');
            }
            const data = await response.json();
            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Erreur:', error);
            alert('Impossible de charger la liste des utilisateurs');
        }
    };

    const fetchTeams = async () => {
        try {
            const response = await authService.get('/teams');
            if (response.status === 404) {
                setTeams([]);
                return;
            }
            if (!response.ok) {
                throw new Error('Erreur lors du chargement des équipes');
            }
            const data = await response.json();
            setTeams(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Erreur:', error);
            alert("Impossible de charger la liste des équipes");
        }
    };

    // Créer un utilisateur
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
            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'Erreur lors de la création');
            }
            await fetchUsers();
            setUserForm({ firstName: '', lastName: '', email: '', telephone: '', roleId: '', teamId: '' });
        } catch (error) {
            console.error('Erreur lors de la création:', error);
            alert('Erreur lors de la création de l\'utilisateur');
        }
    };

    // Mettre à jour un utilisateur
    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                FirstName: userForm.firstName,
                LastName: userForm.lastName,
                Telephone: userForm.telephone,
                RoleId: userForm.roleId === '' ? 0 : Number(userForm.roleId),
                TeamId: userForm.teamId === '' ? null : Number(userForm.teamId)
            };
            const response = await authService.put(`/users/${editingUser.id}`, payload);
            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'Erreur lors de la mise à jour');
            }
            await fetchUsers();
            setEditingUser(null);
            setUserForm({ firstName: '', lastName: '', email: '', telephone: '', roleId: '', teamId: '' });
        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
            alert('Erreur lors de la mise à jour de l\'utilisateur');
        }
    };

    // Supprimer un utilisateur
    const handleDelete = async (userId) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
            try {
                const response = await authService.delete(`/users/${userId}`);
                if (!response.ok && response.status !== 204) {
                    throw new Error('Erreur lors de la suppression');
                }
                await fetchUsers();
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
                alert('Suppression impossible');
            }
        }
    };

    // --- Teams handlers ---
    const handleCreateTeam = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                TeamName: teamForm.teamName,
                ManagerId: teamForm.managerId === '' ? 0 : Number(teamForm.managerId)
            };
            const response = await authService.post('/teams/', payload);
            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'Erreur lors de la création de l\'équipe');
            }
            await fetchTeams();
            setTeamForm({ teamName: '', managerId: '' });
        } catch (error) {
            console.error('Erreur création équipe:', error);
            alert('Erreur lors de la création de l\'équipe');
        }
    };

    const handleUpdateTeamManager = async (e) => {
        e.preventDefault();
        if (!editingTeam) return;
        try {
            const payload = { NewRoleId: undefined }; // not used here, use team manager endpoint payload name
            // Real payload for team manager update is { NewManagerId }
            const response = await authService.put(`/teams/${editingTeam.id}/manager`, { NewManagerId: Number(teamForm.managerId) });
            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'Erreur lors de la mise à jour du manager');
            }
            await fetchTeams();
            setEditingTeam(null);
            setTeamForm({ teamName: '', managerId: '' });
        } catch (error) {
            console.error('Erreur MAJ manager équipe:', error);
            alert('Erreur lors de la mise à jour du manager');
        }
    };

    const handleDeleteTeam = async (teamId) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette équipe ?')) {
            try {
                const response = await authService.delete(`/teams/${teamId}`);
                if (!response.ok && response.status !== 204) {
                    throw new Error('Erreur lors de la suppression');
                }
                await fetchTeams();
            } catch (error) {
                console.error('Erreur suppression équipe:', error);
                alert('Suppression de l\'équipe impossible');
            }
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

    return (
        <div className="App">
            <header className="App-header">
                <h1>Administration</h1>
                <div className="admin-nav">
                    <button 
                        className={`nav-button ${activeSection === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveSection('users')}
                    >
                        Utilisateurs
                    </button>
                    <button 
                        className={`nav-button ${activeSection === 'teams' ? 'active' : ''}`}
                        onClick={() => setActiveSection('teams')}
                    >
                        Équipes
                    </button>
                </div>
            </header>
            <div className="admin-page">
                {activeSection === 'users' ? (
                    <>
                        {/* Users CRUD */}
                        <div className="admin-form-container">
                            <h2>{editingUser ? 'Modifier un utilisateur' : 'Créer un utilisateur'}</h2>
                            <form onSubmit={editingUser ? handleUpdate : handleCreate}>
                                <input
                                    type="text"
                                    placeholder="Prénom"
                                    value={userForm.firstName}
                                    onChange={(e) => setUserForm({...userForm, firstName: e.target.value})}
                                />
                                <input
                                    type="text"
                                    placeholder="Nom"
                                    value={userForm.lastName}
                                    onChange={(e) => setUserForm({...userForm, lastName: e.target.value})}
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={userForm.email}
                                    onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                                />
                                <input
                                    type="text"
                                    placeholder="Téléphone"
                                    value={userForm.telephone}
                                    onChange={(e) => setUserForm({...userForm, telephone: e.target.value})}
                                />
                                <select
                                    value={userForm.roleId}
                                    onChange={(e) => setUserForm({...userForm, roleId: e.target.value})}
                                >
                                    <option value="">Sélectionner un rôle</option>
                                    <option value="0">Utilisateur</option>
                                    <option value="1">Manager</option>
                                    <option value="2">Administrateur</option>
                                </select>
                                <select
                                    value={userForm.teamId}
                                    onChange={(e) => setUserForm({...userForm, teamId: e.target.value})}
                                >
                                    <option value="">Aucune équipe</option>
                                    {teams.map(t => (
                                        <option key={t.id} value={t.id}>{t.teamName}</option>
                                    ))}
                                </select>
                                <button type="submit">
                                    {editingUser ? 'Modifier' : 'Créer'} l'utilisateur
                                </button>
                                {editingUser && (
                                    <button type="button" onClick={() => {
                                        setEditingUser(null);
                                        setUserForm({ firstName: '', lastName: '', email: '', telephone: '', roleId: '', teamId: '' });
                                    }}>
                                        Annuler
                                    </button>
                                )}
                            </form>
                        </div>

                        <div className="admin-table-container">
                            <h2>Liste des utilisateurs</h2>
                            {users.length === 0 ? (
                                <div>Aucun utilisateur</div>
                            ) : (
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Prénom</th>
                                            <th>Nom</th>
                                            <th>Email</th>
                                            <th>Téléphone</th>
                                            <th>Équipe</th>
                                            <th>Rôle</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(user => (
                                            <tr key={user.id}>
                                                <td>{user.firstName}</td>
                                                <td>{user.lastName}</td>
                                                <td>{user.email}</td>
                                                <td>{user.telephone}</td>
                                                <td>{user.teamId ?? ''}</td>
                                                <td>
                                                    {user.roleId === 0 ? 'Utilisateur' : 
                                                     user.roleId === 1 ? 'Manager' : 
                                                     user.roleId === 2 ? 'Administrateur' : ''}
                                                </td>
                                                <td className="action-buttons">
                                                    <button className="btn-edit" onClick={() => startEdit(user)}>
                                                        Modifier
                                                    </button>
                                                    <button className="btn-delete" onClick={() => handleDelete(user.id)}>
                                                        Supprimer
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        {/* Teams CRUD */}
                        <div className="admin-form-container" style={{ marginTop: 24 }}>
                            <h2>{editingTeam ? 'Changer le manager de l\'équipe' : 'Créer une équipe'}</h2>
                            <form onSubmit={editingTeam ? handleUpdateTeamManager : handleCreateTeam}>
                                {!editingTeam && (
                                    <input
                                        type="text"
                                        placeholder="Nom de l'équipe"
                                        value={teamForm.teamName}
                                        onChange={(e) => setTeamForm({...teamForm, teamName: e.target.value})}
                                    />
                                )}
                                <select
                                    value={teamForm.managerId}
                                    onChange={(e) => setTeamForm({...teamForm, managerId: e.target.value})}
                                >
                                    <option value="">Sélectionner un manager</option>
                                    {users.filter(u => u.roleId === 1).map(u => (
                                        <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                                    ))}
                                </select>
                                <button type="submit">
                                    {editingTeam ? 'Mettre à jour' : 'Créer l\'équipe'}
                                </button>
                                {editingTeam && (
                                    <button type="button" onClick={() => { setEditingTeam(null); setTeamForm({ teamName: '', managerId: '' }); }}>Annuler</button>
                                )}
                            </form>
                        </div>

                        <div className="admin-table-container">
                            <h2>Liste des équipes</h2>
                            {teams.length === 0 ? (
                                <div>Aucune équipe</div>
                            ) : (
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Nom</th>
                                            <th>ManagerId</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {teams.map(team => (
                                            <tr key={team.id}>
                                                <td>{team.id}</td>
                                                <td>{team.teamName}</td>
                                                <td>{team.managerId}</td>
                                                <td>
                                                    <button onClick={() => { setEditingTeam(team); setTeamForm({ teamName: team.teamName || '', managerId: String(team.managerId ?? '') }); }}>Changer manager</button>
                                                    <button onClick={() => handleDeleteTeam(team.id)}>Supprimer</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Admin;