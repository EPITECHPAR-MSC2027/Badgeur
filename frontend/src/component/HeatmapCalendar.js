import React from 'react';

function HeatmapCalendar({ month, year, data }) {
    const getDaysInMonth = (month, year) => {
        return new Date(year, month, 0).getDate();
    };

    const getFirstDayOfMonth = (month, year) => {
        const day = new Date(year, month - 1, 1).getDay();
        // Convert Sunday (0) to 6, and shift other days by -1 to align with Monday-first week
        return day === 0 ? 6 : day - 1;
    };

    const getPresenceRate = (day) => {
        if (!data) return 0;
        
        const dayEvents = data.filter(event => {
            const eventDate = new Date(event.badgedAt);
            return eventDate.getDate() === day &&
                   eventDate.getMonth() + 1 === month &&
                   eventDate.getFullYear() === year;
        });

        // Simple presence calculation: if there are events, consider it present
        return dayEvents.length > 0 ? 1 : 0;
    };

    const getColorForPresence = (presenceRate) => {
        if (presenceRate === 1) return '#10b981'; // Green for full presence
        if (presenceRate > 0.5) return '#f59e0b'; // Orange for partial presence
        return '#ef4444'; // Red for absence
    };

    const daysInMonth = getDaysInMonth(month, year);
    const firstDay = getFirstDayOfMonth(month, year);
    const monthNames = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    // Create calendar grid
    const calendarDays = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const presenceRate = getPresenceRate(day);
        const color = getColorForPresence(presenceRate);
        
        calendarDays.push(
            <div 
                key={day} 
                className="calendar-day"
                style={{ backgroundColor: color }}
                title={`${day} ${monthNames[month - 1]}: ${presenceRate === 1 ? 'Présent' : 'Absent'}`}
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
                    <div className="legend-color" style={{ backgroundColor: '#10b981' }}></div>
                    <span>Présent</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: '#f59e0b' }}></div>
                    <span>Partiel</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: '#ef4444' }}></div>
                    <span>Absent</span>
                </div>
            </div>
        </div>
    );
}

export default HeatmapCalendar;
