/**
 * FUT LEGENDS - Juego de stickers tipo Panini 2026
 * Aplicación principal con lógica del juego
 * 
 * Estructura:
 * - Estado centralizado
 * - Render basado en estado
 * - Event delegation (sin memory leaks)
 * - Validación completa de entradas
 */

// ============================================================================
// INICIALIZACIÓN Y ESTADO
// ============================================================================

const stickers = window.FUT_DATA.stickers;
const questions = window.FUT_DATA.questions;
const challenges = window.FUT_DATA.challenges;
const storage = window.FUT_STORAGE;
const game = window.FUT_GAME;
const auth = window.FUT_AUTH;
const backend = window.FUT_BACKEND;

const packCost = 180;
const worldCupPage = 'Mundial 2026';
const worldCupPackCost = 240;
const storageKey = 'fut-legends-state-v1';

/** Estado por defecto del juego */
const defaultState = {
  isSignedIn: false,
  hasSeenCover: false,
  authMode: 'login',
  userId: '',
  username: '',
  playerName: 'Leyenda Invitada',
  avatarColor: '#18b56d',
  coins: 80,
  packs: 1,
  xp: 0,
  streak: 0,
  bestStreak: 0,
  correctAnswers: 0,
  dailyDate: '',
  dailyCorrect: 0,
  flashStartedAt: '',
  flashCorrectStart: 0,
  claimedTimedChallenges: {},
  selectedDifficulty: 'Todas',
  currentQuestion: 0,
  answered: null,
  feedback: 'Responde preguntas para ganar monedas. Cada sobre trae 3 stickers.',
  inventory: {},
  pasted: {},
  lastPack: [],
  selectedPage: 'Leyendas',
  showWorldCup: false,
  worldCupFilter: 'Todas',
  selectedStickerId: '',
  shareCode: '',
  importCode: '',
  helpStickerId: '',
  helpCode: '',
  ranking: [],
  claimedChallenges: {},
  packOpening: false,
  toast: ''
};

let state = loadState();
const app = document.getElementById('app');
let toastTimer = null;
let eventsInitialized = false;

// ============================================================================
// ALMACENAMIENTO Y PERSISTENCIA
// ============================================================================

/**
 * Carga el estado del jugador desde almacenamiento
 * @returns {object} - Estado cargado o defaults
 */
function loadState() {
  const loaded = storage.load(storageKey, defaultState);
  
  // Validar y sanitizar estado cargado
  validateAndSanitizeState(loaded);
  
  return loaded;
}

/**
 * Guarda el estado actual en almacenamiento
 * @returns {boolean} - true si fue exitoso
 */
function saveState() {
  return storage.save(storageKey, state);
}

/**
 * Valida y sanitiza el estado para evitar trucos
 * @param {object} obj - Estado a validar
 */
function validateAndSanitizeState(obj) {
  // Limitar valores numéricos a rangos razonables
  if (obj.coins > 100000) obj.coins = 100000;
  if (obj.xp > 100000) obj.xp = 100000;
  if (obj.packs > 1000) obj.packs = 1000;
  if (obj.streak < 0) obj.streak = 0;
  if (obj.bestStreak < 0) obj.bestStreak = 0;
  if (obj.correctAnswers < 0) obj.correctAnswers = 0;

  // Validar que los IDs de stickers existan
  const validIds = new Set(stickers.map(s => s.id));
  Object.keys(obj.inventory || {}).forEach(id => {
    if (!validIds.has(id)) {
      delete obj.inventory[id];
    }
  });
  
  Object.keys(obj.pasted || {}).forEach(id => {
    if (!validIds.has(id)) {
      delete obj.pasted[id];
    }
  });
}

// ============================================================================
// RENDERIZADO
// ============================================================================

/**
 * Renderiza la interfaz completa basada en el estado actual
 */
function render() {
  if (!state.isSignedIn) {
    app.innerHTML = renderStartScreen();
    
   return;
  }

  ensureDailyState();

  if (!state.hasSeenCover) {
    app.innerHTML = renderCoverScreen();
    bindCoverEvents();
    return;
  }

  app.innerHTML = `
    <main class="game-shell">
      <header class="topbar">
        <div class="brand">
          <div class="brand-badge">FUT</div>
          <div>
            <p class="eyebrow">Trivia + album digital</p>
            <h1>FUT Legends</h1>
          </div>
        </div>
        <section class="score-strip" aria-label="Progreso">
          ${scoreCard('Monedas', state.coins)}
          ${scoreCard('Sobres', state.packs)}
          ${scoreCard('Pegados', `${countPasted()}/${stickers.length}`)}
          ${scoreCard('Nivel', getLevel())}
        </section>
      </header>

      <section class="layout">
        <div class="play-stack">
          ${renderTrivia()}
          ${renderPacks()}
        </div>
        <div class="album-column">
          ${renderWorldCupCollection()}
          ${renderAlbum()}
        </div>
        <div class="progress-stack">
          ${renderSeason()}
          ${renderFriends()}
          ${renderRanking()}
        </div>
      </section>
    </main>
    ${renderStickerDetail()}
    <div class="toast ${state.toast ? 'show' : ''}">${escapeHtml(state.toast)}</div>
  `;

  // Inicializar event delegation una sola vez
  if (!eventsInitialized) {
    initializeEventDelegation();
    eventsInitialized = true;
  }
}

/**
 * Renderiza pantalla de inicio/login
 */
function renderStartScreen() {
  return `
    <main class="start-shell">
      <section class="start-hero">
        <div class="brand start-brand">
          <div class="brand-badge">FUT</div>
          <div>
            <p class="eyebrow">Album + trivia + amigos</p>
            <h1>FUT Legends</h1>
          </div>
        </div>
        <div class="start-copy">
          <h2>Construye tu album de leyendas</h2>
          <p>Responde preguntas, abre sobres, pega stickers y publica tu puntaje en el ranking beta.</p>
        </div>
        <div class="preview-pack" aria-hidden="true">
          ${stickers.slice(0, 3).map(renderSticker).join('')}
        </div>
      </section>

      <section class="start-panel">
        <p class="eyebrow" style="color:#697184">Inicio beta</p>
        <h2>${state.authMode === 'register' ? 'Crear cuenta' : 'Entrar al juego'}</h2>
        <div class="auth-tabs">
          <button class="tab ${state.authMode === 'login' ? 'active' : ''}" type="button" data-auth-mode="login">Iniciar</button>
          <button class="tab ${state.authMode === 'register' ? 'active' : ''}" type="button" data-auth-mode="register">Registrarse</button>
        </div>
        <form id="start-form" class="start-form">
          <label class="field">
            <span>${auth.isFirebaseEnabled() ? 'Correo electronico' : 'Usuario'}</span>
            <input id="start-username" value="${escapeHtml(state.username)}" maxlength="48" placeholder="${auth.isFirebaseEnabled() ? 'Ej: sebas@email.com' : 'Ej: sebasfc'}" required>
          </label>
          <label class="field">
            <span>Clave</span>
            <input id="start-password" type="password" maxlength="32" placeholder="Minimo 4 caracteres" required>
          </label>
          ${state.authMode === 'register' ? `
          <label class="field">
            <span>Nombre visible</span>
            <input id="start-name" value="${escapeHtml(state.playerName)}" maxlength="24" placeholder="Ej: Sebas FC" required>
          </label>
          <div class="avatar-picker" aria-label="Color de avatar">
            ${['#18b56d', '#37a8d8', '#f0b23a', '#e65353', '#7161d6'].map((color) => `
              <button class="avatar-swatch ${state.avatarColor === color ? 'active' : ''}" type="button" data-avatar="${color}" style="--avatar:${color}" title="Color de avatar"></button>
            `).join('')}
          </div>
          ` : ''}
          <button class="btn green" type="submit">${state.authMode === 'register' ? 'Crear cuenta' : 'Iniciar sesion'}</button>
          <button class="btn secondary" type="button" id="guest-login">Entrar como invitado</button>
        </form>
        <div class="login-note">
          <strong>${auth.getModeLabel()}</strong>
          <span>${getAuthModeHelp()}</span>
        </div>
      </section>
    </main>
  `;
}

