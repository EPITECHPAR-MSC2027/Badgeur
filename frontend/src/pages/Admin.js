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
                ) : (
                    <TypeDemandesSection />
                )}
            </div>
        </div>
    );
}

export default Admin;