import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import announcementService from '../services/announcementService';
import '../index.css';
import '../style/theme.css';

function CreateAnnouncement() {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
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
            
            // Redirect to announcements page after 1.5 seconds
            setTimeout(() => {
                navigate('/announcements');
            }, 1500);
        } catch (error) {
            setFeedback({ type: 'error', message: error.message || 'Erreur lors de la création de l\'annonce' });
        } finally {
            setSubmitting(false);
        }
    };

    const containerStyle = {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px'
    };

    const headerStyle = {
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '2px solid var(--color-primary)'
    };

    const formStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    };

    const inputStyle = {
        width: '100%',
        padding: '12px 16px',
        fontSize: '16px',
        borderRadius: '8px',
        border: '2px solid var(--color-primary)',
        fontFamily: 'Alata, sans-serif',
        outline: 'none',
        boxSizing: 'border-box'
    };

    const textareaStyle = {
        ...inputStyle,
        minHeight: '200px',
        resize: 'vertical',
        fontFamily: 'inherit'
    };

    const buttonStyle = {
        background: 'var(--color-primary)',
        color: 'var(--color-third)',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: 600,
        cursor: submitting ? 'not-allowed' : 'pointer',
        fontFamily: 'Alata, sans-serif',
        opacity: submitting ? 0.7 : 1,
        transition: 'all 0.2s ease'
    };

    const feedbackStyle = {
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '16px',
        fontFamily: 'Alata, sans-serif'
    };

    const successStyle = {
        ...feedbackStyle,
        background: '#10b981',
        color: 'white'
    };

    const errorStyle = {
        ...feedbackStyle,
        background: '#ef4444',
        color: 'white'
    };

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <h1 style={{ color: 'var(--color-secondary)', fontFamily: 'Alata, sans-serif' }}>
                    Faire une Annonce
                </h1>
                <p style={{ color: 'var(--color-second-text)', marginTop: '8px' }}>
                    Créez une nouvelle annonce pour tous les employés
                </p>
            </div>

            {feedback && (
                <div style={feedback.type === 'success' ? successStyle : errorStyle}>
                    {feedback.message}
                </div>
            )}

            <form onSubmit={handleSubmit} style={formStyle}>
                <div>
                    <label style={{ 
                        display: 'block', 
                        marginBottom: '8px', 
                        color: 'var(--color-secondary)',
                        fontFamily: 'Alata, sans-serif',
                        fontWeight: 600
                    }}>
                        Titre *
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Titre de l'annonce"
                        style={inputStyle}
                        disabled={submitting}
                        maxLength={200}
                    />
                </div>

                <div>
                    <label style={{ 
                        display: 'block', 
                        marginBottom: '8px', 
                        color: 'var(--color-secondary)',
                        fontFamily: 'Alata, sans-serif',
                        fontWeight: 600
                    }}>
                        Message *
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Contenu de l'annonce"
                        style={textareaStyle}
                        disabled={submitting}
                    />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        onClick={() => navigate('/announcements')}
                        style={{
                            ...buttonStyle,
                            background: 'transparent',
                            color: 'var(--color-primary)',
                            border: '2px solid var(--color-primary)'
                        }}
                        disabled={submitting}
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        style={buttonStyle}
                        disabled={submitting}
                    >
                        {submitting ? 'Création...' : 'Créer l\'annonce'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CreateAnnouncement;