/**
 * Renderiza pantalla de portada después de login
 */
function renderCoverScreen() {
  return `
    <main class="cover-shell">
      <section class="cover-stage">
        <div class="cover-copy">
          <p class="eyebrow">Carta destacada</p>
          <h1>Luis Diaz</h1>
          <p>Comienza tu camino en FUT Legends, abre sobres y completa la coleccion Mundial 2026.</p>
          <div class="cover-actions">
            <button class="btn green" type="button" id="enter-game">Entrar al album</button>
            <button class="btn secondary" type="button" id="cover-logout">Cerrar sesion</button>
          </div>
        </div>
        <article class="cover-card">
          <img src="./images/luis-diaz.png" alt="Luis Diaz">
          <div class="cover-card-info">
            <span>99 DC</span>
            <strong>LUIS DIAZ</strong>
            <small>COLOMBIA · FUT LEGENDS</small>
          </div>
        </article>
      </section>
    </main>
  `;
}

/**
 * Renderiza tarjeta de puntuación
 */
function scoreCard(label, value) {
  return `
    <article class="score-card">
      <span>${label}</span>
      <strong>${value}</strong>
    </article>
  `;
}

/**
 * Renderiza sección de trivia
 */
function renderTrivia() {
  const question = getQuestion();
  if (!question) {
    return `<section class="panel"><p style="padding:18px; color:#697184;">Sin preguntas disponibles</p></section>`;
  }

  return `
    <section class="panel">
      <div class="panel-head">
        <div>
          <p class="eyebrow" style="color:#697184">Modo trivia</p>
          <h2>Gana monedas</h2>
        </div>
        <span class="pill">${question.difficulty}</span>
      </div>
      <div class="quiz">
        <article class="pitch-card">
          <div class="difficulty-row">
            ${['Todas', 'Facil', 'Media', 'Dificil'].map((level) => `
              <button class="difficulty ${state.selectedDifficulty === level ? 'active' : ''}" type="button" data-difficulty="${level}">
                ${level}
              </button>
            `).join('')}
          </div>
          <p class="question">${escapeHtml(question.text)}</p>
        </article>

        <div class="answers">
          ${question.options.map((option) => renderAnswer(option, question)).join('')}
        </div>

        <div class="feedback">${escapeHtml(state.feedback)}</div>

        <div class="actions">
          <button class="btn secondary" type="button" id="next-question">Otra pregunta</button>
          <button class="btn green" type="button" id="buy-pack" ${state.coins < packCost ? 'disabled' : ''}>Comprar sobre</button>
        </div>
      </div>
    </section>
  `;
}

/**
 * Renderiza botón de respuesta
 */
function renderAnswer(option, question) {
  let className = '';
  if (state.answered) {
    if (option === question.answer) className = 'correct';
    if (option === state.answered && option !== question.answer) className = 'wrong';
  }

  return `
    <button class="answer ${className}" type="button" data-answer="${escapeHtml(option)}" ${state.answered ? 'disabled' : ''}>
      ${escapeHtml(option)}
    </button>
  `;
}

/**
 * Renderiza album de stickers
 */
function renderAlbum() {
  const pages = [...new Set(stickers.map((sticker) => sticker.page))].filter((page) => page !== worldCupPage);
  if (state.selectedPage === worldCupPage) state.selectedPage = pages[0] || 'Leyendas';
  const pageStickers = stickers.filter((sticker) => sticker.page === state.selectedPage);

  return `
    <section class="panel album">
      <div class="panel-head">
        <div>
          <p class="eyebrow" style="color:#697184">Album</p>
          <h2>Pega tus stickers</h2>
        </div>
        <span class="pill">${albumProgress()}%</span>
      </div>
      <div class="album-tabs">
        ${pages.map((page) => `
          <button class="tab ${state.selectedPage === page ? 'active' : ''}" type="button" data-page="${page}">
            ${page}
          </button>
        `).join('')}
      </div>
      <div class="album-grid">
        ${pageStickers.map(renderSlot).join('')}
      </div>
    </section>
  `;
}

/**
 * Renderiza colección especial Mundial 2026
 */
function renderWorldCupCollection() {
  const worldCupStickers = stickers.filter((sticker) => sticker.page === worldCupPage);
  const filteredStickers = state.worldCupFilter === 'Todas'
    ? worldCupStickers
    : worldCupStickers.filter((sticker) => sticker.confederation === state.worldCupFilter);
  const confederations = ['Todas', ...new Set(worldCupStickers.map((sticker) => sticker.confederation))];
  const owned = worldCupStickers.filter((sticker) => getOwned(sticker.id) > 0).length;
  const pasted = worldCupStickers.filter((sticker) => state.pasted[sticker.id]).length;
  const preview = filteredStickers.slice(0, 8);
  const progress = Math.round((pasted / worldCupStickers.length) * 100);

  return `
    <section class="panel worldcup-panel">
      <div class="panel-head">
        <div>
          <p class="eyebrow" style="color:#697184">Coleccion especial</p>
          <h2>Mundial 2026</h2>
        </div>
        <span class="pill">${pasted}/${worldCupStickers.length}</span>
      </div>
      <div class="worldcup-zone">
        <div class="worldcup-summary">
          <strong>Previa de selecciones</strong>
          <span>${owned} desbloqueados - ${pasted} pegados - 32 stickers numerados</span>
          <div class="progress-track">
            <span style="width:${progress}%"></span>
          </div>
        </div>
        <div class="worldcup-filters">
          ${confederations.map((confederation) => `
            <button class="tab ${state.worldCupFilter === confederation ? 'active' : ''}" type="button" data-wc-filter="${confederation}">
              ${confederation}
            </button>
          `).join('')}
        </div>
        <div class="worldcup-grid">
          ${preview.map(renderCompactWorldCupSticker).join('')}
        </div>
        <button class="btn green" type="button" id="buy-worldcup-pack" ${state.coins < worldCupPackCost ? 'disabled' : ''}>
          Comprar sobre Mundial 2026 - ${worldCupPackCost} monedas
        </button>
        <button class="btn secondary" type="button" id="toggle-worldcup">
          ${state.showWorldCup ? 'Ocultar coleccion completa' : 'Ver coleccion completa'}
        </button>
        ${state.showWorldCup ? `
          <div class="worldcup-full">
            ${filteredStickers.map(renderWorldCupSlot).join('')}
          </div>
        ` : ''}
      </div>
    </section>
  `;
}

