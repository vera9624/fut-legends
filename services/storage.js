/**
 * Storage Service - Gestión de persistencia de datos
 * Abstrae localStorage y maneja serialización/deserialización
 */

window.FUT_STORAGE = {
  /**
   * Guarda datos en localStorage
   * @param {string} key - Clave de almacenamiento
   * @param {object} data - Datos a guardar
   * @returns {boolean} - true si fue exitoso
   */
  save: (key, data) => {
    try {
      if (!key || typeof key !== 'string') {
        throw new Error('Clave de almacenamiento inválida');
      }

      const serialized = JSON.stringify(data);
      
      // Validar tamaño (máximo 5MB para localStorage)
      if (serialized.length > 5242880) {
        console.warn('⚠️ Datos exceden 5MB');
        return false;
      }

      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error('❌ Error guardando datos:', error);
      return false;
    }
  },

  /**
   * Carga datos de localStorage
   * @param {string} key - Clave de almacenamiento
   * @param {object} defaults - Valores por defecto si no existe
   * @returns {object} - Datos cargados o defaults
   */
  load: (key, defaults = {}) => {
    try {
      if (!key || typeof key !== 'string') {
        throw new Error('Clave de almacenamiento inválida');
      }

      const stored = localStorage.getItem(key);
      
      if (!stored) {
        return structuredClone(defaults);
      }

      const parsed = JSON.parse(stored);
      
      // Validar que parsed sea un objeto
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Datos parseados no son válidos');
      }

      return parsed;
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      return structuredClone(defaults);
    }
  },

  /**
   * Elimina datos de localStorage
   * @param {string} key - Clave de almacenamiento
   * @returns {boolean} - true si fue exitoso
   */
  clear: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('❌ Error limpiando datos:', error);
      return false;
    }
  },

  /**
   * Verifica disponibilidad de localStorage
   * @returns {boolean} - true si localStorage está disponible
   */
  isAvailable: () => {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      console.error('❌ localStorage no disponible:', error);
      return false;
    }
  }
};
