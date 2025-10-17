import React, { useState, useEffect } from 'react';
import '../style/Analytics.css';
import '../style/Chart.css';
import analyticsService from '../services/analyticsService';
import KPICard from '../component/KPICard';
import PresenceChart from '../component/PresenceChart';
import WeeklyHoursChart from '../component/WeeklyHoursChart';
import HeatmapCalendar from '../component/HeatmapCalendar';
import ManagerAnalyticsPanel from '../component/ManagerAnalyticsPanel';

function Analytics() {
    const roleId = parseInt(localStorage.getItem('roleId') || '0', 10);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const months = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

    useEffect(() => {
        fetchAnalyticsData();
    }, [selectedMonth, selectedYear]);

    const fetchAnalyticsData = async () => {
        setLoading(true);
        setError(null);
        try {
            const userId = localStorage.getItem('userId');
            
            if (!userId) {
                setError('Utilisateur non connecté');
                setLoading(false);
                return;
            }

            console.log('Fetching analytics for userId:', userId);

            // Récupération via le service analytics
            const kpiData = await analyticsService.getMyKPIs();
            let events = await analyticsService.getUserBadgeEvents(Number(userId));
            console.log('KPI data:', kpiData);
            console.log('All events:', events);

            // Filter events for selected month/year
            const filteredEvents = events.filter(event => {
                const eventDate = new Date(event.badgedAt);
                return eventDate.getMonth() + 1 === selectedMonth && 
                       eventDate.getFullYear() === selectedYear;
            });

            console.log('Filtered events for', months[selectedMonth - 1], selectedYear, ':', filteredEvents);

            setAnalyticsData({
                kpi: kpiData,
                events: filteredEvents,
                month: selectedMonth,
                year: selectedYear
            });
        } catch (err) {
            console.error('Erreur lors du chargement des données:', err);
            setError(err.message || 'Erreur lors du chargement des données');
            setAnalyticsData({
                kpi: null,
                events: [],
                month: selectedMonth,
                year: selectedYear
            });
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        console.log('Export analytics data');
    };

    const calculateKPIs = () => {
        if (!analyticsData) return {};

        const { kpi, events } = analyticsData;
        
        let avgDailyHours = 0;
        let avgWeeklyHours = 0;
        let presenceRate = 0;
        let absenceRate = 0;

        if (kpi && (kpi.raw7 || kpi.raw14)) {
            try {
                // Parse raw7 if available, else raw14 (format "HH:mm")
                const sourceRaw = kpi.raw7 || kpi.raw14;
                const timeParts = sourceRaw.split(':');
                if (timeParts.length === 2) {
                    const hours = parseInt(timeParts[0], 10);
                    const minutes = parseInt(timeParts[1], 10);
                    avgDailyHours = hours + (minutes / 60);
                    avgWeeklyHours = avgDailyHours * 5;
                }
            } catch (e) {
                console.error('Error parsing RAW value:', e);
                avgDailyHours = 0;
            }
        }

        // Calculate presence rate from events
        const workingDays = new Set(events.map(e => new Date(e.badgedAt).toDateString())).size;
        const totalDaysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
        presenceRate = totalDaysInMonth > 0 ? (workingDays / totalDaysInMonth) * 100 : 0;
        absenceRate = 100 - presenceRate;

        // Parse times safely
        const formatTime = (timeStr) => {
            if (!timeStr) return 'N/A';
            try {
                const date = new Date(timeStr);
                return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            } catch {
                return timeStr;
            }
        };

        return {
            teamSize: 1,
            avgDailyHours: avgDailyHours.toFixed(1),
            avgWeeklyHours: avgWeeklyHours.toFixed(1),
            presenceRate: presenceRate.toFixed(1),
            absenceRate: absenceRate.toFixed(1),
            raat7: kpi?.raat7 ? formatTime(kpi.raat7) : 'N/A',
            raat14: kpi?.raat14 ? formatTime(kpi.raat14) : 'N/A',
            raat28: kpi?.raat28 ? formatTime(kpi.raat28) : 'N/A',
            radt7: kpi?.radt7 ? formatTime(kpi.radt7) : 'N/A',
            radt14: kpi?.radt14 ? formatTime(kpi.radt14) : 'N/A',
            radt28: kpi?.radt28 ? formatTime(kpi.radt28) : 'N/A',
            raw7: kpi?.raw7 || 'N/A',
            raw14: kpi?.raw14 || 'N/A',
            raw28: kpi?.raw28 || 'N/A'
        };
    };

    const kpis = calculateKPIs();

    return (
        <div className="analytics-page">
            <div className="analytics-header">
                <div>
                    <h1>Dashboard Analytics</h1>
                    <p>Analyse et statistiques de présence</p>
                </div>
                <button className="export-btn" onClick={handleExport}>
                    📊 Exporter
                </button>
            </div>

            <div className="filters-section">
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
                    {roleId === 1 && (
                        <ManagerAnalyticsPanel month={selectedMonth} year={selectedYear} />
                    )}
                    <div className="kpi-grid">
                        <KPICard 
                            title="Équipe" 
                            value={`${kpis.teamSize} personne${kpis.teamSize > 1 ? 's' : ''}`}
                            description="Effectif total"
                        />
                        <KPICard 
                            title="Heures/jour (7j)" 
                            value={kpis.raw7 ? `${kpis.raw7}h` : 'N/A'}
                            description="Moyenne 7 jours"
                        />
                        <KPICard 
                            title="Heures/jour" 
                            value={`${kpis.avgDailyHours}h`}
                            description="Moyenne quotidienne"
                        />
                        <KPICard 
                            title="Heures/semaine" 
                            value={`${kpis.avgWeeklyHours}h`}
                            description="Moyenne hebdomadaire"
                        />
                        <KPICard 
                            title="Taux de présence" 
                            value={`${kpis.presenceRate}%`}
                            description={`${kpis.absenceRate}% d'absence`}
                        />
                        <KPICard 
                            title="Heure d'arrivée (7j)" 
                            value={kpis.raat7}
                            description="Moyenne 7 jours"
                        />
                        <KPICard 
                            title="Heure d'arrivée" 
                            value={kpis.raat14}
                            description="Moyenne 14 jours"
                        />
                        <KPICard 
                            title="Heure d'arrivée (28j)" 
                            value={kpis.raat28}
                            description="Moyenne 28 jours"
                        />
                        <KPICard 
                            title="Heure de départ (7j)" 
                            value={kpis.radt7}
                            description="Moyenne 7 jours"
                        />
                        <KPICard 
                            title="Heure de départ" 
                            value={kpis.radt14}
                            description="Moyenne 14 jours"
                        />
                        <KPICard 
                            title="Heure de départ (28j)" 
                            value={kpis.radt28}
                            description="Moyenne 28 jours"
                        />
                        <KPICard 
                            title="Heures/jour (14j)" 
                            value={kpis.raw14 ? `${kpis.raw14}h` : 'N/A'}
                            description="Moyenne 14 jours"
                        />
                        <KPICard 
                            title="Heures/jour (28j)" 
                            value={kpis.raw28 ? `${kpis.raw28}h` : 'N/A'}
                            description="Moyenne 28 jours"
                        />
                    </div>

                    {analyticsData?.events && analyticsData.events.length > 0 ? (
                        <div className="charts-section">
                            <div className="chart-container">
                                <h3>Taux de présence mensuel</h3>
                                <PresenceChart data={analyticsData.events} />
                            </div>
                            <div className="chart-container">
                                <h3>Heures hebdomadaires</h3>
                                <WeeklyHoursChart data={analyticsData.events} />
                            </div>
                        </div>
                    ) : (
                        <div className="no-data-message">
                            <p>Aucune donnée disponible pour cette période</p>
                        </div>
                    )}

                    <div className="calendar-section">
                        <h3>Calendrier de présence</h3>
                        <HeatmapCalendar 
                            month={selectedMonth} 
                            year={selectedYear} 
                            data={analyticsData?.events || []} 
                        />
                    </div>
                </>
            )}
        </div>
    );
}

export default Analytics;