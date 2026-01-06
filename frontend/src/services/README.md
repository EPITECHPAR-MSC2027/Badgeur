# Services de l'Application Badgeur

Ce dossier contient tous les services pour communiquer avec l'API backend.

## Services disponibles

- **authService** : Authentification JWT
- **teamService** : Gestion des équipes
- **planningService** : Gestion des plannings
- **typeDemandeService** : Gestion des types de demandes
- **statsService** : Statistiques et analytics
- **floorService** : Gestion des étages
- **roomService** : Gestion des salles

---

# Service d'Authentification JWT

Ce service gère l'authentification JWT pour l'application Badgeur.

## Utilisation

### Import du service

```javascript
import authService from '../services/authService'
```

### Méthodes disponibles

#### `isAuthenticated()`
Vérifie si l'utilisateur est connecté.

```javascript
if (authService.isAuthenticated()) {
    // L'utilisateur est connecté
}
```

#### `getAccessToken()`
Récupère le token d'accès depuis le localStorage.

```javascript
const token = authService.getAccessToken()
```

#### `logout()`
Déconnecte l'utilisateur et supprime tous les tokens du localStorage.

```javascript
authService.logout()
```

### Requêtes HTTP authentifiées

Le service fournit des méthodes pour faire des requêtes HTTP avec authentification automatique :

#### `get(url, options)`
```javascript
const response = await authService.get('/api/users')
const data = await response.json()
```

#### `post(url, data, options)`
```javascript
const response = await authService.post('/api/badge-events', {
    timestamp: new Date().toISOString()
})
```

#### `put(url, data, options)`
```javascript
const response = await authService.put('/api/users/123', {
    firstName: 'Nouveau prénom'
})
```

#### `delete(url, options)`
```javascript
const response = await authService.delete('/api/users/123')
```

#### `authenticatedFetch(url, options)`
Méthode générique pour les requêtes personnalisées.

```javascript
const response = await authService.authenticatedFetch('/api/custom-endpoint', {
    method: 'PATCH',
    body: JSON.stringify(data)
})
```

## Gestion des erreurs

Le service gère automatiquement les erreurs 401 (Non autorisé) :
- Si une requête retourne 401, l'utilisateur est automatiquement déconnecté
- La page est rechargée pour rediriger vers la page de connexion

## Stockage des données

Le service stocke les données suivantes dans le localStorage :
- `accessToken` : Token JWT d'accès
- `refreshToken` : Token de rafraîchissement (optionnel)
- `firstName` : Prénom de l'utilisateur
- `lastName` : Nom de l'utilisateur
- `email` : Email de l'utilisateur
- `roleId` : ID du rôle de l'utilisateur
- `userId` : ID de l'utilisateur

## Exemple d'utilisation complète

```javascript
import React, { useState, useEffect } from 'react'
import authService from '../services/authService'

function MyComponent() {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const response = await authService.get('/api/data')
            if (response.ok) {
                const result = await response.json()
                setData(result)
            }
        } catch (error) {
            console.error('Erreur lors du chargement:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (formData) => {
        try {
            const response = await authService.post('/api/submit', formData)
            if (response.ok) {
                alert('Données sauvegardées avec succès!')
                loadData() // Recharger les données
            }
        } catch (error) {
            alert('Erreur lors de la sauvegarde')
        }
    }

    if (loading) return <div>Chargement...</div>

    return (
        <div>
            {/* Votre interface utilisateur */}
        </div>
    )
}
```

---

# Services de Gestion des Espaces

## floorService

Service pour gérer les étages (floors).

### Méthodes disponibles

#### `getAllFloors()`
Récupère tous les étages.

```javascript
import floorService from '../services/floorService'

const floors = await floorService.getAllFloors()
// Retourne: [{id: 1, floorNumber: 0}, {id: 2, floorNumber: 1}, ...]
```

#### `getFloorById(id)`
Récupère un étage par son ID.

```javascript
const floor = await floorService.getFloorById(1)
// Retourne: {id: 1, floorNumber: 0} ou null
```

#### `createFloor(floorData)`
Crée un nouvel étage.

```javascript
const newFloorId = await floorService.createFloor({
    floorNumber: 2
})
// Retourne: l'ID du nouvel étage ou null en cas d'erreur
```

#### `updateFloor(id, floorData)`
Met à jour un étage existant.

```javascript
const updatedFloor = await floorService.updateFloor(1, {
    floorNumber: 3
})
// Retourne: l'étage mis à jour ou null
```

#### `deleteFloor(id)`
Supprime un étage.

```javascript
const success = await floorService.deleteFloor(1)
// Retourne: true si succès, false sinon
```

---

## roomService

Service pour gérer les salles (rooms).

### Méthodes disponibles

#### `getAllRooms()`
Récupère toutes les salles.

```javascript
import roomService from '../services/roomService'

const rooms = await roomService.getAllRooms()
// Retourne: [{id: 1, name: "Salle A", idFloor: 1}, ...]
```

#### `getRoomById(id)`
Récupère une salle par son ID.

```javascript
const room = await roomService.getRoomById(1)
```

#### `getRoomsByFloorId(floorId)`
Récupère toutes les salles d'un étage spécifique.

```javascript
const rooms = await roomService.getRoomsByFloorId(1)
// Retourne: [{id: 1, name: "Salle A", idFloor: 1}, ...]
```

#### `createRoom(roomData)`
Crée une nouvelle salle.

```javascript
const newRoomId = await roomService.createRoom({
    name: "Salle de réunion",
    idFloor: 1
})
```

#### `updateRoom(id, roomData)`
Met à jour une salle existante.

```javascript
const updatedRoom = await roomService.updateRoom(1, {
    name: "Salle de conférence",
    idFloor: 2
})
```

#### `deleteRoom(id)`
Supprime une salle.

```javascript
const success = await roomService.deleteRoom(1)
```
