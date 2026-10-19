import { useEffect, useRef, useState } from 'react';
import {
  Link,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom';

const notifications = [
  {
    type: 'critical',
    icon: '⚠️',
    title: 'Estoque Crítico',
    message: 'Micro-ondas Compact 20L está em nível crítico (2 unidades)',
    time: 'há 15 minutos',
  },
  {
    type: 'warning',
    icon: '⊙',
    title: 'Revisão Pendente',
    message: 'Lote LT-0198 aguardando revisão há 2 horas',
    time: 'há 2 horas',
  },
  {
    type: 'critical',
    icon: '⚠️',
    title: 'Vencimento Próximo',
    message: 'Micro-ondas Grill 32L vence em 7 dias',
    time: 'há 4 horas',
  },
];

const navigationGroups = [
  {
    title: 'Visão geral',
    links: [
      { label: 'Painel', page: 'painel', to: '/dashboard' },
      { label: 'Crítico', page: 'critico', to: '/critico' },
      { label: 'Notificações de estoque', page: 'notificacoes', to: '#' },
    ],
  },
  {
    title: 'Estoque',
    links: [
      { label: 'Produtos', page: 'produtos', to: '/produtos' },
      { label: 'Lotes', page: 'lotes', to: '#' },
      { label: 'Movimentação', page: 'movimentacao', to: '#' },
      { label: 'Entrada de produtos', page: 'entrada', to: '#' },
      { label: 'Saída de produtos', page: 'saida', to: '#' },
      { label: 'Devoluções', page: 'devolucoes', to: '#' },
    ],
  },
  {
    title: 'Vendas',
    links: [
      { label: 'Vendas', page: 'vendas', to: '#' },
      { label: 'Formas de pagamento', page: 'pagamentos', to: '#' },
    ],
  },
  {
    title: 'Administração',
    links: [
      { label: 'Funcionários', page: 'funcionarios', to: '#' },
      { label: 'Níveis de acesso', page: 'niveis', to: '#' },
    ],
  },
];

function BrandMark() {
  return (
    <div className="brand-mark">
      <span>Eletrodex</span>
      <span className="dot">●</span>
    </div>
  );
}

function LoginPage() {
  const [highContrast, setHighContrast] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.toggle('high-contrast', highContrast);
    return () => document.body.classList.remove('high-contrast');
  }, [highContrast]);

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const username = String(formData.get('usuario') ?? '').trim();
    const password = String(formData.get('senha') ?? '').trim();

    if (!username || !password) {
      setError('Informe usuário e senha para entrar.');
      return;
    }

    setError('');
    navigate('/dashboard');
  }

  useEffect(() => {
    document.title = 'Eletrodex — Entrar';
  }, []);

  return (
    <>
      <a className="skip-link" href="#login-main">
        Pular para o conteúdo
      </a>
      <div className="login-shell">
        <section className="scan-panel" aria-hidden="true">
          <div className="scan-content">
            <BrandMark />
            <div className="barcode-wrap">
              <div className="scan-line" />
              <div className="barcode">
                {[60, 90, 40, 75, 100, 55, 85, 30, 70, 95, 50, 80].map(
                  (height, index) => (
                    <span key={index} style={{ height: `${height}%` }} />
                  ),
                )}
              </div>
            </div>
            <div className="scan-text">
              <h2>Cada micro-ondas rastreado do estoque até a venda.</h2>
              <p>
                Cadastro, movimentação e devolução de produtos em um só lugar,
                com acesso organizado por cargo.
              </p>
            </div>
          </div>
        </section>

        <main className="login-panel" id="login-main">
          <button
            type="button"
            className="contrast-toggle"
            aria-pressed={highContrast}
            onClick={() => setHighContrast((current) => !current)}
          >
            {highContrast ? 'Contraste padrão' : 'Alto contraste'}
          </button>

          <div className="login-card">
            <p className="eyebrow">Sistema de gerenciamento</p>
            <h1>Entrar no Eletrodex</h1>

            <form noValidate onSubmit={handleSubmit}>
              <div className={`form-error${error ? ' visible' : ''}`} role="alert">
                {error}
              </div>
              <div className="field">
                <label htmlFor="usuario">Usuário</label>
                <input
                  type="text"
                  id="usuario"
                  name="usuario"
                  autoComplete="username"
                  placeholder="nome.sobrenome"
                />
              </div>
              <div className="field">
                <label htmlFor="senha">Senha</label>
                <input
                  type="password"
                  id="senha"
                  name="senha"
                  autoComplete="current-password"
                  placeholder="••••••••"
                />
                <p className="field-hint">
                  O acesso liberado depende do seu cargo: Gerente, Coordenador,
                  Administrador, RH ou Operador de Estoque.
                </p>
              </div>
              <button type="submit" className="btn-primary">
                Entrar
              </button>
              <div className="login-foot">
                <a href="#">Esqueci minha senha</a>
                <span>Suporte: RH / TI</span>
              </div>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}

