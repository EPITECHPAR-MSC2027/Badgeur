import React, { useState, useEffect, useRef } from 'react';
import '../style/Analytics.css';
import '../style/Chart.css';
import authService from '../services/authService';
import KPICard from '../component/KPICard';
import PresenceChart from '../component/PresenceChart';
import WeeklyHoursChart from '../component/WeeklyHoursChart';
import HeatmapCalendar from '../component/HeatmapCalendar';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

function UserAnalytics() {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isExporting, setIsExporting] = useState(false);
    const dashboardRef = useRef(null);

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
            let kpiResponse;
            let kpiData = null;
            
            try {
                // Essayer d'abord l'endpoint /kpis/me
                kpiResponse = await authService.get('/kpis/me');
                if (kpiResponse.status === 404) {
                    console.log('No KPI data found');
                    kpiData = null;
                } else if (kpiResponse.ok) {
                    kpiData = await kpiResponse.json();
                    console.log('KPI data:', kpiData);
                } else {
                    console.error('Error fetching KPI:', kpiResponse.status);
                }
            } catch (error) {
                console.log('Endpoint /kpis/me non accessible, tentative avec /kpis/{userId}');
                try {
                    // Fallback vers l'endpoint avec userId
                    kpiResponse = await authService.get(`/kpis/${userId}`);
                    if (kpiResponse.status === 404) {
                        console.log('No KPI data found');
                        kpiData = null;
                    } else if (kpiResponse.ok) {
                        kpiData = await kpiResponse.json();
                        console.log('KPI data:', kpiData);
                    } else {
                        console.error('Error fetching KPI:', kpiResponse.status);
                    }
                } catch (fallbackError) {
                    console.error('Both KPI endpoints failed:', fallbackError);
                    kpiData = null;
                }
            }

            const eventsResponse = await authService.get(`/badgeLogEvent/user/${userId}`);
            let events = [];

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

    const handleExport = async () => {
        if (!dashboardRef.current) return;
        
        setIsExporting(true);
        
        try {
            // Capture le dashboard en canvas
            const canvas = await html2canvas(dashboardRef.current, {
                scale: 2, // Meilleure qualité
                useCORS: true,
                logging: false,
                backgroundColor: '#f5f5f5'
            });
            
            // Convertir le canvas en image
            const imgData = canvas.toDataURL('image/png');
            
            // Créer le PDF
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            // Calculer les dimensions pour ajuster l'image au PDF
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 10;
            
            // Ajouter l'image au PDF
            pdf.addImage(
                imgData, 
                'PNG', 
                imgX, 
                imgY, 
                imgWidth * ratio, 
                imgHeight * ratio
            );
            
            // Générer le nom du fichier avec la date
            const fileName = `Mes_Analytics_${months[selectedMonth - 1]}_${selectedYear}.pdf`;
            
            // Télécharger le PDF
            pdf.save(fileName);
            
            console.log('Export réussi:', fileName);
        } catch (error) {
            console.error('Erreur lors de l\'export:', error);
            alert('Erreur lors de l\'export du PDF. Veuillez réessayer.');
        } finally {
            setIsExporting(false);
        }
    };

    const calculateKPIs = () => {
        if (!analyticsData) return {};

        const { kpi, events } = analyticsData;
        
        // Calculate from events
        const workingDays = new Set(events.map(e => new Date(e.badgedAt).toDateString())).size;
        const totalDaysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
        const presenceRate = totalDaysInMonth > 0 ? (workingDays / totalDaysInMonth) * 100 : 0;

        // Calculate hours per day and per week from events
        let totalHours = 0;
        let totalMinutes = 0;
        const weeklyHours = {};
        
        // Group events by day and calculate daily hours
        const eventsByDay = {};
        events.forEach(event => {
            const date = new Date(event.badgedAt);
            const dayKey = date.toDateString();
            if (!eventsByDay[dayKey]) {
                eventsByDay[dayKey] = [];
            }
            eventsByDay[dayKey].push(date);
        });

        // Helper function to get week number
        const getWeekNumber = (date) => {
            const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
            const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
            return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        };

        // Calculate total hours from paired events (in/out)
        Object.values(eventsByDay).forEach(dayEvents => {
            // Sort events by time
            dayEvents.sort((a, b) => a - b);
            
            // Pair events (entry-exit, entry-exit, ...)
            for (let i = 0; i < dayEvents.length - 1; i += 2) {
                const entry = dayEvents[i];
                const exit = dayEvents[i + 1];
                const diffMs = exit - entry;
                const hours = Math.floor(diffMs / 3600000);
                const minutes = Math.floor((diffMs % 3600000) / 60000);
                totalHours += hours;
                totalMinutes += minutes;

                // Track by week
                const weekNumber = getWeekNumber(entry);
                if (!weeklyHours[weekNumber]) {
                    weeklyHours[weekNumber] = { hours: 0, minutes: 0 };
                }
                weeklyHours[weekNumber].hours += hours;
                weeklyHours[weekNumber].minutes += minutes;
            }
        });

        // Normalize minutes to hours
        totalHours += Math.floor(totalMinutes / 60);
        totalMinutes = totalMinutes % 60;

        // Calculate average hours per day of presence
        // Convert everything to minutes for accurate division
        const totalMinutesOverall = totalHours * 60 + totalMinutes;
        const avgMinutesPerDay = workingDays > 0 ? totalMinutesOverall / workingDays : 0;
        const avgHoursPerDayFinal = Math.floor(avgMinutesPerDay / 60);
        const avgMinutesPerDayFinal = Math.floor(avgMinutesPerDay % 60);
        const hoursPerDay = `${avgHoursPerDayFinal.toString().padStart(2, '0')}:${avgMinutesPerDayFinal.toString().padStart(2, '0')}`;

        // Calculate average hours per week
        const weekCount = Object.keys(weeklyHours).length;
        let avgWeekHours = 0;
        let avgWeekMinutes = 0;
        if (weekCount > 0) {
            // Convert each week to total minutes first
            let totalWeekMinutes = 0;
            Object.values(weeklyHours).forEach(week => {
                const weekTotalMinutes = week.hours * 60 + week.minutes;
                totalWeekMinutes += weekTotalMinutes;
            });
            // Calculate average minutes per week
            const avgMinutesPerWeek = totalWeekMinutes / weekCount;
            avgWeekHours = Math.floor(avgMinutesPerWeek / 60);
            avgWeekMinutes = Math.floor(avgMinutesPerWeek % 60);
        }
        const hoursPerWeek = `${avgWeekHours.toString().padStart(2, '0')}:${avgWeekMinutes.toString().padStart(2, '0')}`;

        // Use backend KPI values if available, otherwise use calculated values
        return {
            hoursPerDay: (kpi && kpi.hoursPerDay && kpi.hoursPerDay !== '00:00') ? kpi.hoursPerDay : hoursPerDay,
            hoursPerWeek: (kpi && kpi.hoursPerWeek && kpi.hoursPerWeek !== '00:00') ? kpi.hoursPerWeek : hoursPerWeek,
            workingDays: kpi ? (kpi.workingDays || workingDays) : workingDays,
            totalDays: totalDaysInMonth,
            presenceRate: (kpi && kpi.presenceRate) ? parseFloat(kpi.presenceRate).toFixed(2) : presenceRate.toFixed(2),
            absenceRate: (kpi && kpi.presenceRate) ? (100 - parseFloat(kpi.presenceRate)).toFixed(2) : (100 - presenceRate).toFixed(2)
        };
    };

    const kpis = calculateKPIs();

    return (
        <div className="analytics-page">
            <div className="analytics-header">
                <div>
                    <h1>Mes Analytics</h1>
                    <p>Analyse de mes données personnelles</p>
                </div>
                <button 
                    className="export-btn" 
                    onClick={handleExport}
                    disabled={isExporting || loading}
                >
                    {isExporting ? '⏳ Export en cours...' : '📊 Exporter en PDF'}
                </button>
            </div>

            <div ref={dashboardRef} className="dashboard-content">
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
                            description="Sur un mois entier"
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
        </div>
    );
}

export default UserAnalytics;