/**
 * Renderiza token compacto de Mundial 2026
 */
function renderCompactWorldCupSticker(sticker) {
  const pasted = Boolean(state.pasted[sticker.id]);
  const owned = getOwned(sticker.id) > 0;
  return `
    <article class="wc-token ${pasted ? 'pasted' : owned ? 'owned' : ''}">
      <strong>#${sticker.number}</strong>
      <span>${escapeHtml(sticker.country)}</span>
    </article>
  `;
}

/**
 * Renderiza slot de Mundial 2026
 */
function renderWorldCupSlot(sticker) {
  const owned = getOwned(sticker.id);
  const pasted = Boolean(state.pasted[sticker.id]);

  if (pasted) return renderSticker(sticker);

  return `
    <article class="slot ${owned > 0 ? 'owned' : 'empty'}">
      <strong>#${sticker.number} ${escapeHtml(sticker.country)}</strong>
      <small>${escapeHtml(sticker.confederation)}</small>
      ${owned > 0 ? `<button class="btn gold" type="button" data-paste="${sticker.id}">Pegar sticker</button>` : ''}
    </article>
  `;
}

/**
 * Renderiza slot de album
 */
function renderSlot(sticker) {
  const owned = getOwned(sticker.id);
  const pasted = Boolean(state.pasted[sticker.id]);

  if (pasted) {
    return renderSticker(sticker);
  }

  if (owned > 0) {
    return `
      <article class="slot owned">
        <strong>${escapeHtml(sticker.name)}</strong>
        <span class="pill">${escapeHtml(sticker.rarity)}</span>
        <button class="btn gold" type="button" data-paste="${sticker.id}">Pegar sticker</button>
      </article>
    `;
  }

  return `
    <article class="slot empty">
      <strong>Sticker bloqueado</strong>
      <small>${escapeHtml(sticker.page)} - ${escapeHtml(sticker.team)}</small>
    </article>
  `;
}

/**
 * Renderiza sección de sobres
 */
function renderPacks() {
  const duplicates = stickers.filter((sticker) => getOwned(sticker.id) > 1);
  const collection = stickers.filter((sticker) => getOwned(sticker.id) > 0);

  return `
    <section class="panel">
      <div class="panel-head">
        <div>
          <p class="eyebrow" style="color:#697184">Sobres</p>
          <h2>Abre recompensas</h2>
        </div>
        <span class="pill">${packCost} monedas</span>
      </div>
      <div class="pack-zone">
        <button class="pack" type="button" id="open-pack" ${state.packs < 1 ? 'disabled' : ''}>
          <span class="pack-symbol">FL</span>
          <strong>Abrir sobre</strong>
          <span>${state.packs > 0 ? `${state.packs} disponibles` : 'Consigue uno con monedas'}</span>
        </button>

        <div class="pack-results ${state.packOpening ? 'revealing' : ''}">
          ${state.lastPack.length ? state.lastPack.map((id) => renderSticker(getSticker(id))).join('') : '<div class="empty-state" style="grid-column:1/-1">Aqui apareceran los 3 stickers del ultimo sobre.</div>'}
        </div>

        <div class="actions">
          <button class="btn secondary" type="button" id="trade-duplicates" ${duplicates.length ? '' : 'disabled'}>Cambiar repetidos</button>
          <button class="btn secondary" type="button" id="reset-game">Reiniciar</button>
        </div>

        <section>
          <div class="panel-head" style="padding:0 0 10px;border:0">
            <h3>Coleccion</h3>
            <span class="pill">${collection.length} desbloqueados</span>
          </div>
          <div class="mini-list">
            ${collection.length ? collection.map((sticker) => `
              <div class="mini-item">
                <span>${escapeHtml(sticker.name)}</span>
                <small>x${getOwned(sticker.id)}</small>
              </div>
            `).join('') : '<div class="empty-state">Abre sobres para empezar tu coleccion.</div>'}
          </div>
        </section>
      </div>
    </section>
  `;
}

/**
 * Renderiza sección de temporada y desafíos
 */
function renderSeason() {
  return `
    <section class="panel">
      <div class="panel-head">
        <div>
          <p class="eyebrow" style="color:#697184">Temporada</p>
          <h2>Misiones activas</h2>
        </div>
        <span class="pill">${state.xp} XP</span>
      </div>
      <div class="mission-zone">
        <div class="season-card">
          <strong>Camino a Leyenda</strong>
          <div class="progress-track">
            <span style="width:${getLevelProgress()}%"></span>
          </div>
          <small>Nivel ${getLevel()} - ${getLevelProgress()}% al siguiente</small>
        </div>
        ${renderTimedChallenges()}
        ${challenges.map(renderChallenge).join('')}
      </div>
    </section>
  `;
}

/**
 * Renderiza desafíos temporales (diario y relámpago)
 */
function renderTimedChallenges() {
  const dailyDone = state.dailyCorrect >= 3;
  const dailyClaimed = Boolean(state.claimedTimedChallenges[getDailyChallengeId()]);
  const flash = getFlashStatus();
  const flashDone = flash.active && flash.progress >= 3 && !flash.expired;
  const flashClaimed = Boolean(state.claimedTimedChallenges.flash);

  return `
    <article class="mission timed">
      <div>
        <strong>Reto diario</strong>
        <span>Responde 3 preguntas correctas hoy. Progreso: ${state.dailyCorrect}/3</span>
      </div>
      <div class="mission-bottom">
        <div class="progress-track">
          <span style="width:${Math.min(100, Math.round((state.dailyCorrect / 3) * 100))}%"></span>
        </div>
        <button class="mission-claim" type="button" data-timed-claim="daily" ${dailyDone && !dailyClaimed ? '' : 'disabled'}>
          ${dailyClaimed ? 'Reclamado' : '35 monedas'}
        </button>
      </div>
    </article>

    <article class="mission timed">
      <div>
        <strong>Reto relampago</strong>
        <span>${flash.label}</span>
      </div>
      <div class="mission-bottom">
        <div class="progress-track">
          <span style="width:${Math.min(100, Math.round((flash.progress / 3) * 100))}%"></span>
        </div>
        ${flash.active ? `
          <button class="mission-claim" type="button" data-timed-claim="flash" ${flashDone && !flashClaimed ? '' : 'disabled'}>
            ${flashClaimed ? 'Reclamado' : '70 monedas'}
          </button>
        ` : '<button class="mission-claim" type="button" id="start-flash">Iniciar</button>'}
      </div>
    </article>
  `;
}

