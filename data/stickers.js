window.FUT_DATA = window.FUT_DATA || {};

/**
 * Mapa de confederaciones por país/equipo
 * Se usa para asignar automáticamente la confederación a stickers
 */
const CONFEDERATION_MAP = {
  'Argentina': 'CONMEBOL',
  'Brasil': 'CONMEBOL',
  'Colombia': 'CONMEBOL',
  'Uruguay': 'CONMEBOL',
  'Ecuador': 'CONMEBOL',
  'Portugal': 'UEFA',
  'Inglaterra': 'UEFA',
  'España': 'UEFA',
  'Alemania': 'UEFA',
  'Francia': 'UEFA',
  'Paises Bajos': 'UEFA',
  'Belgica': 'UEFA',
  'Italia': 'UEFA',
  'Croacia': 'UEFA',
  'Suiza': 'UEFA',
  'Dinamarca': 'UEFA',
  'Polonia': 'UEFA',
  'Mexico': 'CONCACAF',
  'Canada': 'CONCACAF',
  'Estados Unidos': 'CONCACAF',
  'Marruecos': 'CAF',
  'Senegal': 'CAF',
  'Nigeria': 'CAF',
  'Egipto': 'CAF',
  'Ghana': 'CAF',
  'Japon': 'AFC',
  'Corea del Sur': 'AFC',
  'Australia': 'AFC',
  'Iran': 'AFC',
  'Qatar': 'AFC',
  'Arabia Saudita': 'AFC',
  'Nueva Zelanda': 'OFC'
};

const baseStickers = [
  { id: 'leg-10', name: 'Mago del 10', team: 'Argentina', year: '1986', page: 'Leyendas', rarity: 'legendary', kit: '#6ec6ff' },
  { id: 'leg-09', name: 'Fenomeno 9', team: 'Brasil', year: '2002', page: 'Leyendas', rarity: 'legendary', kit: '#f0d43a' },
  { id: 'leg-07', name: 'Capitan CR7', team: 'Portugal', year: '2016', page: 'Leyendas', rarity: 'epic', kit: '#d61f35' },
  { id: 'leg-11', name: 'Pulga Dorada', team: 'Argentina', year: '2022', page: 'Leyendas', rarity: 'legendary', kit: '#75c7f4' },
  { id: 'club-mad', name: 'Rey Blanco', team: 'Madrid', year: 'UCL', page: 'Clubes', rarity: 'epic', kit: '#f7f7f7' },
  { id: 'club-bar', name: 'Azulgrana', team: 'Barcelona', year: 'Liga', page: 'Clubes', rarity: 'rare', kit: '#2042a0' },
  { id: 'club-mun', name: 'Gigante Bavaro', team: 'Munich', year: 'Bundes', page: 'Clubes', rarity: 'rare', kit: '#d82e3f' },
  { id: 'club-mil', name: 'Rossonero', team: 'Milan', year: 'Serie A', page: 'Clubes', rarity: 'common', kit: '#cf1d36' },
  { id: 'cup-world', name: 'Noche Mundial', team: 'Final', year: '2022', page: 'Momentos', rarity: 'epic', kit: '#18b56d' },
  { id: 'cup-ucl', name: 'Remontada', team: 'Europa', year: '2019', page: 'Momentos', rarity: 'rare', kit: '#37a8d8' },
  { id: 'stad-azt', name: 'Templo Azteca', team: 'Mexico', year: '1970', page: 'Estadios', rarity: 'rare', kit: '#128a59' },
  { id: 'stad-mar', name: 'Maracana', team: 'Brasil', year: '1950', page: 'Estadios', rarity: 'common', kit: '#f0b23a' },
  { id: 'leg-01', name: 'Rey del Area', team: 'Colombia', year: '1990', page: 'Leyendas', rarity: 'epic', kit: '#f6d34b' },
  { id: 'leg-08', name: 'Arquero Loco', team: 'Colombia', year: '1995', page: 'Leyendas', rarity: 'rare', kit: '#4ad17c' },
  { id: 'club-liv', name: 'Anfield Rojo', team: 'Liverpool', year: 'Premier', page: 'Clubes', rarity: 'rare', kit: '#c92535' },
  { id: 'club-boc', name: 'Bombonera Azul', team: 'Buenos Aires', year: 'Libertadores', page: 'Clubes', rarity: 'common', kit: '#173d8f' },
  { id: 'cup-col', name: 'Gol de Escorpion', team: 'Colombia', year: '1995', page: 'Momentos', rarity: 'legendary', kit: '#f7cf35' },
  { id: 'cup-pen', name: 'Tanda Eterna', team: 'Final', year: '2006', page: 'Momentos', rarity: 'rare', kit: '#2d57c9' },
  { id: 'stad-wem', name: 'Wembley Night', team: 'Inglaterra', year: '2011', page: 'Estadios', rarity: 'epic', kit: '#e5e7eb' },
  { id: 'stad-camp', name: 'Gran Camp Nou', team: 'Barcelona', year: '1957', page: 'Estadios', rarity: 'common', kit: '#253c92' },
  { id: 'rookie-01', name: 'Promesa Andina', team: 'FUT Academy', year: '2026', page: 'Promesas', rarity: 'common', kit: '#18b56d' },
  { id: 'rookie-02', name: 'Zurdo Rapido', team: 'FUT Academy', year: '2026', page: 'Promesas', rarity: 'rare', kit: '#37a8d8' },
  { id: 'rookie-03', name: 'Capitan Sub 20', team: 'FUT Academy', year: '2026', page: 'Promesas', rarity: 'epic', kit: '#7161d6' },
  { id: 'rookie-04', name: 'Guardameta Elite', team: 'FUT Academy', year: '2026', page: 'Promesas', rarity: 'common', kit: '#f0b23a' }
];