function Sidebar({ page, isOpen, onClose }) {
  return (
    <>
      <div
        className={`sidebar-scrim${isOpen ? ' visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`app-sidebar${isOpen ? ' open' : ''}`} id="app-sidebar" aria-label="Navegação principal">
        <BrandMark />
        {navigationGroups.map((group) => (
          <div key={group.title}>
            <p className="nav-group-label">{group.title}</p>
            <ul className="nav-list">
              {group.links.map((item) => {
                const active = item.page === page;
                return (
                  <li key={item.page}>
                    <Link
                      to={item.to}
                      className={active ? 'active' : undefined}
                      aria-current={active ? 'page' : undefined}
                      onClick={onClose}
                    >
                      <span className="tick" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        <div className="sidebar-foot">
          <div className="avatar">SU</div>
          <div className="user-info">
            <div className="user-name">Seu usuário</div>
            <div className="role-badge">Coordenador</div>
          </div>
        </div>
      </aside>
    </>
  );
}

function Notifications() {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    function handlePointerDown(event) {
      if (!wrapperRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') setIsOpen(false);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="notifications-wrapper" ref={wrapperRef}>
      <button
        type="button"
        className="icon-btn notification-btn"
        aria-label="Notificações de estoque crítico"
        aria-expanded={isOpen}
        aria-controls="notifications-panel"
        onClick={() => setIsOpen((current) => !current)}
      >
        🔔
        <span className="badge">3</span>
      </button>
      <div
        className={`notifications-panel${isOpen ? ' visible' : ''}`}
        id="notifications-panel"
        role="dialog"
        aria-labelledby="notifications-title"
        aria-hidden={!isOpen}
      >
        <div className="notifications-header">
          <h3 id="notifications-title">Notificações de Estoque</h3>
          <button
            type="button"
            className="close-notifications-btn"
            aria-label="Fechar notificações"
            onClick={() => setIsOpen(false)}
          >
            ✕
          </button>
        </div>
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div
              key={notification.title}
              className={`notification-item notification-${notification.type}`}
            >
              <div className="notification-icon">{notification.icon}</div>
              <div className="notification-content">
                <div className="notification-title">{notification.title}</div>
                <div className="notification-message">{notification.message}</div>
                <div className="notification-time">{notification.time}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="notifications-footer">
          <a href="#" className="view-all-notifications">
            Ver todas as notificações →
          </a>
        </div>
      </div>
    </div>
  );
}

function AppLayout({ page, title, subtitle, searchLabel, searchPlaceholder, children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [page]);

  useEffect(() => {
    document.title = `Eletrodex — ${title}`;
  }, [title]);

  return (
    <>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <div className="app-shell">
        <Sidebar
          page={page}
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
        />
        <div className="app-main">
          <header className="app-topbar">
            <div className="topbar-left">
              <button
                type="button"
                className="menu-btn"
                aria-expanded={menuOpen}
                aria-controls="app-sidebar"
                aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
                onClick={() => setMenuOpen((current) => !current)}
              >
                ☰
              </button>
              <div id="topo-site">
                <h1>{title}</h1>
                <p className="subtitle">{subtitle}</p>
              </div>
            </div>
            <div className="topbar-actions">
              <div className="search-wrap">
                <span className="search-icon" aria-hidden="true">
                  {searchLabel}
                </span>
                <input
                  type="search"
                  className="search-input"
                  placeholder={searchPlaceholder}
                  aria-label="Buscar"
                />
              </div>
              <Notifications />
            </div>
          </header>
          <main className="app-content" id="conteudo">
            <div className="content-container">{children}</div>
          </main>
        </div>
      </div>
    </>
  );
}

const activity = [
  {
    product: 'Micro-ondas Compact 20L',
    lot: 'LT-0231',
    sector: 'Expedição',
    user: 'Letícia Caristo',
    status: 'ok',
    statusLabel: '✓ Disponível',
    time: '14:22',
  },
  {
    product: 'Micro-ondas Grill 32L',
    lot: 'LT-0198',
    sector: 'Recebimento',
    user: 'José Arthur',
    status: 'warn',
    statusLabel: '⊙ Em revisão',
    time: '11:05',
  },
  {
    product: 'Micro-ondas Inox 28L',
    lot: 'LT-0176',
    sector: 'Devolução',
    user: 'Luiz Gustavo',
    status: 'danger',
    statusLabel: '✗ Avariado',
    time: '17:40',
  },
];

function DashboardPage() {
  return (
    <AppLayout
      page="painel"
      title="Painel geral"
      subtitle="Visão consolidada do estoque e das movimentações"
      searchLabel="🔍"
      searchPlaceholder="Buscar produto, lote ou funcionário..."
    >
      <section className="kpi-grid" aria-label="Indicadores gerais">
        <Link to="/produtos" className="kpi-link">
          <div className="card kpi-card">
            <div className="kpi-label">Produtos em estoque</div>
            <div className="kpi-value">248</div>
          </div>
        </Link>
        <Link
          to="/critico"
          className="card kpi-card alert"
          aria-label="Ver produtos em nível crítico"
        >
          <div className="kpi-label">Crítico</div>
          <div className="kpi-value">6</div>
        </Link>
        <div className="card kpi-card">
          <div className="kpi-label">Movimentações hoje</div>
          <div className="kpi-value">14</div>
        </div>
        <div className="card kpi-card">
          <div className="kpi-label">Pendências</div>
          <div className="kpi-value">2</div>
        </div>
      </section>

      <section className="card activity-card" aria-labelledby="mov-title">
        <div className="panel-header">
          <h2 id="mov-title">Atividade recente</h2>
          <a href="#" className="view-all-link">
            Ver todas →
          </a>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col" className="col-product">Produto</th>
                <th scope="col" className="col-lot">Lote</th>
                <th scope="col" className="col-sector">Setor</th>
                <th scope="col" className="col-user">Responsável</th>
                <th scope="col" className="col-status">Estado</th>
                <th scope="col" className="col-time">Horário</th>
              </tr>
            </thead>
            <tbody>
              {activity.map((item) => (
                <tr key={item.lot}>
                  <td className="col-product"><strong>{item.product}</strong></td>
                  <td className="id-cell col-lot">{item.lot}</td>
                  <td className="col-sector">{item.sector}</td>
                  <td className="col-user">{item.user}</td>
                  <td className="col-status">
                    <span className={`pill ${item.status}`}>{item.statusLabel}</span>
                  </td>
                  <td className="col-time">{item.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppLayout>
  );
}

const criticalProducts = [
  {
    product: 'Micro-ondas Compact 20L',
    sku: 'MOW-001',
    current: '2',
    minimum: '10',
    difference: '-8',
    location: 'Bloco A - Prateleira 3',
  },
  {
    product: 'Fogão Grill Premium',
    sku: 'FOG-002',
    current: '5',
    minimum: '15',
    difference: '-10',
    location: 'Bloco D - Prateleira 1',
  },
  {
    product: 'Forno Elétrico 50L',
    sku: 'FOR-001',
    current: '8',
    minimum: '20',
    difference: '-12',
    location: 'Bloco C - Prateleira 4',
  },
];

const pendingItems = [
  {
    type: 'Revisão',
    product: 'Micro-ondas Grill 32L',
    reference: 'LT-0198',
    responsible: 'José Arthur',
    time: '2h 15min',
    action: 'Revisar',
  },
  {
    type: 'Verificação',
    product: 'Refrigerador Inox 400L',
    reference: 'LT-0201',
    responsible: 'Maria Silva',
    time: '45min',
    action: 'Verificar',
  },
  {
    type: 'Aprovação',
    product: 'Fogão Inox Profissional',
    reference: 'LT-0195',
    responsible: 'Coordenador',
    time: '1h 30min',
    action: 'Aprovar',
  },
  {
    type: 'Devolução',
    product: 'Micro-ondas Inox 28L',
    reference: 'LT-0176',
    responsible: 'Luiz Gustavo',
    time: '4h 20min',
    action: 'Processar',
  },
];

function CriticalPage() {
  return (
    <AppLayout
      page="critico"
      title="Crítico & Pendências"
      subtitle="Itens que necessitam de ação urgente"
      searchLabel="⚠️"
      searchPlaceholder="Buscar produto ou lote..."
    >
      <section className="card card-danger" aria-labelledby="criticos-title">
        <div className="panel-header">
          <h2 id="criticos-title">⚠️ Produtos em Nível Crítico</h2>
          <Link to="/produtos" className="view-all-link">Ir para produtos →</Link>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col" className="col-produto">Produto</th>
                <th scope="col" className="col-sku">SKU</th>
                <th scope="col" className="col-quantidade">Qtd Atual</th>
                <th scope="col" className="col-minimo">Qtd Mín.</th>
                <th scope="col" className="col-diferenca">Diferença</th>
                <th scope="col" className="col-localizacao">Localização</th>
                <th scope="col" className="col-acao">Ação</th>
              </tr>
            </thead>
            <tbody>
              {criticalProducts.map((item) => (
                <tr className="danger-row" key={item.sku}>
                  <td className="col-produto"><strong>{item.product}</strong></td>
                  <td className="id-cell col-sku">{item.sku}</td>
                  <td className="col-quantidade">{item.current}</td>
                  <td className="col-minimo">{item.minimum}</td>
                  <td className="col-diferenca">
                    <span className="badge-danger">{item.difference}</span>
                  </td>
                  <td className="col-localizacao">{item.location}</td>
                  <td className="col-acao"><a href="#" className="action-link">Repor</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card card-warning" aria-labelledby="pendencias-title">
        <div className="panel-header">
          <h2 id="pendencias-title">⊙ Pendências</h2>
          <a href="movimentacoes.html" className="view-all-link">Ver movimentações →</a>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col" className="col-tipo">Tipo</th>
                <th scope="col" className="col-produto">Descrição</th>
                <th scope="col" className="col-lote">Lote/Ref</th>
                <th scope="col" className="col-responsavel">Responsável</th>
                <th scope="col" className="col-tempo">Tempo Pendente</th>
                <th scope="col" className="col-acao">Ação</th>
              </tr>
            </thead>
            <tbody>
              {pendingItems.map((item) => (
                <tr className="warning-row" key={item.reference}>
                  <td className="col-tipo"><span className="pill warn">{item.type}</span></td>
                  <td className="col-produto"><strong>{item.product}</strong></td>
                  <td className="id-cell col-lote">{item.reference}</td>
                  <td className="col-responsavel">{item.responsible}</td>
                  <td className="col-tempo">{item.time}</td>
                  <td className="col-acao"><a href="#" className="action-link">{item.action}</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppLayout>
  );
}

const products = [
  {
    product: 'Micro-ondas Compact 20L',
    sku: 'MOW-001',
    quantity: '248',
    location: 'Bloco A - Prateleira 3',
  },
  {
    product: 'Micro-ondas Grill 32L',
    sku: 'MOW-002',
    quantity: '156',
    location: 'Bloco B - Prateleira 1',
  },
  {
    product: 'Micro-ondas Inox 28L',
    sku: 'MOW-003',
    quantity: '89',
    location: 'Bloco A - Prateleira 5',
  },
  {
    product: 'Refrigerador Side-by-Side',
    sku: 'REF-001',
    quantity: '42',
    location: 'Bloco C - Prateleira 2',
  },
  {
    product: 'Fogão Classe A 5 Bocas',
    sku: 'FOG-001',
    quantity: '67',
    location: 'Bloco D - Prateleira 4',
  },
];

function ProductsPage() {
  return (
    <AppLayout
      page="produtos"
      title="Produtos em Estoque"
      subtitle="Gestão completa do inventário de produtos"
      searchLabel="📦"
      searchPlaceholder="Buscar por produto, SKU ou código..."
    >
      <section className="card" aria-labelledby="estoque-title">
        <div className="panel-header">
          <h2 id="estoque-title">Produtos em Estoque</h2>
          <a href="#" className="view-all-link">Adicionar produto +</a>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col" className="col-produto">Produto</th>
                <th scope="col" className="col-sku">SKU</th>
                <th scope="col" className="col-quantidade">Quantidade</th>
                <th scope="col" className="col-localizacao">Localização</th>
                <th scope="col" className="col-status">Status</th>
                <th scope="col" className="col-acao">Ação</th>
              </tr>
            </thead>
            <tbody>
              {products.map((item) => (
                <tr key={item.sku}>
                  <td className="col-produto"><strong>{item.product}</strong></td>
                  <td className="id-cell col-sku">{item.sku}</td>
                  <td className="col-quantidade">{item.quantity}</td>
                  <td className="col-localizacao">{item.location}</td>
                  <td className="col-status"><span className="pill ok">✓ Disponível</span></td>
                  <td className="col-acao"><a href="#" className="action-link">Editar</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppLayout>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/dashboard.html" element={<DashboardPage />} />
      <Route path="/critico" element={<CriticalPage />} />
      <Route path="/critico.html" element={<CriticalPage />} />
      <Route path="/produtos" element={<ProductsPage />} />
      <Route path="/produtos.html" element={<ProductsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return <AppRoutes />;
}
