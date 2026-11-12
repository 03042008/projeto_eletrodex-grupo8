const path = require('node:path');

const frontend = path.resolve(__dirname, 'Front-End');

module.exports = {
  root: frontend,
  build: {
    rollupOptions: {
      input: [
        path.join(frontend, 'index.html'),
        path.join(frontend, 'dashboard.html'),
        path.join(frontend, 'critico.html'),
        path.join(frontend, 'produtos.html'),
        path.join(frontend, 'gestao-produtos.html'),
        path.join(frontend, 'setor-estoquista.html'),
        path.join(frontend, 'entrada-produtos.html'),
        path.join(frontend, 'notificacoes.html'),
        path.join(frontend, 'lotes.html'),
        path.join(frontend, 'devolucoes.html'),
        path.join(frontend, 'funcionarios.html'),
        path.join(frontend, 'saida-vendas.html'),
        path.join(frontend, 'niveis.html'),
        path.join(frontend, 'movimentacao.html'),
      ],
    },
  },
};