/**
 * Renderiza desafío individual
 */
function renderChallenge(challenge) {
  const progress = getChallengeProgress(challenge);
  const done = progress >= challenge.target;
  const claimed = Boolean(state.claimedChallenges[challenge.id]);
  const rewardText = [
    challenge.reward.coins ? `${challenge.reward.coins} monedas` : '',
    challenge.reward.packs ? `${challenge.reward.packs} sobre` : ''
  ].filter(Boolean).join(' + ');

  return `
    <article class="mission">
      <div>
        <strong>${escapeHtml(challenge.title)}</strong>
        <span>${escapeHtml(challenge.text)}</span>
      </div>
      <div class="mission-bottom">
        <div class="progress-track">
          <span style="width:${Math.min(100, Math.round((progress / challenge.target) * 100))}%"></span>
        </div>
        <button class="mission-claim" type="button" data-claim="${challenge.id}" ${done && !claimed ? '' : 'disabled'}>
          ${claimed ? 'Reclamado' : rewardText}
        </button>
      </div>
    </article>
  `;
}

/**
 * Renderiza tarjeta de sticker completa
 */
function renderSticker(sticker) {
  if (!sticker) return '';
  
  const rating = getStickerRating(sticker);
  const position = getStickerPosition(sticker);
  const stats = getStickerStats(sticker, rating);
  const cardNumber = sticker.number || String(stickers.indexOf(sticker) + 1).padStart(3, '0');
  const countryLine = sticker.country || sticker.team;
  const groupLine = sticker.confederation || sticker.year;
  const isWorldCup = sticker.page === worldCupPage;
  const colors = getStickerPalette(sticker);

  return `
    <article class="sticker ${sticker.rarity} ${isWorldCup ? 'worldcup-sticker' : ''}" data-detail="${sticker.id}" style="--kit:${sticker.kit};--accent:${colors.accent};--accent-2:${colors.secondary};">
      <div class="foil"></div>
      <div class="card-grain"></div>
      <div class="sticker-top">
        <div class="rating-box">
          <strong>${rating}</strong>
          <span>${position}</span>
        </div>
        <div class="flag-ribbon">
          <span></span>
          <span></span>
          <span></span>
        </div>
        ${sticker.image ? `
          <div class="player-photo">
            <img src="${escapeHtml(sticker.image)}" alt="${escapeHtml(sticker.name)}">
          </div>
        ` : `
          <div class="player-art">
            <span class="player-head"></span>
            <span class="player-body"></span>
            <span class="player-arm left"></span>
            <span class="player-arm right"></span>
            <span class="player-leg left"></span>
            <span class="player-leg right"></span>
            <span class="ball"></span>
          </div>
        `}
        <div class="collection-number">#${cardNumber}</div>
      </div>
      <div class="sticker-meta">
        <span class="rarity-badge">${escapeHtml(sticker.rarity)}</span>
        <strong class="sticker-name">${escapeHtml(sticker.name)}</strong>
        <div class="sticker-line">
          <span>${escapeHtml(countryLine)}</span>
          <span>${escapeHtml(groupLine)}</span>
        </div>
        ${isWorldCup ? `<span class="confed-seal">${escapeHtml(sticker.confederation)}</span>` : ''}
        <div class="stat-grid">
          ${stats.map((stat) => `<span>${stat.label} <strong>${stat.value}</strong></span>`).join('')}
        </div>
        <div class="card-serial">
          <span>FUTL-${escapeHtml(cardNumber)}</span>
          <i></i>
        </div>
      </div>
    </article>
  `;
}

/**
 * Renderiza panel de detalle de sticker
 */
function renderStickerDetail() {
  if (!state.selectedStickerId) return '';
  const sticker = getSticker(state.selectedStickerId);
  if (!sticker) return '';
  const owned = getOwned(sticker.id);
  const pasted = Boolean(state.pasted[sticker.id]);
  const status = pasted ? 'Pegado en album' : owned > 0 ? 'Desbloqueado' : 'Bloqueado';

  return `
    <section class="detail-overlay" role="dialog" aria-modal="true">
      <div class="detail-card">
        <button class="detail-close" type="button" id="close-detail">Cerrar</button>
        <div class="detail-preview">
          ${renderSticker(sticker)}
        </div>
        <div class="detail-info">
          <p class="eyebrow" style="color:#697184">${escapeHtml(sticker.page)}</p>
          <h2>${escapeHtml(sticker.country || sticker.name)}</h2>
          <div class="detail-grid">
            <span><strong>Numero</strong>#${escapeHtml(sticker.number || String(stickers.indexOf(sticker) + 1).padStart(3, '0'))}</span>
            <span><strong>Confederacion</strong>${escapeHtml(sticker.confederation || sticker.team)}</span>
            <span><strong>Rareza</strong>${escapeHtml(sticker.rarity)}</span>
            <span><strong>Estado</strong>${status}</span>
          </div>
          ${owned > 0 && !pasted ? `<button class="btn gold" type="button" data-paste="${sticker.id}">Pegar sticker</button>` : ''}
        </div>
      </div>
    </section>
  `;
}

/**
 * Renderiza sección de amigos
 */
