
class AuthService {
    constructor() {
        this.baseURL = ''; // URL de base de l'API (vide car on utilise des routes relatives)
    }

    // Récupère le token d'accès depuis le localStorage
    getAccessToken() {
        return localStorage.getItem('accessToken');
    }

    // Vérifie si l'utilisateur est connecté
    isAuthenticated() {
        const token = this.getAccessToken();
        return token !== null && token !== undefined && token !== '';
    }

    // Déconnecte l'utilisateur
    logout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('firstName');
        localStorage.removeItem('lastName');
        localStorage.removeItem('roleId');
        localStorage.removeItem('email');
        localStorage.removeItem('userId');
    }

    // Effectue une requête HTTP avec authentification automatique
    async authenticatedFetch(url, options = {}) {
        const token = this.getAccessToken();
        console.log('Token d\'authentification:', token ? 'Présent' : 'Absent');
        console.log('URL de la requête:', url);
        console.log('Options de la requête:', options);
        
        if (!token) {
            throw new Error('Aucun token d\'authentification trouvé');
        }

        const defaultHeaders = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        };

        console.log('Headers de la requête:', defaultHeaders);

        const response = await fetch(url, {
            ...options,
            headers: defaultHeaders
        });

        console.log('Statut de la réponse:', response.status);

        // Si la réponse est 401 (Non autorisé), vérifier si c'est une erreur de session ou de permissions
        if (response.status === 401) {
            console.log('Erreur 401 détectée');
            
            // Vérifier si le token existe encore
            const token = this.getAccessToken();
            if (!token) {
                console.log('Token manquant, déconnexion de l\'utilisateur');
                this.logout();
                window.location.reload();
                throw new Error('Session expirée. Veuillez vous reconnecter.');
            }
            
            // Si le token existe mais on a une 401, c'est probablement un problème de permissions
            // On ne déconnecte pas automatiquement, on laisse l'erreur remonter
            console.log('Erreur 401 avec token valide - problème de permissions');
            throw new Error('Accès non autorisé à cette ressource.');
        }

        return response;
    }

    // Méthodes pour les requêtes HTTP courantes avec authentification
    async get(url, options = {}) {
        return this.authenticatedFetch(url, {
            ...options,
            method: 'GET'
        });
    }

    async post(url, data, options = {}) {
        return this.authenticatedFetch(url, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(url, data, options = {}) {
        return this.authenticatedFetch(url, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async delete(url, options = {}) {
        return this.authenticatedFetch(url, {
            ...options,
            method: 'DELETE'
        });
    }
}

// Créer une instance singleton du service
const authService = new AuthService();

export default authService;
