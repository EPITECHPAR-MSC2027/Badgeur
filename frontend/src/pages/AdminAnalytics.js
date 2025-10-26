import React, { useState, useEffect } from 'react';
import '../style/Analytics.css';
import '../style/Chart.css';
import authService from '../services/authService';
import KPICard from '../component/KPICard';
import PresenceChart from '../component/PresenceChart';
import WeeklyHoursChart from '../component/WeeklyHoursChart';
import TeamStatsChart from '../component/TeamStatsChart';
import HeatmapCalendar from '../component/HeatmapCalendar';

function AdminAnalytics() {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedTeam, setSelectedTeam] = useState('');
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [teams, setTeams] = useState([]);
    const [users, setUsers] = useState([]);

    const months = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

    useEffect(() => {
        fetchTeams();
        fetchUsers();
    }, []);

    useEffect(() => {
        if (teams.length > 0 && users.length > 0) {
            fetchAnalyticsData();
        }
    }, [selectedMonth, selectedYear, selectedTeam, teams, users]);

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
            setError('Impossible de charger la liste des équipes');
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await authService.get('/users');
            if (response.status === 404) {
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
            setError('Impossible de charger la liste des utilisateurs');
        }
    };

    const fetchAnalyticsData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Filtrer les utilisateurs selon l'équipe sélectionnée
            const filteredUsers = selectedTeam 
                ? users.filter(user => user.teamId === Number(selectedTeam))
                : users;

            if (filteredUsers.length === 0) {
                setAnalyticsData({
                    teamData: [],
                    teamKPIs: {},
                    month: selectedMonth,
                    year: selectedYear
                });
                setLoading(false);
                return;
            }

            // Récupérer les données pour chaque utilisateur de l'équipe
            const teamData = await Promise.all(
                filteredUsers.map(async (user) => {
                    try {
                        // Récupérer les KPIs de l'utilisateur
                        const kpiResponse = await authService.get(`/kpis/${user.id}`);
                        let kpiData = null;
                        
                        if (kpiResponse.ok) {
                            kpiData = await kpiResponse.json();
                        }

                        // Récupérer les événements de badge de l'utilisateur
                        const eventsResponse = await authService.get(`/badgeLogEvent/user/${user.id}`);
                        let events = [];
                        
                        if (eventsResponse.ok) {
                            const allEvents = await eventsResponse.json();
                            events = Array.isArray(allEvents) ? allEvents : [];
                        }

                        // Filtrer les événements pour la période sélectionnée
                        const filteredEvents = events.filter(event => {
                            const eventDate = new Date(event.badgedAt);
                            return eventDate.getMonth() + 1 === selectedMonth && 
                                   eventDate.getFullYear() === selectedYear;
                        });

                        return {
                            user,
                            kpi: kpiData,
                            events: filteredEvents
                        };
                    } catch (err) {
                        console.error(`Erreur pour l'utilisateur ${user.id}:`, err);
                        return {
                            user,
                            kpi: null,
                            events: []
                        };
                    }
                })
            );

            // Calculer les KPIs d'équipe
            const teamKPIs = calculateTeamKPIs(teamData);

            setAnalyticsData({
                teamData,
                teamKPIs,
                month: selectedMonth,
                year: selectedYear
            });
        } catch (err) {
            console.error('Erreur lors du chargement des données:', err);
            setError(err.message || 'Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    const calculateTeamKPIs = (teamData) => {
        if (!teamData || teamData.length === 0) {
            return {
                teamSize: 0,
                avgDailyHours: 0,
                avgWeeklyHours: 0,
                presenceRate: 0,
                absenceRate: 0,
                totalWorkingDays: 0,
                avgArrivalTime: 'N/A',
                avgDepartureTime: 'N/A'
            };
        }

        const teamSize = teamData.length;
        let totalDailyHours = 0;
        let totalPresenceDays = 0;
        let totalWorkingDays = 0;
        let arrivalTimes = [];
        let departureTimes = [];

        teamData.forEach(({ user, kpi, events }) => {
            // Calculer les heures moyennes quotidiennes
            if (kpi && (kpi.raw7 || kpi.raw14)) {
                try {
                    const sourceRaw = kpi.raw7 || kpi.raw14;
                    const timeParts = sourceRaw.split(':');
                    if (timeParts.length === 2) {
                        const hours = parseInt(timeParts[0], 10);
                        const minutes = parseInt(timeParts[1], 10);
                        totalDailyHours += hours + (minutes / 60);
                    }
                } catch (e) {
                    console.error('Erreur parsing RAW value:', e);
                }
            }

            // Calculer les jours de présence
            const workingDays = new Set(events.map(e => new Date(e.badgedAt).toDateString())).size;
            totalPresenceDays += workingDays;
            totalWorkingDays += workingDays;

            // Collecter les heures d'arrivée et de départ
            if (kpi) {
                if (kpi.raat7) arrivalTimes.push(new Date(kpi.raat7));
                if (kpi.radt7) departureTimes.push(new Date(kpi.radt7));
            }
        });

        const avgDailyHours = teamSize > 0 ? totalDailyHours / teamSize : 0;
        const avgWeeklyHours = avgDailyHours * 5;
        const totalDaysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
        const presenceRate = totalDaysInMonth > 0 ? (totalPresenceDays / (teamSize * totalDaysInMonth)) * 100 : 0;
        const absenceRate = 100 - presenceRate;

        // Calculer les heures moyennes d'arrivée et de départ
        const avgArrivalTime = arrivalTimes.length > 0 
            ? new Date(arrivalTimes.reduce((sum, time) => sum + time.getTime(), 0) / arrivalTimes.length)
                .toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            : 'N/A';

        const avgDepartureTime = departureTimes.length > 0 
            ? new Date(departureTimes.reduce((sum, time) => sum + time.getTime(), 0) / departureTimes.length)
                .toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            : 'N/A';

        return {
            teamSize,
            avgDailyHours: avgDailyHours.toFixed(1),
            avgWeeklyHours: avgWeeklyHours.toFixed(1),
            presenceRate: presenceRate.toFixed(1),
            absenceRate: absenceRate.toFixed(1),
            totalWorkingDays,
            avgArrivalTime,
            avgDepartureTime
        };
    };

    const handleExport = () => {
        console.log('Export analytics data');
        // TODO: Implémenter l'export des données
    };

    const kpis = analyticsData?.teamKPIs || {};

    return (
        <div className="analytics-page">
            <div className="analytics-header">
                <div>
                    <h1>Analytics Équipe</h1>
                    <p>Analyse et statistiques de l'équipe</p>
                </div>
                <button className="export-btn" onClick={handleExport}>
                    📊 Exporter
                </button>
            </div>

            <div className="filters-section">
                <div className="filter-group">
                    <label>Équipe:</label>
                    <select 
                        value={selectedTeam} 
                        onChange={(e) => setSelectedTeam(e.target.value)}
                    >
                        <option value="">Toutes les équipes</option>
                        {teams.map(team => (
                            <option key={team.id} value={team.id}>{team.name}</option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <label>Mois:</label>
                    <select 
                        value={selectedMonth} 
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    >
                        {months.map((month, index) => (
                            <option key={index} value={index + 1}>{month}</option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <label>Année:</label>
                    <select 
                        value={selectedYear} 
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    >
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="loading">Chargement des données...</div>
            ) : error ? (
                <div className="error-message">
                    <h3>⚠️ Erreur</h3>
                    <p>{error}</p>
                    <button onClick={fetchAnalyticsData} className="retry-btn">
                        🔄 Réessayer
                    </button>
                </div>
            ) : (
                <>
                    <div className="kpi-grid">
                        <KPICard 
                            title="Taille de l'équipe" 
                            value={`${kpis.teamSize || 0} personne${(kpis.teamSize || 0) > 1 ? 's' : ''}`}
                            description="Effectif total"
                        />
                        <KPICard 
                            title="Heures/jour moyennes" 
                            value={`${kpis.avgDailyHours || 0}h`}
                            description="Moyenne par personne"
                        />
                        <KPICard 
                            title="Heures/semaine moyennes" 
                            value={`${kpis.avgWeeklyHours || 0}h`}
                            description="Moyenne par personne"
                        />
                        <KPICard 
                            title="Taux de présence" 
                            value={`${kpis.presenceRate || 0}%`}
                            description={`${kpis.absenceRate || 0}% d'absence`}
                        />
                        <KPICard 
                            title="Jours travaillés" 
                            value={`${kpis.totalWorkingDays || 0}`}
                            description="Total de l'équipe"
                        />
                        <KPICard 
                            title="Heure d'arrivée moyenne" 
                            value={kpis.avgArrivalTime || 'N/A'}
                            description="Moyenne de l'équipe"
                        />
                        <KPICard 
                            title="Heure de départ moyenne" 
                            value={kpis.avgDepartureTime || 'N/A'}
                            description="Moyenne de l'équipe"
                        />
                    </div>

                    {analyticsData?.teamData && analyticsData.teamData.length > 0 ? (
                        <div className="charts-section">
                            <div className="chart-container">
                                <h3>Présence de l'équipe</h3>
                                <PresenceChart data={analyticsData.teamData.flatMap(member => member.events)} />
                            </div>
                            <div className="chart-container">
                                <h3>Heures hebdomadaires de l'équipe</h3>
                                <WeeklyHoursChart data={analyticsData.teamData.flatMap(member => member.events)} />
                            </div>
                            <div className="chart-container">
                                <h3>Statistiques d'équipe</h3>
                                <TeamStatsChart teamData={analyticsData.teamData} />
                            </div>
                        </div>
                    ) : (
                        <div className="no-data-message">
                            <p>Aucune donnée disponible pour cette période</p>
                        </div>
                    )}

                    <div className="team-members-section">
                        <h3>Membres de l'équipe</h3>
                        <div className="team-members-grid">
                            {analyticsData?.teamData?.map(({ user, kpi, events }) => (
                                <div key={user.id} className="member-card">
                                    <div className="member-header">
                                        <h4>{user.firstName} {user.lastName}</h4>
                                        <span className="member-role">{user.role?.name || 'N/A'}</span>
                                    </div>
                                    <div className="member-stats">
                                        <div className="stat">
                                            <span className="stat-label">Jours travaillés:</span>
                                            <span className="stat-value">
                                                {new Set(events.map(e => new Date(e.badgedAt).toDateString())).size}
                                            </span>
                                        </div>
                                        <div className="stat">
                                            <span className="stat-label">Heures/jour:</span>
                                            <span className="stat-value">
                                                {kpi?.raw7 ? `${kpi.raw7}h` : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="stat">
                                            <span className="stat-label">Arrivée:</span>
                                            <span className="stat-value">
                                                {kpi?.raat7 ? new Date(kpi.raat7).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="stat">
                                            <span className="stat-label">Départ:</span>
                                            <span className="stat-value">
                                                {kpi?.radt7 ? new Date(kpi.radt7).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="calendar-section">
                        <h3>Calendrier de présence de l'équipe</h3>
                        <HeatmapCalendar 
                            month={selectedMonth} 
                            year={selectedYear} 
                            data={analyticsData?.teamData?.flatMap(member => member.events) || []} 
                        />
                    </div>
                </>
            )}
        </div>
    );
}

export default AdminAnalytics;
