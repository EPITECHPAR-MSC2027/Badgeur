import React, { useState, useEffect } from 'react';
import vehiculeService from '../services/vehiculeService';
import '../style/ReservationVehicule.css';

function ReservationVehicule() {
    const [vehicules, setVehicules] = useState([]);
    const [selectedVehicule, setSelectedVehicule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState(null);

    // Form fields
    const [destination, setDestination] = useState('');
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('');

    useEffect(() => {
        loadVehicules();
    }, []);

    const loadVehicules = async () => {
        try {
            setLoading(true);
            const data = await vehiculeService.getAllVehicules();
            setVehicules(data);
        } catch (error) {
            console.error('Erreur lors du chargement des véhicules:', error);
            setFeedback({ type: 'error', message: 'Erreur lors du chargement des véhicules' });
        } finally {
            setLoading(false);
        }
    };

    const getVehiculeTypeIcon = (type) => {
        const typeLower = type?.toLowerCase() || '';
        if (typeLower.includes('citadine') || typeLower.includes('berline')) {
            return '🚗';
        } else if (typeLower.includes('suv')) {
            return '🚙';
        } else if (typeLower.includes('utilitaire')) {
            return '🚐';
        } else if (typeLower.includes('électrique') || typeLower.includes('electrique')) {
            return '⚡';
        }
        return '🚗';
    };

    const getVehiculeTypeLabel = (vehicule) => {
        const nameLower = vehicule.name?.toLowerCase() || '';
        if (nameLower.includes('clio') || nameLower.includes('citadine')) return 'Citadine';
        if (nameLower.includes('3008') || nameLower.includes('suv')) return 'SUV';
        if (nameLower.includes('model') || nameLower.includes('tesla')) return 'Berline';
        if (nameLower.includes('kangoo') || nameLower.includes('utilitaire')) return 'Utilitaire';
        return 'Véhicule';
    };

    const getTransmissionLabel = (transmission) => {
        const transLower = transmission?.toLowerCase() || '';
        if (transLower.includes('manu') || transLower.includes('manuel')) return 'Manu.';
        if (transLower.includes('auto') || transLower.includes('automatique')) return 'Auto.';
        return transmission;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFeedback(null);

        if (!selectedVehicule) {
            setFeedback({ type: 'error', message: 'Veuillez sélectionner un véhicule' });
            return;
        }

        if (!destination.trim()) {
            setFeedback({ type: 'error', message: 'Veuillez saisir une destination' });
            return;
        }

        if (!startDate || !startTime || !endDate || !endTime) {
            setFeedback({ type: 'error', message: 'Veuillez remplir toutes les dates et heures' });
            return;
        }

        const userId = parseInt(localStorage.getItem('userId'));
        if (!userId) {
            setFeedback({ type: 'error', message: 'Utilisateur non identifié' });
            return;
        }

        const startDatetime = new Date(`${startDate}T${startTime}`);
        const endDatetime = new Date(`${endDate}T${endTime}`);

        if (startDatetime >= endDatetime) {
            setFeedback({ type: 'error', message: 'La date de départ doit être antérieure à la date de retour' });
            return;
        }

        setSubmitting(true);
        try {
            await vehiculeService.createBooking({
                idVehicule: selectedVehicule.id,
                userId: userId,
                startDatetime: startDatetime.toISOString(),
                endDatetime: endDatetime.toISOString()
            });

            setFeedback({ type: 'success', message: 'Réservation confirmée avec succès!' });
            // Reset form
            setSelectedVehicule(null);
            setDestination('');
            setStartDate('');
            setStartTime('');
            setEndDate('');
            setEndTime('');
        } catch (error) {
            setFeedback({ type: 'error', message: error.message || 'Erreur lors de la création de la réservation' });
        } finally {
            setSubmitting(false);
        }
    };

    const formatDateForInput = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatTimeForInput = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    return (
        <div className="reservation-vehicule-container">
            <header className="reservation-header">
                <h1>Réserver un véhicule</h1>
                <p className="reservation-subtitle">Choisissez votre véhicule et planifiez votre déplacement</p>
            </header>

            <div className="reservation-content">
                {/* Section de sélection des véhicules */}
                <div className="vehicules-section">
                    {loading ? (
                        <div className="loading-message">Chargement des véhicules...</div>
                    ) : vehicules.length === 0 ? (
                        <div className="no-vehicules">Aucun véhicule disponible</div>
                    ) : (
                        <div className="vehicules-grid">
                            {vehicules.map((vehicule) => {
                                const isSelected = selectedVehicule?.id === vehicule.id;
                                const vehiculeType = getVehiculeTypeLabel(vehicule);
                                const transmissionLabel = getTransmissionLabel(vehicule.transmissionType);

                                return (
                                    <div
                                        key={vehicule.id}
                                        className={`vehicule-card ${isSelected ? 'selected' : ''}`}
                                        onClick={() => setSelectedVehicule(vehicule)}
                                    >
                                        <div className="vehicule-icon">{getVehiculeTypeIcon(vehiculeType)}</div>
                                        <div className="vehicule-type">{vehiculeType}</div>
                                        <div className="vehicule-name">{vehicule.name}</div>
                                        <div className="vehicule-plate">{vehicule.licensePlate}</div>
                                        <div className="vehicule-details">
                                            <span>{vehicule.capacity} places</span>
                                            <span>{transmissionLabel}</span>
                                            <span>{vehicule.fuelType}</span>
                                        </div>
                                        <div className="vehicule-status">
                                            <span className="status-dot available"></span>
                                            <span className="status-text">Disponible</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Section détails du trajet */}
                <div className="trip-details-section">
                    <div className="trip-details-header">
                        <span className="calendar-icon">📅</span>
                        <h2>Détails du trajet</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="trip-form">
                        <div className="form-group">
                            <label>
                                <span className="input-icon">📍</span>
                                Destination
                            </label>
                            <input
                                type="text"
                                placeholder="Ville ou adresse"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>
                                <span className="input-icon">🕐</span>
                                Départ
                            </label>
                            <div className="datetime-inputs">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="form-input date-input"
                                />
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="form-input time-input"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>
                                <span className="input-icon">🕐</span>
                                Retour
                            </label>
                            <div className="datetime-inputs">
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="form-input date-input"
                                />
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="form-input time-input"
                                />
                            </div>
                        </div>

                        {feedback && (
                            <div className={`feedback-message ${feedback.type}`}>
                                {feedback.message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting || !selectedVehicule}
                            className="confirm-button"
                        >
                            <span className="button-icon">✓</span>
                            {submitting ? 'Confirmation...' : 'Confirmer la réservation'}
                        </button>

                        {!selectedVehicule && (
                            <p className="selection-hint">Sélectionnez un véhicule pour continuer</p>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ReservationVehicule;

