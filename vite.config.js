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
      ],
    },
  },
};
