import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import '../index.css';
import '../style/theme.css';

function UserProfile() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [badgeages, setBadgeages] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);
    const [loadingBadgeages, setLoadingBadgeages] = useState(false);
    const [teamName, setTeamName] = useState(null);
    const [managerName, setManagerName] = useState(null);
    const currentUserRoleId = parseInt(localStorage.getItem('roleId'));

    // Vérifier l'accès dès le montage du composant
    useEffect(() => {
        if (currentUserRoleId !== 3) {
            alert('Accès refusé. Seuls les RH peuvent accéder aux profils détaillés.');
            navigate('/trombinoscope');
        }
    }, [currentUserRoleId, navigate]);

    const loadUserData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await authService.get('/users');
            if (response.ok) {
                const users = await response.json();
                const userData = Array.isArray(users) ? users.find(u => u.id === parseInt(userId)) : null;
                if (userData) {
                    setUser(userData);
                } else {
                    alert('Utilisateur non trouvé');
                    navigate('/trombinoscope');
                }
            } else {
                alert('Erreur lors du chargement des utilisateurs');
                navigate('/trombinoscope');
            }
        } catch (error) {
            console.error('Erreur lors du chargement de l\'utilisateur:', error);
            alert('Erreur lors du chargement de l\'utilisateur');
            navigate('/trombinoscope');
        } finally {
            setLoading(false);
        }
    }, [userId, navigate]);

    const loadTeamAndManager = useCallback(async () => {
        if (!user) return;
        try {
            const [teamsRes, usersRes] = await Promise.all([
                authService.get('/teams'),
                authService.get('/users')
            ]);

            if (teamsRes.ok && usersRes.ok) {
                const teams = await teamsRes.json();
                const users = await usersRes.json();
                const allTeams = Array.isArray(teams) ? teams : [];
                const allUsers = Array.isArray(users) ? users : [];

                if (user.teamId) {
                    const userTeam = allTeams.find(t => t.id === user.teamId);
                    if (userTeam) {
                        setTeamName(userTeam.teamName || `Équipe ${userTeam.id}`);

                        if (user.roleId === 0 && userTeam.managerId) {
                            const manager = allUsers.find(u => u.id === userTeam.managerId);
                            if (manager) {
                                setManagerName(`${manager.firstName} ${manager.lastName}`);
                            } else {
                                setManagerName(null);
                            }
                        } else {
                            setManagerName(null);
                        }
                    } else {
                        setTeamName(null);
                        setManagerName(null);
                    }
                } else {
                    setTeamName(null);
                    setManagerName(null);
                }
            }
        } catch (error) {
            console.error('Erreur lors du chargement de l\'équipe et du manager:', error);
            setTeamName(null);
            setManagerName(null);
        }
    }, [user]);

    const loadBadgeages = useCallback(async () => {
        if (!user) return;
        try {
            setLoadingBadgeages(true);
            const response = await authService.get(`/badgeLogEvent/user/${user.id}`);
            if (response.ok) {
                const data = await response.json();
                const allBadges = Array.isArray(data) ? data.map(item => ({
                    id: item.id,
                    time: new Date(item.badgedAt)
                })) : [];
                setBadgeages(allBadges);
            } else {
                setBadgeages([]);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des badgeages:', error);
            setBadgeages([]);
        } finally {
            setLoadingBadgeages(false);
        }
    }, [user]);

    useEffect(() => {
        if (currentUserRoleId === 3) {
            loadUserData();
        }
    }, [loadUserData, currentUserRoleId]);

    useEffect(() => {
        if (user && currentUserRoleId === 3) {
            loadBadgeages();
            loadTeamAndManager();
        }
    }, [selectedDate, user, loadBadgeages, loadTeamAndManager, currentUserRoleId]);

    const getRoleLabel = (roleId) => {
        switch (roleId) {
            case 0: return 'Employe';
            case 1: return 'Manager';
            case 2: return 'Admin';
            case 3: return 'RH';
            default: return 'Inconnu';
        }
    };

    const formatTime = (date) => {
        const pad = (n) => String(n).padStart(2, '0');
        const h = pad(date.getHours());
        const m = pad(date.getMinutes());
        const s = pad(date.getSeconds());
        return `${h}:${m}:${s}`;
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const filteredBadges = badgeages.filter(badge => {
        const badgeDate = badge.time.toISOString().split('T')[0];
        return badgeDate === selectedDate;
    }).sort((a, b) => a.time - b.time);

    const containerStyle = {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px'
    };

    const headerStyle = {
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '2px solid var(--color-secondary)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    };

    const infoCardStyle = {
        background: 'var(--color-primary)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
    };

    const badgeCardStyle = {
        background: 'var(--color-background)',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '12px',
        border: '2px solid var(--color-secondary)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        transition: 'all 0.2s ease'
    };

    const timeBadgeStyle = {
        background: 'var(--color-primary)',
        color: 'var(--color-text)',
        borderRadius: '8px',
        padding: '12px 20px',
        fontSize: '18px',
        fontWeight: 700,
        fontFamily: 'Alata, sans-serif',
        minWidth: '100px',
        textAlign: 'center'
    };

    const informationStyle = {
        margin: '0 0 4px 0',
        color: 'var(--color-text)',
        fontSize: '14px',
        fontWeight: '800'
    };

    // Bloquer l'accès si pas RH
    if (currentUserRoleId !== 3) {
        return null;
    }

    if (loading) {
        return (
            <div style={containerStyle} data-testid="loading-container">
                <p data-testid="loading-text">Chargement du profil...</p>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div style={containerStyle} data-testid="profile-container">
            <div style={headerStyle} data-testid="profile-header">
                <div>
                    <h1
                        style={{
                            color: 'var(--color-secondary)',
                            fontFamily: 'Alata, sans-serif',
                            marginTop: '50px'
                        }}
                        data-testid="profile-title"
                    >
                        Profil de {user.firstName} {user.lastName}
                    </h1>
                    <p
                        style={{
                            color: 'var(--color-text)',
                            marginTop: '8px',
                            margin: '8px 0 0 0'
                        }}
                        data-testid="user-role"
                    >
                        {getRoleLabel(user.roleId)}
                    </p>
                </div>
                <button
                    onClick={() => navigate('/trombinoscope')}
                    style={{
                        background: 'var(--color-primary)',
                        color: 'var(--color-text)',
                        border: '2px solid var(--color-secondary)',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontFamily: 'Alata, sans-serif',
                        fontWeight: 600,
                        fontSize: '14px'
                    }}
                    data-testid="back-button"
                >
                    ← Retour
                </button>
            </div>

            <div style={infoCardStyle} data-testid="info-card">
                <h2
                    style={{
                        color: 'var(--color-secondary)',
                        fontFamily: 'Alata, sans-serif',
                        marginTop: 0,
                        marginBottom: '16px'
                    }}
                    data-testid="info-section-title"
                >
                    Informations
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                    <div data-testid="email-field">
                        <p style={informationStyle}>
                            Email
                        </p>
                        <p style={{ margin: 0, color: 'var(--color-text)', fontSize: '16px' }} data-testid="user-email">
                            {user.email}
                        </p>
                    </div>
                    {user.telephone && (
                        <div data-testid="telephone-field">
                            <p style={informationStyle}>
                                Telephone
                            </p>
                            <p style={{ margin: 0, color: 'var(--color-text)', fontSize: '16px' }} data-testid="user-telephone">
                                {user.telephone}
                            </p>
                        </div>
                    )}
                    {teamName && (
                        <div data-testid="team-field">
                            <p style={informationStyle}>
                                Equipe
                            </p>
                            <p style={{ margin: 0, color: 'var(--color-text)', fontSize: '16px' }} data-testid="user-team">
                                {teamName}
                            </p>
                        </div>
                    )}
                    {managerName && user.roleId === 0 && (
                        <div data-testid="manager-field">
                            <p style={informationStyle}>
                                Manager
                            </p>
                            <p style={{ margin: 0, color: 'var(--color-text)', fontSize: '16px' }} data-testid="user-manager">
                                {managerName}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div style={infoCardStyle} data-testid="history-card">
                <h2
                    style={{
                        color: 'var(--color-secondary)',
                        fontFamily: 'Alata, sans-serif',
                        marginTop: 0,
                        marginBottom: '16px'
                    }}
                    data-testid="history-section-title"
                >
                    Historique de pointage
                </h2>

                <div style={{ marginBottom: '20px' }}>
                    <label
                        style={{
                            display: 'block',
                            marginBottom: '8px',
                            color: 'var(--color-text)',
                            fontWeight: 600,
                            fontSize: '14px',
                            fontFamily: 'Fustat, sans-serif'
                        }}
                        data-testid="date-label"
                    >
                        Selectionner un jour
                    </label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={{
                            padding: '10px 16px',
                            fontSize: '16px',
                            borderRadius: '8px',
                            border: '2px solid var(--color-secondary)',
                            fontFamily: 'Alata, sans-serif',
                            outline: 'none',
                            background: 'var(--color-background)',
                            color: 'var(--color-text)'
                        }}
                        data-testid="date-picker"
                    />
                </div>

                {loadingBadgeages ? (
                    <p style={{ color: 'var(--color-text)' }} data-testid="loading-badges">Chargement des pointages...</p>
                ) : filteredBadges.length === 0 ? (
                    <div style={informationStyle} data-testid="empty-badges-state">
                        <p style={{ fontSize: '18px', margin: 0 }} data-testid="empty-badges-message">
                            Aucun pointage enregistre pour le {formatDate(new Date(selectedDate))}
                        </p>
                    </div>
                ) : (
                    <div data-testid="badges-list-container">
                        <p
                            style={{
                                color: 'var(--color-text)',
                                marginBottom: '16px',
                                fontSize: '16px',
                                fontWeight: 600
                            }}
                            data-testid="badges-count"
                        >
                            {filteredBadges.length} pointage{filteredBadges.length > 1 ? 's' : ''} le {formatDate(new Date(selectedDate))}
                        </p>
                        <div data-testid="badges-list">
                            {filteredBadges.map((badge, index) => (
                                <div
                                    key={badge.id || index}
                                    style={badgeCardStyle}
                                    data-testid={`badge-card-${index}`}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateX(4px)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateX(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <div style={timeBadgeStyle} data-testid={`badge-time-${index}`}>
                                        {formatTime(badge.time)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p
                                            style={{
                                                margin: 0,
                                                color: 'var(--color-text)',
                                                fontSize: '16px',
                                                fontWeight: 600
                                            }}
                                            data-testid={`badge-label-${index}`}
                                        >
                                            Pointage #{index + 1}
                                        </p>
                                        <p
                                            style={{
                                                margin: '4px 0 0 0',
                                                color: 'var(--color-text)',
                                                fontSize: '14px'
                                            }}
                                            data-testid={`badge-full-time-${index}`}
                                        >
                                            {badge.time.toLocaleTimeString('fr-FR', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                second: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserProfile;