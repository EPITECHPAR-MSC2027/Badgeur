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
    const [teams, setTeams] = useState([]);
    const currentUserRoleId = parseInt(localStorage.getItem('roleId'));

    useEffect(() => {
        loadUsers();
        loadTeams();
    }, []);

    useEffect(() => {
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

    const loadTeams = async () => {
        try {
            const response = await authService.get('/teams');
            if (response.ok) {
                const data = await response.json();
                setTeams(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Error loading teams:', error);
        }
    };

    const handleUserClick = (user) => {
        // Seuls les utilisateurs avec roleId = 3 peuvent accéder aux profils détaillés
        if (currentUserRoleId === 3) {
            navigate(`/user-profile/${user.id}`);
        }
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

    const getRoleColor = (roleId) => {
        switch (roleId) {
            case 0: return '#E8F5E9'; // Vert clair
            case 1: return '#FFF3E0'; // Orange clair
            case 2: return '#E3F2FD'; // Bleu clair
            case 3: return '#F3E5F5'; // Violet clair
            default: return '#F5F5F5';
        }
    };


    const getInitials = (firstName, lastName) => {
        const first = firstName ? firstName.charAt(0).toUpperCase() : '';
        const last = lastName ? lastName.charAt(0).toUpperCase() : '';
        return `${first}${last}`;
    };

    const getTeamName = (teamId) => {
        const team = teams.find(t => t.id === teamId);
        return team ? team.teamName : null;
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
        fontFamily: 'Alata, sans-serif',
        marginBottom: '24px',
        outline: 'none',
        background: 'var(--color-primary)',
        color: 'var(--color-text)'
    };

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmin(280px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
    };

    const userCardStyle = {
        background: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        padding: '24px',
        cursor: currentUserRoleId === 3 ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        textAlign: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    };

    const avatarStyle = (roleId) => ({
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: getRoleColor(roleId),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px',
        fontSize: '28px',
        fontWeight: '700',
        color: '#1a237e',
        fontFamily: 'Alata, sans-serif'
    });


    const infoRowStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '13px',
        color: '#666',
        marginBottom: '6px',
        justifyContent: 'center',
        fontFamily: 'Fustat, sans-serif'
    };

    if (loading) {
        return (
            <div style={containerStyle} data-testid="trombinoscope-loading">
                <p data-testid="loading-message">Chargement des utilisateurs...</p>
            </div>
        );
    }

    return (
        <div style={containerStyle} data-testid="trombinoscope-container">
            <div style={headerStyle} data-testid="trombinoscope-header">
                <h1 data-testid="trombinoscope-title">
                    Trombinoscope
                </h1>
                <p
                    style={{ color: 'var(--color--third-text)', fontWeight: '700', marginTop: '8px', margin: '8px 0 0 0' }}
                    data-testid="trombinoscope-subtitle"
                >
                    {currentUserRoleId === 3
                        ? 'Cliquez sur une personne pour voir son profil détaillé'
                        : 'Annuaire des employés'}
                </p>
            </div>

            <input
                type="text"
                placeholder="Rechercher une personne (nom, prénom, email)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={searchStyle}
                data-testid="search-input"
            />

            {filteredUsers.length === 0 ? (
                <div data-testid="no-users-message">
                    <p>Aucun utilisateur trouvé</p>
                </div>
            ) : (
                <div style={gridStyle} data-testid="users-grid">
                    {filteredUsers.map(user => {
                        const teamName = getTeamName(user.teamId);
                        return (
                            <div
                                key={user.id}
                                onClick={() => handleUserClick(user)}
                                style={userCardStyle}
                                data-testid={`user-card-${user.id}`}
                                data-clickable={currentUserRoleId === 3}
                                onMouseEnter={(e) => {
                                    if (currentUserRoleId === 3) {
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (currentUserRoleId === 3) {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                                    }
                                }}
                            >
                                <div style={avatarStyle(user.roleId)} data-testid={`user-avatar-${user.id}`}>
                                    {getInitials(user.firstName, user.lastName)}
                                </div>

                                <h3
                                    style={{
                                        margin: '0 0 4px 0',
                                        color: '#1a237e',
                                        fontFamily: 'Alata, sans-serif',
                                        fontSize: '18px'
                                    }}
                                    data-testid={`user-name-${user.id}`}
                                >
                                    {user.firstName} {user.lastName}
                                </h3>

                                <p
                                    style={{
                                        margin: '0 0 12px 0',
                                        fontSize: '14px',
                                        color: '#666',
                                        fontWeight: '500'
                                    }}
                                    data-testid={`user-role-${user.id}`}
                                >
                                    {getRoleLabel(user.roleId)}
                                </p>

                                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }} data-testid={`user-info-${user.id}`}>
                                    <div style={infoRowStyle} data-testid={`user-email-${user.id}`}>
                                        <span>✉️</span>
                                        <span>{user.email}</span>
                                    </div>

                                    {user.telephone && (
                                        <div style={infoRowStyle} data-testid={`user-telephone-${user.id}`}>
                                            <span>📞</span>
                                            <span>{user.telephone}</span>
                                        </div>
                                    )}

                                    {teamName && (
                                        <div style={infoRowStyle} data-testid={`user-team-${user.id}`}>
                                            <span>👥</span>
                                            <span>{teamName}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default Trombinoscope;