function renderFriends() {
  const missing = stickers.filter((sticker) => !state.pasted[sticker.id]);
  const selectedHelp = getSticker(state.helpStickerId) || missing[0];

  return `
    <section class="panel">
      <div class="panel-head">
        <div>
          <p class="eyebrow" style="color:#697184">Amigos</p>
          <h2>Comparte tu avance</h2>
        </div>
        <span class="pill">Beta social</span>
      </div>
      <div class="friend-zone">
        <label class="field">
          <span>Nombre de jugador</span>
          <input id="player-name" value="${escapeHtml(state.playerName)}" maxlength="24">
        </label>

        <div class="share-card">
          <div class="profile-line">
            <span class="profile-avatar" style="--avatar:${state.avatarColor}">${escapeHtml(getInitials(state.playerName))}</span>
            <strong>${escapeHtml(state.playerName)}</strong>
          </div>
          <span>${countPasted()} pegados - ${countUnlocked()} desbloqueados - ${state.coins} monedas</span>
        </div>

        <div class="actions">
          <button class="btn green" type="button" id="generate-share">Crear codigo</button>
          <button class="btn secondary" type="button" id="copy-share" ${state.shareCode ? '' : 'disabled'}>Copiar</button>
        </div>

        <textarea class="code-box" id="share-code" readonly placeholder="Tu codigo aparecera aqui">${escapeHtml(state.shareCode)}</textarea>

        <label class="field">
          <span>Importar codigo de un amigo</span>
          <textarea id="import-code" class="code-box" placeholder="Pega aqui el codigo de progreso">${escapeHtml(state.importCode)}</textarea>
        </label>
        <button class="btn gold" type="button" id="import-progress">Ver progreso amigo</button>
        <button class="btn secondary" type="button" id="logout">Cerrar sesion beta</button>

        <div class="help-box">
          <h3>Pedir ayuda</h3>
          <label class="field">
            <span>Sticker que necesitas</span>
            <select id="help-sticker">
              ${missing.map((sticker) => `
                <option value="${sticker.id}" ${selectedHelp?.id === sticker.id ? 'selected' : ''}>
                  ${escapeHtml(sticker.number ? `#${sticker.number} ` : '')}${escapeHtml(sticker.country || sticker.name)}
                </option>
              `).join('')}
            </select>
          </label>
          <button class="btn green" type="button" id="generate-help" ${selectedHelp ? '' : 'disabled'}>Generar pedido</button>
          <textarea class="code-box" readonly placeholder="Codigo de ayuda">${escapeHtml(state.helpCode)}</textarea>
        </div>
      </div>
    </section>
  `;
}

/**
 * Renderiza sección de ranking
 */
function renderRanking() {
  const ranking = state.ranking.length ? state.ranking : backend.getRanking();

  return `
    <section class="panel">
      <div class="panel-head">
        <div>
          <p class="eyebrow" style="color:#697184">Competencia</p>
          <h2>Ranking beta</h2>
        </div>
        <button class="mission-claim" type="button" id="publish-score">Publicar puntaje</button>
      </div>

      <div class="ranking-zone">
        <div class="mini-list">
          ${ranking.length ? ranking.map((item, index) => `
            <div class="mini-item">
              <span>${index + 1}. ${escapeHtml(item.playerName)}</span>
              <small>${item.score} pts</small>
            </div>
          `).join('') : '<div class="empty-state">Publica tu puntaje para iniciar el ranking local.</div>'}
        </div>
      </div>
    </section>
  `;
}

// ============================================================================
// EVENT DELEGATION (Sin memory leaks)
// ============================================================================

/**
 * Inicializa event delegation - se ejecuta UNA SOLA VEZ
 * Maneja todos los eventos con un solo listener en el documento
 */
function initializeEventDelegation() {
  // Click events
  document.addEventListener('click', handleClickEvent);

  // Input/change events
  document.addEventListener('input', handleInputEvent);
  document.addEventListener('change', handleChangeEvent);

  // Form submission
  document.addEventListener('submit', handleFormSubmit);
}

/**
 * Maneja todos los click events del juego
 */
function handleClickEvent(e) {
  const target = e.target;

  // Dificultad de preguntas
  if (target.matches('[data-difficulty]')) {
    state.selectedDifficulty = target.dataset.difficulty;
    state.currentQuestion = 0;
    state.answered = null;
    state.feedback = 'Dificultad cambiada. Elige la respuesta correcta.';
    saveAndRender();
    return;
  }

  // Respuesta a pregunta
  if (target.matches('[data-answer]')) {
    const answer = target.dataset.answer;
    if (answer && !state.answered) {
      answerQuestion(answer);
    }
    return;
  }

  // Siguiente pregunta
  if (target.matches('#next-question')) {
    nextQuestion();
    return;
  }

  // Comprar sobre
  if (target.matches('#buy-pack')) {
    if (state.coins >= packCost) {
      buyPack();
    }
    return;
  }

  // Abrir sobre
  if (target.matches('#open-pack')) {
    if (state.packs > 0) {
      openPack();
    }
    return;
  }

  // Cambiar repetidos
  if (target.matches('#trade-duplicates')) {
    tradeDuplicates();
    return;
  }

  // Reiniciar juego
  if (target.matches('#reset-game')) {
    if (confirm('¿Estás seguro de que quieres reiniciar el juego? Se perderá todo el progreso.')) {
      resetGame();
    }
    return;
  }

  // Página del álbum
  if (target.matches('[data-page]')) {
    state.selectedPage = target.dataset.page;
    saveAndRender();
    return;
  }

  // Pegar sticker
  if (target.matches('[data-paste]')) {
    const stickerId = target.dataset.paste;
    if (stickerId && getOwned(stickerId) > 0) {
      pasteSticker(stickerId);
    }
    return;
  }

  // Ver detalle de sticker
  if (target.matches('[data-detail]')) {
    state.selectedStickerId = target.dataset.detail;
    saveAndRender();
    return;
  }

  // Cerrar detalle
  if (target.matches('#close-detail')) {
    state.selectedStickerId = '';
    saveAndRender();
    return;
  }

  // Filtros Mundial 2026
  if (target.matches('[data-wc-filter]')) {
    state.worldCupFilter = target.dataset.wcFilter;
    saveAndRender();
    return;
  }

  // Toggle colección completa
  if (target.matches('#toggle-worldcup')) {
    state.showWorldCup = !state.showWorldCup;
    saveAndRender();
    return;
  }

  // Comprar sobre Mundial 2026
  if (target.matches('#buy-worldcup-pack')) {
    if (state.coins >= worldCupPackCost) {
      buyWorldCupPack();
    }
    return;
  }

  // Generar código de compartición
  if (target.matches('#generate-share')) {
    generateShareCode();
    return;
  }

  // Copiar código
  if (target.matches('#copy-share')) {
    if (state.shareCode) {
      copyShareCode();
    }
    return;
  }

  // Importar progreso
  if (target.matches('#import-progress')) {
    importProgress();
    return;
  }

  // Generar código de ayuda
  if (target.matches('#generate-help')) {
    generateHelpCode();
    return;
  }

  // Publicar puntaje
  if (target.matches('#publish-score')) {
    publishScore();
    return;
  }

  // Cerrar sesión
  if (target.matches('#logout')) {
    logout();
    return;
  }

  // Reclamar desafío
  if (target.matches('[data-claim]')) {
    claimChallenge(target.dataset.claim);
    return;
  }

  // Reclamar desafío temporal
  if (target.matches('[data-timed-claim]')) {
    claimTimedChallenge(target.dataset.timedClaim);
    return;
  }

  // Iniciar reto relámpago
  if (target.matches('#start-flash')) {
    startFlashChallenge();
    return;
  }

  // Tab de autenticación
  if (target.matches('[data-auth-mode]')) {
    state.authMode = target.dataset.authMode;
    saveAndRender();
    return;
  }

  // Selector de avatar
  if (target.matches('[data-avatar]')) {
    state.avatarColor = target.dataset.avatar;
    saveAndRender();
    return;
  }

  // Entrar al juego (portada)
  if (target.matches('#enter-game')) {
    state.hasSeenCover = true;
    saveAndRender();
    return;
  }

  // Cerrar sesión desde portada
  if (target.matches('#cover-logout')) {
    logout();
    return;
  }

  // Entrar como invitado
  if (target.matches('#guest-login')) {
    signIn('Leyenda Invitada');
    return;
  }
}

