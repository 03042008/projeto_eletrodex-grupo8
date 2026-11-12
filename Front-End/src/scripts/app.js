// Eletrodex — interações do front-end e integração com a API.

import './config.js';

const API_BASE_URL = window.ELETRODEX_CONFIG?.apiBaseUrl;
const PAGE_ROLES = {
  painel: ['Administrador', 'Gerente'],
  critico: ['Administrador', 'Gerente', 'Estoquista'],
  devolucoes: ['Administrador', 'Gerente', 'Estoquista'],
  funcionarios: ['Administrador'],
  lotes: ['Administrador', 'Gerente', 'Estoquista'],
  notificacoes: ['Administrador', 'Gerente', 'Estoquista'],
  produtos: ['Administrador', 'Gerente', 'Estoquista', 'Vendedor', 'Funcionário'],
  'gestao-produtos': ['Administrador', 'Gerente'],
  'setor-estoquista': ['Administrador', 'Gerente', 'Estoquista'],
};

function paginaInicialDoCargo(nivel) {
  return ['Administrador', 'Gerente'].includes(nivel) ? 'dashboard.html' : 'produtos.html';
}

document.addEventListener('DOMContentLoaded', async () => {
  if (!await enforceAuthentication()) return;

  initContrastToggle();
  initSidebar();
  initProfileEditor();
  initAuthTabs();
  initLoginForm();
  initRegisterForm();
  initPasswordRecovery();
  initLogout();
  initNotifications();
  markActiveNav();
  initFuncionarios();
  initDevolucoes();
  initLotsManager();
  initManagerProducts();
  initStockOperations();
});

async function enforceAuthentication() {
  if (!document.body.dataset.page) return true;

  try {
    const token = sessionStorage.getItem('eletrodex-token');
    if (!token || !API_BASE_URL) throw new Error('Sessão ausente.');

    const response = await fetch(`${API_BASE_URL}/funcionarios/sessao`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Sessão inválida.');

    const { usuario } = await response.json();
    const user = {
      id_funcionario: usuario.id_funcionario,
      nome: usuario.nome,
      email: usuario.email,
      cpf: usuario.cpf,
      nivel: usuario.nivel,
    };
    sessionStorage.setItem('eletrodex-user', JSON.stringify(user));

    if (!PAGE_ROLES[document.body.dataset.page]?.includes(user.nivel)) {
      window.location.replace(`${paginaInicialDoCargo(user.nivel)}?acesso=negado`);
      return false;
    }

    applyRoleAccess(user);
    return true;
  } catch (error) {
    clearSession();
    window.location.replace('index.html');
    return false;
  }
}

function clearSession() {
  sessionStorage.removeItem('eletrodex-token');
  sessionStorage.removeItem('eletrodex-user');
  sessionStorage.removeItem('eletrodex-authenticated');
}

function initProfileEditor() {
  const dialog = document.querySelector('[data-profile-dialog]');
  const form = document.querySelector('[data-profile-form]');
  if (!dialog || !form) return;

  const errorBox = form.querySelector('.form-error');
  const open = () => {
    const user = JSON.parse(sessionStorage.getItem('eletrodex-user') || '{}');
    form.elements.nome.value = user.nome || '';
    form.elements.email.value = user.email || '';
    form.elements.cpf.value = user.cpf || '';
    errorBox.className = 'form-error';
    dialog.showModal();
  };

  document.querySelectorAll('[data-profile-open]').forEach((button) => {
    button.addEventListener('click', open);
  });
  dialog.querySelectorAll('[data-profile-close]').forEach((button) => {
    button.addEventListener('click', () => dialog.close());
  });
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const nome = form.elements.nome.value.trim();
    const email = form.elements.email.value.trim();
    const cpf = form.elements.cpf.value.trim();
    const button = form.querySelector('[type="submit"]');
    errorBox.className = 'form-error';

    if (!nome || !email || !cpf || !form.elements.email.validity.valid || !cpfValido(cpf)) {
      errorBox.textContent = !cpfValido(cpf)
        ? 'Informe um CPF válido.'
        : 'Informe nome, e-mail válido e CPF.';
      errorBox.classList.add('visible');
      return;
    }

    button.disabled = true;
    button.textContent = 'Salvando...';
    try {
      const response = await fetch(`${API_BASE_URL}/funcionarios/perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('eletrodex-token')}`,
        },
        body: JSON.stringify({ nome, email, cpf }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.erro || 'Não foi possível atualizar o perfil.');

      sessionStorage.setItem('eletrodex-user', JSON.stringify(result.usuario));
      const name = document.querySelector('.user-name');
      const avatar = document.querySelector('.sidebar-foot .avatar');
      if (name) name.textContent = result.usuario.nome;
      if (avatar) {
        avatar.textContent = result.usuario.nome.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
      }
      errorBox.textContent = result.mensagem || 'Perfil atualizado com sucesso.';
      errorBox.classList.add('visible', 'success');
    } catch (error) {
      errorBox.textContent = error instanceof TypeError
        ? 'Não foi possível conectar ao servidor.'
        : error.message;
      errorBox.classList.add('visible');
    } finally {
      button.disabled = false;
      button.textContent = 'Salvar perfil';
    }
  });
}

function applyRoleAccess(user) {
  document.querySelectorAll('[data-roles]').forEach((element) => {
    const allowedRoles = element.dataset.roles.split(',');
    const item = element.closest('li') || element;
    item.hidden = !allowedRoles.includes(user.nivel);
  });

  document.querySelectorAll('.nav-list').forEach((list) => {
    const hasVisibleItem = Array.from(list.children).some((item) => !item.hidden);
    list.hidden = !hasVisibleItem;
    const label = list.previousElementSibling;
    if (label?.classList.contains('nav-group-label')) label.hidden = !hasVisibleItem;
  });

  const name = document.querySelector('.user-name');
  const role = document.querySelector('.role-badge');
  const avatar = document.querySelector('.sidebar-foot .avatar');
  if (name) name.textContent = user.nome;
  if (role) role.textContent = user.nivel;
  if (avatar) {
    avatar.textContent = user.nome.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  }

}

