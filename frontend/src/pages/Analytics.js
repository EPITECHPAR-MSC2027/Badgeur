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
        try {
            // Fetch user's KPI data and badge events for the selected period
            const [kpiResponse, eventsResponse] = await Promise.all([
                authService.get('/userKPI'),
                authService.get('/badgeLogEvent')
            ]);

            if (kpiResponse.ok && eventsResponse.ok) {
                const kpiData = await kpiResponse.json();
                const events = await eventsResponse.json();
                
                // Filter events for selected month/year
                const filteredEvents = events.filter(event => {
                    const eventDate = new Date(event.badgedAt);
                    return eventDate.getMonth() + 1 === selectedMonth && 
                           eventDate.getFullYear() === selectedYear;
                });

                setAnalyticsData({
                    kpi: kpiData,
                    events: filteredEvents,
                    month: selectedMonth,
                    year: selectedYear
                });
            }
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        // TODO: Implement export functionality
        console.log('Export analytics data');
    };

    const calculateKPIs = () => {
        if (!analyticsData) return {};

        const { events } = analyticsData;
        
        // Calculate daily hours for each day
        const dailyHours = {};
        events.forEach(event => {
            const date = new Date(event.badgedAt).toDateString();
            if (!dailyHours[date]) dailyHours[date] = [];
            dailyHours[date].push(new Date(event.badgedAt));
        });

        // Calculate presence rate and hours
        const workingDays = Object.keys(dailyHours).length;
        const totalHours = Object.values(dailyHours).reduce((total, dayEvents) => {
            if (dayEvents.length < 2) return total;
            // Sort by time and calculate hours between first and last punch
            const sorted = dayEvents.sort((a, b) => a - b);
            const hours = (sorted[sorted.length - 1] - sorted[0]) / (1000 * 60 * 60);
            return total + Math.max(0, hours);
        }, 0);

        const avgDailyHours = workingDays > 0 ? totalHours / workingDays : 0;
        const avgWeeklyHours = avgDailyHours * 5; // Assuming 5-day work week
        const presenceRate = workingDays > 0 ? (workingDays / 22) * 100 : 0; // Assuming 22 working days per month

        return {
            teamSize: 1, // For individual analytics
            avgDailyHours: avgDailyHours.toFixed(1),
            avgWeeklyHours: avgWeeklyHours.toFixed(1),
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
            ) : (
                <>
                    <div className="kpi-grid">
                        <KPICard 
                            title="Équipe" 
                            value={`${kpis.teamSize} personne${kpis.teamSize > 1 ? 's' : ''}`}
                            description="Effectif total"
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
                            title="Comparaison équipe" 
                            value="92%"
                            description="Équipe : 88%"
                            comparison="positive"
                        />
                        <KPICard 
                            title="Objectif contractuel" 
                            value="37h"
                            description="Contrat : 35h"
                            comparison="positive"
                        />
                    </div>

                    <div className="charts-section">
                        <div className="chart-container">
                            <h3>Taux de présence mensuel</h3>
                            <PresenceChart data={analyticsData?.events} />
                        </div>
                        <div className="chart-container">
                            <h3>Heures hebdomadaires</h3>
                            <WeeklyHoursChart data={analyticsData?.events} />
                        </div>
                    </div>

                    <div className="calendar-section">
                        <h3>Calendrier de présence</h3>
                        <HeatmapCalendar 
                            month={selectedMonth} 
                            year={selectedYear} 
                            data={analyticsData?.events} 
                        />
                    </div>
                </>
            )}
        </div>
    );
}

export default Analytics;
