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

    const handleUpdateTeamManager = async (e) => {
        e.preventDefault();
        if (!editingTeam) return;
        try {
            const response = await authService.put(`/teams/${editingTeam.id}/manager`, { NewManagerId: Number(teamForm.managerId) });
            if (!response.ok) throw new Error(await response.text());
            await fetchTeams();
            setEditingTeam(null);
            setTeamForm({ teamName: '', managerId: '' });
        } catch (e) {
            console.error(e);
            alert('Erreur lors de la mise à jour du manager');
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
                <h2>{editingTeam ? "Changer le manager de l'équipe" : 'Créer une équipe'}</h2>
                <form onSubmit={editingTeam ? handleUpdateTeamManager : handleCreateTeam}>
                    {!editingTeam && (
                        <input type="text" placeholder="Nom de l'équipe" value={teamForm.teamName} onChange={(e) => setTeamForm({ ...teamForm, teamName: e.target.value })} />
                    )}
                    <select value={teamForm.managerId} onChange={(e) => setTeamForm({ ...teamForm, managerId: e.target.value })}>
                        <option value="">Sélectionner un manager</option>
                        {users.filter(u => u.roleId === 1).map(u => (
                            <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                        ))}
                    </select>
                    <button type="submit">{editingTeam ? 'Mettre à jour' : "Créer l'équipe"}</button>
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
                                <th>Manager</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teams.map(team => {
                                const manager = users.find(user => user.id === team.managerId);
                                return (
                                    <tr key={team.id}>
                                        <td>{team.id}</td>
                                        <td>{team.teamName}</td>
                                        <td>{manager ? `${manager.firstName} ${manager.lastName}` : 'Aucun manager'}</td>
                                        <td className="action-buttons">
                                            <button className="btn-edit" onClick={() => { setEditingTeam(team); setTeamForm({ teamName: team.teamName || '', managerId: String(team.managerId ?? '') }); }}>Changer manager</button>
                                            <button className="btn-delete" onClick={() => handleDeleteTeam(team.id)}>Supprimer</button>
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


