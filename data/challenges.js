window.FUT_DATA = window.FUT_DATA || {};

/**
 * Desafíos del juego
 * Estructura: { id, title, text, target, reward, metric }
 * 
 * Métricas válidas: 'correctAnswers', 'pasted', 'bestStreak', 'unlocked'
 */
window.FUT_DATA.challenges = [
  {
    id: 'quiz-5',
    title: 'Calentamiento',
    text: 'Responde 5 preguntas correctas',
    target: 5,
    reward: { coins: 45, packs: 0 },
    metric: 'correctAnswers'
  },
  {
    id: 'paste-3',
    title: 'Pegador Pro',
    text: 'Pega 3 stickers en el álbum',
    target: 3,
    reward: { coins: 0, packs: 1 },
    metric: 'pasted'
  },
  {
    id: 'streak-4',
    title: 'Racha Perfecta',
    text: 'Llega a una racha de 4 respuestas correctas',
    target: 4,
    reward: { coins: 70, packs: 0 },
    metric: 'bestStreak'
  },
  {
    id: 'collect-10',
    title: 'Coleccionista',
    text: 'Desbloquea 10 stickers distintos',
    target: 10,
    reward: { coins: 25, packs: 1 },
    metric: 'unlocked'
  },
  {
    id: 'quiz-15',
    title: 'Maestro del Trivia',
    text: 'Responde 15 preguntas correctas',
    target: 15,
    reward: { coins: 100, packs: 1 },
    metric: 'correctAnswers'
  },
  {
    id: 'paste-20',
    title: 'Album Maestro',
    text: 'Pega 20 stickers en el álbum',
    target: 20,
    reward: { coins: 50, packs: 2 },
    metric: 'pasted'
  }
];

/**
 * Valida los desafíos
 */
function validateChallenges() {
  const errors = [];
  const validMetrics = ['correctAnswers', 'pasted', 'bestStreak', 'unlocked'];
  const ids = new Set();

  window.FUT_DATA.challenges.forEach((c, idx) => {
    if (!c.id) errors.push(`[${idx}] Falta 'id'`);
    if (!c.title) errors.push(`[${idx}] Falta 'title'`);
    if (!c.text) errors.push(`[${idx}] Falta 'text'`);
    if (typeof c.target !== 'number' || c.target <= 0) {
      errors.push(`[${idx}] 'target' debe ser un número positivo`);
    }
    if (!c.reward || typeof c.reward !== 'object') {
      errors.push(`[${idx}] 'reward' debe ser un objeto`);
    }
    if (!c.metric) errors.push(`[${idx}] Falta 'metric'`);

    if (c.metric && !validMetrics.includes(c.metric)) {
      errors.push(`[${idx}] Métrica inválida: ${c.metric}. Debe ser: ${validMetrics.join(', ')}`);
    }

    if (c.id && ids.has(c.id)) {
      errors.push(`[${idx}] ID duplicado: ${c.id}`);
    }
    if (c.id) ids.add(c.id);

    // Validar estructura de reward
    if (c.reward) {
      if (typeof c.reward.coins !== 'number' || c.reward.coins < 0) {
        errors.push(`[${idx}] 'reward.coins' debe ser un número >= 0`);
      }
      if (typeof c.reward.packs !== 'number' || c.reward.packs < 0) {
        errors.push(`[${idx}] 'reward.packs' debe ser un número >= 0`);
      }
    }
  });

  if (errors.length) {
    console.error('❌ Errores en desafíos:', errors);
    return false;
  }

  console.log(`✅ ${window.FUT_DATA.challenges.length} desafíos validados correctamente`);
  return true;
}

validateChallenges();
