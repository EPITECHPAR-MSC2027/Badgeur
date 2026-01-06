import React, { useState, useEffect, useRef } from 'react';
import '../style/Chart.css';
import '../style/Analytics.css';
import authService from '../services/authService';
import teamService from '../services/teamService';
import vehiculeService from '../services/vehiculeService';
import bookingRoomService from '../services/bookingRoomService';
import KPICard from '../component/KPICard';
import PresenceChart from '../component/PresenceChart';
import WeeklyHoursChart from '../component/WeeklyHoursChart';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import UserAnalytics from './UserAnalytics';

function ManagerAnalytics() {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isExporting, setIsExporting] = useState(false);
    const [teamMembers, setTeamMembers] = useState([]);
    const [selectedMemberId, setSelectedMemberId] = useState('');
    const dashboardRef = useRef(null);

    const months = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

    useEffect(() => {
        fetchTeamMembers();
    }, []);

    useEffect(() => {
        if (teamMembers.length > 0) {
            fetchAnalyticsData();
        }
    }, [selectedMonth, selectedYear, teamMembers]);

    const fetchTeamMembers = async () => {
        try {
            const members = await teamService.listMyTeamMembers();
            // Filtrer pour ne garder que les employés (exclure le manager lui-même si nécessaire)
            setTeamMembers(members);
        } catch (err) {
            console.error('Erreur lors du chargement des membres de l\'équipe:', err);
            setError('Erreur lors du chargement des membres de l\'équipe');
            setTeamMembers([]);
        }
    };

    const fetchAnalyticsData = async () => {
        if (teamMembers.length === 0) {
            setAnalyticsData({
                kpi: null,
                events: [],
                month: selectedMonth,
                year: selectedYear
            });
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const memberDataPromises = teamMembers.map(async (member) => {
                try {
                    let kpiData = null;
                    try {
                        const kpiResponse = await authService.get(`/kpis/${member.id}`);
                        if (kpiResponse.ok && kpiResponse.status !== 404) {
                            kpiData = await kpiResponse.json();
                        }
                    } catch (kpiError) {
                        console.log(`No KPI data for member ${member.id}`);
                    }
                    let events = [];
                    try {
                        const eventsResponse = await authService.get(`/badgeLogEvent/user/${member.id}`);
                        if (eventsResponse.ok && eventsResponse.status !== 404) {
                            const allEvents = await eventsResponse.json();
                            events = Array.isArray(allEvents) ? allEvents : [];
                        }
                    } catch (eventsError) {
                        console.log(`No events for member ${member.id}`);
                    }
                    const filteredEvents = events.filter(event => {
                        const eventDate = new Date(event.badgedAt);
                        return eventDate.getMonth() + 1 === selectedMonth && 
                               eventDate.getFullYear() === selectedYear;
                    });

                    return {
                        memberId: member.id,
                        memberName: `${member.firstName} ${member.lastName}`,
                        kpi: kpiData,
                        events: filteredEvents
                    };
                } catch (err) {
                    console.error(`Erreur pour le membre ${member.id}:`, err);
                    return {
                        memberId: member.id,
                        memberName: `${member.firstName} ${member.lastName}`,
                        kpi: null,
                        events: []
                    };
                }
            });

            const allMemberData = await Promise.all(memberDataPromises);

            const allEvents = allMemberData.flatMap(data => data.events);

            // Construire un set des IDs des membres de l'équipe
            const teamUserIds = new Set(teamMembers.map(m => Number(m.id)));

            // Compter les réservations de véhicules pour l'équipe sur le mois
            let vehicleBookingsCountTeam = 0;
            try {
                const allVehicleBookings = await vehiculeService.getAllBookings();
                const vehicleBookingsForTeam = (Array.isArray(allVehicleBookings) ? allVehicleBookings : []).filter(b => {
                    const bookingUserId = Number(b.userId ?? b.UserId);
                    if (!teamUserIds.has(bookingUserId)) return false;
                    const start = new Date(b.startDatetime || b.StartDatetime);
                    return start.getMonth() + 1 === selectedMonth &&
                           start.getFullYear() === selectedYear;
                });
                vehicleBookingsCountTeam = vehicleBookingsForTeam.length;
            } catch (e) {
                console.warn('Erreur chargement réservations véhicules pour équipe', e);
            }

            // Compter les réservations de salles pour l'équipe sur le mois
            let roomBookingsCountTeam = 0;
            try {
                const allRoomBookings = await bookingRoomService.list();
                const roomBookingsForTeam = (Array.isArray(allRoomBookings) ? allRoomBookings : []).filter(b => {
                    const bookingUserId = Number(b.UserId ?? b.userId);
                    if (!teamUserIds.has(bookingUserId)) return false;
                    const start = new Date(b.StartDatetime || b.startDatetime);
                    return start.getMonth() + 1 === selectedMonth &&
                           start.getFullYear() === selectedYear;
                });
                roomBookingsCountTeam = roomBookingsForTeam.length;
            } catch (e) {
                console.warn('Erreur chargement réservations salles pour équipe', e);
            }

            setAnalyticsData({
                memberData: allMemberData,
                events: allEvents,
                month: selectedMonth,
                year: selectedYear,
                vehicleBookingsCountTeam,
                roomBookingsCountTeam
            });
        } catch (err) {
            console.error('Erreur lors du chargement des données:', err);
            setError(err.message || 'Erreur lors du chargement des données');
            setAnalyticsData({
                memberData: [],
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
            const canvas = await html2canvas(dashboardRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#f5f5f5'
            });
            
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 10;
            
            pdf.addImage(
                imgData, 
                'PNG', 
                imgX, 
                imgY, 
                imgWidth * ratio, 
                imgHeight * ratio
            );
            
            const fileName = `Analytics_Equipe_${months[selectedMonth - 1]}_${selectedYear}.pdf`;
            
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
        if (!analyticsData || !analyticsData.memberData || analyticsData.memberData.length === 0) {
            return {};
        }

        const { memberData } = analyticsData;
        const totalDaysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

        // Calculer les KPIs pour chaque membre
        const memberKPIs = memberData.map(member => {
            const { kpi, events } = member;
            
            const workingDays = new Set(events.map(e => new Date(e.badgedAt).toDateString())).size;
            const presenceRate = totalDaysInMonth > 0 ? (workingDays / totalDaysInMonth) * 100 : 0;

            let totalHours = 0;
            let totalMinutes = 0;
            const weeklyHours = {};
            
            const eventsByDay = {};
            events.forEach(event => {
                const date = new Date(event.badgedAt);
                const dayKey = date.toDateString();
                if (!eventsByDay[dayKey]) {
                    eventsByDay[dayKey] = [];
                }
                eventsByDay[dayKey].push(date);
            });

            const getWeekNumber = (date) => {
                const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
                const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
                return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
            };

            Object.values(eventsByDay).forEach(dayEvents => {
                dayEvents.sort((a, b) => a - b);
                
                for (let i = 0; i < dayEvents.length - 1; i += 2) {
                    const entry = dayEvents[i];
                    const exit = dayEvents[i + 1];
                    const diffMs = exit - entry;
                    const hours = Math.floor(diffMs / 3600000);
                    const minutes = Math.floor((diffMs % 3600000) / 60000);
                    totalHours += hours;
                    totalMinutes += minutes;

                    const weekNumber = getWeekNumber(entry);
                    if (!weeklyHours[weekNumber]) {
                        weeklyHours[weekNumber] = { hours: 0, minutes: 0 };
                    }
                    weeklyHours[weekNumber].hours += hours;
                    weeklyHours[weekNumber].minutes += minutes;
                }
            });

            totalHours += Math.floor(totalMinutes / 60);
            totalMinutes = totalMinutes % 60;

            const totalMinutesOverall = totalHours * 60 + totalMinutes;
            const avgMinutesPerDay = workingDays > 0 ? totalMinutesOverall / workingDays : 0;
            const avgHoursPerDayFinal = Math.floor(avgMinutesPerDay / 60);
            const avgMinutesPerDayFinal = Math.floor(avgMinutesPerDay % 60);
            const hoursPerDay = `${avgHoursPerDayFinal.toString().padStart(2, '0')}:${avgMinutesPerDayFinal.toString().padStart(2, '0')}`;

            const weekCount = Object.keys(weeklyHours).length;
            let avgWeekHours = 0;
            let avgWeekMinutes = 0;
            if (weekCount > 0) {
                let totalWeekMinutes = 0;
                Object.values(weeklyHours).forEach(week => {
                    const weekTotalMinutes = week.hours * 60 + week.minutes;
                    totalWeekMinutes += weekTotalMinutes;
                });
                const avgMinutesPerWeek = totalWeekMinutes / weekCount;
                avgWeekHours = Math.floor(avgMinutesPerWeek / 60);
                avgWeekMinutes = Math.floor(avgMinutesPerWeek % 60);
            }
            const hoursPerWeek = `${avgWeekHours.toString().padStart(2, '0')}:${avgWeekMinutes.toString().padStart(2, '0')}`;

            return {
                hoursPerDay: (kpi && kpi.hoursPerDay && kpi.hoursPerDay !== '00:00') ? kpi.hoursPerDay : hoursPerDay,
                hoursPerWeek: (kpi && kpi.hoursPerWeek && kpi.hoursPerWeek !== '00:00') ? kpi.hoursPerWeek : hoursPerWeek,
                workingDays: kpi ? (kpi.workingDays || workingDays) : workingDays,
                presenceRate: (kpi && kpi.presenceRate) ? parseFloat(kpi.presenceRate) : presenceRate
            };
        });

        // Calculer les moyennes
        const memberCount = memberKPIs.length;
        if (memberCount === 0) {
            return {
                hoursPerDay: '00:00',
                hoursPerWeek: '00:00',
                workingDays: 0,
                totalDays: totalDaysInMonth,
                presenceRate: '0.00',
                absenceRate: '100.00'
            };
        }

        // Moyenne des heures par jour (convertir en minutes pour la moyenne)
        let totalMinutesPerDay = 0;
        memberKPIs.forEach(kpi => {
            const [hours, minutes] = kpi.hoursPerDay.split(':').map(Number);
            totalMinutesPerDay += hours * 60 + minutes;
        });
        const avgMinutesPerDay = totalMinutesPerDay / memberCount;
        const avgHoursPerDay = Math.floor(avgMinutesPerDay / 60);
        const avgMinsPerDay = Math.floor(avgMinutesPerDay % 60);
        const hoursPerDay = `${avgHoursPerDay.toString().padStart(2, '0')}:${avgMinsPerDay.toString().padStart(2, '0')}`;

        // Moyenne des heures par semaine
        let totalMinutesPerWeek = 0;
        memberKPIs.forEach(kpi => {
            const [hours, minutes] = kpi.hoursPerWeek.split(':').map(Number);
            totalMinutesPerWeek += hours * 60 + minutes;
        });
        const avgMinutesPerWeek = totalMinutesPerWeek / memberCount;
        const avgHoursPerWeek = Math.floor(avgMinutesPerWeek / 60);
        const avgMinsPerWeek = Math.floor(avgMinutesPerWeek % 60);
        const hoursPerWeek = `${avgHoursPerWeek.toString().padStart(2, '0')}:${avgMinsPerWeek.toString().padStart(2, '0')}`;

        // Moyenne des jours travaillés
        const avgWorkingDays = memberKPIs.reduce((sum, kpi) => sum + kpi.workingDays, 0) / memberCount;

        // Moyenne du taux de présence
        const avgPresenceRate = memberKPIs.reduce((sum, kpi) => sum + kpi.presenceRate, 0) / memberCount;

        return {
            hoursPerDay,
            hoursPerWeek,
            workingDays: Math.round(avgWorkingDays * 10) / 10,
            totalDays: totalDaysInMonth,
            presenceRate: avgPresenceRate.toFixed(2),
            absenceRate: (100 - avgPresenceRate).toFixed(2)
        };
    };

    const kpis = calculateKPIs();

    const totalMembers = teamMembers.length;
    const totalManagers = teamMembers.filter(m => m.roleId === 1).length;
    const totalEmployees = Math.max(0, totalMembers - totalManagers);
    const selectedMember = teamMembers.find(m => String(m.id) === String(selectedMemberId));

    return (
        <div className="analytics-page">
            <div className="analytics-header">
                <div>
                    <h1>Analytics Équipe</h1>
                    <p>
                        {selectedMember
                            ? `Analytics détaillés pour ${selectedMember.firstName} ${selectedMember.lastName}`
                            : `Analyse des données moyennes de mon équipe (${teamMembers.length} membre${teamMembers.length > 1 ? 's' : ''})`}
                    </p>
                </div>
                {!selectedMember && (
                    <button 
                        className="export-btn" 
                        onClick={handleExport}
                        disabled={isExporting || loading}
                    >
                        {isExporting ? '⏳ Export en cours...' : '📊 Exporter en PDF'}
                    </button>
                )}
            </div>

            {!selectedMember && (
                <div className="kpi-grid" style={{ marginTop: '12px' }}>
                    <KPICard 
                        title="Membres de l'équipe" 
                        value={totalMembers}
                        description="Nombre total de personnes dans mon équipe"
                    />
                    <KPICard 
                        title="Managers" 
                        value={totalManagers}
                        description="Nombre de managers dans l'équipe"
                    />
                    <KPICard 
                        title="Employés" 
                        value={totalEmployees}
                        description="Nombre d'employés (hors managers)"
                    />
                </div>
            )}

            <div ref={dashboardRef} className="dashboard-content">
                <div className="filters-section">
                    <div className="filter-group">
                        <label>Vue:</label>
                        <select
                            value={selectedMemberId || 'team'}
                            onChange={(e) => {
                                const value = e.target.value;
                                setSelectedMemberId(value === 'team' ? '' : value);
                            }}
                        >
                            <option value="team">Équipe (tous les membres)</option>
                            {teamMembers.map(member => (
                                <option key={member.id} value={member.id}>
                                    {member.firstName} {member.lastName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {!selectedMember && (
                        <>
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
                        </>
                    )}
                </div>

                {selectedMember ? (
                    <div style={{ marginTop: '16px' }}>
                        <UserAnalytics 
                            userId={selectedMember.id}
                            title={`Analytics de ${selectedMember.firstName} ${selectedMember.lastName}`}
                            subtitle="Analyse détaillée de cet employé"
                        />
                    </div>
                ) : (
                    <>
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
                        ) : teamMembers.length === 0 ? (
                            <div className="no-data-message">
                                <p>Aucun membre dans votre équipe</p>
                            </div>
                        ) : (
                            <>
                                <div className="kpi-grid">
                                    <KPICard 
                                        title="Jours travaillés (moyenne)" 
                                        value={`${kpis.workingDays || 0}/${kpis.totalDays || 0}`}
                                        description="Moyenne par membre sur un mois entier"
                                    />
                                    <KPICard 
                                        title="Heures/jour (moyenne)" 
                                        value={kpis.hoursPerDay ? `${kpis.hoursPerDay}h` : '00:00h'}
                                        description="Moyenne par jour de présence"
                                    />
                                    <KPICard 
                                        title="Heures/semaine (moyenne)" 
                                        value={kpis.hoursPerWeek ? `${kpis.hoursPerWeek}h` : '00:00h'}
                                        description="Moyenne hebdomadaire"
                                    />
                                    <KPICard 
                                        title="Taux de présence (moyenne)" 
                                        value={`${kpis.presenceRate || 0}%`}
                                        description={`${kpis.absenceRate || 0}% d'absence moyen`}
                                    />
                                    <KPICard 
                                        title="Réservations de véhicule (équipe)" 
                                        value={analyticsData?.vehicleBookingsCountTeam ?? 0}
                                        description="Nombre total de réservations de véhicule sur le mois"
                                    />
                                    <KPICard 
                                        title="Réservations de salle (équipe)" 
                                        value={analyticsData?.roomBookingsCountTeam ?? 0}
                                        description="Nombre total de réservations de salle sur le mois"
                                    />
                                </div>

                                {analyticsData?.events && analyticsData.events.length > 0 ? (
                                    <div className="charts-section">
                                        <div className="chart-container">
                                            <h3>Taux de présence mensuel (équipe)</h3>
                                            <PresenceChart data={analyticsData.events} />
                                        </div>
                                        <div className="chart-container">
                                            <h3>Heures hebdomadaires (équipe)</h3>
                                            <WeeklyHoursChart data={analyticsData.events} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="no-data-message">
                                        <p>Aucune donnée disponible pour cette période</p>
                                    </div>
                                )}

                                <div className="calendar-section">
                                    <h3>Calendrier de présence (équipe)</h3>
                                    <TeamHeatmapCalendar 
                                        month={selectedMonth} 
                                        year={selectedYear} 
                                        memberData={analyticsData?.memberData || []} 
                                    />
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

// Composant HeatmapCalendar adapté pour l'équipe
function TeamHeatmapCalendar({ month, year, memberData }) {
    const getDaysInMonth = (month, year) => {
        return new Date(year, month, 0).getDate();
    };

    const getFirstDayOfMonth = (month, year) => {
        return new Date(year, month - 1, 1).getDay();
    };

    const getPresenceRate = (day) => {
        if (!memberData || memberData.length === 0) return 0;
        
        // Pour chaque jour, compter combien de membres étaient présents
        const membersPresent = new Set();
        
        memberData.forEach(member => {
            const dayEvents = member.events.filter(event => {
                const eventDate = new Date(event.badgedAt);
                return eventDate.getDate() === day && 
                       eventDate.getMonth() + 1 === month &&
                       eventDate.getFullYear() === year;
            });
            
            if (dayEvents.length > 0) {
                membersPresent.add(member.memberId);
            }
        });

        // Retourner le taux de présence (nombre de membres présents / nombre total de membres)
        return memberData.length > 0 ? membersPresent.size / memberData.length : 0;
    };

    const getColorForPresence = (presenceRate) => {
        if (presenceRate >= 0.8) return '#10b981'; // Vert pour forte présence
        if (presenceRate >= 0.5) return '#f59e0b'; // Orange pour présence moyenne
        if (presenceRate > 0) return '#fbbf24'; // Jaune pour faible présence
        return '#ef4444'; // Rouge pour absence totale
    };

    const daysInMonth = getDaysInMonth(month, year);
    const firstDay = getFirstDayOfMonth(month, year);
    const monthNames = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    const calendarDays = [];
    
    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const presenceRate = getPresenceRate(day);
        const color = getColorForPresence(presenceRate);
        const percentage = (presenceRate * 100).toFixed(0);
        
        calendarDays.push(
            <div 
                key={day} 
                className="calendar-day"
                style={{ backgroundColor: color }}
                title={`${day} ${monthNames[month - 1]}: ${percentage}% de l'équipe présente`}
            >
                {day}
            </div>
        );
    }

    return (
        <div className="heatmap-calendar">
            <div className="calendar-header">
                <h4>{monthNames[month - 1]} {year}</h4>
            </div>
            
            <div className="calendar-grid">
                <div className="week-days">
                    {weekDays.map(day => (
                        <div key={day} className="week-day">{day}</div>
                    ))}
                </div>
                
                <div className="calendar-days">
                    {calendarDays}
                </div>
            </div>
            
            <div className="calendar-legend">
                <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: '#10b981', color: 'var(--color-secondary)' }}></div>
                    <span>≥80% présents</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: '#f59e0b', color: 'var(--color-secondary)' }}></div>
                    <span>≥50% présents</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: '#fbbf24', color: 'var(--color-secondary)' }}></div>
                    <span>&lt;50% présents</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: '#ef4444', color: 'var(--color-secondary)' }}></div>
                    <span>Aucun présent</span>
                </div>
            </div>
        </div>
    );
}

export default ManagerAnalytics;
