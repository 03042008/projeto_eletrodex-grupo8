import { useEffect, useState } from 'react';
import { Bell, Boxes, ChevronRight, CircleAlert, ClipboardList, LayoutDashboard, LogOut, Menu, Package, Search, Settings, ShoppingCart, X } from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

const navigation = [
  {
    label: 'Visão geral',
    items: [
      { title: 'Painel', path: '/dashboard', page: 'painel', roles: ['Administrador', 'Gerente'], icon: LayoutDashboard },
      { title: 'Crítico', path: '/critico', page: 'critico', roles: ['Administrador', 'Gerente', 'Estoquista'], icon: CircleAlert },
      { title: 'Notificações de estoque', page: 'notificacoes', roles: ['Administrador', 'Gerente', 'Estoquista'], icon: Bell },
    ],
  },
  {
    label: 'Estoque',
    items: [
      { title: 'Produtos', path: '/produtos', page: 'produtos', roles: ['Administrador', 'Gerente', 'Estoquista', 'Vendedor', 'Funcionário'], icon: Package },
      { title: 'Lotes', page: 'lotes', roles: ['Administrador', 'Gerente', 'Estoquista'], icon: Boxes },
      { title: 'Movimentação', page: 'movimentacao', roles: ['Administrador', 'Gerente', 'Estoquista'], icon: ClipboardList },
      { title: 'Entrada de produtos', page: 'entrada', roles: ['Administrador', 'Gerente', 'Estoquista'], icon: Package },
      { title: 'Saída de produtos', page: 'saida', roles: ['Administrador', 'Gerente', 'Estoquista', 'Vendedor'], icon: ChevronRight },
      { title: 'Devoluções', page: 'devolucoes', roles: ['Administrador', 'Gerente', 'Estoquista'], icon: Boxes },
    ],
  },
  {
    label: 'Vendas',
    items: [
      { title: 'Vendas', page: 'vendas', roles: ['Administrador', 'Gerente', 'Vendedor'], icon: ShoppingCart },
      { title: 'Formas de pagamento', page: 'pagamentos', roles: ['Administrador', 'Gerente', 'Vendedor'], icon: ClipboardList },
    ],
  },
  {
    label: 'Administração',
    items: [
      { title: 'Funcionários', page: 'funcionarios', roles: ['Administrador', 'Gerente'], icon: Settings },
      { title: 'Níveis de acesso', page: 'niveis', roles: ['Administrador'], icon: Settings },
    ],
  },
];

const pageDetails = {
  '/dashboard': ['Painel geral', 'Visão consolidada do estoque e das movimentações'],
  '/critico': ['Crítico & Pendências', 'Itens que necessitam de ação urgente'],
  '/produtos': ['Produtos em Estoque', 'Gestão completa do inventário de produtos'],
};

const notifications = [
  { icon: '⚠️', title: 'Estoque crítico', message: 'Micro-ondas Compact 20L está em nível crítico (2 unidades)', time: 'há 15 minutos', type: 'critical' },
  { icon: '⊙', title: 'Revisão pendente', message: 'Lote LT-0198 aguardando revisão há 2 horas', time: 'há 2 horas', type: 'warning' },
  { icon: '⚠️', title: 'Vencimento próximo', message: 'Micro-ondas Grill 32L vence em 7 dias', time: 'há 4 horas', type: 'critical' },
];

