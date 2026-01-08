import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import announcementService from '../services/announcementService';
import '../index.css';
import '../style/theme.css';

// Composant icône Megaphone simple
const Megaphone = ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 11 18-5v12L3 14v-3z" />
        <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
);

// Composant icône Send simple
const Send = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
);

function CreateAnnouncement() {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const handleSubmit = async () => {
        setFeedback(null);

        if (!title.trim()) {
            setFeedback({ type: 'error', message: 'Le titre est requis' });
            return;
        }

        if (!message.trim()) {
            setFeedback({ type: 'error', message: 'Le message est requis' });
            return;
        }

        const userId = parseInt(localStorage.getItem('userId'));
        if (!userId) {
            setFeedback({ type: 'error', message: 'Utilisateur non identifié' });
            return;
        }

        setSubmitting(true);
        try {
            await announcementService.createAnnouncement({
                title: title.trim(),
                message: message.trim(),
                authorId: userId
            });

            setFeedback({ type: 'success', message: 'Annonce créée avec succès!' });
            setTitle('');
            setMessage('');

            setTimeout(() => {
                navigate('/announcements');
            }, 1500);
        } catch (error) {
            console.error('Erreur création annonce:', error);
            setFeedback({
                type: 'error',
                message: error.message || 'Erreur lors de la création de l\'annonce'
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div data-testid="create-announcement-page" style={{
            marginTop: '50px',
            padding: '0 20px'
        }}>
            <div data-testid="create-announcement-container" style={{
                maxWidth: '700px',
                margin: '0 auto',
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                overflow: 'hidden'
            }}>
                {/* En-tête avec icône */}
                <div data-testid="header-section" style={{
                    padding: '22px',
                    borderBottom: '1px solid #e5e7eb'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px'
                    }}>
                        <div data-testid="icon-container" style={{
                            width: '48px',
                            height: '48px',
                            background: '#eff6ff',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Megaphone size={24} color="#3b82f6" />
                        </div>
                        <h1 data-testid="page-title" style={{
                            fontSize: '24px',
                            fontWeight: '700',
                            color: '#111827',
                            margin: 0,
                            fontFamily: 'Fustat, sans-serif'
                        }}>
                            Nouvelle annonce
                        </h1>
                    </div>
                    <p data-testid="page-description" style={{
                        color: 'var(--color-third-text)',
                        fontSize: '14px',
                        margin: '8px 0 0 0',
                        paddingLeft: '64px',
                        fontFamily: 'Fustat, sans-serif'
                    }}>
                        Publiez une annonce visible par tous les employés
                    </p>
                </div>

                {/* Formulaire */}
                <div data-testid="form-section" style={{ padding: '32px' }}>
                    {feedback && (
                        <div
                            data-testid="feedback-message"
                            data-feedback-type={feedback.type}
                            style={{
                                padding: '12px 16px',
                                borderRadius: '8px',
                                marginBottom: '20px',
                                background: feedback.type === 'success' ? '#dcfce7' : '#fee2e2',
                                color: feedback.type === 'success' ? '#166534' : '#991b1b',
                                fontSize: '14px',
                                fontFamily: 'Fustat, sans-serif'
                            }}
                        >
                            {feedback.message}
                        </div>
                    )}

                    {/* Champ Titre */}
                    <div data-testid="title-field-container" style={{ marginBottom: '24px' }}>
                        <label data-testid="title-label" style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: 'var(color-secondary)',
                            marginBottom: '8px',
                            fontFamily: 'Fustat, sans-serif'
                        }}>
                            Titre de l'annonce
                        </label>
                        <input
                            data-testid="title-input"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ex: Réunion d'équipe vendredi"
                            maxLength={100}
                            disabled={submitting}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                fontSize: '15px',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                                boxSizing: 'border-box',
                                fontFamily: 'Fustat, sans-serif'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                        <div data-testid="title-char-count" style={{
                            textAlign: 'right',
                            fontSize: '12px',
                            color: 'var(color-third-text)',
                            marginTop: '6px',
                            fontFamily: 'Fustat, sans-serif',
                            fontWeight: '500'
                        }}>
                            {title.length}/100 caractères
                        </div>
                    </div>

                    {/* Champ Message */}
                    <div data-testid="message-field-container" style={{ marginBottom: '24px' }}>
                        <label data-testid="message-label" style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: 'var(--color-secondary)',
                            marginBottom: '8px',
                            fontFamily: 'Fustat, sans-serif'
                        }}>
                            Message
                        </label>
                        <textarea
                            data-testid="message-input"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Écrivez votre message ici..."
                            maxLength={1000}
                            disabled={submitting}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                fontSize: '15px',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                outline: 'none',
                                minHeight: '180px',
                                resize: 'vertical',
                                transition: 'border-color 0.2s',
                                boxSizing: 'border-box',
                                fontFamily: 'Fustat, sans-serif'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                        <div data-testid="message-char-count" style={{
                            textAlign: 'right',
                            fontSize: '12px',
                            color: 'var(--color-third-text)',
                            marginTop: '6px',
                            fontFamily: 'Fustat, sans-serif',
                            fontWeight: '500'
                        }}>
                            {message.length}/1000 caractères
                        </div>
                    </div>

                    {/* Bouton de soumission */}
                    <button
                        data-testid="submit-button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        style={{
                            width: '100%',
                            padding: '14px 24px',
                            background: submitting ? '#9ca3af' : '#7c8fc7',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: submitting ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'background 0.2s',
                            fontFamily: 'Fustat, sans-serif'
                        }}
                        onMouseEnter={(e) => {
                            if (!submitting) e.target.style.background = '#6b7db3';
                        }}
                        onMouseLeave={(e) => {
                            if (!submitting) e.target.style.background = '#7c8fc7';
                        }}
                    >
                        <Send size={18} />
                        {submitting ? 'Publication...' : "Publier l'annonce"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CreateAnnouncement;