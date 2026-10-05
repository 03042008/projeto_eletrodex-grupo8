import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

const products = [
  { name: 'Micro-ondas Compact 20L', sku: 'MOW-001', quantity: 248, location: 'Bloco A - Prateleira 3', status: 'Disponível', statusClass: 'ok' },
  { name: 'Micro-ondas Grill 32L', sku: 'MOW-002', quantity: 156, location: 'Bloco B - Prateleira 1', status: 'Disponível', statusClass: 'ok' },
  { name: 'Micro-ondas Inox 28L', sku: 'MOW-003', quantity: 89, location: 'Bloco A - Prateleira 5', status: 'Disponível', statusClass: 'ok' },
  { name: 'Refrigerador Side-by-Side', sku: 'REF-001', quantity: 42, location: 'Bloco C - Prateleira 2', status: 'Disponível', statusClass: 'ok' },
  { name: 'Fogão Classe A 5 Bocas', sku: 'FOG-001', quantity: 67, location: 'Bloco D - Prateleira 4', status: 'Disponível', statusClass: 'ok' },
];

export default function ProductsPage() {
  const { user } = useAuth();
  const { search } = useOutletContext();
  const canManage = ['Administrador', 'Gerente'].includes(user.nivel);
  const filteredProducts = products.filter((item) => Object.values(item).join(' ').toLowerCase().includes(search.toLowerCase()));

  return (
    <main className="app-content" id="conteudo">
      <div className="content-container">
        <section className="card" aria-labelledby="products-title">
          <div className="panel-header"><h2 id="products-title">Produtos em Estoque</h2>{canManage && <button type="button" className="view-all-link">Adicionar produto <span aria-hidden="true">+</span></button>}</div>
          <div className="table-container"><table className="data-table">
            <thead><tr><th scope="col" className="col-produto">Produto</th><th scope="col" className="col-sku">SKU</th><th scope="col" className="col-quantidade">Quantidade</th><th scope="col" className="col-localizacao">Localização</th><th scope="col" className="col-status">Status</th>{canManage && <th scope="col" className="col-acao">Ação</th>}</tr></thead>
            <tbody>
              {filteredProducts.map((item) => <tr key={item.sku}><td className="col-produto"><strong>{item.name}</strong></td><td className="id-cell col-sku">{item.sku}</td><td className="col-quantidade">{item.quantity}</td><td className="col-localizacao">{item.location}</td><td className="col-status"><span className={`pill ${item.statusClass}`}>{item.status}</span></td>{canManage && <td className="col-acao"><button type="button" className="action-link">Editar</button></td>}</tr>)}
              {!filteredProducts.length && <tr><td colSpan={canManage ? 6 : 5} className="empty-row">Nenhum produto corresponde à busca.</td></tr>}
            </tbody>
          </table></div>
        </section>
      </div>
    </main>
  );
}