const worldCupPreviewStickers = [
  { id: 'wc26-01', number: '001', name: 'Canada', country: 'Canada', team: 'CONCACAF', year: '2026', page: 'Mundial 2026', rarity: 'rare', kit: '#d71920', confederation: 'CONCACAF' },
  { id: 'wc26-02', number: '002', name: 'Mexico', country: 'Mexico', team: 'CONCACAF', year: '2026', page: 'Mundial 2026', rarity: 'epic', kit: '#128a59', confederation: 'CONCACAF' },
  { id: 'wc26-03', number: '003', name: 'United States', country: 'Estados Unidos', team: 'CONCACAF', year: '2026', page: 'Mundial 2026', rarity: 'epic', kit: '#1d4f91', confederation: 'CONCACAF' },
  { id: 'wc26-04', number: '004', name: 'Argentina', country: 'Argentina', team: 'CONMEBOL', year: '2026', page: 'Mundial 2026', rarity: 'legendary', kit: '#75c7f4', confederation: 'CONMEBOL' },
  { id: 'wc26-05', number: '005', name: 'Brazil', country: 'Brasil', team: 'CONMEBOL', year: '2026', page: 'Mundial 2026', rarity: 'legendary', kit: '#f0d43a', confederation: 'CONMEBOL' },
  { id: 'wc26-06', number: '006', name: 'Colombia', country: 'Colombia', image: './images/luis-diaz.png', team: 'CONMEBOL', year: '2026', page: 'Mundial 2026', rarity: 'epic', kit: '#f6d34b', confederation: 'CONMEBOL' },
  { id: 'wc26-07', number: '007', name: 'Uruguay', country: 'Uruguay', team: 'CONMEBOL', year: '2026', page: 'Mundial 2026', rarity: 'rare', kit: '#66b7e8', confederation: 'CONMEBOL' },
  { id: 'wc26-08', number: '008', name: 'Ecuador', country: 'Ecuador', team: 'CONMEBOL', year: '2026', page: 'Mundial 2026', rarity: 'rare', kit: '#f4ce24', confederation: 'CONMEBOL' },
  { id: 'wc26-09', number: '009', name: 'England', country: 'Inglaterra', team: 'UEFA', year: '2026', page: 'Mundial 2026', rarity: 'epic', kit: '#f7f7f7', confederation: 'UEFA' },
  { id: 'wc26-10', number: '010', name: 'France', country: 'Francia', team: 'UEFA', year: '2026', page: 'Mundial 2026', rarity: 'legendary', kit: '#263b8f', confederation: 'UEFA' },
  { id: 'wc26-11', number: '011', name: 'Spain', country: 'España', team: 'UEFA', year: '2026', page: 'Mundial 2026', rarity: 'epic', kit: '#d8202f', confederation: 'UEFA' },
  { id: 'wc26-12', number: '012', name: 'Germany', country: 'Alemania', team: 'UEFA', year: '2026', page: 'Mundial 2026', rarity: 'epic', kit: '#e8e8e8', confederation: 'UEFA' },
  { id: 'wc26-13', number: '013', name: 'Portugal', country: 'Portugal', team: 'UEFA', year: '2026', page: 'Mundial 2026', rarity: 'legendary', kit: '#c91f35', confederation: 'UEFA' },
  { id: 'wc26-14', number: '014', name: 'Netherlands', country: 'Paises Bajos', team: 'UEFA', year: '2026', page: 'Mundial 2026', rarity: 'epic', kit: '#f47c20', confederation: 'UEFA' },
  { id: 'wc26-15', number: '015', name: 'Belgium', country: 'Belgica', team: 'UEFA', year: '2026', page: 'Mundial 2026', rarity: 'rare', kit: '#9b1b30', confederation: 'UEFA' },
  { id: 'wc26-16', number: '016', name: 'Croatia', country: 'Croacia', team: 'UEFA', year: '2026', page: 'Mundial 2026', rarity: 'rare', kit: '#e03030', confederation: 'UEFA' },
  { id: 'wc26-17', number: '017', name: 'Italy', country: 'Italia', team: 'UEFA', year: '2026', page: 'Mundial 2026', rarity: 'rare', kit: '#1e4fa3', confederation: 'UEFA' },
  { id: 'wc26-18', number: '018', name: 'Morocco', country: 'Marruecos', team: 'CAF', year: '2026', page: 'Mundial 2026', rarity: 'epic', kit: '#c1272d', confederation: 'CAF' },
  { id: 'wc26-19', number: '019', name: 'Senegal', country: 'Senegal', team: 'CAF', year: '2026', page: 'Mundial 2026', rarity: 'rare', kit: '#1aa057', confederation: 'CAF' },
  { id: 'wc26-20', number: '020', name: 'Nigeria', country: 'Nigeria', team: 'CAF', year: '2026', page: 'Mundial 2026', rarity: 'rare', kit: '#0b8f55', confederation: 'CAF' },
  { id: 'wc26-21', number: '021', name: 'Egypt', country: 'Egipto', team: 'CAF', year: '2026', page: 'Mundial 2026', rarity: 'rare', kit: '#d8202f', confederation: 'CAF' },
  { id: 'wc26-22', number: '022', name: 'Japan', country: 'Japon', team: 'AFC', year: '2026', page: 'Mundial 2026', rarity: 'epic', kit: '#2457c5', confederation: 'AFC' },
  { id: 'wc26-23', number: '023', name: 'South Korea', country: 'Corea del Sur', team: 'AFC', year: '2026', page: 'Mundial 2026', rarity: 'rare', kit: '#df3b57', confederation: 'AFC' },
  { id: 'wc26-24', number: '024', name: 'Australia', country: 'Australia', team: 'AFC', year: '2026', page: 'Mundial 2026', rarity: 'rare', kit: '#f0c735', confederation: 'AFC' },
  { id: 'wc26-25', number: '025', name: 'Iran', country: 'Iran', team: 'AFC', year: '2026', page: 'Mundial 2026', rarity: 'common', kit: '#ffffff', confederation: 'AFC' },
  { id: 'wc26-26', number: '026', name: 'Qatar', country: 'Qatar', team: 'AFC', year: '2026', page: 'Mundial 2026', rarity: 'common', kit: '#7a1737', confederation: 'AFC' },
  { id: 'wc26-27', number: '027', name: 'Saudi Arabia', country: 'Arabia Saudita', team: 'AFC', year: '2026', page: 'Mundial 2026', rarity: 'common', kit: '#168b55', confederation: 'AFC' },
  { id: 'wc26-28', number: '028', name: 'Ghana', country: 'Ghana', team: 'CAF', year: '2026', page: 'Mundial 2026', rarity: 'common', kit: '#f7d13d', confederation: 'CAF' },
  { id: 'wc26-29', number: '029', name: 'Switzerland', country: 'Suiza', team: 'UEFA', year: '2026', page: 'Mundial 2026', rarity: 'common', kit: '#d8202f', confederation: 'UEFA' },
  { id: 'wc26-30', number: '030', name: 'Denmark', country: 'Dinamarca', team: 'UEFA', year: '2026', page: 'Mundial 2026', rarity: 'common', kit: '#c8102e', confederation: 'UEFA' },
  { id: 'wc26-31', number: '031', name: 'Poland', country: 'Polonia', team: 'UEFA', year: '2026', page: 'Mundial 2026', rarity: 'common', kit: '#f4f4f4', confederation: 'UEFA' },
  { id: 'wc26-32', number: '032', name: 'New Zealand', country: 'Nueva Zelanda', team: 'OFC', year: '2026', page: 'Mundial 2026', rarity: 'rare', kit: '#111827', confederation: 'OFC' }
];