function initLogout() {
  document.querySelectorAll('[data-logout]').forEach((button) => {
    button.addEventListener('click', async () => {
      const token = sessionStorage.getItem('eletrodex-token');
      try {
        if (token && API_BASE_URL) {
          await fetch(`${API_BASE_URL}/funcionarios/logout`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      } finally {
        clearSession();
        window.location.replace('index.html');
      }
    });
  });
}

/* ---------- alternância entre login e cadastro ---------- */
function initAuthTabs() {
  const tabs = document.querySelectorAll('[data-auth-tab]');
  const panels = document.querySelectorAll('[data-auth-panel]');
  if (!tabs.length || !panels.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const selected = tab.dataset.authTab;
      tabs.forEach((item) => {
        const isSelected = item === tab;
        item.classList.toggle('active', isSelected);
        item.setAttribute('aria-selected', String(isSelected));
        item.tabIndex = isSelected ? 0 : -1;
      });
      panels.forEach((panel) => {
        panel.hidden = panel.dataset.authPanel !== selected;
      });
    });
  });
}

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

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorBox = form.querySelector('.form-error');
    const email = form.email.value.trim();
    const senha = form.senha.value;
    const button = form.querySelector('[type="submit"]');

    if (!email || !senha) {
      errorBox.textContent = 'Informe e-mail e senha para entrar.';
      errorBox.classList.add('visible');
      return;
    }
    if (!form.email.validity.valid) {
      errorBox.textContent = 'Informe um e-mail válido para entrar.';
      errorBox.classList.add('visible');
      form.email.focus();
      return;
    }

    if (!API_BASE_URL) {
      errorBox.textContent = 'A URL da API não está configurada.';
      errorBox.classList.add('visible');
      return;
    }

    button.disabled = true;
    button.textContent = 'Verificando...';
    try {
      const response = await fetch(`${API_BASE_URL}/funcionarios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });
      const resultado = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(resultado.erro || 'E-mail ou senha inválidos.');
      }

      sessionStorage.setItem('eletrodex-token', resultado.token);
      sessionStorage.setItem('eletrodex-user', JSON.stringify(resultado.usuario));
      window.location.href = paginaInicialDoCargo(resultado.usuario.nivel);
    } catch (error) {
      errorBox.textContent = error instanceof TypeError
        ? 'Não foi possível conectar ao servidor. Verifique se o backend está iniciado.'
        : error.message;
      errorBox.classList.add('visible');
    } finally {
      button.disabled = false;
      button.textContent = 'Entrar';
    }
  });
}

function cpfValido(cpf) {
  if (!/^[\d.\-\s]+$/.test(cpf)) return false;
  const digitos = cpf.replace(/\D/g, "");
  if (digitos.length !== 11 || /^(\d)\1{10}$/.test(digitos)) return false;

  const calcularDigito = (base, pesoInicial) => {
    const soma = base.split("").reduce(
      (total, digito, indice) => total + Number(digito) * (pesoInicial - indice),
      0
    );
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  return calcularDigito(digitos.slice(0, 9), 10) === Number(digitos[9])
    && calcularDigito(digitos.slice(0, 10), 11) === Number(digitos[10]);
}

/* ---------- cadastro de funcionário ---------- */
function initRegisterForm() {
  const form = document.querySelector('[data-register-form]');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorBox = form.querySelector('.form-error');
    const senha = form.senha.value;
    const confirmacao = form.confirmacao.value;
    const button = form.querySelector('[type="submit"]');

    errorBox.classList.remove('success');
    errorBox.classList.remove('visible');
    if (!cpfValido(form.cpf.value)) {
      errorBox.textContent = 'Informe um CPF válido.';
      errorBox.classList.add('visible');
      form.cpf.focus();
      return;
    }
    if (senha.trim().length < 8) {
      errorBox.textContent = 'A senha deve ter ao menos 8 caracteres não vazios.';
      errorBox.classList.add('visible');
      form.senha.focus();
      return;
    }
    if (senha !== confirmacao) {
      errorBox.textContent = 'As senhas informadas não coincidem.';
      errorBox.classList.add('visible');
      form.confirmacao.focus();
      return;
    }

    if (!API_BASE_URL) {
      errorBox.textContent = 'A URL da API não está configurada.';
      errorBox.classList.add('visible');
      return;
    }

    button.disabled = true;
    button.textContent = 'Enviando...';
    try {
      const response = await fetch(`${API_BASE_URL}/funcionarios/cadastro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: form.nome.value.trim(),
          email: form.email.value.trim(),
          cpf: form.cpf.value.trim(),
          senha,
        }),
      });
      const resultado = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(resultado.erro || 'Não foi possível concluir o cadastro.');
      }

      errorBox.textContent = resultado.mensagem || 'Funcionário cadastrado com sucesso.';
      errorBox.classList.add('visible', 'success');
      form.reset();
    } catch (error) {
      errorBox.textContent = error instanceof TypeError
        ? 'Não foi possível conectar ao servidor. Verifique se o backend está iniciado.'
        : error.message;
      errorBox.classList.add('visible');
    } finally {
      button.disabled = false;
      button.textContent = 'Solicitar cadastro';
    }
  });
}

function initPasswordRecovery() {
  const authTabs = document.querySelector('.auth-tabs');
  const authPanels = document.querySelectorAll('[data-auth-panel]');
  const recoveryPanels = document.querySelectorAll('[data-password-panel]');
  const requestForm = document.querySelector('[data-password-request-form]');
  const resetForm = document.querySelector('[data-password-reset-form]');
  if (!authTabs || !requestForm || !resetForm) return;

  const showRecovery = (panelName) => {
    authTabs.hidden = Boolean(panelName);
    authPanels.forEach((panel) => { panel.hidden = Boolean(panelName); });
    recoveryPanels.forEach((panel) => {
      panel.hidden = panel.dataset.passwordPanel !== panelName;
    });
  };

  document.querySelector('[data-forgot-password]')?.addEventListener('click', () => {
    showRecovery('request');
    requestForm.reset();
    requestForm.querySelector('.form-error').className = 'form-error';
  });

  document.querySelectorAll('[data-back-to-login]').forEach((button) => {
    button.addEventListener('click', () => {
      showRecovery(null);
      document.querySelector('[data-auth-tab="login"]')?.click();
      window.history.replaceState({}, '', window.location.pathname);
    });
  });

  const token = new URLSearchParams(window.location.search).get('token');
  if (token) {
    showRecovery('reset');
    resetForm.elements.token.value = token;
  }

  requestForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const errorBox = requestForm.querySelector('.form-error');
    const button = requestForm.querySelector('[type="submit"]');
    const email = requestForm.elements.email.value.trim();
    errorBox.className = 'form-error';

    if (!email || !requestForm.elements.email.validity.valid) {
      errorBox.textContent = 'Informe um e-mail válido.';
      errorBox.classList.add('visible');
      requestForm.elements.email.focus();
      return;
    }

    button.disabled = true;
    button.textContent = 'Enviando...';
    try {
      const response = await fetch(`${API_BASE_URL}/funcionarios/solicitar-redefinicao-senha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.erro || 'Não foi possível solicitar a recuperação.');
      errorBox.textContent = result.mensagem;
      errorBox.classList.add('visible', 'success');
    } catch (error) {
      errorBox.textContent = error instanceof TypeError
        ? 'Não foi possível conectar ao servidor.'
        : error.message;
      errorBox.classList.add('visible');
    } finally {
      button.disabled = false;
      button.textContent = 'Enviar link de recuperação';
    }
  });

  resetForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const errorBox = resetForm.querySelector('.form-error');
    const button = resetForm.querySelector('[type="submit"]');
    const senha = resetForm.elements.senha.value;
    const confirmacao = resetForm.elements.confirmacao.value;
    errorBox.className = 'form-error';

    if (senha.trim().length < 8 || new TextEncoder().encode(senha).length > 72) {
      errorBox.textContent = 'A senha deve ter ao menos 8 caracteres e até 72 bytes.';
      errorBox.classList.add('visible');
      resetForm.elements.senha.focus();
      return;
    }
    if (senha !== confirmacao) {
      errorBox.textContent = 'As senhas informadas não coincidem.';
      errorBox.classList.add('visible');
      resetForm.elements.confirmacao.focus();
      return;
    }

    button.disabled = true;
    button.textContent = 'Redefinindo...';
    try {
      const response = await fetch(`${API_BASE_URL}/funcionarios/redefinir-senha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetForm.elements.token.value, senha }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.erro || 'Não foi possível redefinir a senha.');
      errorBox.textContent = result.mensagem;
      errorBox.classList.add('visible', 'success');
      resetForm.reset();
      window.history.replaceState({}, '', window.location.pathname);
    } catch (error) {
      errorBox.textContent = error instanceof TypeError
        ? 'Não foi possível conectar ao servidor.'
        : error.message;
      errorBox.classList.add('visible');
    } finally {
      button.disabled = false;
      button.textContent = 'Redefinir senha';
    }
  });
}

