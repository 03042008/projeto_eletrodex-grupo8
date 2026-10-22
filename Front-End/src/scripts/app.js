// Eletrodex — base de comportamento do front-end
// Sem dependências externas. Pensado para ser plugado numa API depois.

document.addEventListener('DOMContentLoaded', () => {
  initContrastToggle();
  initSidebar();
  initLoginForm();
  initNotifications();
  markActiveNav();
});

/* ---------- alto contraste ---------- */
function initContrastToggle() {
  const btn = document.querySelector('[data-contrast-toggle]');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const isHigh = document.body.classList.toggle('high-contrast');
    btn.setAttribute('aria-pressed', String(isHigh));
    btn.textContent = isHigh ? 'Contraste padrão' : 'Alto contraste';
  });
}

/* ---------- sidebar (mobile) ---------- */
function initSidebar() {
  const menuBtn = document.querySelector('[data-menu-toggle]');
  const sidebar = document.querySelector('.app-sidebar');
  const scrim = document.querySelector('.sidebar-scrim');
  if (!menuBtn || !sidebar) return;

  const close = () => {
    sidebar.classList.remove('open');
    scrim && scrim.classList.remove('visible');
    menuBtn.setAttribute('aria-expanded', 'false');
  };
  const open = () => {
    sidebar.classList.add('open');
    scrim && scrim.classList.add('visible');
    menuBtn.setAttribute('aria-expanded', 'true');
  };

  menuBtn.addEventListener('click', () => {
    sidebar.classList.contains('open') ? close() : open();
  });
  scrim && scrim.addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
}

/* ---------- marca o item de menu correspondente à página atual ---------- */
function markActiveNav() {
  const current = document.body.dataset.page;
  if (!current) return;
  document.querySelectorAll('.nav-list a[data-page]').forEach((link) => {
    if (link.dataset.page === current) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
}

/* ---------- login (mock — trocar pela chamada real à API) ---------- */
function initLoginForm() {
  const form = document.querySelector('[data-login-form]');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const errorBox = form.querySelector('.form-error');
    const usuario = form.usuario.value.trim();
    const senha = form.senha.value.trim();

    if (!usuario || !senha) {
      errorBox.textContent = 'Informe usuário e senha para entrar.';
      errorBox.classList.add('visible');
      return;
    }

    // TODO: substituir por POST /login na API do Eletrodex.
    // Em caso de sucesso, redirecionar para dashboard.html
    // conforme o cargo retornado (Gerente, Coordenador,
    // Administrador, RH ou Operador de Estoque).
    window.location.href = 'dashboard.html';
  });
}

/* ---------- notificações (popup) ---------- */
function initNotifications() {
  const notificationBtn = document.querySelector('.notification-btn');
  const notificationsPanel = document.getElementById('notifications-panel');
  const closeBtn = document.querySelector('.close-notifications-btn');

  if (!notificationBtn || !notificationsPanel) return;

  // Abrir/fechar o painel
  notificationBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isVisible = notificationsPanel.classList.contains('visible');
    notificationsPanel.classList.toggle('visible', !isVisible);
    notificationBtn.setAttribute('aria-expanded', String(!isVisible));
  });

  // Fechar ao clicar no botão de close
  closeBtn.addEventListener('click', () => {
    notificationsPanel.classList.remove('visible');
    notificationBtn.setAttribute('aria-expanded', 'false');
  });

  // Fechar ao clicar fora
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.notifications-wrapper')) {
      notificationsPanel.classList.remove('visible');
      notificationBtn.setAttribute('aria-expanded', 'false');
    }
  });

  // Fechar ao pressionar Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && notificationsPanel.classList.contains('visible')) {
      notificationsPanel.classList.remove('visible');
      notificationBtn.setAttribute('aria-expanded', 'false');
    }
  });

  // Adicionar comportamento aos items de notificação
  const notificationItems = document.querySelectorAll('.notification-item');
  notificationItems.forEach((item) => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      // Aqui você pode adicionar lógica para navegar para a página relevante
      console.log('Notificação clicada:', item.querySelector('.notification-title').textContent);
    });
  });
}
