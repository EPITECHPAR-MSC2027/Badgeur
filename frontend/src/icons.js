/**
 * Fichier centralisé pour toutes les icônes utilisées dans l'application
 * Les icônes proviennent d'icons8.com
 */

export const icons = {
  // Icônes de pointage
  dataArrived: {
    url: 'https://img.icons8.com/officel/80/data-arrived.png',
    alt: 'data-arrived',
    width: 84,
    height: 84
  },
  foodBar: {
    url: 'https://img.icons8.com/officel/80/food-bar.png',
    alt: 'food-bar',
    width: 60,
    height: 60
  },
  repeat: {
    url: 'https://img.icons8.com/fluency/48/repeat.png',
    alt: 'repeat',
    width: 48,
    height: 48
  },
  morning: {
    url: 'https://img.icons8.com/fluency/48/morning.png',
    alt: 'morning',
    width: 48,
    height: 48
  },
  sunset: {
    url: 'https://img.icons8.com/cotton/64/sunset--v2.png',
    alt: 'sunset--v2',
    width: 64,
    height: 64
  },
  badge: {
    url: 'https://img.icons8.com/plasticine/100/employee-card.png',
    alt: 'badge',
    width: 110,
    height: 110
  }
}

/**
 * Composant réutilisable pour afficher une icône
 * @param {Object} icon - Objet icône avec url, alt, width, height
 * @param {number} width - Largeur personnalisée (optionnel)
 * @param {number} height - Hauteur personnalisée (optionnelle)
 */
export const Icon = ({ icon, width, height }) => {
  return (
    <img
      width={width || icon.width}
      height={height || icon.height}
      src={icon.url}
      alt={icon.alt}
    />
  )
}

export default icons

