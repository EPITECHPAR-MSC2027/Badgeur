import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import '../style/Admin.css';
import authService from '../services/authService';
import UsersSection from '../component/UsersSection';
import TeamsSection from '../component/TeamsSection';
import PointagesSection from '../component/PointagesSection';
import PlanningsSection from '../component/PlanningsSection';
import TypeDemandesSection from '../component/TypeDemandesSection';
import SeedDataPanel from '../component/SeedDataPanel';
import AdminAnalytics from './AdminAnalytics';
// Use authService with baseURL handled centrally


function Admin() {
    const [searchParams] = useSearchParams();
    const [users, setUsers] = useState([]);
    const [teams, setTeams] = useState([]);

    const [activeSection, setActiveSection] = useState('users'); 

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

    // Gérer le paramètre de query pour afficher directement analytics
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'analytics') {
            setActiveSection('analytics');
        }
    }, [searchParams]);

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
            // Backend does not expose /badgeLogEvent/range; fetch user events if userId set or all then filter
            let events = [];
            if (pointageFilters.userId) {
                const res = await authService.get(`/badgeLogEvent/user/${pointageFilters.userId}`);
                if (!res.ok && res.status !== 404) throw new Error('Erreur lors du chargement des pointages');
                events = res.status === 404 ? [] : await res.json();
            } else {
                const res = await authService.get('/badgeLogEvent');
                if (!res.ok && res.status !== 404) throw new Error('Erreur lors du chargement des pointages');
                events = res.status === 404 ? [] : await res.json();
            }
            const start = new Date(pointageFilters.startDate);
            const end = new Date(pointageFilters.endDate);
            end.setHours(23,59,59,999);
            const filtered = Array.isArray(events) ? events.filter(e => {
                const d = new Date(e.badgedAt);
                return d >= start && d <= end;
            }) : [];
            setPointages(filtered);
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
                const response = await authService.delete(`/badgeLogEvent/${pointageId}`);
                if (!response.ok) throw new Error('Erreur lors de la suppression');
                await fetchPointages();
            } catch (error) {
                console.error('Erreur:', error);
            }
        }
    };

    const handleEditPointage = async (pointageId, updatedData) => {
        try {
            const response = await authService.put(`/badgeLogEvent/${pointageId}`, updatedData);
            
            if (!response.ok) throw new Error('Erreur lors de la modification');
            await fetchPointages();
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la modification du pointage');
        }
    };

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
                    <button 
                        className={`nav-button ${activeSection === 'plannings' ? 'active' : ''}`}
                        onClick={() => setActiveSection('plannings')}
                    >
                        Plannings
                    </button>
                    <button 
                        className={`nav-button ${activeSection === 'typeDemandes' ? 'active' : ''}`}
                        onClick={() => setActiveSection('typeDemandes')}
                    >
                        Types de demande
                    </button>
                    <button 
                        className={`nav-button ${activeSection === 'analytics' ? 'active' : ''}`}
                        onClick={() => setActiveSection('analytics')}
                    >
                        Analytics
                    </button>
                </div>
            </header>
            <div className="admin-page">
                 {activeSection === 'users' ? (
                     <UsersSection />
                 ) : activeSection === 'teams' ? (
                     <TeamsSection />
                 ) : activeSection === 'pointages' ? (
                     <PointagesSection 
                         onEditPointage={handleEditPointage}
                         onDeletePointage={handleDeletePointage}
                     />
                 ) : activeSection === 'plannings' ? (
                     <PlanningsSection />
                 ) : activeSection === 'analytics' ? (
                     <AdminAnalytics />
                 ) : (
                     <TypeDemandesSection />
                 )}
            </div>
        </div>
    );
}

export default Admin;