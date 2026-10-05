// Eletrodex — interações do front-end e integração com a API.

const API_BASE_URL = window.ELETRODEX_CONFIG?.apiBaseUrl;
const PAGE_ROLES = {
  painel: ['Administrador', 'Gerente', 'Estoquista', 'Vendedor', 'Funcionário'],
  critico: ['Administrador', 'Gerente', 'Estoquista'],
  produtos: ['Administrador', 'Gerente', 'Estoquista', 'Vendedor', 'Funcionário'],
};

document.addEventListener('DOMContentLoaded', async () => {
  if (!await enforceAuthentication()) return;

  initContrastToggle();
  initSidebar();
  initAuthTabs();
  initLoginForm();
  initRegisterForm();
  initPasswordRecovery();
  initLogout();
  initNotifications();
  markActiveNav();
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
    const user = { nome: usuario.nome, email: usuario.email, nivel: usuario.nivel };
    sessionStorage.setItem('eletrodex-user', JSON.stringify(user));

    if (!PAGE_ROLES[document.body.dataset.page]?.includes(user.nivel)) {
      window.location.replace('dashboard.html?acesso=negado');
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
      window.location.href = 'dashboard.html';
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