/**
 * Maneja input events
 */
function handleInputEvent(e) {
  const target = e.target;

  // Nombre del jugador
  if (target.matches('#player-name')) {
    state.playerName = target.value || 'Leyenda Invitada';
    saveState();
    return;
  }

  // Código a importar
  if (target.matches('#import-code')) {
    state.importCode = target.value;
    saveState();
    return;
  }
}

/**
 * Maneja change events
 */
function handleChangeEvent(e) {
  const target = e.target;

  // Seleccionar sticker para pedir ayuda
  if (target.matches('#help-sticker')) {
    state.helpStickerId = target.value;
    saveState();
    return;
  }
}

/**
 * Maneja form submissions
 */
function handleFormSubmit(e) {
  if (e.target.matches('#start-form')) {
    e.preventDefault();
    handleStartFormSubmit();
  }
}

/**
 * Maneja envío del formulario de inicio/registro
 */
async function handleStartFormSubmit() {
  const username = document.getElementById('start-username')?.value?.trim();
  const password = document.getElementById('start-password')?.value?.trim();
  const name = document.getElementById('start-name')?.value?.trim();

  // Validaciones
  if (!username || !password) {
    showToast('Ingresa usuario y contraseña.');
    return;
  }

  if (password.length < 4) {
    showToast('Contraseña debe tener mínimo 4 caracteres.');
    return;
  }

  try {
    if (state.authMode === 'register') {
      if (!name) {
        showToast('Nombre del jugador es requerido.');
        return;
      }
      const user = await auth.register({
        username,
        password,
        playerName: name,
        avatarColor: state.avatarColor
      });
      signInUser(user);
    } else {
      const user = await auth.login({ username, password });
      signInUser(user);
    }
  } catch (error) {
    console.error('❌ Error de autenticación:', error);
    showToast(error.message || 'Error en autenticación');
  }
}

// ============================================================================
// LÓGICA DEL JUEGO
// ============================================================================

/**
 * Responde una pregunta
 */
function answerQuestion(answer) {
  if (!answer || typeof answer !== 'string') return;

  const question = getQuestion();
  if (!question) return;

  // Validar que la respuesta esté en las opciones
  if (!question.options.includes(answer)) {
    console.warn('Respuesta inválida:', answer);
    return;
  }

  state.answered = answer;

  if (answer === question.answer) {
    const reward = getQuestionReward(question);
    const bonus = state.streak >= 3 ? 5 : 0;
    state.coins += reward + bonus;
    state.xp += 15;
    state.streak += 1;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    state.correctAnswers += 1;
    state.dailyCorrect += 1;
    state.feedback = `Correcto. Ganaste ${reward + bonus} monedas.`;
    
    if (state.streak % 6 === 0) {
      state.packs += 1;
      showToast('Racha elite: ganaste un sobre gratis.');
    }
  } else {
    state.streak = 0;
    state.feedback = `Casi. La respuesta correcta era ${question.answer}. Racha perdida.`;
  }

  saveAndRender();
}

/**
 * Siguiente pregunta
 */
function nextQuestion() {
  state.currentQuestion += 1;
  state.answered = null;
  state.feedback = 'Nueva jugada. Responde para sumar monedas.';
  saveAndRender();
}

/**
 * Compra un sobre
 */
function buyPack() {
  if (state.coins < packCost) {
    showToast('No tienes suficientes monedas.');
    return;
  }
  state.coins -= packCost;
  state.packs += 1;
  showToast('Sobre comprado. Ve a abrirlo.');
  saveAndRender();
}

/**
 * Compra sobre de Mundial 2026
 */
function buyWorldCupPack() {
  const cost = worldCupPackCost;
  if (state.coins < cost) {
    showToast('No tienes suficientes monedas.');
    return;
  }

  const worldCupStickers = stickers.filter((sticker) => sticker.page === worldCupPage);
  const pulled = Array.from({ length: 3 }, () => pullFromPool(worldCupStickers).id);
  
  pulled.forEach((id) => {
    state.inventory[id] = getOwned(id) + 1;
  });

  state.coins -= cost;
  state.lastPack = pulled;
  state.packOpening = true;
  state.showWorldCup = true;
  showToast('Sobre Mundial 2026 abierto: 3 selecciones nuevas en juego.');
  saveAndRender();
}

/**
 * Abre un sobre
 */
function openPack() {
  if (state.packs < 1) {
    showToast('No tienes sobres disponibles.');
    return;
  }

  state.packs -= 1;
  const pulled = Array.from({ length: 3 }, () => pullSticker().id);
  
  pulled.forEach((id) => {
    state.inventory[id] = getOwned(id) + 1;
  });

  state.lastPack = pulled;
  state.packOpening = true;
  showToast('Sobre abierto. Revisa si tienes stickers para pegar.');
  saveAndRender();
}

/**
 * Pega un sticker en el álbum
 */
function pasteSticker(id) {
  if (!id || typeof id !== 'string') return;
  if (getOwned(id) < 1) {
    showToast('No tienes este sticker.');
    return;
  }

  state.pasted[id] = true;
  state.selectedStickerId = '';
  const sticker = getSticker(id);
  
  if (sticker) {
    showToast(`${escapeHtml(sticker.name)} pegado en el álbum.`);
  }

  saveAndRender();
}

/**
 * Reclama un desafío
 */
function claimChallenge(id) {
  if (!id) return;

  const challenge = challenges.find((item) => item.id === id);
  if (!challenge || state.claimedChallenges[id]) return;
  
  const progress = getChallengeProgress(challenge);
  if (progress < challenge.target) return;

  state.coins += challenge.reward.coins || 0;
  state.packs += challenge.reward.packs || 0;
  state.xp += 25;
  state.claimedChallenges[id] = true;
  
  showToast(`Misión completada: ${challenge.title}.`);
  saveAndRender();
}

/**
 * Reclama un desafío temporal (diario o relámpago)
 */
function claimTimedChallenge(type) {
  if (type === 'daily') {
    const id = getDailyChallengeId();
    if (state.dailyCorrect < 3 || state.claimedTimedChallenges[id]) return;
    
    state.coins += 35;
    state.xp += 15;
    state.claimedTimedChallenges[id] = true;
    showToast('Reto diario reclamado: 35 monedas.');
    saveAndRender();
    return;
  }

  if (type === 'flash') {
    const flash = getFlashStatus();
    if (!flash.active || flash.expired || flash.progress < 3 || state.claimedTimedChallenges.flash) return;
    
    state.coins += 70;
    state.xp += 25;
    state.claimedTimedChallenges.flash = true;
    showToast('Reto relámpago completado: 70 monedas.');
    saveAndRender();
  }
}

