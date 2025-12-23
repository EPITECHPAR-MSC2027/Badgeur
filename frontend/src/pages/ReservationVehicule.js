import React, { useState, useEffect } from 'react';
import vehiculeService from '../services/vehiculeService';
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

    const getVehiculeTypeIcon = (type) => {
        const typeLower = type?.toLowerCase() || '';
        if (typeLower.includes('citadine')) return '🚗';
        if (typeLower.includes('berline')) return '🚗';
        if (typeLower.includes('suv')) return '🚙';
        if (typeLower.includes('utilitaire')) return '🚐';
        if (typeLower.includes('électrique') || typeLower.includes('electrique')) return '⚡';
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
            await vehiculeService.createBooking({
                idVehicule: selectedVehicule.id,
                userId: userId,
                startDatetime: startDatetime.toISOString(),
                endDatetime: endDatetime.toISOString(),
                destination: destination.trim()
            });

            setFeedback({ type: 'success', message: 'Réservation confirmée avec succès!' });
            
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
                                const vehiculeType = vehicule.typeVehicule || 'Véhicule';
                                const transmissionLabel = getTransmissionLabel(vehicule.transmissionType);
                                const isAvailable = vehiculesAvailability[vehicule.id] !== false;

                                return (
                                    <div
                                        key={vehicule.id}
                                        className={`vehicule-card ${isSelected ? 'selected' : ''} ${!isAvailable ? 'unavailable' : ''}`}
                                        onClick={() => setSelectedVehicule(vehicule)}
                                    >
                                        <div className="vehicule-icon">{getVehiculeTypeIcon(vehiculeType)}</div>
                                        <div className="vehicule-type">{vehiculeType}</div>
                                        <div className="vehicule-name">{vehicule.name}</div>
                                        <div className="vehicule-plate">{vehicule.licensePlate}</div>
                                        <div className="vehicule-tags">
                                            <span className="vehicule-tag">{vehicule.capacity} places</span>
                                            <span className="vehicule-tag">{transmissionLabel}</span>
                                            <span className="vehicule-tag">{vehicule.fuelType}</span>
                                        </div>
                                        <div className="vehicule-status">
                                            <span className={`status-dot ${isAvailable ? 'available' : 'unavailable'}`}></span>
                                            <span className="status-text">{isAvailable ? 'Disponible' : 'Indisponible'}</span>
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
                                    min={new Date().toISOString().split('T')[0]}
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
                                    min={startDate || new Date().toISOString().split('T')[0]}
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
                            {submitting ? 'Vérification...' : 'Confirmer la réservation'}
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