import React, { useState, useEffect } from 'react';
import authService from '../services/authService';
import planningService from '../services/planningService';
import '../index.css';
import '../style/theme.css';

function Trombinoscope() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [badgeages, setBadgeages] = useState([]);
    const [plannings, setPlannings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);

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
            // Filter to show only employees (role_id = 0)
            const employees = Array.isArray(data) ? data.filter(u => u.roleId === 0) : [];
            setUsers(employees);
            setFilteredUsers(employees);
        } catch (error) {
            console.error('Error loading users:', error);
            alert('Impossible de charger la liste des employés');
        } finally {
            setLoading(false);
        }
    };

    const handleUserClick = async (user) => {
        setSelectedUser(user);
        setLoadingDetails(true);
        try {
            // Load badgeages
            const badgeResponse = await authService.get(`/badgeLogEvent/user/${user.id}`);
            if (badgeResponse.ok) {
                const badgeData = await badgeResponse.json();
                const sortedBadges = Array.isArray(badgeData)
                    ? badgeData
                        .map(item => ({ time: new Date(item.badgedAt) }))
                        .sort((a, b) => b.time - a.time)
                    : [];
                setBadgeages(sortedBadges);
            } else {
                setBadgeages([]);
            }

            // Load plannings (status 0 = pending, 1 = accepted)
            const planningData = await planningService.listByUser(user.id);
            const filteredPlannings = Array.isArray(planningData)
                ? planningData.filter(p => {
                    const statut = Number(p.statut ?? p.Statut ?? 0);
                    return statut === 0 || statut === 1; // Only pending and accepted
                })
                : [];
            setPlannings(filteredPlannings);
        } catch (error) {
            console.error('Error loading user details:', error);
            setBadgeages([]);
            setPlannings([]);
        } finally {
            setLoadingDetails(false);
        }
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('fr-FR', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
        });
    };

    const formatTime = (date) => {
        const pad = (n) => String(n).padStart(2, '0');
        const h = pad(date.getHours());
        const m = pad(date.getMinutes());
        const s = pad(date.getSeconds());
        return `${h}:${m}:${s}`;
    };

    const getStatutLabel = (statut) => {
        const s = Number(statut);
        if (s === 0) return 'En attente';
        if (s === 1) return 'Accepté';
        if (s === 2) return 'Refusé';
        return 'Inconnu';
    };

    const getStatutColor = (statut) => {
        const s = Number(statut);
        if (s === 0) return '#fbbf24'; // Yellow for pending
        if (s === 1) return '#10b981'; // Green for accepted
        if (s === 2) return '#ef4444'; // Red for rejected
        return '#6b7280';
    };

    const getTypeLabel = (typeId) => {
        const types = {
            1: 'Présence au bureau',
            2: 'Télétravail',
            3: 'Congé payé',
            4: 'Déplacement professionnel',
            5: 'Formation'
        };
        return types[typeId] || 'Inconnu';
    };

    const containerStyle = {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '20px'
    };

    const headerStyle = {
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '2px solid var(--color-primary)'
    };

    const searchStyle = {
        width: '100%',
        padding: '12px 16px',
        fontSize: '16px',
        borderRadius: '8px',
        border: '2px solid var(--color-primary)',
        fontFamily: 'Alata, sans-serif',
        marginBottom: '24px',
        outline: 'none'
    };

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: selectedUser ? '1fr 1fr' : 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
    };

    const userCardStyle = {
        background: 'var(--color-background)',
        border: '2px solid var(--color-primary)',
        borderRadius: '12px',
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        textAlign: 'center'
    };

    const userCardHoverStyle = {
        ...userCardStyle,
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
    };

    const detailsPanelStyle = {
        background: 'var(--color-background)',
        border: '2px solid var(--color-primary)',
        borderRadius: '12px',
        padding: '24px',
        maxHeight: '80vh',
        overflowY: 'auto'
    };

    const sectionStyle = {
        marginBottom: '32px'
    };

    const sectionTitleStyle = {
        fontSize: '20px',
        fontWeight: 600,
        color: 'var(--color-secondary)',
        marginBottom: '16px',
        fontFamily: 'Alata, sans-serif',
        borderBottom: '1px solid var(--color-primary)',
        paddingBottom: '8px'
    };

    const listItemStyle = {
        padding: '12px',
        marginBottom: '8px',
        background: 'rgba(31, 139, 76, 0.05)',
        borderRadius: '8px',
        border: '1px solid var(--color-primary)'
    };

    if (loading) {
        return (
            <div style={containerStyle}>
                <p>Chargement des employés...</p>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <h1 style={{ color: 'var(--color-secondary)', fontFamily: 'Alata, sans-serif' }}>
                    Trombinoscope
                </h1>
                <p style={{ color: 'var(--color-second-text)', marginTop: '8px' }}>
                    Cliquez sur un employé pour voir ses détails
                </p>
            </div>

            <input
                type="text"
                placeholder="Rechercher un employé (nom, prénom, email)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={searchStyle}
            />

            <div style={gridStyle}>
                {filteredUsers.map(user => (
                    <div
                        key={user.id}
                        onClick={() => handleUserClick(user)}
                        style={selectedUser?.id === user.id ? userCardHoverStyle : userCardStyle}
                        onMouseEnter={(e) => {
                            if (selectedUser?.id !== user.id) {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (selectedUser?.id !== user.id) {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }
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
                            margin: 0, 
                            fontSize: '14px', 
                            color: 'var(--color-second-text)' 
                        }}>
                            {user.email}
                        </p>
                    </div>
                ))}
            </div>

            {selectedUser && (
                <div style={detailsPanelStyle}>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '24px',
                        paddingBottom: '16px',
                        borderBottom: '2px solid var(--color-primary)'
                    }}>
                        <h2 style={{ 
                            margin: 0, 
                            color: 'var(--color-secondary)',
                            fontFamily: 'Alata, sans-serif'
                        }}>
                            Détails de {selectedUser.firstName} {selectedUser.lastName}
                        </h2>
                        <button
                            onClick={() => {
                                setSelectedUser(null);
                                setBadgeages([]);
                                setPlannings([]);
                            }}
                            style={{
                                background: 'var(--color-primary)',
                                color: 'var(--color-third)',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontFamily: 'Alata, sans-serif',
                                fontWeight: 600
                            }}
                        >
                            Fermer
                        </button>
                    </div>

                    {loadingDetails ? (
                        <p>Chargement des détails...</p>
                    ) : (
                        <>
                            <div style={sectionStyle}>
                                <h3 style={sectionTitleStyle}>Badgeages</h3>
                                {badgeages.length === 0 ? (
                                    <p style={{ color: 'var(--color-second-text)' }}>
                                        Aucun badgeage enregistré
                                    </p>
                                ) : (
                                    <div>
                                        {badgeages.map((badge, index) => (
                                            <div key={index} style={listItemStyle}>
                                                <div style={{ 
                                                    display: 'flex', 
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}>
                                                    <div>
                                                        <strong>{formatDate(badge.time)}</strong>
                                                        <span style={{ marginLeft: '12px', color: 'var(--color-second-text)' }}>
                                                            {formatTime(badge.time)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div style={sectionStyle}>
                                <h3 style={sectionTitleStyle}>Plannings (en cours et acceptés)</h3>
                                {plannings.length === 0 ? (
                                    <p style={{ color: 'var(--color-second-text)' }}>
                                        Aucun planning en cours ou accepté
                                    </p>
                                ) : (
                                    <div>
                                        {plannings.map((planning, index) => {
                                            const date = new Date(planning.date ?? planning.Date);
                                            const period = planning.period ?? planning.Period;
                                            const statut = planning.statut ?? planning.Statut;
                                            const typeId = planning.demandTypeId ?? planning.DemandTypeId ?? planning.typeDemandeId ?? planning.TypeDemandeId;
                                            
                                            return (
                                                <div key={index} style={listItemStyle}>
                                                    <div style={{ 
                                                        display: 'flex', 
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        flexWrap: 'wrap',
                                                        gap: '8px'
                                                    }}>
                                                        <div>
                                                            <strong>{formatDate(date)}</strong>
                                                            <span style={{ 
                                                                marginLeft: '12px', 
                                                                color: 'var(--color-second-text)'
                                                            }}>
                                                                {period === '0' ? 'Matin' : period === '1' ? 'Après-midi' : period}
                                                            </span>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                            <span style={{ 
                                                                padding: '4px 12px',
                                                                borderRadius: '12px',
                                                                fontSize: '12px',
                                                                fontWeight: 600,
                                                                background: getStatutColor(statut),
                                                                color: 'white'
                                                            }}>
                                                                {getStatutLabel(statut)}
                                                            </span>
                                                            <span style={{ 
                                                                color: 'var(--color-second-text)',
                                                                fontSize: '14px'
                                                            }}>
                                                                {getTypeLabel(typeId)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default Trombinoscope;