function initials(name) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [highContrast, setHighContrast] = useState(() => document.body.classList.contains('high-contrast'));
  const [search, setSearch] = useState('');
  const [title, subtitle] = pageDetails[location.pathname] || pageDetails['/produtos'];

  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === 'Escape') {
        setSidebarOpen(false);
        setNotificationsOpen(false);
      }
    }
    function closeNotificationsOnOutsideClick(event) {
      if (!event.target.closest('.notifications-wrapper')) setNotificationsOpen(false);
    }
    window.addEventListener('keydown', closeOnEscape);
    window.addEventListener('pointerdown', closeNotificationsOnOutsideClick);
    return () => {
      window.removeEventListener('keydown', closeOnEscape);
      window.removeEventListener('pointerdown', closeNotificationsOnOutsideClick);
    };
  }, []);

  function toggleContrast() {
    const next = !highContrast;
    setHighContrast(next);
    document.body.classList.toggle('high-contrast', next);
  }

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <>
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <div className="app-shell">
        <button className={`sidebar-scrim ${sidebarOpen ? 'visible' : ''}`} aria-label="Fechar menu" onClick={() => setSidebarOpen(false)} />
        <aside className={`app-sidebar ${sidebarOpen ? 'open' : ''}`} id="app-sidebar" aria-label="Navegação principal">
          <NavLink className="brand-mark" to={user.nivel === 'Vendedor' || user.nivel === 'Estoquista' || user.nivel === 'Funcionário' ? '/produtos' : '/dashboard'} onClick={() => setSidebarOpen(false)}>
            <span>Eletrodex</span><span className="dot">●</span>
          </NavLink>

          {navigation.map((group) => {
            const visibleItems = group.items.filter((item) => item.roles.includes(user.nivel));
            if (!visibleItems.length) return null;
            return (
              <section className="nav-group" key={group.label} aria-label={group.label}>
                <p className="nav-group-label">{group.label}</p>
                <ul className="nav-list">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.page}>
                        {item.path ? (
                          <NavLink to={item.path} data-page={item.page} onClick={() => setSidebarOpen(false)}>
                            <span className="tick" /><Icon size={16} aria-hidden="true" /><span>{item.title}</span>
                          </NavLink>
                        ) : (
                          <a href="#" data-page={item.page} aria-disabled="true" onClick={(event) => event.preventDefault()}>
                            <span className="tick" /><Icon size={16} aria-hidden="true" /><span>{item.title}</span>
                          </a>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}

          <div className="sidebar-foot">
            <div className="avatar">{initials(user.nome)}</div>
            <div className="user-info"><span className="user-name">{user.nome}</span><span className="role-badge">{user.nivel}</span></div>
            <button type="button" className="logout-button" aria-label="Sair" title="Sair" onClick={handleLogout}><LogOut size={17} /></button>
          </div>
        </aside>

        <div className="app-main">
          <header className="app-topbar">
            <div className="topbar-left">
              <button className="menu-btn" type="button" aria-expanded={sidebarOpen} aria-controls="app-sidebar" aria-label="Abrir menu" onClick={() => setSidebarOpen((open) => !open)}><Menu size={19} /></button>
              <div id="topo-site"><h1>{title}</h1><p className="subtitle">{subtitle}</p></div>
            </div>
            <div className="topbar-actions">
              <label className={`search-wrap ${search ? 'has-value' : ''}`}>
                <Search className="search-icon" size={15} aria-hidden="true" />
                <input className="search-input" type="search" placeholder="Buscar produto, lote ou funcionário..." aria-label="Buscar" value={search} onChange={(event) => setSearch(event.target.value)} />
                {search && <button type="button" className="search-clear" aria-label="Limpar busca" onClick={() => setSearch('')}><X size={14} /></button>}
              </label>
              <div className="notifications-wrapper">
                <button className="icon-btn notification-btn" type="button" aria-label="Notificações de estoque crítico" aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen((open) => !open)}>
                  <Bell size={17} aria-hidden="true" /><span className="badge">3</span>
                </button>
                <div className={`notifications-panel ${notificationsOpen ? 'visible' : ''}`} role="dialog" aria-label="Notificações de estoque">
                  <div className="notifications-header"><h3>Notificações de Estoque</h3><button type="button" className="close-notifications-btn" aria-label="Fechar notificações" onClick={() => setNotificationsOpen(false)}><X size={17} /></button></div>
                  <div className="notifications-list">
                    {notifications.map((notification) => (
                      <button type="button" className={`notification-item notification-${notification.type}`} key={notification.title} onClick={() => setNotificationsOpen(false)}>
                        <span className="notification-icon" aria-hidden="true">{notification.icon}</span>
                        <span className="notification-content"><span className="notification-title">{notification.title}</span><span className="notification-message">{notification.message}</span><span className="notification-time">{notification.time}</span></span>
                      </button>
                    ))}
                  </div>
                  <div className="notifications-footer"><span className="view-all-notifications">3 notificações recentes</span></div>
                </div>
              </div>
              <button type="button" className="contrast-toggle app-contrast-toggle" aria-pressed={highContrast} onClick={toggleContrast}>{highContrast ? 'Contraste padrão' : 'Alto contraste'}</button>
            </div>
          </header>

          {location.state?.denied && <div className="access-denied" role="alert">Seu cargo não tem acesso à página solicitada.</div>}
          <Outlet context={{ search }} />
        </div>
      </div>
    </>
  );
}