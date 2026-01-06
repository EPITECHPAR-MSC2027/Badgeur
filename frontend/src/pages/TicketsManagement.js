import React, { useState, useEffect } from 'react';
import '../style/TicketsManagement.css';
import authService from '../services/authService';
import notificationService from '../services/notificationService';

function TicketsManagement() {
    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [expandedTickets, setExpandedTickets] = useState(new Set());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [updatingStatus, setUpdatingStatus] = useState(null);

    useEffect(() => {
        fetchTickets();
    }, []);

    useEffect(() => {
        filterTickets();
    }, [tickets, selectedCategory]);

    const fetchTickets = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await authService.get('/tickets/my');
            if (!response.ok) {
                throw new Error('Erreur lors du chargement des tickets');
            }
            const data = await response.json();
            
            // Filtrer les tickets selon le role_id de l'utilisateur connecté
            const roleId = parseInt(localStorage.getItem('roleId'), 10);
            let filteredData = data;

            if (roleId === 2) {
                // Admin : montrer les tickets avec assigned_to = "IT support"
                filteredData = data.filter(ticket => ticket.assignedTo === 'IT support');
            } else if (roleId === 3) {
                // RH : montrer les tickets avec assigned_to = "RH"
                filteredData = data.filter(ticket => ticket.assignedTo === 'RH');
            }

            setTickets(filteredData);
        } catch (err) {
            setError(err.message || 'Erreur lors du chargement des tickets');
            console.error('Erreur:', err);
        } finally {
            setLoading(false);
        }
    };

    const filterTickets = () => {
        if (selectedCategory === '') {
            setFilteredTickets(tickets);
        } else {
            setFilteredTickets(tickets.filter(ticket => {
                const category = ticket.category || ticket.Category;
                return category === selectedCategory;
            }));
        }
    };

    const getUniqueCategories = () => {
        const categories = tickets.map(ticket => ticket.category || ticket.Category);
        return [...new Set(categories)].sort();
    };

    const toggleTicketExpansion = (ticketId) => {
        setExpandedTickets(prev => {
            const newSet = new Set(prev);
            if (newSet.has(ticketId)) {
                newSet.delete(ticketId);
            } else {
                newSet.add(ticketId);
            }
            return newSet;
        });
    };

    const handleUpdateStatus = async (ticketId) => {
        setUpdatingStatus(ticketId);
        try {
            // Récupérer le ticket actuel pour obtenir l'email de l'utilisateur
            const currentTicket = tickets.find(t => {
                const id = t.id || t.Id;
                return id === ticketId;
            });

            if (!currentTicket) {
                throw new Error('Ticket non trouvé');
            }

            const response = await authService.put(`/tickets/${ticketId}/status`, {
                status: 'traité'
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la mise à jour du status');
            }

            // Mettre à jour le ticket dans la liste
            setTickets(prevTickets =>
                prevTickets.map(ticket => {
                    const id = ticket.id || ticket.Id;
                    if (id === ticketId) {
                        return { ...ticket, status: 'traité', Status: 'traité' };
                    }
                    return ticket;
                })
            );

            // Créer une notification pour l'utilisateur qui a créé le ticket
            try {
                const userEmail = currentTicket.userEmail || currentTicket.UserEmail;
                if (userEmail) {
                    // Récupérer tous les utilisateurs pour trouver l'userId par email
                    const usersResponse = await authService.get('/users');
                    if (usersResponse.ok) {
                        const users = await usersResponse.json();
                        const ticketUser = Array.isArray(users) 
                            ? users.find(u => (u.email || u.Email)?.toLowerCase() === userEmail.toLowerCase())
                            : null;

                        if (ticketUser) {
                            const ticketUserId = ticketUser.id || ticketUser.Id;
                            const category = currentTicket.category || currentTicket.Category;
                            const message = `Votre ticket "${category}" a été traité.`;
                            
                            await notificationService.createNotification({
                                userId: ticketUserId,
                                message: message,
                                type: 'ticket_status',
                                relatedId: ticketId
                            });
                        }
                    }
                }
            } catch (notifError) {
                // Ne pas faire échouer la mise à jour du status si la notification échoue
                console.error('Erreur lors de la création de la notification:', notifError);
            }
        } catch (err) {
            setError(err.message || 'Erreur lors de la mise à jour du status');
            console.error('Erreur:', err);
        } finally {
            setUpdatingStatus(null);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'à traiter':
                return '#ff9800';
            case 'traité':
                return '#4caf50';
            default:
                return '#757575';
        }
    };

    if (loading && tickets.length === 0) {
        return (
            <div className="tickets-management-container">
                <div className="tickets-loading">Chargement des tickets...</div>
            </div>
        );
    }

    return (
        <div className="tickets-management-container">
            <h1 className="tickets-title">Gestion des tickets</h1>

            {error && (
                <div className="tickets-error">
                    ⚠️ {error}
                </div>
            )}

            <div className="tickets-controls">
                <div className="tickets-filter">
                    <label htmlFor="category-filter" className="filter-label">
                        Filtrer par catégorie :
                    </label>
                    <select
                        id="category-filter"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Toutes les catégories</option>
                        {getUniqueCategories().map(category => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {filteredTickets.length === 0 ? (
                <div className="tickets-empty">
                    {selectedCategory === '' 
                        ? 'Aucun ticket disponible'
                        : `Aucun ticket pour la catégorie "${selectedCategory}"`}
                </div>
            ) : (
                <div className="tickets-list">
                    {filteredTickets.map(ticket => {
                        const ticketId = ticket.id || ticket.Id;
                        const category = ticket.category || ticket.Category;
                        const userName = ticket.userName || ticket.UserName;
                        const userLastName = ticket.userLastName || ticket.UserLastName;
                        const createdAt = ticket.createdAt || ticket.CreatedAt;
                        const status = ticket.status || ticket.Status;
                        const description = ticket.description || ticket.Description;
                        const isTreated = status === 'traité';
                        
                        return (
                            <div key={ticketId} className="ticket-card">
                                <div 
                                    className="ticket-header"
                                    onClick={() => toggleTicketExpansion(ticketId)}
                                >
                                    <div className="ticket-header-info">
                                        <div className="ticket-category">{category}</div>
                                        <div className="ticket-user">
                                            {userName} {userLastName}
                                        </div>
                                        <div className="ticket-date">{formatDate(createdAt)}</div>
                                        <div 
                                            className="ticket-status"
                                            style={{ backgroundColor: getStatusColor(status) }}
                                        >
                                            {status}
                                        </div>
                                    </div>
                                    <div className="ticket-expand-icon">
                                        {expandedTickets.has(ticketId) ? '▼' : '▶'}
                                    </div>
                                </div>

                                {expandedTickets.has(ticketId) && (
                                    <div className="ticket-details">
                                        <div className="ticket-description">
                                            <strong>Description :</strong>
                                            <p>{description}</p>
                                        </div>
                                        {!isTreated && (
                                            <div className="ticket-actions">
                                                <button
                                                    onClick={() => handleUpdateStatus(ticketId)}
                                                    disabled={updatingStatus === ticketId}
                                                    className="ticket-mark-done-btn"
                                                >
                                                    {updatingStatus === ticketId 
                                                        ? 'Mise à jour...' 
                                                        : 'Marquer comme traité'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default TicketsManagement;