/**
 * Inicia el reto relámpago
 */
function startFlashChallenge() {
  state.flashStartedAt = new Date().toISOString();
  state.flashCorrectStart = state.correctAnswers;
  state.claimedTimedChallenges.flash = false;
  showToast('Reto relámpago iniciado: tienes 10 minutos.');
  saveAndRender();
}

/**
 * Cambia stickers repetidos por monedas
 */
function tradeDuplicates() {
  let traded = 0;
  
  Object.keys(state.inventory).forEach((id) => {
    while (state.inventory[id] > 1) {
      state.inventory[id] -= 1;
      traded += 1;
    }
  });

  if (!traded) {
    showToast('No tienes stickers repetidos.');
    return;
  }

  state.coins += traded * 20;
  showToast(`Cambiaste ${traded} repetidos por ${traded * 20} monedas.`);
  saveAndRender();
}

/**
 * Reinicia el juego (limpia todo)
 */
function resetGame() {
  state = structuredClone(defaultState);
  storage.clear(storageKey);
  showToast('Partida reiniciada.');
  render();
}

/**
 * Genera código para compartir progreso
 */
function generateShareCode() {
  try {
    const payload = {
      n: state.playerName,
      c: state.coins,
      p: countPasted(),
      u: countUnlocked(),
      album: Object.keys(state.pasted).filter((id) => state.pasted[id]),
      collection: state.inventory
    };

    state.shareCode = btoa(JSON.stringify(payload));
    showToast('Código creado para compartir con amigos.');
    saveAndRender();
  } catch (error) {
    console.error('Error generando código:', error);
    showToast('Error al generar código.');
  }
}

/**
 * Genera código para pedir un sticker
 */
function generateHelpCode() {
  try {
    const sticker = getSticker(state.helpStickerId) || stickers.find((item) => !state.pasted[item.id]);
    if (!sticker) {
      showToast('No hay stickers para pedir.');
      return;
    }

    const payload = {
      type: 'help-request',
      from: state.playerName,
      stickerId: sticker.id,
      sticker: sticker.country || sticker.name,
      number: sticker.number || '',
      page: sticker.page,
      createdAt: new Date().toISOString()
    };

    state.helpStickerId = sticker.id;
    state.helpCode = btoa(JSON.stringify(payload));
    showToast(`Pedido creado para ${sticker.country || sticker.name}.`);
    saveAndRender();
  } catch (error) {
    console.error('Error generando código de ayuda:', error);
    showToast('Error al generar código.');
  }
}

/**
 * Copia el código de compartición al portapapeles
 */
async function copyShareCode() {
  if (!state.shareCode) return;

  try {
    await navigator.clipboard.writeText(state.shareCode);
    showToast('Código copiado.');
  } catch (error) {
    console.error('Error copiando:', error);
    showToast('No se pudo copiar automáticamente. Selecciona el código manualmente.');
  }
}

/**
 * Importa progreso de un amigo
 */
function importProgress() {
  const code = document.getElementById('import-code')?.value?.trim();

  if (!code) {
    showToast('Pega un código antes de importar.');
    return;
  }

  try {
    const decoded = atob(code);
    const payload = JSON.parse(decoded);

    if (!payload || typeof payload !== 'object') {
      throw new Error('Formato inválido');
    }

    // Importar código de ayuda
    if (payload.type === 'help-request') {
      const from = String(payload.from || 'Un amigo').substring(0, 50);
      const sticker = String(payload.sticker || '').substring(0, 50);
      showToast(`${escapeHtml(from)} necesita ${escapeHtml(sticker)}.`);
      return;
    }

    // Importar progreso
    if (!payload.n || typeof payload.p !== 'number' || typeof payload.u !== 'number') {
      throw new Error('Datos de progreso incompletos');
    }

    const friendName = String(payload.n).substring(0, 30);
    const pasted = Math.max(0, Number(payload.p || 0));
    const unlocked = Math.max(0, Number(payload.u || 0));

    showToast(`${escapeHtml(friendName)}: ${pasted} pegados, ${unlocked} desbloqueados.`);
  } catch (error) {
    console.error('Error importando:', error);
    showToast('El código no es válido o está corrupto.');
  }
}

/**
 * Publica el puntaje en el ranking
 */
function publishScore() {
  try {
    const score = (countPasted() * 120) + (countUnlocked() * 45) + state.coins + (getLevel() * 80);
    
    state.ranking = backend.saveRankingEntry({
      playerName: state.playerName,
      score,
      level: getLevel(),
      pasted: countPasted(),
      unlocked: countUnlocked()
    });

    showToast('Puntaje publicado en el ranking beta.');
    saveAndRender();
  } catch (error) {
    console.error('Error publicando puntaje:', error);
    showToast('Error al publicar puntaje.');
  }
}

// ============================================================================
// AUTENTICACIÓN
// ============================================================================

/**
 * Inicia sesión como invitado
 */
function signIn(name) {
  if (!name || typeof name !== 'string') {
    name = 'Leyenda Invitada';
  }

  state.playerName = name;
  state.isSignedIn = true;
  showToast(`Bienvenido, ${name}.`);
  saveAndRender();
}

/**
 * Inicia sesión con usuario autenticado
 */
function signInUser(user) {
  if (!user || typeof user !== 'object') {
    showToast('Error en autenticación.');
    return;
  }

  state.userId = user.id || '';
  state.username = user.username || '';
  state.playerName = user.playerName || user.username || 'Jugador';
  state.avatarColor = user.avatarColor || state.avatarColor;
  state.isSignedIn = true;
  showToast(`Bienvenido, ${state.playerName}.`);
  saveAndRender();
}

/**
 * Cierra la sesión
 */
async function logout() {
  try {
    await auth.logout();
    state.isSignedIn = false;
    state.userId = '';
    state.username = '';
    showToast('Sesión cerrada.');
    saveAndRender();
  } catch (error) {
    console.error('Error en logout:', error);
    showToast('Error al cerrar sesión.');
  }
}

// ============================================================================
// UTILIDADES Y HELPERS
// ============================================================================

/**
 * Obtiene la pregunta actual
 */
function getQuestion() {
  const pool = getQuestionPool();
  if (!pool || pool.length === 0) return null;
  return pool[state.currentQuestion % pool.length];
}

/**
 * Obtiene el pool de preguntas según dificultad
 */
function getQuestionPool() {
  if (state.selectedDifficulty === 'Todas') {
    return questions;
  }
  return questions.filter((q) => q.difficulty === state.selectedDifficulty);
}

/**
 * Obtiene la recompensa de una pregunta
 */
function getQuestionReward(question) {
  if (!question) return 10;

  const rewards = {
    'Facil': 8,
    'Media': 15,
    'Dificil': 25
  };

  return rewards[question.difficulty] || 10;
}

