import { Link, useOutletContext } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

const criticalProducts = [
  { product: 'Micro-ondas Compact 20L', sku: 'MOW-001', quantity: 2, minimum: 10, location: 'Bloco A - Prateleira 3' },
  { product: 'Fogão Grill Premium', sku: 'FOG-002', quantity: 5, minimum: 15, location: 'Bloco D - Prateleira 1' },
  { product: 'Forno Elétrico 50L', sku: 'FOR-001', quantity: 8, minimum: 20, location: 'Bloco C - Prateleira 4' },
];

const pendingItems = [
  { type: 'Revisão', product: 'Micro-ondas Grill 32L', lot: 'LT-0198', responsible: 'José Arthur', elapsed: '2h 15min', action: 'Revisar' },
  { type: 'Verificação', product: 'Refrigerador Inox 400L', lot: 'LT-0201', responsible: 'Maria Silva', elapsed: '45min', action: 'Verificar' },
  { type: 'Aprovação', product: 'Fogão Inox Profissional', lot: 'LT-0195', responsible: 'Gerente', elapsed: '1h 30min', action: 'Aprovar' },
  { type: 'Devolução', product: 'Micro-ondas Inox 28L', lot: 'LT-0176', responsible: 'Luiz Gustavo', elapsed: '4h 20min', action: 'Processar' },
];

export default function CriticalPage() {
  const { user } = useAuth();
  const { search } = useOutletContext();
  const canManage = ['Administrador', 'Gerente'].includes(user.nivel);
  const filteredProducts = criticalProducts.filter((item) => Object.values(item).join(' ').toLowerCase().includes(search.toLowerCase()));
  const filteredPending = pendingItems.filter((item) => Object.values(item).join(' ').toLowerCase().includes(search.toLowerCase()));

  return (
    <main className="app-content" id="conteudo">
      <div className="content-container">
        <section className="card card-danger" aria-labelledby="critical-title">
          <div className="panel-header"><h2 id="critical-title">Produtos em Nível Crítico</h2><Link to="/produtos" className="view-all-link">Ir para produtos <span aria-hidden="true">→</span></Link></div>
          <div className="table-container"><table className="data-table">
            <thead><tr><th scope="col" className="col-produto">Produto</th><th scope="col" className="col-sku">SKU</th><th scope="col" className="col-quantidade">Qtd Atual</th><th scope="col" className="col-minimo">Qtd Mín.</th><th scope="col" className="col-diferenca">Diferença</th><th scope="col" className="col-localizacao">Localização</th>{canManage && <th scope="col" className="col-acao">Ação</th>}</tr></thead>
            <tbody>
              {filteredProducts.map((item) => <tr className="danger-row" key={item.sku}><td className="col-produto"><strong>{item.product}</strong></td><td className="id-cell col-sku">{item.sku}</td><td className="col-quantidade">{item.quantity}</td><td className="col-minimo">{item.minimum}</td><td className="col-diferenca"><span className="badge-danger">{item.quantity - item.minimum}</span></td><td className="col-localizacao">{item.location}</td>{canManage && <td className="col-acao"><button type="button" className="action-link">Repor</button></td>}</tr>)}
              {!filteredProducts.length && <tr><td colSpan={canManage ? 7 : 6} className="empty-row">Nenhum produto corresponde à busca.</td></tr>}
            </tbody>
          </table></div>
        </section>

        <section className="card card-warning" aria-labelledby="pending-title">
          <div className="panel-header"><h2 id="pending-title">Pendências</h2><span className="view-all-link">{filteredPending.length} itens</span></div>
          <div className="table-container"><table className="data-table">
            <thead><tr><th scope="col" className="col-tipo">Tipo</th><th scope="col" className="col-produto">Descrição</th><th scope="col" className="col-lote">Lote/Ref</th><th scope="col" className="col-responsavel">Responsável</th><th scope="col" className="col-tempo">Tempo Pendente</th>{canManage && <th scope="col" className="col-acao">Ação</th>}</tr></thead>
            <tbody>
              {filteredPending.map((item) => <tr className="warning-row" key={item.lot}><td className="col-tipo"><span className="pill warn">{item.type}</span></td><td className="col-produto"><strong>{item.product}</strong></td><td className="id-cell col-lote">{item.lot}</td><td className="col-responsavel">{item.responsible}</td><td className="col-tempo">{item.elapsed}</td>{canManage && <td className="col-acao"><button type="button" className="action-link">{item.action}</button></td>}</tr>)}
              {!filteredPending.length && <tr><td colSpan={canManage ? 6 : 5} className="empty-row">Nenhuma pendência corresponde à busca.</td></tr>}
            </tbody>
          </table></div>
        </section>
      </div>
    </main>
  );
}