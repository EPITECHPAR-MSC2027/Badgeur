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
        loadUserData();
    }, [loadUserData]);

    useEffect(() => {
        if (user) {
            loadBadgeages();
            loadTeamAndManager();
        }
    }, [selectedDate, user, loadBadgeages, loadTeamAndManager]);

    const getRoleLabel = (roleId) => {
        switch (roleId) {
            case 0: return 'Employé';
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
        border: '2px solid var(--color-secondary)'
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
        color: 'var(--color-third)',
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
    }

    if (loading) {
        return (
            <div style={containerStyle}>
                <p>Chargement du profil...</p>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <div>
                    <h1 style={{ 
                        color: 'var(--color-secondary)', 
                        fontFamily: 'Alata, sans-serif',
                        marginTop: '50px'
                    }}>
                        Profil de {user.firstName} {user.lastName}
                    </h1>
                    <p style={{ 
                        color: 'var(--color-text)', 
                        marginTop: '8px',
                        margin: '8px 0 0 0'
                    }}>
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
                >
                    ← Retour
                </button>
            </div>

            <div style={infoCardStyle}>
                <h2 style={{ 
                    color: 'var(--color-secondary)', 
                    fontFamily: 'Alata, sans-serif',
                    marginTop: 0,
                    marginBottom: '16px'
                }}>
                    Informations
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                    <div>
                        <p style={informationStyle}>
                            Email
                        </p>
                        <p style={{ margin: 0, color: 'var(--color-text)', fontSize: '16px' }}>
                            {user.email}
                        </p>
                    </div>
                    {user.telephone && (
                        <div>
                            <p style={informationStyle}>
                                Téléphone
                            </p>
                            <p style={{ margin: 0, color: 'var(--color-text)', fontSize: '16px' }}>
                                {user.telephone}
                            </p>
                        </div>
                    )}
                    {teamName && (
                        <div>
                            <p style={informationStyle}>
                                Équipe
                            </p>
                            <p style={{ margin: 0, color: 'var(--color-text)', fontSize: '16px' }}>
                                {teamName}
                            </p>
                        </div>
                    )}
                    {managerName && user.roleId === 0 && (
                        <div>
                            <p style={informationStyle}>
                                Manager
                            </p>
                            <p style={{ margin: 0, color: 'var(--color-text)', fontSize: '16px' }}>
                                {managerName}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div style={infoCardStyle}>
                <h2 style={{ 
                    color: 'var(--color-secondary)', 
                    fontFamily: 'Alata, sans-serif',
                    marginTop: 0,
                    marginBottom: '16px'
                }}>
                    Historique de pointage
                </h2>
                
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ 
                        display: 'block', 
                        marginBottom: '8px',
                        color: 'var(--color-text)',
                        fontWeight: 600,
                        fontSize: '14px'
                    }}>
                        Sélectionner un jour
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
                    />
                </div>

                {loadingBadgeages ? (
                    <p style={{ color: 'var(--color-text)' }}>Chargement des pointages...</p>
                ) : filteredBadges.length === 0 ? (
                    <div style={informationStyle}>
                        <p style={{ fontSize: '18px', margin: 0 }}>
                            Aucun pointage enregistré pour le {formatDate(new Date(selectedDate))}
                        </p>
                    </div>
                ) : (
                    <div>
                        <p style={{ 
                            color: 'var(--color-text)', 
                            marginBottom: '16px',
                            fontSize: '16px',
                            fontWeight: 600
                        }}>
                            {filteredBadges.length} pointage{filteredBadges.length > 1 ? 's' : ''} le {formatDate(new Date(selectedDate))}
                        </p>
                        <div>
                            {filteredBadges.map((badge, index) => (
                                <div 
                                    key={badge.id || index} 
                                    style={badgeCardStyle}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateX(4px)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateX(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <div style={timeBadgeStyle}>
                                        {formatTime(badge.time)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ 
                                            margin: 0, 
                                            color: 'var(--color-text)',
                                            fontSize: '16px',
                                            fontWeight: 600
                                        }}>
                                            Pointage #{index + 1}
                                        </p>
                                        <p style={{ 
                                            margin: '4px 0 0 0', 
                                            color: 'var(--color-second-text)',
                                            fontSize: '14px'
                                        }}>
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