/* ---------- central e popup de notificações ---------- */
function initNotifications() {
  const notificationBtn = document.querySelector('.notification-btn');
  const notificationsPanel = document.getElementById('notifications-panel');
  const notificationsList = notificationsPanel?.querySelector('.notifications-list');
  const notificationCenter = document.querySelector('[data-notification-center-list]');
  const notificationSummary = document.querySelector('[data-notification-summary]');
  const filter = document.querySelector('[data-notification-filter]');
  const badge = notificationBtn?.querySelector('.badge');
  const closeBtn = notificationsPanel?.querySelector('.close-notifications-btn');
  const user = JSON.parse(sessionStorage.getItem('eletrodex-user') || '{}');
  const storageKey = `eletrodex-notificacoes-lidas:${user.email || 'sessao'}`;
  let notifications = [];
  let readIds = new Set();
  let currentFilter = 'todas';

  if (!notificationsPanel && !notificationCenter) return;

  try {
    const savedIds = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (Array.isArray(savedIds)) readIds = new Set(savedIds.map(String));
  } catch {
    localStorage.removeItem(storageKey);
  }

  const saveReadIds = () => localStorage.setItem(storageKey, JSON.stringify([...readIds]));

  const createNotification = (notification, compact = false) => {
    const id = String(notification.id_produto);
    const isRead = readIds.has(id);
    const isCritical = notification.tipo === 'critico';
    const item = document.createElement('article');
    item.className = `notification-item ${isCritical ? 'notification-critical' : 'notification-warning'}${isRead ? ' is-read' : ' is-unread'}`;
    const icon = document.createElement('span');
    icon.className = 'notification-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = isCritical ? '⚠️' : '⊙';

    const content = document.createElement('div');
    content.className = 'notification-content';
    const title = document.createElement('div');
    title.className = 'notification-title';
    title.textContent = isCritical ? 'Estoque crítico' : 'Estoque baixo';
    const message = document.createElement('div');
    message.className = 'notification-message';
    const quantity = Number(notification.quantidade_estoque);
    message.textContent = `${notification.nome}: ${quantity} ${quantity === 1 ? 'unidade' : 'unidades'} disponíveis.`;
    content.append(title, message);

    const actions = document.createElement('div');
    actions.className = `notification-actions${compact ? ' compact' : ''}`;
    const readButton = document.createElement('button');
    readButton.type = 'button';
    readButton.className = 'notification-read-toggle';
    readButton.textContent = isRead ? 'Marcar como não lida' : 'Marcar como lida';
    readButton.setAttribute('aria-pressed', String(isRead));
    readButton.addEventListener('click', () => {
      if (readIds.has(id)) readIds.delete(id);
      else readIds.add(id);
      saveReadIds();
      renderNotifications();
    });

    const stockLink = document.createElement('a');
    const canManageProducts = ['Administrador', 'Gerente'].includes(user.nivel);
    stockLink.href = canManageProducts ? './gestao-produtos.html' : './setor-estoquista.html';
    stockLink.textContent = 'Ver estoque';
    actions.append(readButton, stockLink);
    item.append(icon, content, actions);
    return item;
  };

  const renderList = (container, items, compact = false) => {
    container.replaceChildren();
    if (!items.length) {
      const empty = document.createElement('p');
      empty.className = 'notification-empty';
      empty.textContent = notifications.length ? 'Nenhuma notificação neste filtro.' : 'Nenhum alerta de estoque baixo.';
      container.append(empty);
      return;
    }
    items.forEach((notification) => container.append(createNotification(notification, compact)));
  };

  function renderNotifications() {
    const unreadCount = notifications.filter((item) => !readIds.has(String(item.id_produto))).length;
    if (badge) {
      badge.textContent = String(unreadCount);
      badge.hidden = unreadCount === 0;
    }
    if (notificationBtn) {
      notificationBtn.setAttribute('aria-label', `${unreadCount} notificações de estoque não lidas`);
    }
    if (notificationSummary) {
      notificationSummary.textContent = `${notifications.length} alerta(s), ${unreadCount} não lido(s)`;
    }

    const filtered = notifications.filter((item) => {
      const isRead = readIds.has(String(item.id_produto));
      return currentFilter === 'todas' || (currentFilter === 'lidas' && isRead) || (currentFilter === 'nao-lidas' && !isRead);
    });
    if (notificationCenter) renderList(notificationCenter, filtered);
    if (notificationsList) renderList(notificationsList, notifications.slice(0, 5), true);
  }

  const loadNotifications = async () => {
    [notificationsList, notificationCenter].filter(Boolean).forEach((container) => {
      const loading = document.createElement('p');
      loading.className = 'notification-empty';
      loading.textContent = 'Carregando notificações...';
      container.replaceChildren(loading);
    });

    try {
      const result = await apiRequest('/estoque/alertas');
      notifications = Array.isArray(result.dados) ? result.dados : [];
      const activeIds = new Set(notifications.map((item) => String(item.id_produto)));
      readIds = new Set([...readIds].filter((id) => activeIds.has(id)));
      saveReadIds();
      renderNotifications();
    } catch (error) {
      notifications = [];
      renderNotifications();
      const message = error instanceof TypeError ? 'Não foi possível conectar ao servidor.' : error.message;
      if (notificationSummary) notificationSummary.textContent = message;
      [notificationsList, notificationCenter].filter(Boolean).forEach((container) => {
        const errorMessage = document.createElement('p');
        errorMessage.className = 'notification-empty';
        errorMessage.textContent = message;
        container.replaceChildren(errorMessage);
      });
    }
  };

  notificationBtn?.addEventListener('click', (event) => {
    event.stopPropagation();
    const isVisible = notificationsPanel.classList.toggle('visible');
    notificationBtn.setAttribute('aria-expanded', String(isVisible));
  });
  closeBtn?.addEventListener('click', () => {
    notificationsPanel.classList.remove('visible');
    notificationBtn?.setAttribute('aria-expanded', 'false');
  });
  document.addEventListener('click', (event) => {
    if (notificationsPanel && !event.target.closest('.notifications-wrapper')) {
      notificationsPanel.classList.remove('visible');
      notificationBtn?.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && notificationsPanel?.classList.contains('visible')) {
      notificationsPanel.classList.remove('visible');
      notificationBtn?.setAttribute('aria-expanded', 'false');
    }
  });

  filter?.addEventListener('change', () => {
    currentFilter = filter.value;
    renderNotifications();
  });
  document.querySelector('[data-notification-refresh]')?.addEventListener('click', loadNotifications);
  document.querySelector('[data-notification-mark-all]')?.addEventListener('click', () => {
    readIds = new Set(notifications.map((item) => String(item.id_produto)));
    saveReadIds();
    renderNotifications();
  });

  loadNotifications();
}

