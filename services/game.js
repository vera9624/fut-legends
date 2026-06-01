/**
 * Game Service - Lógica central del juego
 * Maneja mecánicas de juego, probabilidades y cálculos
 */

window.FUT_GAME = {
  /**
   * Extrae un sticker aleatorio del pool con pesos por rareza
   * @param {array} pool - Array de stickers disponibles
   * @returns {object} - Sticker seleccionado
   */
  pullSticker: (pool) => {
    if (!pool || !Array.isArray(pool) || pool.length === 0) {
      console.error('❌ Pool inválido para pullSticker');
      return null;
    }

    // Pesos por rareza (más raro = más peso)
    const rarityWeights = {
      common: 50,
      rare: 25,
      epic: 15,
      legendary: 10
    };

    // Calcular pesos acumulados
    const weights = pool.map((sticker) => rarityWeights[sticker.rarity] || 1);
    const totalWeight = weights.reduce((a, b) => a + b, 0);

    // Seleccionar basado en pesos
    let random = Math.random() * totalWeight;
    for (let i = 0; i < pool.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return pool[i];
      }
    }

    return pool[pool.length - 1];
  },

  /**
   * Cuenta stickers pegados en el álbum
   * @param {object} pasted - Objeto con stickers pegados
   * @returns {number} - Cantidad de stickers pegados
   */
  countPasted: (pasted) => {
    if (!pasted || typeof pasted !== 'object') return 0;
    return Object.values(pasted).filter(Boolean).length;
  },

  /**
   * Cuenta stickers desbloqueados (en inventario)
   * @param {object} inventory - Objeto con inventario
   * @returns {number} - Cantidad de stickers distintos
   */
  countUnlocked: (inventory) => {
    if (!inventory || typeof inventory !== 'object') return 0;
    return Object.keys(inventory).length;
  },

  /**
   * Calcula el nivel actual basado en XP
   * @param {number} xp - Puntos de experiencia
   * @returns {number} - Nivel (1-based)
   */
  getLevel: (xp) => {
    if (typeof xp !== 'number' || xp < 0) return 1;
    return Math.floor(xp / 100) + 1;
  },

  /**
   * Calcula el progreso hacia el siguiente nivel
   * @param {number} xp - Puntos de experiencia
   * @returns {number} - Porcentaje (0-100)
   */
  getLevelProgress: (xp) => {
    if (typeof xp !== 'number' || xp < 0) return 0;
    return (xp % 100);
  },

  /**
   * Genera un hash code a partir de un string
   * Se usa para determinismo (génerar valores consistentes por ID)
   * @param {string} value - String para hashear
   * @returns {number} - Hash code
   */
  hashCode: (value) => {
    if (typeof value !== 'string') {
      value = String(value || '');
    }

    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a 32-bit integer
    }
    return Math.abs(hash);
  },

  /**
   * Valida que un sticker sea válido
   * @param {object} sticker - Sticker a validar
   * @returns {boolean} - true si es válido
   */
  validateSticker: (sticker) => {
    if (!sticker || typeof sticker !== 'object') return false;

    const requiredFields = ['id', 'name', 'rarity', 'kit', 'page', 'team'];
    const validRarities = ['common', 'rare', 'epic', 'legendary'];

    return (
      requiredFields.every((field) => sticker[field]) &&
      validRarities.includes(sticker.rarity)
    );
  }
};
