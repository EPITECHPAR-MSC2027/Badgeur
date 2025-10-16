import React, { useEffect, useState } from 'react';
import authService from '../services/authService';

function TeamsSection() {
    const [teams, setTeams] = useState([]);
    const [users, setUsers] = useState([]);
    const [editingTeam, setEditingTeam] = useState(null);
    const [teamForm, setTeamForm] = useState({ teamName: '', managerId: '' });

    useEffect(() => {
        fetchTeams();
        fetchUsers();
    }, []);

    const fetchTeams = async () => {
        try {
            const response = await authService.get('/teams');
            if (response.status === 404) { setTeams([]); return; }
            if (!response.ok) throw new Error('Erreur lors du chargement des équipes');
            const data = await response.json();
            setTeams(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
            alert('Impossible de charger la liste des équipes');
        }
    };

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

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        try {
            const payload = { TeamName: teamForm.teamName, ManagerId: teamForm.managerId === '' ? 0 : Number(teamForm.managerId) };
            const response = await authService.post('/teams/', payload);
            if (!response.ok) throw new Error(await response.text());
            await fetchTeams();
            setTeamForm({ teamName: '', managerId: '' });
        } catch (e) {
            console.error(e);
            alert("Erreur lors de la création de l'équipe");
        }
    };

    const handleUpdateInline = async (team) => {
        try {
            // L'API backend existante n'a pas d'endpoint PUT générique; on conserve l'intention de modifier teamName et managerId si disponible.
            // Ici, nous utilisons l'endpoint d'update existant (PUT /teams/{id}) d'après le backend pour mettre à jour teamName & managerId.
            const payload = { TeamName: teamForm.teamName || team.teamName, ManagerId: teamForm.managerId === '' ? team.managerId : Number(teamForm.managerId) };
            const response = await authService.put(`/teams/${team.id}`, payload);
            if (!response.ok) throw new Error(await response.text());
            await fetchTeams();
            setEditingTeam(null);
            setTeamForm({ teamName: '', managerId: '' });
        } catch (e) {
            console.error(e);
            alert('Erreur lors de la mise à jour de l\'équipe');
        }
    };

    const handleDeleteTeam = async (teamId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette équipe ?')) return;
        try {
            const response = await authService.delete(`/teams/${teamId}`);
            if (!response.ok && response.status !== 204) throw new Error('Erreur lors de la suppression');
            await fetchTeams();
        } catch (e) {
            console.error(e);
            alert("Suppression de l'équipe impossible");
        }
    };

    return (
        <>
            <div className="admin-form-container" style={{ marginTop: 24 }}>
                <h2>Créer une équipe</h2>
                {editingTeam && <div style={{ marginBottom: 8, color: '#6c757d' }}>Édition en ligne en cours — utilisez la ligne concernée. La création est temporairement désactivée.</div>}
                <form onSubmit={handleCreateTeam}>
                    <input disabled={!!editingTeam} type="text" placeholder="Nom de l'équipe" value={teamForm.teamName} onChange={(e) => setTeamForm({ ...teamForm, teamName: e.target.value })} />
                    <select disabled={!!editingTeam} value={teamForm.managerId} onChange={(e) => setTeamForm({ ...teamForm, managerId: e.target.value })}>
                        <option value="">Sélectionner un manager</option>
                        {users.filter(u => u.roleId === 1).map(u => (
                            <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                        ))}
                    </select>
                    <button disabled={!!editingTeam} type="submit">Créer l'équipe</button>
                </form>
            </div>

            <div className="admin-table-container">
                <h2>Liste des équipes</h2>
                {teams.length === 0 ? (
                    <div>Aucune équipe</div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nom</th>
                                <th>Manager</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teams.map(team => {
                                const manager = users.find(user => user.id === team.managerId);
                                return (
                                    <tr key={team.id} className={editingTeam && editingTeam.id === team.id ? 'edit-row' : ''}>
                                        <td>{team.id}</td>
                                        <td>
                                            {editingTeam && editingTeam.id === team.id ? (
                                                <input type="text" value={teamForm.teamName} onChange={(e) => setTeamForm({ ...teamForm, teamName: e.target.value })} />
                                            ) : team.teamName}
                                        </td>
                                        <td>
                                            {editingTeam && editingTeam.id === team.id ? (
                                                <select value={teamForm.managerId} onChange={(e) => setTeamForm({ ...teamForm, managerId: e.target.value })}>
                                                    <option value="">Sélectionner un manager</option>
                                                    {users.filter(u => u.roleId === 1).map(u => (
                                                        <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                                                    ))}
                                                </select>
                                            ) : (manager ? `${manager.firstName} ${manager.lastName}` : 'Aucun manager')}
                                        </td>
                                        <td>
                                            {editingTeam && editingTeam.id === team.id ? (
                                                <div className="edit-actions">
                                                    <button className="btn-save" onClick={() => handleUpdateInline(team)}>Enregistrer</button>
                                                    <button className="btn-cancel" onClick={() => { setEditingTeam(null); setTeamForm({ teamName: '', managerId: '' }); }}>Annuler</button>
                                                </div>
                                            ) : (
                                                <div className="action-buttons">
                                                    <button className="btn-edit" onClick={() => { setEditingTeam(team); setTeamForm({ teamName: team.teamName || '', managerId: String(team.managerId ?? '') }); }}>Modifier</button>
                                                    <button className="btn-delete" onClick={() => handleDeleteTeam(team.id)}>Supprimer</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
}

export default TeamsSection;