async function apiRequest(path, options = {}) {
  const token = sessionStorage.getItem('eletrodex-token');
  const headers = { Authorization: `Bearer ${token}`, ...(options.headers || {}) };
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.erro || result.mensagem || result.error || 'Não foi possível concluir a operação.');
  }
  return result;
}

function showFormMessage(element, message, success = false) {
  element.textContent = message;
  element.classList.toggle('visible', Boolean(message));
  element.classList.toggle('success', success);
}

function makeTableCell(text) {
  const cell = document.createElement('td');
  cell.textContent = text ?? '—';
  return cell;
}

async function initFuncionarios() {
  const form = document.querySelector('[data-funcionario-form]');
  const list = document.querySelector('[data-funcionario-list]');
  if (!form || !list) return;

  const roleSelect = form.elements.id_nivel;
  const errorBox = form.querySelector('[data-funcionario-error]');
  const listError = document.querySelector('[data-funcionario-list-error]');
  const cancelButton = document.querySelector('[data-funcionario-cancel]');
  const submitButton = form.querySelector('[type="submit"]');
  const title = document.querySelector('#funcionario-form-title');
  const currentUser = JSON.parse(sessionStorage.getItem('eletrodex-user') || '{}');

  const showMessage = (element, message, success = false) => {
    element.textContent = message;
    element.classList.toggle('visible', Boolean(message));
    element.classList.toggle('success', success);
  };

  const loadRoles = async () => {
    const result = await apiRequest('/nivel');
    const roles = Array.isArray(result.dados) ? result.dados : [];
    roleSelect.replaceChildren();
    const prompt = document.createElement('option');
    prompt.value = '';
    prompt.textContent = 'Selecione um cargo';
    roleSelect.append(prompt);
    roles.forEach((role) => {
      const option = document.createElement('option');
      option.value = role.id_nivel;
      option.textContent = role.descricao;
      roleSelect.append(option);
    });
  };

  const loadEmployees = async () => {
    showMessage(listError, '');
    try {
      const result = await apiRequest('/funcionarios');
      const employees = Array.isArray(result.dados) ? result.dados : [];
      list.replaceChildren();
      if (!employees.length) {
        const row = document.createElement('tr');
        const cell = makeTableCell('Nenhum funcionário cadastrado.');
        cell.colSpan = 5;
        row.append(cell);
        list.append(row);
        return;
      }

      employees.forEach((employee) => {
        const row = document.createElement('tr');
        row.append(makeTableCell(employee.nome));
        row.append(makeTableCell(employee.email));
        row.append(makeTableCell(employee.cpf));
        row.append(makeTableCell(employee.nivel));
        const actions = document.createElement('td');
        const isCurrentUser = Number(employee.id_funcionario) === Number(currentUser.id_funcionario);

        const editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.className = 'text-button';
        editButton.textContent = 'Editar';
        editButton.addEventListener('click', () => {
          form.elements.id_funcionario.value = employee.id_funcionario;
          form.elements.nome.value = employee.nome || '';
          form.elements.email.value = employee.email || '';
          form.elements.cpf.value = employee.cpf || '';
          roleSelect.value = employee.id_nivel;
          roleSelect.disabled = isCurrentUser;
          form.elements.senha.value = '';
          form.elements.senha.required = false;
          document.querySelector('[data-funcionario-self-hint]').hidden = !isCurrentUser;
          title.textContent = `Editar funcionário #${employee.id_funcionario}`;
          submitButton.textContent = 'Salvar alterações';
          cancelButton.hidden = false;
          form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'text-button danger-button';
        deleteButton.textContent = 'Excluir';
        deleteButton.disabled = isCurrentUser;
        deleteButton.title = isCurrentUser ? 'Não é permitido excluir a própria conta.' : '';
        deleteButton.addEventListener('click', async () => {
          if (!window.confirm(`Excluir o acesso de ${employee.nome}?`)) return;
          deleteButton.disabled = true;
          try {
            const result = await apiRequest(`/funcionarios/${employee.id_funcionario}`, { method: 'DELETE' });
            showMessage(errorBox, result.mensagem || 'Funcionário excluído.', true);
            await loadEmployees();
          } catch (error) {
            showMessage(listError, error.message);
            deleteButton.disabled = false;
          }
        });
        actions.append(editButton, deleteButton);
        row.append(actions);
        list.append(row);
      });
    } catch (error) {
      const row = document.createElement('tr');
      const cell = makeTableCell(error.message);
      cell.colSpan = 5;
      row.append(cell);
      list.replaceChildren(row);
      showMessage(listError, error.message);
    }
  };

  const resetForm = () => {
    form.reset();
    form.elements.id_funcionario.value = '';
    roleSelect.disabled = false;
    form.elements.senha.required = true;
    document.querySelector('[data-funcionario-self-hint]').hidden = true;
    title.textContent = 'Cadastrar funcionário';
    submitButton.textContent = 'Cadastrar funcionário';
    cancelButton.hidden = true;
    showMessage(errorBox, '');
  };

  cancelButton.addEventListener('click', resetForm);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    showMessage(errorBox, '');
    const employeeId = form.elements.id_funcionario.value;
    const isCurrentUser = Number(employeeId) === Number(currentUser.id_funcionario);
    const nome = form.elements.nome.value.trim();
    const email = form.elements.email.value.trim();
    const cpf = form.elements.cpf.value.trim();
    const senha = form.elements.senha.value;

    if (!nome || !email || !form.elements.email.validity.valid || !cpfValido(cpf)) {
      showMessage(errorBox, !cpfValido(cpf) ? 'Informe um CPF válido.' : 'Informe nome e e-mail válido.');
      return;
    }
    if (!employeeId && senha.trim().length < 8) {
      showMessage(errorBox, 'A senha inicial deve ter ao menos 8 caracteres.');
      return;
    }
    if (senha && (senha.trim().length < 8 || new TextEncoder().encode(senha).length > 72)) {
      showMessage(errorBox, 'A senha deve ter ao menos 8 caracteres e até 72 bytes.');
      return;
    }
    if (!employeeId && !roleSelect.value) {
      showMessage(errorBox, 'Selecione o cargo do funcionário.');
      return;
    }

    const payload = { nome, email, cpf };
    if (!isCurrentUser) payload.id_nivel = Number(roleSelect.value);
    if (senha) payload.senha = senha;
    submitButton.disabled = true;
    submitButton.textContent = 'Salvando...';
    try {
      const result = await apiRequest(employeeId ? `/funcionarios/${employeeId}` : '/funcionarios', {
        method: employeeId ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });
      if (isCurrentUser) {
        Object.assign(currentUser, { nome, email, cpf });
        sessionStorage.setItem('eletrodex-user', JSON.stringify(currentUser));
        applyRoleAccess(currentUser);
      }
      resetForm();
      showMessage(errorBox, result.mensagem || (employeeId ? 'Funcionário atualizado.' : 'Funcionário cadastrado.'), true);
      await loadEmployees();
    } catch (error) {
      showMessage(errorBox, error.message);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = form.elements.id_funcionario.value ? 'Salvar alterações' : 'Cadastrar funcionário';
    }
  });

  try {
    await loadRoles();
  } catch (error) {
    roleSelect.disabled = true;
    showMessage(errorBox, error.message);
  }
  await loadEmployees();
}

