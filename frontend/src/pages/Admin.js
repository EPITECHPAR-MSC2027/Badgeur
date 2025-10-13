import React, { useState, useEffect } from 'react';
import '../style/Admin.css';

function Admin() {
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        roleId: ''
    });

    // Charger les utilisateurs
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/users/all', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error('Erreur lors du chargement des utilisateurs');
            }
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Erreur:', error);
            alert('Impossible de charger la liste des utilisateurs');
        }
    };

    // Créer un utilisateur
    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify(formData)
            });
            fetchUsers();
            setFormData({ firstName: '', lastName: '', email: '', password: '', roleId: '' });
        } catch (error) {
            console.error('Erreur lors de la création:', error);
        }
    };

    // Mettre à jour un utilisateur
    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await fetch(`/api/users/${editingUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify(formData)
            });
            fetchUsers();
            setEditingUser(null);
            setFormData({ firstName: '', lastName: '', email: '', password: '', roleId: '' });
        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
        }
    };

    // Supprimer un utilisateur
    const handleDelete = async (userId) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
            try {
                await fetch(`/api/users/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    }
                });
                fetchUsers();
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
            }
        }
    };

    const startEdit = (user) => {
        setEditingUser(user);
        setFormData({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            roleId: user.roleId,
            password: ''
        });
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Administration des utilisateurs</h1>
            </header>
            <div className="admin-page">
                <div className="admin-form-container">
                    <h2>{editingUser ? 'Modifier un utilisateur' : 'Créer un utilisateur'}</h2>
                    <form onSubmit={editingUser ? handleUpdate : handleCreate}>
                        <input
                            type="text"
                            placeholder="Prénom"
                            value={formData.firstName}
                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        />
                        <input
                            type="text"
                            placeholder="Nom"
                            value={formData.lastName}
                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                        <input
                            type="password"
                            placeholder="Mot de passe"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                        <select
                            value={formData.roleId}
                            onChange={(e) => setFormData({...formData, roleId: e.target.value})}
                        >
                            <option value="">Sélectionner un rôle</option>
                            <option value="0">Utilisateur</option>
                            <option value="1">Manager</option>
                            <option value="2">Administrateur</option>
                        </select>
                        <button type="submit">
                            {editingUser ? 'Modifier' : 'Créer'} l'utilisateur
                        </button>
                        {editingUser && (
                            <button type="button" onClick={() => {
                                setEditingUser(null);
                                setFormData({ firstName: '', lastName: '', email: '', password: '', roleId: '' });
                            }}>
                                Annuler
                            </button>
                        )}
                    </form>
                </div>
                
                <div className="admin-table-container">
                    <h2>Liste des utilisateurs</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Prénom</th>
                                <th>Nom</th>
                                <th>Email</th>
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
                                    <td>
                                        {user.roleId === 0 ? 'Utilisateur' : 
                                         user.roleId === 1 ? 'Manager' : 
                                         user.roleId === 2 ? 'Administrateur' : ''}
                                    </td>
                                    <td>
                                        <button onClick={() => startEdit(user)}>Modifier</button>
                                        <button onClick={() => handleDelete(user.id)}>Supprimer</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Admin;