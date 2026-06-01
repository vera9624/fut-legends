/**
 * Backend Service - Gestión de ranking y datos globales
 * Simula un backend, en producción conectaría a servidor real
 */

window.FUT_BACKEND = {
  /**
   * Obtiene el ranking actual
   * @returns {array} - Array de jugadores ordenados por score
   */
  getRanking: () => {
    try {
      const stored = localStorage.getItem('fut-ranking-v1');
      
      if (!stored) {
        return [];
      }

      const ranking = JSON.parse(stored);
      
      // Validar que sea un array válido
      if (!Array.isArray(ranking)) {
        console.warn('⚠️ Ranking inválido, reseteando');
        return [];
      }

      // Validar cada entrada
      return ranking.filter((entry) => {
        return (
          entry.playerName &&
          typeof entry.score === 'number' &&
          entry.score >= 0
        );
      });
    } catch (error) {
      console.error('❌ Error cargando ranking:', error);
      return [];
    }
  },

  /**
   * Guarda una entrada de ranking
   * @param {object} entry - { playerName, score, level, pasted, unlocked }
   * @returns {array} - Ranking actualizado (top 100)
   */
  saveRankingEntry: (entry) => {
    try {
      if (!entry || !entry.playerName || typeof entry.score !== 'number') {
        throw new Error('Entrada de ranking inválida');
      }

      const ranking = window.FUT_BACKEND.getRanking();

      // Agregar entrada con timestamp
      ranking.push({
        playerName: String(entry.playerName).substring(0, 50),
        score: Math.floor(Math.max(0, entry.score)),
        level: entry.level || 1,
        pasted: entry.pasted || 0,
        unlocked: entry.unlocked || 0,
        date: new Date().toISOString(),
        id: 'entry_' + Date.now()
      });

      // Ordenar por score descendente
      ranking.sort((a, b) => b.score - a.score);

      // Guardar solo top 100
      const top100 = ranking.slice(0, 100);
      localStorage.setItem('fut-ranking-v1', JSON.stringify(top100));

      const position = ranking.findIndex(r => r.id === ranking[ranking.length - 1].id) + 1;
      console.log(`✅ Ranking guardado - Posición: ${position}`);

      return top100;
    } catch (error) {
      console.error('❌ Error guardando ranking:', error);
      return window.FUT_BACKEND.getRanking();
    }
  },

  /**
   * Limpia el ranking (admin only)
   * @returns {boolean} - true si fue exitoso
   */
  clearRanking: () => {
    try {
      localStorage.removeItem('fut-ranking-v1');
      console.log('✅ Ranking limpiado');
      return true;
    } catch (error) {
      console.error('❌ Error limpiando ranking:', error);
      return false;
    }
  },

  /**
   * Obtiene posición de un jugador en el ranking
   * @param {string} playerName - Nombre del jugador
   * @returns {object} - { position, entry } o null
   */
  getPlayerRanking: (playerName) => {
    const ranking = window.FUT_BACKEND.getRanking();
    const index = ranking.findIndex((r) => r.playerName === playerName);
    
    if (index === -1) return null;
    
    return {
      position: index + 1,
      entry: ranking[index]
    };
  }
};