async function initLotsManager() {
  const form = document.querySelector('[data-lote-form]');
  const list = document.querySelector('[data-lote-list]');
  if (!form || !list) return;

  const productSelect = form.elements.id_produto;
  const errorBox = form.querySelector('[data-lote-error]');
  const listError = document.querySelector('[data-lote-list-error]');
  const cancelButton = document.querySelector('[data-lote-cancel]');
  const submitButton = form.querySelector('[type="submit"]');
  const title = document.querySelector('#lote-form-title');
  const user = JSON.parse(sessionStorage.getItem('eletrodex-user') || '{}');

  const showMessage = (element, message, success = false) => {
    element.textContent = message;
    element.classList.toggle('visible', Boolean(message));
    element.classList.toggle('success', success);
  };

  const dateOnly = (value) => {
    if (!(value instanceof Date)) return String(value ?? '').slice(0, 10);
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const renderErrorRow = (message) => {
    const row = document.createElement('tr');
    const cell = makeTableCell(message);
    cell.colSpan = 9;
    row.append(cell);
    list.replaceChildren(row);
  };

  const loadProducts = async () => {
    const result = await apiRequest('/produtos');
    const products = Array.isArray(result.dados) ? result.dados : [];
    productSelect.replaceChildren();
    const prompt = document.createElement('option');
    prompt.value = '';
    prompt.textContent = products.length ? 'Selecione um produto' : 'Nenhum produto cadastrado';
    productSelect.append(prompt);
    products.forEach((product) => {
      const option = document.createElement('option');
      option.value = product.id_produto;
      option.textContent = product.nome;
      productSelect.append(option);
    });
    productSelect.disabled = products.length === 0;
  };

  const loadLots = async () => {
    showMessage(listError, '');
    try {
      const result = await apiRequest('/lotes');
      const lots = Array.isArray(result.dados) ? result.dados : [];
      list.replaceChildren();
      if (!lots.length) {
        renderErrorRow('Nenhum lote cadastrado.');
        return;
      }

      lots.forEach((lot) => {
        const row = document.createElement('tr');
        row.append(makeTableCell(`#${lot.id_lote}`));
        row.append(makeTableCell(lot.produto_nome || `Produto #${lot.id_produto}`));
        row.append(makeTableCell(Number(lot.quantidade).toLocaleString('pt-BR')));
        row.append(makeTableCell(lot.localizacao));
        row.append(makeTableCell(dateOnly(lot.data_entrada)));
        row.append(makeTableCell(lot.responsavel_nome || `Funcionário #${lot.responsavel}`));
        row.append(makeTableCell(String(lot.nota_fiscal)));
        row.append(makeTableCell(Number(lot.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })));

        const actions = document.createElement('td');
        const editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.className = 'text-button';
        editButton.textContent = 'Editar';
        editButton.addEventListener('click', () => {
          form.elements.id_lote.value = lot.id_lote;
          productSelect.value = lot.id_produto;
          form.elements.quantidade.value = lot.quantidade;
          form.elements.localizacao.value = lot.localizacao;
          form.elements.data_entrada.value = dateOnly(lot.data_entrada);
          form.elements.nota_fiscal.value = lot.nota_fiscal;
          form.elements.valor.value = lot.valor;
          title.textContent = `Editar lote #${lot.id_lote}`;
          submitButton.textContent = 'Salvar alterações';
          cancelButton.hidden = false;
          form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'text-button danger-button';
        deleteButton.textContent = 'Excluir';
        deleteButton.addEventListener('click', async () => {
          if (!window.confirm(`Deseja excluir o lote #${lot.id_lote}?`)) return;
          deleteButton.disabled = true;
          try {
            const result = await apiRequest(`/lotes/${lot.id_lote}`, { method: 'DELETE' });
            showMessage(errorBox, result.mensagem || 'Lote excluído.', true);
            await loadLots();
          } catch (error) {
            showMessage(errorBox, error.message);
          } finally {
            deleteButton.disabled = false;
          }
        });

        actions.append(editButton, deleteButton);
        row.append(actions);
        list.append(row);
      });
    } catch (error) {
      renderErrorRow(error.message);
      showMessage(listError, error.message);
    }
  };

  const resetForm = () => {
    form.reset();
    form.elements.id_lote.value = '';
    form.elements.responsavel.value = user.id_funcionario || '';
    title.textContent = 'Cadastrar lote';
    submitButton.textContent = 'Cadastrar lote';
    cancelButton.hidden = true;
    showMessage(errorBox, '');
  };

  cancelButton.addEventListener('click', resetForm);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    showMessage(errorBox, '');
    const lotId = form.elements.id_lote.value;
    const quantity = Number(form.elements.quantidade.value);
    const fiscalNote = Number(form.elements.nota_fiscal.value);
    const value = Number(form.elements.valor.value);
    if (!user.id_funcionario) {
      showMessage(errorBox, 'Não foi possível identificar o funcionário responsável. Entre novamente no sistema.');
      return;
    }
    if (!Number.isInteger(quantity) || quantity <= 0 || !Number.isSafeInteger(fiscalNote) || fiscalNote <= 0 || !Number.isFinite(value) || value < 0) {
      showMessage(errorBox, 'Confira a quantidade, a nota fiscal e o valor informado.');
      return;
    }

    const payload = {
      id_produto: Number(productSelect.value),
      quantidade: quantity,
      localizacao: form.elements.localizacao.value.trim(),
      data_entrada: form.elements.data_entrada.value,
      nota_fiscal: fiscalNote,
      valor,
    };
    if (!lotId) payload.responsavel = Number(user.id_funcionario);

    submitButton.disabled = true;
    submitButton.textContent = 'Salvando...';
    try {
      const result = await apiRequest(lotId ? `/lotes/${lotId}` : '/lotes', {
        method: lotId ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });
      resetForm();
      showMessage(errorBox, result.mensagem || (lotId ? 'Lote atualizado.' : 'Lote cadastrado.'), true);
      await loadLots();
    } catch (error) {
      showMessage(errorBox, error.message);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = form.elements.id_lote.value ? 'Salvar alterações' : 'Cadastrar lote';
    }
  });

  form.elements.responsavel.value = user.id_funcionario || '';
  try {
    await loadProducts();
  } catch (error) {
    productSelect.disabled = true;
    showMessage(errorBox, error.message);
  }
  await loadLots();
}

