window.FUT_DATA = window.FUT_DATA || {};

/**
 * Preguntas de trivia del juego
 * Estructura: { difficulty, text, options, answer }
 */
window.FUT_DATA.questions = [
  // PREGUNTAS FÁCILES
  {
    difficulty: 'Facil',
    text: '¿Qué selección ganó el Mundial de 2022?',
    options: ['Argentina', 'Francia', 'Brasil', 'Croacia'],
    answer: 'Argentina'
  },
  {
    difficulty: 'Facil',
    text: '¿Cuántos jugadores inicia cada equipo en un partido de fútbol?',
    options: ['11', '9', '10', '12'],
    answer: '11'
  },
  {
    difficulty: 'Facil',
    text: '¿Qué parte del cuerpo NO puede usar un jugador de campo para tocar el balón?',
    options: ['Mano', 'Cabeza', 'Pecho', 'Rodilla'],
    answer: 'Mano'
  },
  {
    difficulty: 'Facil',
    text: '¿Cómo se llama el tiro desde los 11 metros?',
    options: ['Penalti', 'Corner', 'Saque lateral', 'Tiro libre indirecto'],
    answer: 'Penalti'
  },
  {
    difficulty: 'Facil',
    text: '¿Cuántos países organizan el Mundial 2026?',
    options: ['3', '1', '2', '4'],
    answer: '3'
  },

  // PREGUNTAS MEDIAS
  {
    difficulty: 'Media',
    text: '¿Qué club es conocido como los Rossoneri?',
    options: ['AC Milan', 'Inter', 'Juventus', 'Roma'],
    answer: 'AC Milan'
  },
  {
    difficulty: 'Media',
    text: '¿En qué país queda el estadio Maracaná?',
    options: ['Brasil', 'Argentina', 'Uruguay', 'Colombia'],
    answer: 'Brasil'
  },
  {
    difficulty: 'Media',
    text: '¿Qué selección es conocida como la Canarinha?',
    options: ['Brasil', 'España', 'Portugal', 'Mexico'],
    answer: 'Brasil'
  },
  {
    difficulty: 'Media',
    text: '¿Qué equipo juega tradicionalmente en Anfield?',
    options: ['Liverpool', 'Chelsea', 'Arsenal', 'Manchester City'],
    answer: 'Liverpool'
  },
  {
    difficulty: 'Media',
    text: '¿Cuáles son los países sede del Mundial 2026?',
    options: ['Canada, Mexico y Estados Unidos', 'Brasil, Argentina y Uruguay', 'España, Portugal y Marruecos', 'Estados Unidos, Francia y Canada'],
    answer: 'Canada, Mexico y Estados Unidos'
  },

  // PREGUNTAS DIFÍCILES
  {
    difficulty: 'Dificil',
    text: '¿Qué selección ganó el Mundial de 1986?',
    options: ['Argentina', 'Alemania', 'Italia', 'Francia'],
    answer: 'Argentina'
  },
  {
    difficulty: 'Dificil',
    text: '¿Qué torneo europeo se abrevia como UCL?',
    options: ['Champions League', 'Europa League', 'Conference League', 'Nations League'],
    answer: 'Champions League'
  },
  {
    difficulty: 'Dificil',
    text: '¿En qué continente se juega la Copa Libertadores?',
    options: ['Sudamerica', 'Europa', 'Asia', 'Africa'],
    answer: 'Sudamerica'
  },
  {
    difficulty: 'Dificil',
    text: '¿Qué significa VAR en fútbol?',
    options: ['Video Assistant Referee', 'Virtual Attack Rule', 'Victory Area Review', 'Visual Arena Replay'],
    answer: 'Video Assistant Referee'
  },
  {
    difficulty: 'Dificil',
    text: '¿Cuántas selecciones tiene el formato oficial del Mundial 2026?',
    options: ['48', '32', '40', '36'],
    answer: '48'
  }
];

/**
 * Valida las preguntas
 */
function validateQuestions() {
  const errors = [];

  window.FUT_DATA.questions.forEach((q, idx) => {
    if (!q.text) errors.push(`[${idx}] Falta 'text'`);
    if (!q.answer) errors.push(`[${idx}] Falta 'answer'`);
    if (!q.options || !Array.isArray(q.options)) errors.push(`[${idx}] 'options' no es un array`);
    if (!q.difficulty) errors.push(`[${idx}] Falta 'difficulty'`);

    if (q.options && !q.options.includes(q.answer)) {
      errors.push(`[${idx}] Respuesta '${q.answer}' no está en las opciones`);
    }

    const validDifficulties = ['Facil', 'Media', 'Dificil'];
    if (q.difficulty && !validDifficulties.includes(q.difficulty)) {
      errors.push(`[${idx}] Dificultad inválida: ${q.difficulty}`);
    }
  });

  if (errors.length) {
    console.error('❌ Errores en preguntas:', errors);
    return false;
  }

  console.log(`✅ ${window.FUT_DATA.questions.length} preguntas validadas correctamente`);
  return true;
}

validateQuestions();
