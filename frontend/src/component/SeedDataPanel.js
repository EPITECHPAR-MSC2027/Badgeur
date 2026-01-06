import React, { useState } from 'react';
import authService from '../services/authService';

function SeedDataPanel() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(10); // Octobre
    const [selectedYear, setSelectedYear] = useState(2025);

    const generateTestData = async () => {
        setLoading(true);
        setMessage('');
        
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                setMessage('Erreur: Utilisateur non connecté');
                return;
            }

            const random = () => Math.random();
            let eventsCreated = 0;
            
            // Calculer le nombre de jours dans le mois sélectionné
            const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
            
            // Démarrer au 1er du mois sélectionné
            const startDate = new Date(selectedYear, selectedMonth - 1, 1);

            for (let i = 0; i < daysInMonth; i++) {
                const date = new Date(startDate);
                date.setDate(date.getDate() + i);
                
                // Ignorer les weekends
                if (date.getDay() === 0 || date.getDay() === 6) continue;
                
                // 80% de chance d'avoir des pointages
                if (random() < 0.8) {
                    // Arrivée entre 8h et 9h30
                    const arrival = new Date(date);
                    arrival.setHours(8, 0, 0);
                    
                    // Pause déjeuner entre 12h et 13h
                    const lunchStart = new Date(date);
                    lunchStart.setHours(12, 0, 0);
                    
                    // Retour de pause (45-75 minutes après)
                    const lunchEnd = new Date(lunchStart);
                    lunchEnd.setMinutes(14, 0, 0);
                    
                    // Départ entre 17h et 19h
                    const departure = new Date(date);
                    departure.setHours(17, 0, 0);
                    
                    // Créer les 4 pointages
                    const events = [arrival, lunchStart, lunchEnd, departure];
                    
                    for (const eventTime of events) {
                        const payload = {
                            UserId: parseInt(userId),
                            BadgedAt: eventTime.toISOString()
                        };
                        
                        const response = await authService.post('/badgeLogEvent/', payload);
                        if (response.ok) {
                            eventsCreated++;
                        }
                    }
                }
            }
            
            const monthNames = [
                'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
            ];
            
            setMessage(`✅ ${eventsCreated} événements créés avec succès pour ${monthNames[selectedMonth - 1]} ${selectedYear} !`);
        } catch (error) {
            console.error('Erreur:', error);
            setMessage(`❌ Erreur: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const clearTestData = async () => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer TOUTES vos données de pointage ?')) {
            return;
        }
        
        setLoading(true);
        setMessage('');
        
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                setMessage('Erreur: Utilisateur non connecté');
                return;
            }

            const response = await authService.get(`/badgeLogEvent/user/${userId}`);
            
            if (!response.ok) {
                setMessage('Erreur lors de la récupération des données');
                return;
            }
            
            const events = await response.json();
            let deletedCount = 0;
            
            for (const event of events) {
                const deleteResponse = await authService.delete(`/badgeLogEvent/${event.id}`);
                if (deleteResponse.ok || deleteResponse.status === 204) {
                    deletedCount++;
                }
            }
            
            setMessage(`✅ ${deletedCount} événements supprimés`);
        } catch (error) {
            console.error('Erreur:', error);
            setMessage(`❌ Erreur: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const cardStyle = {
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-secondary)',
        borderRadius: '9px',
        padding: '20px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        marginBottom: '20px'
    };

    const buttonStyle = {
        padding: '10px 20px',
        margin: '10px 5px',
        borderRadius: '5px',
        border: 'none',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontWeight: '600',
        fontSize: '14px',
        opacity: loading ? 0.6 : 1
    };

    const generateButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#10b981',
        color: 'white'
    };

    const clearButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#ef4444',
        color: 'white'
    };

    return (
        <div style={cardStyle}>
            <h2 style={{ margin: '0 0 15px 0', fontWeight: 500 }}>🧪 Données de Test</h2>
            <p style={{ color: 'var(--color-second-text)', marginBottom: '15px' }}>
                Générez des données de pointage fictives pour un mois spécifique
            </p>
            
            <div style={{ marginBottom: '15px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                <div>
                    <label style={{ marginRight: '10px', fontWeight: '600' }}>Mois :</label>
                    <select 
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        style={{ 
                            padding: '8px', 
                            borderRadius: '5px', 
                            border: '1px solid var(--color-second-text)',
                            backgroundColor: 'var(--color-primary)',
                            color: 'var(--color-secondary)'
                        }}
                    >
                        <option value="1">Janvier</option>
                        <option value="2">Février</option>
                        <option value="3">Mars</option>
                        <option value="4">Avril</option>
                        <option value="5">Mai</option>
                        <option value="6">Juin</option>
                        <option value="7">Juillet</option>
                        <option value="8">Août</option>
                        <option value="9">Septembre</option>
                        <option value="10">Octobre</option>
                        <option value="11">Novembre</option>
                        <option value="12">Décembre</option>
                    </select>
                </div>
                
                <div>
                    <label style={{ marginRight: '10px', fontWeight: '600' }}>Année :</label>
                    <input 
                        type="number" 
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        min="2020"
                        max="2030"
                        style={{ 
                            padding: '8px', 
                            borderRadius: '5px', 
                            border: '1px solid var(--color-second-text)',
                            backgroundColor: 'var(--color-primary)',
                            color: 'var(--color-secondary)',
                            width: '100px'
                        }}
                    />
                </div>
            </div>
            
            <div>
                <button 
                    style={generateButtonStyle}
                    onClick={generateTestData}
                    disabled={loading}
                >
                    {loading ? '⏳ Génération...' : '✨ Générer des données'}
                </button>
                
                <button 
                    style={clearButtonStyle}
                    onClick={clearTestData}
                    disabled={loading}
                >
                    {loading ? '⏳ Suppression...' : '🗑️ Supprimer toutes les données'}
                </button>
            </div>
            
            {message && (
                <div style={{ 
                    marginTop: '15px', 
                    padding: '10px', 
                    borderRadius: '5px',
                    backgroundColor: message.includes('❌') ? '#fee2e2' : '#d1fae5',
                    color: message.includes('❌') ? '#991b1b' : '#065f46'
                }}>
                    {message}
                </div>
            )}
        </div>
    );
}

export default SeedDataPanel;