async function initDevolucoes() {
  const form = document.querySelector('[data-devolucao-form]');
  const list = document.querySelector('[data-devolucao-list]');
  if (!form || !list) return;

  const lotSelect = form.elements.id_lote;
  const formError = form.querySelector('[data-devolucao-error]');
  const listError = document.querySelector('[data-devolucao-list-error]');
  const submitButton = form.querySelector('[type="submit"]');
  const statusLabels = {
    pendente: 'Pendente',
    em_analise: 'Em análise',
    reintegrada: 'Reintegrada ao estoque',
    recusada: 'Recusada',
  };

  const showMessage = (element, message, success = false) => {
    element.textContent = message;
    element.classList.toggle('visible', Boolean(message));
    element.classList.toggle('success', success);
  };

  const loadLots = async () => {
    const result = await apiRequest('/lotes');
    const lots = Array.isArray(result.dados) ? result.dados : [];
    lotSelect.replaceChildren();
    const prompt = document.createElement('option');
    prompt.value = '';
    prompt.textContent = lots.length ? 'Selecione o lote do produto' : 'Nenhum lote disponível';
    lotSelect.append(prompt);
    lots.forEach((lot) => {
      const option = document.createElement('option');
      option.value = lot.id_lote;
      option.textContent = `Lote #${lot.id_lote} · ${lot.produto_nome || `Produto #${lot.id_produto}`} · NF ${lot.nota_fiscal}`;
      lotSelect.append(option);
    });
    lotSelect.disabled = lots.length === 0;
  };

  const updateStatus = async (item, status, button) => {
    button.disabled = true;
    try {
      const result = await apiRequest(`/devolucoes/${item.id_devolucao}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      showMessage(formError, result.mensagem, true);
      await Promise.all([loadReturns(), loadLots()]);
    } catch (error) {
      showMessage(listError, error.message);
      button.disabled = false;
    }
  };

  const renderReturns = (items) => {
    list.replaceChildren();
    if (!items.length) {
      const row = document.createElement('tr');
      const cell = makeTableCell('Nenhuma devolução registrada.');
      cell.colSpan = 9;
      row.append(cell);
      list.append(row);
      return;
    }

    items.forEach((item) => {
      const row = document.createElement('tr');
      row.append(makeTableCell(item.produto_nome));
      row.append(makeTableCell(`#${item.id_lote} · NF ${item.nota_fiscal}`));
      row.append(makeTableCell(Number(item.quantidade).toLocaleString('pt-BR')));
      row.append(makeTableCell(item.motivo));
      row.append(makeTableCell(item.solicitante_nome));
      row.append(makeTableCell(item.data_devolucao ? new Date(item.data_devolucao).toLocaleString('pt-BR') : '—'));

      const photoCell = document.createElement('td');
      const photoLink = document.createElement('a');
      photoLink.href = `${API_BASE_URL}/${String(item.foto).replace(/^\/+/, '')}`;
      photoLink.target = '_blank';
      photoLink.rel = 'noopener noreferrer';
      photoLink.textContent = 'Ver foto';
      photoLink.setAttribute('aria-label', `Abrir foto da devolução do produto ${item.produto_nome}`);
      photoCell.append(photoLink);
      row.append(photoCell);

      const statusCell = document.createElement('td');
      const status = document.createElement('span');
      status.className = `return-status status-${item.status}`;
      status.textContent = statusLabels[item.status] || item.status;
      statusCell.append(status);
      row.append(statusCell);

      const actions = document.createElement('td');
      actions.className = 'return-actions';
      const addAction = (label, nextStatus, danger = false) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = danger ? 'text-button danger-button' : 'text-button';
        button.textContent = label;
        button.addEventListener('click', () => updateStatus(item, nextStatus, button));
        actions.append(button);
      };

      if (item.status === 'pendente') addAction('Iniciar análise', 'em_analise');
      if (['pendente', 'em_analise'].includes(item.status)) {
        addAction('Reintegrar', 'reintegrada');
        addAction('Recusar', 'recusada', true);
      }
      if (actions.childElementCount) row.append(actions);
      else row.append(makeTableCell(item.revisor_nome ? `Analisada por ${item.revisor_nome}` : 'Concluída'));
      list.append(row);
    });
  };

  async function loadReturns() {
    showMessage(listError, '');
    try {
      const result = await apiRequest('/devolucoes');
      renderReturns(Array.isArray(result.dados) ? result.dados : []);
    } catch (error) {
      const row = document.createElement('tr');
      const cell = makeTableCell(error.message);
      cell.colSpan = 9;
      row.append(cell);
      list.replaceChildren(row);
      showMessage(listError, error.message);
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    showMessage(formError, '');
    if (!lotSelect.value || !form.elements.foto.files.length) {
      showMessage(formError, 'Selecione o lote e anexe uma foto do produto.');
      return;
    }
    submitButton.disabled = true;
    submitButton.textContent = 'Enviando...';
    try {
      const result = await apiRequest('/devolucoes', {
        method: 'POST',
        body: new FormData(form),
      });
      form.reset();
      showMessage(formError, result.mensagem || 'Devolução registrada para análise.', true);
      await Promise.all([loadLots(), loadReturns()]);
    } catch (error) {
      showMessage(formError, error.message);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Registrar devolução';
    }
  });

  try {
    await loadLots();
  } catch (error) {
    lotSelect.disabled = true;
    showMessage(formError, error.message);
  }
  await loadReturns();
}

