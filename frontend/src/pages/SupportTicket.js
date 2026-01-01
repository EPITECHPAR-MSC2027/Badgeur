import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/SupportTicket.css';
import icon from '../assets/icon.png';
import API_URL from '../config/api';
import authService from '../services/authService';

function SupportTicket() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        assigned_to: '',
        user_name: '',
        user_last_name: '',
        user_email: '',
        category: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Initialisation du formulaire selon l'état de connexion
    useEffect(() => {
        const authenticated = authService.isAuthenticated();
        setIsAuthenticated(authenticated);

        if (authenticated) {
            // Si connecté : pré-remplir le prénom et le nom depuis localStorage
            const firstName = localStorage.getItem('firstName') || '';
            const lastName = localStorage.getItem('lastName') || '';
            setFormData(prev => ({
                ...prev,
                user_name: firstName,
                user_last_name: lastName
            }));
        } else {
            // Si non connecté : assigner automatiquement "IT support"
            setFormData(prev => ({
                ...prev,
                assigned_to: 'IT support'
            }));
        }
    }, []);

    const categoriesByAssignedTo = {
        'IT support': [
            'Problème de connexion',
            'Problème technique',
            'Demande d\'accès',
            'Bug/Erreur',
            'Question générale',
            'Autre'
        ],
        'RH': [
            'Demande de congés',
            'Demande de formation',
            'Question sur le planning',
            'Problème de pointage',
            'Demande de changement d\'équipe',
            'Question sur les avantages',
            'Autre'
        ]
    };

    const getCategories = () => {
        return formData.assigned_to ? categoriesByAssignedTo[formData.assigned_to] || [] : [];
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Si on change assigned_to, réinitialiser la catégorie
        if (name === 'assigned_to') {
            setFormData(prev => ({
                ...prev,
                assigned_to: value,
                category: '' // Réinitialiser la catégorie
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/tickets/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || 'Erreur lors de la création du ticket');
            }

            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            setError(err.message || 'Erreur lors de la création du ticket');
            setLoading(false);
        }
    };

    return (
        <div className="support-background">
            <div className="app-header">
                <div className="header-brand">
                    <img src={icon} alt="Icon" className="header-icon" />
                    <span className="header-title">BADGEUR</span>
                </div>
            </div>

            <div className="support-container">
                <div className="geometric-background"></div>
                
                <div className="support-content">
                    <h1 className="support-title">Contactez le support</h1>
                    <p className="support-subtitle">
                        Remplissez le formulaire ci-dessous pour créer un ticket de support
                    </p>

                    {error && (
                        <div className="support-error">
                            ⚠️ {error}
                        </div>
                    )}

                    {success && (
                        <div className="support-success">
                            ✅ Votre ticket a été créé avec succès ! Redirection en cours...
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="support-form">
                        <div className="support-form-group">
                            <label className="support-label">Assigné à</label>
                            <select
                                name="assigned_to"
                                value={formData.assigned_to}
                                onChange={handleChange}
                                className="support-select"
                                required
                                disabled={loading || !isAuthenticated}
                            >
                                <option value="">Sélectionnez un service</option>
                                <option value="IT support">IT support</option>
                                <option value="RH">RH</option>
                            </select>
                        </div>

                        <div className="support-form-group">
                            <label className="support-label">Prénom</label>
                            <input
                                type="text"
                                name="user_name"
                                value={formData.user_name}
                                onChange={handleChange}
                                className="support-input"
                                placeholder="Votre prénom"
                                required
                                disabled={loading || isAuthenticated}
                            />
                        </div>

                        <div className="support-form-group">
                            <label className="support-label">Nom</label>
                            <input
                                type="text"
                                name="user_last_name"
                                value={formData.user_last_name}
                                onChange={handleChange}
                                className="support-input"
                                placeholder="Votre nom"
                                required
                                disabled={loading || isAuthenticated}
                            />
                        </div>

                        <div className="support-form-group">
                            <label className="support-label">Email</label>
                            <input
                                type="email"
                                name="user_email"
                                value={formData.user_email}
                                onChange={handleChange}
                                className="support-input"
                                placeholder="nom@banque.fr"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="support-form-group">
                            <label className="support-label">Catégorie</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="support-select"
                                required
                                disabled={loading || !formData.assigned_to}
                            >
                                <option value="">
                                    {formData.assigned_to 
                                        ? 'Sélectionnez une catégorie' 
                                        : 'Sélectionnez d\'abord un service'}
                                </option>
                                {getCategories().map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="support-form-group">
                            <label className="support-label">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="support-textarea"
                                placeholder="Décrivez votre problème ou votre demande..."
                                rows="5"
                                required
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            className="support-submit-button"
                            disabled={loading || success}
                        >
                            {loading ? 'Création en cours...' : success ? 'Ticket créé !' : 'Créer le ticket →'}
                        </button>

                        <button
                            type="button"
                            className="support-back-button"
                            onClick={() => navigate('/login')}
                            disabled={loading}
                        >
                            ← Retour à la connexion
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default SupportTicket;

