import React, { useState, useEffect } from 'react';
import vehiculeService from '../services/vehiculeService';
import notificationService from '../services/notificationService';
import '../style/ReservationVehicule.css';
import '../index.css'


function ReservationVehicule() {
    const [vehicules, setVehicules] = useState([]);
    const [vehiculesAvailability, setVehiculesAvailability] = useState({});
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

            // Check current availability for each vehicule
            const availabilityMap = {};
            for (const vehicule of data) {
                const isAvailable = await vehiculeService.isVehiculeCurrentlyAvailable(vehicule.id);
                availabilityMap[vehicule.id] = isAvailable;
            }
            setVehiculesAvailability(availabilityMap);
        } catch (error) {
            console.error('Erreur lors du chargement des véhicules:', error);
            setFeedback({ type: 'error', message: 'Erreur lors du chargement des véhicules' });
        } finally {
            setLoading(false);
        }
    };

    const getVehiculeTypeIcon = (type, fuelType) => {
        // Vérifier d'abord si c'est électrique (dans fuelType ou type)
        const fuelLower = fuelType?.toLowerCase() || '';
        const typeLower = type?.toLowerCase() || '';
        
        if (fuelLower.includes('électrique') || fuelLower.includes('electrique') || 
            typeLower.includes('électrique') || typeLower.includes('electrique')) {
            return '⚡';
        }
        
        // Ensuite vérifier le type de véhicule
        if (typeLower.includes('suv')) return '🚙';
        if (typeLower.includes('utilitaire')) return '🚐';
        if (typeLower.includes('citadine')) return '🚗';
        if (typeLower.includes('berline')) return '🚗';
        
        return '🚗';
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

        // Vérifier la disponibilité pour la période demandée
        setSubmitting(true);
        try {
            const isAvailable = await vehiculeService.checkVehiculeAvailability(
                selectedVehicule.id,
                startDatetime.toISOString(),
                endDatetime.toISOString()
            );

            if (!isAvailable) {
                setFeedback({
                    type: 'error',
                    message: 'Ce véhicule est déjà réservé pour cette période. Veuillez choisir d\'autres dates.'
                });
                setSubmitting(false);
                return;
            }

            // Créer la réservation
            const bookingResult = await vehiculeService.createBooking({
                idVehicule: selectedVehicule.id,
                userId: userId,
                startDatetime: startDatetime.toISOString(),
                endDatetime: endDatetime.toISOString(),
                destination: destination.trim()
            });

            setFeedback({ type: 'success', message: 'Réservation confirmée avec succès!' });

            // Créer une notification pour la réservation
            try {
                await notificationService.createNotification({
                    userId: userId,
                    message: `Votre réservation de véhicule pour ${destination.trim()} a été confirmée`,
                    type: 'reservation',
                    relatedId: bookingResult
                })
            } catch (notifError) {
                console.error('Erreur lors de la création de la notification:', notifError)
            }

            // Reset form
            setSelectedVehicule(null);
            setDestination('');
            setStartDate('');
            setStartTime('');
            setEndDate('');
            setEndTime('');

            // Recharger les véhicules pour mettre à jour la disponibilité
            await loadVehicules();
        } catch (error) {
            setFeedback({ type: 'error', message: error.message || 'Erreur lors de la création de la réservation' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="reservation-vehicule-container" data-testid="reservation-container">
            <header className="reservation-header" data-testid="reservation-header">
                <h1 data-testid="page-title">Réserver un véhicule</h1>
                <p className="reservation-subtitle" data-testid="page-subtitle">Choisissez votre véhicule et planifiez votre déplacement</p>
            </header>

            <div className="reservation-content" data-testid="reservation-content">
                {/* Section de sélection des véhicules */}
                <div className="vehicules-section" data-testid="vehicules-section">
                    {loading ? (
                        <div className="loading-message" data-testid="loading-message">Chargement des véhicules...</div>
                    ) : vehicules.length === 0 ? (
                        <div className="no-vehicules" data-testid="no-vehicules-message">Aucun véhicule disponible</div>
                    ) : (
                        <div className="vehicules-grid" data-testid="vehicules-grid">
                            {vehicules.map((vehicule) => {
                                const isSelected = selectedVehicule?.id === vehicule.id;
                                const vehiculeType = vehicule.typeVehicule || 'Véhicule';
                                const transmissionLabel = getTransmissionLabel(vehicule.transmissionType);
                                const isAvailable = vehiculesAvailability[vehicule.id] !== false;

                                return (
                                    <div
                                        key={vehicule.id}
                                        data-testid={`vehicule-card-${vehicule.id}`}
                                        data-selected={isSelected}
                                        data-available={isAvailable}
                                        className={`vehicule-card ${isSelected ? 'selected' : ''} ${!isAvailable ? 'unavailable' : ''}`}
                                        onClick={() => setSelectedVehicule(vehicule)}
                                    >
                                        <div className="vehicule-icon" data-testid={`vehicule-icon-${vehicule.id}`}>{getVehiculeTypeIcon(vehiculeType, vehicule.fuelType)}</div>
                                        <div className="vehicule-type" data-testid={`vehicule-type-${vehicule.id}`}>{vehiculeType}</div>
                                        <div className="vehicule-name" data-testid={`vehicule-name-${vehicule.id}`}>{vehicule.name}</div>
                                        <div className="vehicule-plate" data-testid={`vehicule-plate-${vehicule.id}`}>{vehicule.licensePlate}</div>
                                        <div className="vehicule-tags" data-testid={`vehicule-tags-${vehicule.id}`}>
                                            <span className="vehicule-tag" data-testid={`vehicule-capacity-${vehicule.id}`}>{vehicule.capacity} places</span>
                                            <span className="vehicule-tag" data-testid={`vehicule-transmission-${vehicule.id}`}>{transmissionLabel}</span>
                                            <span className="vehicule-tag" data-testid={`vehicule-fuel-${vehicule.id}`}>{vehicule.fuelType}</span>
                                        </div>
                                        <div className="vehicule-status" data-testid={`vehicule-status-${vehicule.id}`}>
                                            <span className={`status-dot ${isAvailable ? 'available' : 'unavailable'}`} data-testid={`status-dot-${vehicule.id}`}></span>
                                            <span className="status-text" data-testid={`status-text-${vehicule.id}`}>{isAvailable ? 'Disponible' : 'Indisponible'}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Section détails du trajet */}
                <div className="trip-details-section" data-testid="trip-details-section">
                    <div className="trip-details-header" data-testid="trip-details-header">
                        <span className="calendar-icon">📅</span>
                        <h2 data-testid="trip-details-title">Détails du trajet</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="trip-form" data-testid="trip-form">
                        <div className="form-group" data-testid="destination-group">
                            <label data-testid="destination-label">
                                <span className="input-icon">📍</span>
                                Destination
                            </label>
                            <input
                                type="text"
                                placeholder="Ville ou adresse"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                className="form-input"
                                data-testid="destination-input"
                            />
                        </div>

                        <div className="form-group" data-testid="start-datetime-group">
                            <label data-testid="start-datetime-label">
                                <span className="input-icon">🕐</span>
                                Départ
                            </label>
                            <div className="datetime-inputs" data-testid="start-datetime-inputs">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="form-input date-input"
                                    min={new Date().toISOString().split('T')[0]}
                                    data-testid="start-date-input"
                                />
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="form-input time-input"
                                    data-testid="start-time-input"
                                />
                            </div>
                        </div>

                        <div className="form-group" data-testid="end-datetime-group">
                            <label data-testid="end-datetime-label">
                                <span className="input-icon">🕐</span>
                                Retour
                            </label>
                            <div className="datetime-inputs" data-testid="end-datetime-inputs">
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="form-input date-input"
                                    min={startDate || new Date().toISOString().split('T')[0]}
                                    data-testid="end-date-input"
                                />
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="form-input time-input"
                                    data-testid="end-time-input"
                                />
                            </div>
                        </div>

                        {feedback && (
                            <div
                                className={`feedback-message ${feedback.type}`}
                                data-testid="feedback-message"
                                data-feedback-type={feedback.type}
                            >
                                {feedback.message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting || !selectedVehicule}
                            className="confirm-button"
                            data-testid="confirm-button"
                        >
                            <span className="button-icon">✓</span>
                            {submitting ? 'Vérification...' : 'Confirmer la réservation'}
                        </button>

                        {!selectedVehicule && (
                            <p className="selection-hint" data-testid="selection-hint">Sélectionnez un véhicule pour continuer</p>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ReservationVehicule;