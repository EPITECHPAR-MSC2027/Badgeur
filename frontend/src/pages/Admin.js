import React, { useState } from 'react';
import '../style/Admin.css';
import authService from '../services/authService';
import UsersSection from '../component/UsersSection';
import TeamsSection from '../component/TeamsSection';
import PointagesSection from '../component/PointagesSection';
import PlanningsSection from '../component/PlanningsSection';
import TypeDemandesSection from '../component/TypeDemandesSection';
import SeedDataPanel from '../component/SeedDataPanel';

function Admin() {
    const [activeSection, setActiveSection] = useState('users');

    const handleDeletePointage = async (pointageId) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce pointage ?')) {
            try {
                const response = await authService.delete(`/badgeLogEvent/${pointageId}`);
                if (!response.ok) throw new Error('Erreur lors de la suppression');
                // Le composant PointagesSection devra gérer le refresh
            } catch (error) {
                console.error('Erreur:', error);
                alert('Erreur lors de la suppression du pointage');
            }
        }
    };

    const handleEditPointage = async (pointageId, updatedData) => {
        try {
            const response = await authService.put(`/badgeLogEvent/${pointageId}`, updatedData);
            if (!response.ok) throw new Error('Erreur lors de la modification');
            // Le composant PointagesSection devra gérer le refresh
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la modification du pointage');
        }
    };

    return (
        <div className="App" data-testid="admin-container">
            <header className="App-header" data-testid="admin-header">
                <h1 data-testid="admin-title">Administration</h1>
                <SeedDataPanel />
                <div className="admin-nav" data-testid="admin-nav">
                    <button
                        data-testid="nav-button-users"
                        className={`nav-button ${activeSection === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveSection('users')}
                        data-active={activeSection === 'users'}
                    >
                        Utilisateurs
                    </button>
                    <button
                        data-testid="nav-button-teams"
                        className={`nav-button ${activeSection === 'teams' ? 'active' : ''}`}
                        onClick={() => setActiveSection('teams')}
                        data-active={activeSection === 'teams'}
                    >
                        Équipes
                    </button>
                    <button
                        data-testid="nav-button-pointages"
                        className={`nav-button ${activeSection === 'pointages' ? 'active' : ''}`}
                        onClick={() => setActiveSection('pointages')}
                        data-active={activeSection === 'pointages'}
                    >
                        Pointages
                    </button>
                    <button
                        data-testid="nav-button-plannings"
                        className={`nav-button ${activeSection === 'plannings' ? 'active' : ''}`}
                        onClick={() => setActiveSection('plannings')}
                        data-active={activeSection === 'plannings'}
                    >
                        Plannings
                    </button>
                    <button
                        data-testid="nav-button-typeDemandes"
                        className={`nav-button ${activeSection === 'typeDemandes' ? 'active' : ''}`}
                        onClick={() => setActiveSection('typeDemandes')}
                        data-active={activeSection === 'typeDemandes'}
                    >
                        Types de demande
                    </button>
                </div>
            </header>
            <div className="admin-page" data-testid="admin-page">
                {activeSection === 'users' ? (
                    <UsersSection data-testid="users-section" />
                ) : activeSection === 'teams' ? (
                    <TeamsSection data-testid="teams-section" />
                ) : activeSection === 'pointages' ? (
                    <PointagesSection
                        data-testid="pointages-section"
                        onEditPointage={handleEditPointage}
                        onDeletePointage={handleDeletePointage}
                    />
                ) : activeSection === 'plannings' ? (
                    <PlanningsSection data-testid="plannings-section" />
                ) : (
                    <TypeDemandesSection data-testid="typeDemandes-section" />
                )}
            </div>
        </div>
    );
}

export default Admin;