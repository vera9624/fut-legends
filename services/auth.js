/**
 * Auth Service - Autenticación de usuarios
 * Soporta Firebase Authentication y auth local
 */

window.FUT_AUTH = {
  /**
   * Verifica si Firebase está habilitado y configurado
   * @returns {boolean} - true si Firebase está activo
   */
  isFirebaseEnabled: () => {
    return (
      window.FUT_FIREBASE_CONFIG?.enabled === true &&
      window.firebase?.auth !== undefined
    );
  },

  /**
   * Obtiene etiqueta del modo de autenticación actual
   * @returns {string} - Descripción del modo
   */
  getModeLabel: () => {
    if (window.FUT_AUTH.isFirebaseEnabled()) {
      return 'Autenticación con Firebase';
    }
    return 'Almacenamiento local (Beta)';
  },

  /**
   * Registra un nuevo usuario
   * @param {object} credentials - { username, password, playerName, avatarColor }
   * @returns {Promise<object>} - Usuario creado
   * @throws {Error} - Si falla el registro
   */
  register: async (credentials) => {
    try {
      const { username, password, playerName, avatarColor } = credentials;

      // Validaciones
      if (!username || username.trim().length < 3) {
        throw new Error('Usuario debe tener al menos 3 caracteres');
      }

      if (!password || password.length < 4) {
        throw new Error('Contraseña debe tener al menos 4 caracteres');
      }

      if (!playerName || playerName.trim().length < 1) {
        throw new Error('Nombre del jugador es requerido');
      }

      // Si Firebase está habilitado
      if (window.FUT_AUTH.isFirebaseEnabled()) {
        try {
          const auth = firebase.auth();
          const userCredential = await auth.createUserWithEmailAndPassword(
            username,
            password
          );

          return {
            id: userCredential.user.uid,
            username: userCredential.user.email,
            playerName: playerName,
            avatarColor: avatarColor || '#18b56d'
          };
        } catch (error) {
          throw window.FUT_AUTH._mapFirebaseError(error);
        }
      }

      // Fallback a almacenamiento local
      return {
        id: 'user_' + Date.now(),
        username: username,
        playerName: playerName,
        avatarColor: avatarColor || '#18b56d'
      };
    } catch (error) {
      console.error('❌ Error en registro:', error);
      throw error;
    }
  },

  /**
   * Inicia sesión de usuario
   * @param {object} credentials - { username, password }
   * @returns {Promise<object>} - Usuario autenticado
   * @throws {Error} - Si falla el login
   */
  login: async (credentials) => {
    try {
      const { username, password } = credentials;

      if (!username || !password) {
        throw new Error('Usuario y contraseña requeridos');
      }

      // Si Firebase está habilitado
      if (window.FUT_AUTH.isFirebaseEnabled()) {
        try {
          const auth = firebase.auth();
          const userCredential = await auth.signInWithEmailAndPassword(
            username,
            password
          );

          return {
            id: userCredential.user.uid,
            username: userCredential.user.email,
            playerName: userCredential.user.displayName || username,
            avatarColor: '#18b56d'
          };
        } catch (error) {
          throw window.FUT_AUTH._mapFirebaseError(error);
        }
      }

      // Fallback a almacenamiento local
      return {
        id: 'user_' + Date.now(),
        username: username,
        playerName: username,
        avatarColor: '#18b56d'
      };
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error;
    }
  },

  /**
   * Cierra la sesión del usuario
   * @returns {Promise<boolean>} - true si fue exitoso
   */
  logout: async () => {
    try {
      if (window.FUT_AUTH.isFirebaseEnabled()) {
        await firebase.auth().signOut();
      }
      return true;
    } catch (error) {
      console.error('❌ Error en logout:', error);
      return false;
    }
  },

  /**
   * Mapea errores de Firebase a mensajes legibles
   * @param {Error} error - Error de Firebase
   * @returns {Error} - Error con mensaje mejorado
   * @private
   */
  _mapFirebaseError: (error) => {
    const errorMap = {
      'auth/email-already-in-use': 'Este correo ya está registrado',
      'auth/invalid-email': 'Correo inválido',
      'auth/weak-password': 'Contraseña debe tener al menos 6 caracteres',
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/invalid-credential': 'Credenciales inválidas'
    };

    const message = errorMap[error.code] || error.message || 'Error de autenticación';
    return new Error(message);
  }
};
