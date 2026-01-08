import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

    useEffect(() => {
        const authenticated = authService.isAuthenticated();
        setIsAuthenticated(authenticated);

        if (authenticated) {
            const firstName = localStorage.getItem('firstName') || '';
            const lastName = localStorage.getItem('lastName') || '';
            const email = localStorage.getItem('email') || '';
            setFormData(prev => ({
                ...prev,
                user_name: firstName,
                user_last_name: lastName,
                user_email: email
            }));
        } else {
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

        if (name === 'assigned_to') {
            setFormData(prev => ({
                ...prev,
                assigned_to: value,
                category: ''
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
            const res = await authService.post('/tickets/', formData);

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || 'Erreur lors de la création du ticket');
            }

            setSuccess(true);
            setTimeout(() => {
                if (isAuthenticated) {
                    navigate('/home');
                } else {
                    navigate('/login');
                }
            }, 2000);

        } catch (err) {
            setError(err.message || 'Erreur lors de la création du ticket');
            setLoading(false);
        }
    };

    const styles = {
        container: {
            minHeight: '100vh',
            backgroundColor: 'var(--color-background)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        },
        card: {
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            padding: '48px',
            maxWidth: '600px',
            width: '100%'
        },
        iconContainer: {
            width: '64px',
            height: '64px',
            backgroundColor: '#e0f2f1',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: '28px'
        },
        title: {
            fontSize: '28px',
            fontWeight: '600',
            color: 'var(--color-secondary)',
            textAlign: 'center',
            margin: '0 0 12px 0'
        },
        subtitle: {
            fontSize: '15px',
            color: 'var(--color-third-text)',
            textAlign: 'center',
            margin: '0 0 40px 0',
            lineHeight: '1.5'
        },
        formGroup: {
            marginBottom: '24px'
        },
        label: {
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: 'var(--color-text)',
            marginBottom: '8px'
        },
        required: {
            color: '#e53e3e',
            marginLeft: '4px'
        },
        input: {
            width: '100%',
            padding: '12px 16px',
            fontSize: '15px',
            color: 'var(--color-text)',
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            outline: 'none',
            transition: 'all 0.2s',
            boxSizing: 'border-box',
            fontFamily: 'inherit'
        },
        select: {
            width: '100%',
            padding: '12px 16px',
            fontSize: '15px',
            color: '#2d3748',
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            outline: 'none',
            transition: 'all 0.2s',
            boxSizing: 'border-box',
            cursor: 'pointer',
            fontFamily: 'inherit',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23718096' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 16px center',
            paddingRight: '40px'
        },
        textarea: {
            width: '100%',
            padding: '12px 16px',
            fontSize: '15px',
            color: 'var(--color-text)',
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            outline: 'none',
            transition: 'all 0.2s',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
            resize: 'vertical',
            minHeight: '120px'
        },
        button: {
            width: '100%',
            padding: '14px 24px',
            fontSize: '16px',
            fontWeight: '600',
            color: 'white',
            backgroundColor: 'var(--color-secondary)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            marginTop: '8px',
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
        },
        alert: {
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '24px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        error: {
            backgroundColor: '#fff5f5',
            color: '#c53030',
            border: '1px solid #feb2b2'
        },
        success: {
            backgroundColor: '#f0fff4',
            color: '#276749',
            border: '1px solid #9ae6b4'
        }
    };

    return (
        <div style={styles.container} data-testid="support-ticket-container">
            <div style={styles.card} data-testid="support-ticket-card">
                <div style={styles.iconContainer} data-testid="ticket-icon">
                    🎫
                </div>

                <h1 style={styles.title} data-testid="ticket-title">Nouveau ticket</h1>
                <p style={styles.subtitle} data-testid="ticket-subtitle">
                    Soumettez une demande ou signalez un problème à l'administration
                </p>

                {error && (
                    <div style={{ ...styles.alert, ...styles.error }} data-testid="error-message">
                        ⚠️ {error}
                    </div>
                )}

                {success && (
                    <div style={{ ...styles.alert, ...styles.success }} data-testid="success-message">
                        ✅ Votre ticket a été créé avec succès ! Redirection en cours...
                    </div>
                )}

                <form style={{ padding: '0px 100px' }} onSubmit={handleSubmit} data-testid="ticket-form">
                    <div style={styles.formGroup} data-testid="assigned-to-group">
                        <label style={styles.label} data-testid="assigned-to-label">
                            Assigné à<span style={styles.required}>*</span>
                        </label>
                        <select
                            name="assigned_to"
                            value={formData.assigned_to}
                            onChange={handleChange}
                            style={styles.select}
                            required
                            disabled={loading || !isAuthenticated}
                            data-testid="assigned-to-select"
                        >
                            <option value="">Sélectionnez un service</option>
                            <option value="IT support">IT support</option>
                            <option value="RH">RH</option>
                        </select>
                    </div>

                    <div style={styles.formGroup} data-testid="first-name-group">
                        <label style={styles.label} data-testid="first-name-label">
                            Prénom<span style={styles.required}>*</span>
                        </label>
                        <input
                            type="text"
                            name="user_name"
                            value={formData.user_name}
                            onChange={handleChange}
                            style={styles.input}
                            placeholder="Votre prénom"
                            required
                            disabled={loading || isAuthenticated}
                            data-testid="first-name-input"
                        />
                    </div>

                    <div style={styles.formGroup} data-testid="last-name-group">
                        <label style={styles.label} data-testid="last-name-label">
                            Nom<span style={styles.required}>*</span>
                        </label>
                        <input
                            type="text"
                            name="user_last_name"
                            value={formData.user_last_name}
                            onChange={handleChange}
                            style={styles.input}
                            placeholder="Votre nom"
                            required
                            disabled={loading || isAuthenticated}
                            data-testid="last-name-input"
                        />
                    </div>

                    <div style={styles.formGroup} data-testid="email-group">
                        <label style={styles.label} data-testid="email-label">
                            Email<span style={styles.required}>*</span>
                        </label>
                        <input
                            type="email"
                            name="user_email"
                            value={formData.user_email}
                            onChange={handleChange}
                            style={styles.input}
                            placeholder="nom@banque.fr"
                            required
                            disabled={loading || isAuthenticated}
                            data-testid="email-input"
                        />
                    </div>

                    <div style={styles.formGroup} data-testid="category-group">
                        <label style={styles.label} data-testid="category-label">
                            Catégorie<span style={styles.required}>*</span>
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            style={styles.select}
                            required
                            disabled={loading || !formData.assigned_to}
                            data-testid="category-select"
                        >
                            <option value="">
                                {formData.assigned_to
                                    ? 'Sélectionnez une catégorie'
                                    : 'Sélectionnez d\'abord un service'}
                            </option>
                            {getCategories().map((cat) => (
                                <option key={cat} value={cat} data-testid={`category-option-${cat}`}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={styles.formGroup} data-testid="description-group">
                        <label style={styles.label} data-testid="description-label">
                            Description<span style={styles.required}>*</span>
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            style={styles.textarea}
                            placeholder="Décrivez votre problème ou votre demande..."
                            rows="5"
                            required
                            disabled={loading}
                            data-testid="description-textarea"
                        />
                    </div>

                    <button
                        type="submit"
                        style={{
                            ...styles.button,
                            opacity: loading || success ? 0.6 : 1,
                            cursor: loading || success ? 'not-allowed' : 'pointer',
                            backgroundColor: loading || success ? '#4a5568' : '#2c5282'
                        }}
                        disabled={loading || success}
                        onMouseEnter={(e) => {
                            if (!loading && !success) {
                                e.target.style.backgroundColor = '#2a4365';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!loading && !success) {
                                e.target.style.backgroundColor = '#2c5282';
                            }
                        }}
                        data-testid="submit-button"
                    >
                        <span>✈️</span>
                        {loading ? 'Création en cours...' : success ? 'Ticket créé !' : 'Envoyer le ticket'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default SupportTicket;