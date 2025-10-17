import React, { useEffect, useMemo, useState } from 'react';
import analyticsService from '../services/analyticsService';
import PresenceChart from './PresenceChart';
import WeeklyHoursChart from './WeeklyHoursChart';
import HeatmapCalendar from './HeatmapCalendar';

function ManagerAnalyticsPanel({ month, year }) {
    const [managedTeams, setManagedTeams] = useState([]);
    const [selectedTeamId, setSelectedTeamId] = useState(null);
    const [teamUsers, setTeamUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('all');
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const init = async () => {
            try {
                const currentUserId = Number(localStorage.getItem('userId'));
                if (!currentUserId) return;

                const teams = await analyticsService.getAllTeams();
                const mine = Array.isArray(teams)
                    ? teams.filter(t => Number(t.managerId) === currentUserId)
                    : [];
                setManagedTeams(mine);
                if (mine.length > 0) setSelectedTeamId(mine[0].id);
            } catch (e) {
                setError(e.message || 'Erreur chargement équipes');
            }
        };
        init();
    }, []);

    useEffect(() => {
        const loadTeamUsers = async () => {
            if (!selectedTeamId) return;
            setError(null);
            try {
                const users = await analyticsService.getTeamUsers(selectedTeamId);
                setTeamUsers(users);
                setSelectedUserId('all');
            } catch (e) {
                setError(e.message || 'Erreur chargement utilisateurs');
            }
        };
        loadTeamUsers();
    }, [selectedTeamId]);

    useEffect(() => {
        const loadEvents = async () => {
            if (!selectedTeamId) return;
            setLoading(true);
            setError(null);
            try {
                let fetchedEvents = [];
                if (selectedUserId === 'all') {
                    const usersIds = teamUsers.map(u => u.id);
                    const all = await Promise.all(usersIds.map(id => analyticsService.getUserBadgeEvents(id)));
                    fetchedEvents = all.flat();
                } else {
                    fetchedEvents = await analyticsService.getUserBadgeEvents(Number(selectedUserId));
                }
                setEvents(fetchedEvents);
            } catch (e) {
                setError(e.message || 'Erreur chargement événements');
                setEvents([]);
            } finally {
                setLoading(false);
            }
        };
        loadEvents();
    }, [selectedUserId, selectedTeamId, teamUsers]);

    const filteredEvents = useMemo(() => {
        if (!Array.isArray(events)) return [];
        return events.filter(ev => {
            const d = new Date(ev.badgedAt);
            return d.getMonth() + 1 === month && d.getFullYear() === year;
        });
    }, [events, month, year]);

    if (!managedTeams || managedTeams.length === 0) return null;

    return (
        <div className="manager-analytics-panel">
            <div className="analytics-header" style={{ marginTop: 24 }}>
                <div>
                    <h2>Vue Manager</h2>
                    <p>Consulter les présences de l'équipe ou d'un employé</p>
                </div>
            </div>

            <div className="filters-section">
                <div className="filter-group">
                    <label>Équipe:</label>
                    <select
                        value={selectedTeamId || ''}
                        onChange={(e) => setSelectedTeamId(Number(e.target.value))}
                    >
                        {managedTeams.map(team => (
                            <option key={team.id} value={team.id}>{team.teamName}</option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <label>Employé:</label>
                    <select
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                    >
                        <option value="all">Toute l'équipe</option>
                        {teamUsers.map(u => (
                            <option key={u.id} value={u.id}>{`${u.firstName} ${u.lastName}`}</option>
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
                </div>
            ) : (
                <>
                    {filteredEvents.length > 0 ? (
                        <div className="charts-section">
                            <div className="chart-container">
                                <h3>Présence mensuelle {selectedUserId === 'all' ? '(équipe)' : '(employé)'} </h3>
                                <PresenceChart data={filteredEvents} />
                            </div>
                            <div className="chart-container">
                                <h3>Heures hebdomadaires {selectedUserId === 'all' ? '(équipe)' : '(employé)'} </h3>
                                <WeeklyHoursChart data={filteredEvents} />
                            </div>
                        </div>
                    ) : (
                        <div className="no-data-message">
                            <p>Aucune donnée disponible pour cette période</p>
                        </div>
                    )}

                    <div className="calendar-section">
                        <h3>Calendrier de présence {selectedUserId === 'all' ? '(équipe)' : '(employé)'} </h3>
                        <HeatmapCalendar month={month} year={year} data={filteredEvents} />
                    </div>
                </>
            )}
        </div>
    );
}

export default ManagerAnalyticsPanel;


