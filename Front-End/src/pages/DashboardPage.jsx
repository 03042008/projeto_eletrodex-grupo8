import { Link, useOutletContext } from 'react-router-dom';

const activity = [
  { product: 'Micro-ondas Compact 20L', lot: 'LT-0231', sector: 'Expedição', user: 'Letícia Caristo', status: 'Disponível', statusClass: 'ok', time: '14:22' },
  { product: 'Micro-ondas Grill 32L', lot: 'LT-0198', sector: 'Recebimento', user: 'José Arthur', status: 'Em revisão', statusClass: 'warn', time: '11:05' },
  { product: 'Micro-ondas Inox 28L', lot: 'LT-0176', sector: 'Devolução', user: 'Luiz Gustavo', status: 'Avariado', statusClass: 'danger', time: '17:40' },
];

export default function DashboardPage() {
  const { search } = useOutletContext();
  const filteredActivity = activity.filter((item) => Object.values(item).join(' ').toLowerCase().includes(search.toLowerCase()));

  return (
    <main className="app-content" id="conteudo">
      <div className="content-container">
        <section className="kpi-grid" aria-label="Indicadores gerais">
          <Link to="/produtos" className="kpi-link">
            <div className="card kpi-card"><div className="kpi-label">Produtos em estoque</div><div className="kpi-value">248</div></div>
          </Link>
          <Link to="/critico" className="card kpi-card alert" aria-label="Ver produtos em nível crítico">
            <div className="kpi-label">Crítico</div><div className="kpi-value">6</div>
          </Link>
          <div className="card kpi-card"><div className="kpi-label">Movimentações hoje</div><div className="kpi-value">14</div></div>
          <div className="card kpi-card"><div className="kpi-label">Pendências</div><div className="kpi-value">2</div></div>
        </section>

        <section className="card activity-card" aria-labelledby="activity-title">
          <div className="panel-header"><h2 id="activity-title">Atividade recente</h2><span className="view-all-link">{filteredActivity.length} registros</span></div>
          <div className="table-container">
            <table className="data-table">
              <thead><tr><th scope="col" className="col-product">Produto</th><th scope="col" className="col-lot">Lote</th><th scope="col" className="col-sector">Setor</th><th scope="col" className="col-user">Responsável</th><th scope="col" className="col-status">Estado</th><th scope="col" className="col-time">Horário</th></tr></thead>
              <tbody>
                {filteredActivity.map((item) => (
                  <tr key={item.lot}>
                    <td className="col-product"><strong>{item.product}</strong></td><td className="id-cell col-lot">{item.lot}</td><td className="col-sector">{item.sector}</td><td className="col-user">{item.user}</td><td className="col-status"><span className={`pill ${item.statusClass}`}>{item.status}</span></td><td className="col-time">{item.time}</td>
                  </tr>
                ))}
                {!filteredActivity.length && <tr><td colSpan="6" className="empty-row">Nenhuma atividade corresponde à busca.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}