/**
 * Extrae un sticker del pool
 */
function pullSticker() {
  return game.pullSticker(stickers);
}

/**
 * Extrae un sticker de un pool específico
 */
function pullFromPool(pool) {
  return game.pullSticker(pool);
}

/**
 * Obtiene cuántos de un sticker posee el jugador
 */
function getOwned(id) {
  if (!id || typeof id !== 'string') return 0;
  return Number(state.inventory[id] || 0);
}

/**
 * Obtiene un sticker por ID
 */
function getSticker(id) {
  if (!id || typeof id !== 'string') return null;
  return stickers.find((sticker) => sticker.id === id);
}

/**
 * Cuenta stickers pegados
 */
function countPasted() {
  return game.countPasted(state.pasted);
}

/**
 * Cuenta stickers desbloqueados
 */
function countUnlocked() {
  return game.countUnlocked(state.inventory);
}

/**
 * Calcula el progreso del álbum en porcentaje
 */
function albumProgress() {
  if (stickers.length === 0) return 0;
  return Math.round((countPasted() / stickers.length) * 100);
}

/**
 * Obtiene el nivel actual
 */
function getLevel() {
  return game.getLevel(state.xp);
}

/**
 * Obtiene el progreso hacia el siguiente nivel
 */
function getLevelProgress() {
  return game.getLevelProgress(state.xp);
}

/**
 * Obtiene el progreso de un desafío
 */
function getChallengeProgress(challenge) {
  if (!challenge) return 0;

  const values = {
    correctAnswers: state.correctAnswers,
    pasted: countPasted(),
    bestStreak: state.bestStreak,
    unlocked: countUnlocked()
  };

  return values[challenge.metric] || 0;
}

/**
 * Calcula el rating de un sticker (determinístico por ID)
 */
function getStickerRating(sticker) {
  if (!sticker) return 70;

  const rarityBase = {
    common: 72,
    rare: 80,
    epic: 88,
    legendary: 94
  };

  const base = rarityBase[sticker.rarity] || 70;
  const boost = Math.abs(game.hashCode(sticker.id)) % 5;
  return Math.min(99, base + boost);
}

/**
 * Obtiene la posición de un sticker en el campo
 */
function getStickerPosition(sticker) {
  if (!sticker) return 'MID';

  if (sticker.page === 'Estadios') return 'STD';
  if (sticker.page === 'Momentos') return 'MOM';
  if (sticker.page === 'Clubes') return 'CLB';

  const positions = ['DC', 'MCO', 'EI', 'MC'];
  return positions[Math.abs(game.hashCode(sticker.name || '')) % positions.length];
}

/**
 * Calcula las estadísticas de un sticker
 */
function getStickerStats(sticker, rating) {
  if (!sticker) return [];

  const seed = Math.abs(game.hashCode(sticker.id));
  const labels = ['RIT', 'TIR', 'PAS', 'REG', 'DEF', 'FIS'];

  return labels.map((label, index) => ({
    label,
    value: Math.min(99, rating - 9 + ((seed + index * 7) % 14))
  }));
}

/**
 * Obtiene la paleta de colores de un sticker
 */
function getStickerPalette(sticker) {
  if (!sticker) {
    return { accent: '#18b56d', secondary: '#f0b23a' };
  }

  const confederationColors = {
    'CONMEBOL': '#f0b23a',
    'UEFA': '#37a8d8',
    'CONCACAF': '#e65353',
    'CAF': '#18b56d',
    'AFC': '#7161d6',
    'OFC': '#111827'
  };

  return {
    accent: confederationColors[sticker.confederation] || sticker.kit || '#18b56d',
    secondary: sticker.kit || '#f0b23a'
  };
}

/**
 * Asegura que el estado diario sea consistente
 */
function ensureDailyState() {
  const today = getTodayKey();

  if (state.dailyDate !== today) {
    state.dailyDate = today;
    state.dailyCorrect = 0;
    state.flashStartedAt = '';
    state.flashCorrectStart = 0;
    state.claimedTimedChallenges = {
      ...state.claimedTimedChallenges,
      flash: false
    };
  }
}

/**
 * Obtiene la clave del día actual (YYYY-MM-DD)
 */
function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Obtiene el ID del desafío diario de hoy
 */
function getDailyChallengeId() {
  return `daily-${getTodayKey()}`;
}

/**
 * Obtiene el estado del reto relámpago
 */
function getFlashStatus() {
  if (!state.flashStartedAt) {
    return {
      active: false,
      expired: false,
      progress: 0,
      label: 'Inicia un reto de 10 minutos para responder 3 preguntas correctas.'
    };
  }

  const started = new Date(state.flashStartedAt).getTime();
  const elapsed = Date.now() - started;
  const limit = 10 * 60 * 1000; // 10 minutos
  const remaining = Math.max(0, limit - elapsed);
  const expired = elapsed > limit;
  const progress = Math.max(0, state.correctAnswers - state.flashCorrectStart);

  if (expired) {
    return {
      active: false,
      expired: true,
      progress,
      label: 'Reto vencido. Puedes iniciar otro intento.'
    };
  }

  return {
    active: true,
    expired: false,
    progress,
    label: `Responde 3 correctas. Progreso: ${progress}/3. Tiempo: ${formatRemaining(remaining)}`
  };
}

/**
 * Formatea tiempo restante en MM:SS
 */
function formatRemaining(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

/**
 * Obtiene las iniciales del nombre de un jugador
 */
function getInitials(name) {
  if (!name || typeof name !== 'string') return 'FL';

  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
    .substring(0, 2);
}

/**
 * Obtiene mensaje de ayuda según el modo de autenticación
 */
function getAuthModeHelp() {
  if (auth.isFirebaseEnabled()) {
    return 'Las cuentas se crean en Firebase Authentication.';
  }

  if (window.FUT_FIREBASE_CONFIG?.enabled) {
    return 'Pega la configuración real de Firebase en services/firebase-config.js.';
  }

  return 'El usuario y clave se guardan en este navegador hasta activar Firebase.';
}

/**
 * Escapa caracteres HTML para evitar XSS
 */
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Muestra un toast (mensaje temporal)
 */
function showToast(message) {
  if (!message || typeof message !== 'string') return;

  state.toast = message.substring(0, 200); // Limitar a 200 caracteres
  window.clearTimeout(toastTimer);

  saveAndRender();

  toastTimer = window.setTimeout(() => {
    state.toast = '';
    render();
  }, 2200);
}

/**
 * Guarda el estado y renderiza (atomic operation)
 */
function saveAndRender() {
  saveState();
  render();

  // Animación de apertura de sobre
  if (state.packOpening) {
    window.setTimeout(() => {
      state.packOpening = false;
      saveAndRender();
    }, 900);
  }
}

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

// Iniciar eventos
initializeEventDelegation();

// Iniciar el juego
render();
