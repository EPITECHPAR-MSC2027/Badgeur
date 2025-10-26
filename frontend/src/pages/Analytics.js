import React, { useState, useEffect } from 'react';
import '../style/Analytics.css';
import '../style/Chart.css';
import authService from '../services/authService';
import KPICard from '../component/KPICard';
import PresenceChart from '../component/PresenceChart';
import WeeklyHoursChart from '../component/WeeklyHoursChart';
import HeatmapCalendar from '../component/HeatmapCalendar';

function Analytics() {
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

            // Fetch user's KPI data and badge events for the selected period
            const kpiResponse = await authService.get('/kpis/me');
            const eventsResponse = await authService.get(`/badgeLogEvent/user/${userId}`);

            let kpiData = null;
            let events = [];

            // Handle KPI response
            if (kpiResponse.status === 404) {
                console.log('No KPI data found');
                kpiData = null;
            } else if (kpiResponse.ok) {
                kpiData = await kpiResponse.json();
                console.log('KPI data:', kpiData);
            } else {
                console.error('Error fetching KPI:', kpiResponse.status);
            }

            // Handle events response
            if (eventsResponse.status === 404) {
                console.log('No events found');
                events = [];
            } else if (eventsResponse.ok) {
                const allEvents = await eventsResponse.json();
                events = Array.isArray(allEvents) ? allEvents : [];
                console.log('All events:', events);
            } else {
                console.error('Error fetching events:', eventsResponse.status);
            }

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
        
        // Use backend calculated values if available
        if (kpi) {
            return {
                teamSize: 1,
                hoursPerDay: kpi.hoursPerDay || '00:00',
                hoursPerWeek: kpi.hoursPerWeek || '00:00',
                workingDays: kpi.workingDays || 0,
                totalDays: kpi.totalDays || 0,
                presenceRate: kpi.presenceRate || 0,
                absenceRate: 100 - (kpi.presenceRate || 0)
            };
        }

        // Fallback calculation if no KPI data
        const workingDays = new Set(events.map(e => new Date(e.badgedAt).toDateString())).size;
        const totalDaysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
        const presenceRate = totalDaysInMonth > 0 ? (workingDays / totalDaysInMonth) * 100 : 0;

        return {
            teamSize: 1,
            hoursPerDay: '00:00',
            hoursPerWeek: '00:00',
            workingDays: workingDays,
            totalDays: totalDaysInMonth,
            presenceRate: presenceRate.toFixed(1),
            absenceRate: (100 - presenceRate).toFixed(1)
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
                    <div className="kpi-grid">
                        <KPICard 
                            title="Jours travaillés" 
                            value={`${kpis.workingDays || 0}/${kpis.totalDays || 0}`}
                            description="Sur 14 jours"
                        />
                        <KPICard 
                            title="Heures/jour" 
                            value={kpis.hoursPerDay ? `${kpis.hoursPerDay}h` : '00:00h'}
                            description="Moyenne par jour de présence"
                        />
                        <KPICard 
                            title="Heures/semaine" 
                            value={kpis.hoursPerWeek ? `${kpis.hoursPerWeek}h` : '00:00h'}
                            description="Moyenne hebdomadaire"
                        />
                        <KPICard 
                            title="Taux de présence" 
                            value={`${kpis.presenceRate || 0}%`}
                            description={`${kpis.absenceRate || 0}% d'absence`}
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