function productImageUrl(imagePath) {
  if (!imagePath) return '';
  return `${API_BASE_URL}/${String(imagePath).replace(/^\/+/, '')}`;
}

async function initManagerProducts() {
      const form = document.querySelector('[data-product-form]');
      const list = document.querySelector('[data-product-list]');
      if (!form || !list) return;

      const errorBox = form.querySelector('.form-error');
      const listError = document.querySelector('[data-product-list-error]');
      const cancelButton = document.querySelector('[data-product-cancel]');
      const submitButton = form.querySelector('[type="submit"]');

      const loadProducts = async () => {
        showFormMessage(listError, '');
        try {
          const result = await apiRequest('/produtos');
          renderProducts(Array.isArray(result.dados) ? result.dados : []);
        } catch (error) {
          list.replaceChildren();
          const row = document.createElement('tr');
          const cell = makeTableCell(error.message);
          cell.colSpan = 7;
          row.append(cell);
          list.append(row);
          showFormMessage(listError, error.message);
        }
      };

      const renderProducts = (products) => {
        list.replaceChildren();
        if (!products.length) {
          const row = document.createElement('tr');
          const cell = makeTableCell('Nenhum produto cadastrado.');
          cell.colSpan = 7;
          row.append(cell);
          list.append(row);
          return;
        }

        products.forEach((product) => {
          const row = document.createElement('tr');
          row.append(makeTableCell(product.nome));
          row.append(makeTableCell(`${product.setor || '—'} / ${product.localizacao || '—'}`));
          row.append(makeTableCell(`${product.modelo || product.descricao || '—'} / ${product.tamanho || '—'}`));
          row.append(makeTableCell(Number(product.preco || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })));
          row.append(makeTableCell(String(product.quantidade ?? product.quantidade_estoque ?? 0)));

          const imageCell = document.createElement('td');
          if (product.imagem) {
            const download = document.createElement('a');
            download.href = productImageUrl(product.imagem);
            download.download = product.imagem.split('/').pop() || 'imagem-produto';
            download.textContent = 'Baixar imagem';
            download.setAttribute('aria-label', `Baixar imagem de ${product.nome}`);
            download.addEventListener('click', async (event) => {
              event.preventDefault();
              try {
                const response = await fetch(download.href);
                if (!response.ok) throw new Error('Não foi possível baixar a imagem.');
                const image = URL.createObjectURL(await response.blob());
                const link = document.createElement('a');
                link.href = image;
                link.download = download.download;
                link.click();
                window.setTimeout(() => URL.revokeObjectURL(image), 1000);
              } catch (error) {
                showFormMessage(errorBox, error.message);
              }
            });
            imageCell.append(download);
          } else {
            imageCell.textContent = 'Sem imagem';
          }
          row.append(imageCell);

          const actions = document.createElement('td');
          const edit = document.createElement('button');
          edit.type = 'button';
          edit.className = 'text-button';
          edit.textContent = 'Editar';
          edit.addEventListener('click', () => {
            form.elements.id_produto.value = product.id_produto;
            form.elements.nome.value = product.nome || '';
            form.elements.modelo.value = product.modelo || product.descricao || '';
            form.elements.setor.value = product.setor || '';
            form.elements.tamanho.value = product.tamanho || '';
            form.elements.preco.value = product.preco ?? 0;
            form.elements.quantidade.value = product.quantidade ?? product.quantidade_estoque ?? 0;
            form.elements.localizacao.value = product.localizacao || '';
            form.elements.estado_produto.value = product.estado_produto || 'Novo';
            form.elements.proxima_revisao.value = product.proxima_revisao
              ? String(product.proxima_revisao).slice(0, 10)
              : '';
            form.elements.imagem.value = '';
            document.querySelector('#product-form-title').textContent = 'Atualizar produto';
            submitButton.textContent = 'Salvar alterações';
            cancelButton.hidden = false;
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
          });

          const remove = document.createElement('button');
          remove.type = 'button';
          remove.className = 'text-button danger-button';
          remove.textContent = 'Excluir';
          remove.addEventListener('click', async () => {
            if (!window.confirm(`Deseja excluir "${product.nome}"?`)) return;
            remove.disabled = true;
            try {
              await apiRequest(`/produtos/${product.id_produto}`, { method: 'DELETE' });
              showFormMessage(errorBox, 'Produto excluído.', true);
              await loadProducts();
            } catch (error) {
              showFormMessage(errorBox, error.message);
            } finally {
              remove.disabled = false;
            }
          });
          actions.append(edit, remove);
          row.append(actions);
          list.append(row);
        });
      };

      const resetForm = () => {
        form.reset();
        form.elements.id_produto.value = '';
        form.elements.estado_produto.value = 'Novo';
        document.querySelector('#product-form-title').textContent = 'Cadastrar produto';
        submitButton.textContent = 'Cadastrar produto';
        cancelButton.hidden = true;
        showFormMessage(errorBox, '');
      };

      cancelButton.addEventListener('click', resetForm);
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        showFormMessage(errorBox, '');
        const productId = form.elements.id_produto.value;
        const payload = new FormData(form);
        payload.set('descricao', form.elements.modelo.value.trim());
        if (!form.elements.imagem.files.length) payload.delete('imagem');

        submitButton.disabled = true;
        submitButton.textContent = 'Salvando...';
        try {
          await apiRequest(productId ? `/produtos/${productId}` : '/produtos', {
            method: productId ? 'PUT' : 'POST',
            body: payload,
          });
          resetForm();
          showFormMessage(errorBox, productId ? 'Produto atualizado com sucesso.' : 'Produto cadastrado com sucesso.', true);
          await loadProducts();
        } catch (error) {
          showFormMessage(errorBox, error.message);
        } finally {
          submitButton.disabled = false;
          submitButton.textContent = form.elements.id_produto.value ? 'Salvar alterações' : 'Cadastrar produto';
        }
      });

      await loadProducts();
    }

