import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import '../index.css';
import '../style/theme.css';

function Trombinoscope() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        // Filter users based on search term
        if (searchTerm.trim() === '') {
            setFilteredUsers(users);
        } else {
            const term = searchTerm.toLowerCase();
            const filtered = users.filter(user => {
                const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
                const email = (user.email || '').toLowerCase();
                return fullName.includes(term) || email.includes(term);
            });
            setFilteredUsers(filtered);
        }
    }, [searchTerm, users]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await authService.get('/users');
            if (response.status === 404) {
                setUsers([]);
                return;
            }
            if (!response.ok) throw new Error('Error loading users');
            const data = await response.json();
            // Afficher tous les utilisateurs de tous les rôles
            const allUsers = Array.isArray(data) ? data : [];
            setUsers(allUsers);
            setFilteredUsers(allUsers);
        } catch (error) {
            console.error('Error loading users:', error);
            alert('Impossible de charger la liste des utilisateurs');
        } finally {
            setLoading(false);
        }
    };

    const handleUserClick = (user) => {
        // Naviguer vers la page de profil de l'utilisateur
        navigate(`/user-profile/${user.id}`);
    };

    const getRoleLabel = (roleId) => {
        switch (roleId) {
            case 0: return 'Employé';
            case 1: return 'Manager';
            case 2: return 'Admin';
            case 3: return 'RH';
            default: return 'Inconnu';
        }
    };


    const containerStyle = {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '20px'
    };

    const headerStyle = {
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '2px solid var(--color-secondary)'
    };

    const searchStyle = {
        width: '100%',
        padding: '12px 16px',
        fontSize: '16px',
        borderRadius: '8px',
        border: '2px solid var(--color-secondary)',
        fontFamily: 'Alata, sans-serif',
        marginBottom: '24px',
        outline: 'none'
    };

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
    };

    const userCardStyle = {
        background: 'var(--color-background)',
        border: '2px solid var(--color-secondary)',
        borderRadius: '12px',
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        textAlign: 'center'
    };


    if (loading) {
        return (
            <div style={containerStyle}>
                <p>Chargement des utilisateurs...</p>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <h1 style={{ color: 'var(--color-secondary)', fontFamily: 'Alata, sans-serif' }}>
                    Trombinoscope
                </h1>
                <p style={{ color: 'var(--color-text)', marginTop: '8px' }}>
                    Cliquez sur une personne pour voir son profil
                </p>
            </div>

            <input
                type="text"
                placeholder="Rechercher une personne (nom, prénom, email)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={searchStyle}
            />

            <div style={gridStyle}>
                {filteredUsers.map(user => (
                    <div
                        key={user.id}
                        onClick={() => handleUserClick(user)}
                        style={userCardStyle}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>👤</div>
                        <h3 style={{ 
                            margin: '0 0 8px 0', 
                            color: 'var(--color-secondary)',
                            fontFamily: 'Alata, sans-serif'
                        }}>
                            {user.firstName} {user.lastName}
                        </h3>
                        <p style={{ 
                            margin: '0 0 4px 0', 
                            fontSize: '14px', 
                            color: 'var(--color-text)' 
                        }}>
                            {user.email}
                        </p>
                        <p style={{ 
                            margin: 0, 
                            fontSize: '12px', 
                            color: 'var(--color-text)',
                            fontWeight: 600
                        }}>
                            {getRoleLabel(user.roleId)}
                        </p>
                    </div>
                ))}
            </div>

        </div>
    );
}

export default Trombinoscope;

