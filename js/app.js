/* ══════════════════════════════════════════════
   ADE Manager — App Logic
   ══════════════════════════════════════════════ */

// ─── STATE ───────────────────────────────────────
const state = {
  currentUser: null,
  currentRole: null,
  currentView: 'dashboard',
  sidebarOpen: true,
  botRunning: false,
};

// ─── LOGIN ────────────────────────────────────────
function doLogin() {
  const user = document.getElementById('login-user').value.trim().toUpperCase();
  const pass = document.getElementById('login-pass').value.trim().toUpperCase();

  // Mock credentials — in produzione: chiamata API FastAPI
  const validUsers = {
    'ADMIN': { password: 'ADMIN', role: 'Admin' },
    'MARIO': { password: 'MARIO', role: 'Utente' },
  };

  const err = document.getElementById('login-error');
  if (validUsers[user] && validUsers[user].password === pass) {
    err.classList.add('hidden');
    state.currentUser = user;
    state.currentRole = validUsers[user].role;

    // Update header user info
    document.getElementById('user-name-display').textContent = user;
    document.getElementById('user-role-display').textContent = validUsers[user].role;
    document.getElementById('user-avatar').textContent = user.charAt(0);

    // Switch screens with animation
    const loginScreen = document.getElementById('login-screen');
    const appScreen = document.getElementById('app-screen');
    loginScreen.style.opacity = '0';
    loginScreen.style.transition = 'opacity 0.3s ease';
    setTimeout(() => {
      loginScreen.classList.remove('active');
      appScreen.classList.add('active');
      appScreen.style.opacity = '0';
      appScreen.style.transition = 'opacity 0.3s ease';
      requestAnimationFrame(() => { appScreen.style.opacity = '1'; });
      navigate('dashboard', document.querySelector('[data-view="dashboard"]'));
    }, 300);
  } else {
    err.classList.remove('hidden');
    document.getElementById('login-user').style.borderColor = 'rgba(239,68,68,.6)';
    setTimeout(() => { document.getElementById('login-user').style.borderColor = ''; }, 2000);
  }
}

// Allow Enter key on password field
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('login-pass').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doLogin();
  });
  document.getElementById('login-user').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('login-pass').focus();
  });

  // Animate progress bars on load
  animateProgressBars();
});

// ─── LOGOUT ──────────────────────────────────────
function doLogout() {
  if (!confirm('Vuoi davvero uscire?')) return;
  state.currentUser = null;
  state.currentView = 'dashboard';

  const appScreen = document.getElementById('app-screen');
  const loginScreen = document.getElementById('login-screen');
  appScreen.style.opacity = '0';
  appScreen.style.transition = 'opacity 0.25s ease';
  setTimeout(() => {
    appScreen.classList.remove('active');
    loginScreen.classList.add('active');
    loginScreen.style.opacity = '0';
    loginScreen.style.transition = 'opacity 0.25s ease';
    requestAnimationFrame(() => { loginScreen.style.opacity = '1'; });
    document.getElementById('login-user').value = '';
    document.getElementById('login-pass').value = '';
    document.getElementById('login-error').classList.add('hidden');
  }, 250);
}

// ─── ROUTER ──────────────────────────────────────
function navigate(viewId, btn) {
  // Hide all views
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

  // Show target view
  const target = document.getElementById('view-' + viewId);
  if (target) {
    target.classList.add('active');
    state.currentView = viewId;

    // Update breadcrumb
    const title = target.dataset.title || viewId;
    document.getElementById('header-page-name').textContent = title;
  }

  // Update nav buttons
  if (btn) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  // Animate progress bars when navigating to dashboard
  if (viewId === 'dashboard') {
    setTimeout(animateProgressBars, 100);
  }
}

// ─── SIDEBAR TOGGLE ──────────────────────────────
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  state.sidebarOpen = !state.sidebarOpen;
  if (state.sidebarOpen) {
    sidebar.style.width = 'var(--sidebar-w)';
  } else {
    sidebar.style.width = '60px';
  }
}

// ─── PROGRESS BARS ANIMATION ─────────────────────
function animateProgressBars() {
  document.querySelectorAll('.prog-fill').forEach(bar => {
    const targetWidth = bar.style.width;
    bar.style.width = '0%';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        bar.style.width = targetWidth;
      });
    });
  });
}

// ─── BOT MOCK ────────────────────────────────────
const botMessages = [
  { delay: 200,  type: 'info',    text: '> Avvio Playwright in background...' },
  { delay: 800,  type: '',        text: '> Navigazione verso la pagina di login ADE...' },
  { delay: 1800, type: '',        text: '> Attesa del form di login...' },
  { delay: 2800, type: 'info',    text: '> Inserimento Username / Codice Fiscale: RSSSFN70A01H501T' },
  { delay: 3400, type: '',        text: '> Inserimento Password...' },
  { delay: 4000, type: '',        text: '> Inserimento PIN...' },
  { delay: 4600, type: '',        text: '> Invio modulo di login...' },
  { delay: 6200, type: '',        text: '> Attesa caricamento Area Riservata...' },
  { delay: 8000, type: 'success', text: '> [DATI] Scadenza rilevata: 12 giorni al 26/03/2026' },
  { delay: 8400, type: 'success', text: '> ✅ Navigazione automatica completata. Il browser rimane aperto.' },
];

function startBot() {
  if (state.botRunning) return;
  state.botRunning = true;

  const logArea = document.getElementById('bot-log');
  const status = document.getElementById('bot-status');
  const stopBtn = document.getElementById('stop-bot-btn');
  const startBtn = document.querySelector('[onclick="startBot()"]');

  logArea.innerHTML = '';
  status.textContent = '● Running';
  status.className = 'bot-status running';
  startBtn.disabled = true;
  startBtn.style.opacity = '.5';
  stopBtn.classList.remove('hidden');

  botMessages.forEach(({ delay, type, text }) => {
    setTimeout(() => {
      if (!state.botRunning) return;
      addLogLine(logArea, text, type);
    }, delay);
  });

  setTimeout(() => {
    if (!state.botRunning) return;
    state.botRunning = false;
    status.textContent = '● Completato';
    status.className = 'bot-status done';
    startBtn.disabled = false;
    startBtn.style.opacity = '1';
    stopBtn.classList.add('hidden');
  }, 9000);
}

function addLogLine(container, text, type = '') {
  const line = document.createElement('div');
  line.className = 'log-line' + (type ? ' ' + type : '');
  line.textContent = text;
  container.appendChild(line);
  container.scrollTop = container.scrollHeight;
}

// ─── SETTINGS TABS ───────────────────────────────
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('settings-tab')) {
    document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
    e.target.classList.add('active');
  }
});