async function initStockOperations() {
  const form = document.querySelector('[data-stock-form]');
  const productsList = document.querySelector('[data-stock-products]');
  const movementsList = document.querySelector('[data-stock-movements]');
  if (!form || !productsList || !movementsList) return;

  const productSelect = form.elements.id_produto;
  const requestedType = new URLSearchParams(window.location.search).get('tipo');
  if (requestedType === 'entrada' || requestedType === 'saida') form.elements.tipo.value = requestedType;
  const formError = form.querySelector('.form-error');
  const productsError = document.querySelector('[data-stock-list-error]');
  const movementsError = document.querySelector('[data-movement-list-error]');
  const submitButton = form.querySelector('[type="submit"]');
  const editDialog = document.querySelector('[data-stock-edit-dialog]');
  const editForm = document.querySelector('[data-stock-edit-form]');
  let products = [];

  const loadProducts = async () => {
    showFormMessage(productsError, '');
    const result = await apiRequest('/produtos');
    products = Array.isArray(result.dados) ? result.dados : [];
    productSelect.replaceChildren();
    const prompt = document.createElement('option');
    prompt.value = '';
    prompt.textContent = 'Selecione um produto';
    productSelect.append(prompt);

    products.forEach((product) => {
      const option = document.createElement('option');
      option.value = product.id_produto;
      option.textContent = `${product.nome} — ${product.quantidade ?? product.quantidade_estoque ?? 0} un.`;
      productSelect.append(option);
    });

    productsList.replaceChildren();
    if (!products.length) {
      const row = document.createElement('tr');
      const cell = makeTableCell('Nenhum produto cadastrado.');
      cell.colSpan = 6;
      row.append(cell);
      productsList.append(row);
      return;
    }
    products.forEach((product) => {
      const row = document.createElement('tr');
      row.append(makeTableCell(product.nome));
      row.append(makeTableCell(product.setor));
      row.append(makeTableCell(product.localizacao));
      row.append(makeTableCell(product.estado_produto));
      const quantity = Number(product.quantidade ?? product.quantidade_estoque ?? 0);
      row.append(makeTableCell(String(quantity)));
      const actions = document.createElement('td');
      const edit = document.createElement('button');
      edit.type = 'button';
      edit.className = 'text-button';
      edit.textContent = 'Editar';
      edit.addEventListener('click', () => {
        editForm.elements.id_produto.value = product.id_produto;
        editForm.elements.setor.value = product.setor || '';
        editForm.elements.localizacao.value = product.localizacao || '';
        editForm.elements.estado_produto.value = product.estado_produto || 'Novo';
        editForm.elements.proxima_revisao.value = product.proxima_revisao
          ? String(product.proxima_revisao).slice(0, 10)
          : '';
        editForm.elements.observacao.value = '';
        showFormMessage(editForm.querySelector('.form-error'), '');
        editDialog.showModal();
      });

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'text-button danger-button';
      remove.textContent = quantity > 0 ? 'Excluir do estoque' : 'Fora do estoque';
      remove.disabled = quantity === 0;
      remove.setAttribute('aria-label', `Excluir ${product.nome} do estoque`);
      remove.addEventListener('click', async () => {
        if (!window.confirm(`Retirar todas as ${quantity} unidades de "${product.nome}" do estoque? O registro será mantido no histórico.`)) return;
        remove.disabled = true;
        try {
          const result = await apiRequest(`/estoque/produtos/${product.id_produto}/retirar`, { method: 'POST' });
          await Promise.all([loadProducts(), loadMovements()]);
          showFormMessage(productsError, result.mensagem, true);
        } catch (error) {
          showFormMessage(productsError, error.message);
          remove.disabled = false;
        }
      });
      actions.append(edit, remove);
      row.append(actions);
      productsList.append(row);
    });
  };

  editDialog.querySelectorAll('[data-stock-edit-close]').forEach((button) => {
    button.addEventListener('click', () => editDialog.close());
  });
  editDialog.addEventListener('click', (event) => {
    if (event.target === editDialog) editDialog.close();
  });
  editForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const errorBox = editForm.querySelector('.form-error');
    const button = editForm.querySelector('[type="submit"]');
    const productId = editForm.elements.id_produto.value;
    const payload = Object.fromEntries(new FormData(editForm).entries());
    button.disabled = true;
    button.textContent = 'Salvando...';
    try {
      const result = await apiRequest(`/estoque/produtos/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      editDialog.close();
      await Promise.all([loadProducts(), loadMovements()]);
      showFormMessage(productsError, result.mensagem, true);
    } catch (error) {
      showFormMessage(errorBox, error.message);
    } finally {
      button.disabled = false;
      button.textContent = 'Salvar alterações';
    }
  });

  const loadMovements = async () => {
    showFormMessage(movementsError, '');
    const result = await apiRequest('/estoque/movimentacoes');
    const movements = Array.isArray(result.dados) ? result.dados : [];
    movementsList.replaceChildren();
    if (!movements.length) {
      const row = document.createElement('tr');
      const cell = makeTableCell('Nenhuma movimentação registrada.');
      cell.colSpan = 7;
      row.append(cell);
      movementsList.append(row);
      return;
    }

    movements.forEach((movement) => {
      const row = document.createElement('tr');
      const date = movement.data_movimentacao
        ? new Date(movement.data_movimentacao).toLocaleString('pt-BR')
        : '—';
      row.append(makeTableCell(date));
      row.append(makeTableCell({
        entrada: 'Entrada',
        saida: 'Saída',
        ajuste: 'Ajuste',
      }[movement.tipo] || movement.tipo));
      row.append(makeTableCell(movement.nome_produto));
      row.append(makeTableCell(String(movement.quantidade)));
      row.append(makeTableCell(movement.responsavel));
      row.append(makeTableCell(`${movement.setor} / ${movement.localizacao}`));
      const reviewDate = movement.proxima_revisao
        ? `revisão em ${String(movement.proxima_revisao).slice(0, 10)}`
        : '';
      row.append(makeTableCell([
        movement.estado_produto,
        reviewDate,
        movement.observacao,
      ].filter(Boolean).join(' — ')));
      movementsList.append(row);
    });
  };

  productSelect.addEventListener('change', () => {
    const product = products.find((item) => String(item.id_produto) === productSelect.value);
    if (!product) return;
    form.elements.setor.value = product.setor || '';
    form.elements.localizacao.value = product.localizacao || '';
    form.elements.estado_produto.value = product.estado_produto || 'Novo';
    form.elements.proxima_revisao.value = product.proxima_revisao
      ? String(product.proxima_revisao).slice(0, 10)
      : '';
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    showFormMessage(formError, '');
    const body = Object.fromEntries(new FormData(form).entries());
    body.quantidade = Number(body.quantidade);
    body.id_produto = Number(body.id_produto);
    submitButton.disabled = true;
    submitButton.textContent = 'Registrando...';
    try {
      const result = await apiRequest('/estoque/movimentacoes', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      showFormMessage(formError, result.mensagem || 'Movimentação registrada.', true);
      form.elements.quantidade.value = '';
      form.elements.observacao.value = '';
      await Promise.all([loadProducts(), loadMovements()]);
    } catch (error) {
      showFormMessage(formError, error.message);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Registrar movimentação';
    }
  });

  try {
    await Promise.all([loadProducts(), loadMovements()]);
  } catch (error) {
    showFormMessage(productsError, error.message);
    showFormMessage(movementsError, error.message);
  }
}

