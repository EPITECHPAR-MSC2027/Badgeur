import React, { useState, useEffect } from 'react';
import '../style/Admin.css';
import authService from '../services/authService';
import UsersSection from '../component/UsersSection';
import TeamsSection from '../component/TeamsSection';
import PointagesSection from '../component/PointagesSection';
import SeedDataPanel from '../component/SeedDataPanel';


function Admin() {
    const [users, setUsers] = useState([]);
    const [teams, setTeams] = useState([]);

    const [activeSection, setActiveSection] = useState('users'); // nouvelle état pour la navigation

    const [filters, setFilters] = useState({
        roleId: '',
        teamId: '',
    });
    const [sortConfig, setSortConfig] = useState({
        key: 'lastName',
        direction: 'asc'
    });

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

    const handleSort = (key) => {
        setSortConfig(prevConfig => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const filteredAndSortedUsers = users
        .filter(user => {
            return (filters.roleId === '' || user.roleId === Number(filters.roleId)) &&
                   (filters.teamId === '' || user.teamId === Number(filters.teamId));
        })
        .sort((a, b) => {
            if (sortConfig.direction === 'asc') {
                return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1;
            }
            return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1;
        });

    const [pointages, setPointages] = useState([]);
    const [pointageFilters, setPointageFilters] = useState({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        userId: ''
    });

    const fetchPointages = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/badgeLogEvent/range?startDate=${pointageFilters.startDate}&endDate=${pointageFilters.endDate}${pointageFilters.userId ? `&userId=${pointageFilters.userId}` : ''}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            if (!response.ok) throw new Error('Erreur lors du chargement des pointages');
            const data = await response.json();
            setPointages(data);
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    useEffect(() => {
        if (activeSection === 'pointages') {
            fetchPointages();
        }
    }, [activeSection, pointageFilters]);

    const handleDeletePointage = async (pointageId) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce pointage ?')) {
            try {
                const response = await fetch(`http://localhost:3000/api/badgeLogEvent/${pointageId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    }
                });
                if (!response.ok) throw new Error('Erreur lors de la suppression');
                await fetchPointages();
            } catch (error) {
                console.error('Erreur:', error);
            }
        }
    };

    const handleEditPointage = async (pointageId, updatedData) => {
        try {
            const response = await fetch(`http://localhost:3000/api/badgeLogEvent/${pointageId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData)
            });
            
            if (!response.ok) throw new Error('Erreur lors de la modification');
            await fetchPointages();
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la modification du pointage');
        }
    };

    // Passez la fonction handleEditPointage au composant PointagesSection
    return (
        <div className="App">
            <header className="App-header">
                <h1>Administration</h1>
                <SeedDataPanel />
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
                    <button 
                        className={`nav-button ${activeSection === 'pointages' ? 'active' : ''}`}
                        onClick={() => setActiveSection('pointages')}
                    >
                        Pointages
                    </button>
                </div>
            </header>
            <div className="admin-page">
                 {activeSection === 'users' ? (
                     <UsersSection />
                 ) : activeSection === 'teams' ? (
                     <TeamsSection />
                 ) : (
                     <PointagesSection 
                         onEditPointage={handleEditPointage}
                         onDeletePointage={handleDeletePointage}
                     />
                 )}
            </div>
        </div>
    );
}

export default Admin;