/**
 * Normaliza stickers: asigna confederación y número automáticamente
 * @param {array} stickers - Array de stickers
 * @returns {array} - Stickers normalizados
 */
function normalizeStickers(stickers) {
  return stickers.map((sticker, index) => ({
    ...sticker,
    number: sticker.number || String(index + 1).padStart(3, '0'),
    confederation: sticker.confederation || CONFEDERATION_MAP[sticker.team] || CONFEDERATION_MAP[sticker.country] || 'OFC',
    image: sticker.image || null
  }));
}

/**
 * Valida integridad de stickers
 * @param {array} stickers - Array a validar
 * @returns {boolean} - true si todos son válidos
 */
function validateStickers(stickers) {
  const errors = [];
  const ids = new Set();

  stickers.forEach((s, i) => {
    // Campos requeridos
    if (!s.id) errors.push(`[${i}] Falta 'id'`);
    if (!s.name) errors.push(`[${i}] Falta 'name'`);
    if (!s.rarity) errors.push(`[${i}] Falta 'rarity'`);
    if (!s.kit) errors.push(`[${i}] Falta 'kit'`);
    if (!s.page) errors.push(`[${i}] Falta 'page'`);
    if (!s.team) errors.push(`[${i}] Falta 'team'`);

    // Validaciones de valor
    if (s.rarity && !['common', 'rare', 'epic', 'legendary'].includes(s.rarity)) {
      errors.push(`[${i}] Rareza inválida: ${s.rarity}`);
    }

    // Detectar duplicados
    if (s.id && ids.has(s.id)) {
      errors.push(`[${i}] ID duplicado: ${s.id}`);
    }
    if (s.id) ids.add(s.id);
  });

  if (errors.length) {
    console.error('❌ Errores en stickers:', errors);
    return false;
  }

  console.log(`✅ ${stickers.length} stickers validados correctamente`);
  return true;
}

// Normalizar y validar todos los stickers
const allStickers = normalizeStickers([...worldCupPreviewStickers, ...baseStickers]);
validateStickers(allStickers);

window.FUT_DATA.stickers = allStickers;
