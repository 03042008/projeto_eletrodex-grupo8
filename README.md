# Eletrodex 🏠📦

## Sistema de Gerenciamento de Eletrodomésticos

O **Eletrodex** é um sistema desenvolvido para uma empresa especializada na venda de micro-ondas. O objetivo principal é **digitalizar e organizar os processos de estoque, movimentação, cadastro de produtos, funcionários e vendas**, tornando o gerenciamento mais seguro, rápido e organizado.

O sistema foi planejado para uso **desktop** e possui diferentes níveis de acesso de acordo com o cargo do funcionário.

---

## 👥 Equipe

* João Lucas de Campos Gonçalves
* José Arthur Armelin de Paula
* Letícia Caristo dos Santos
* Luiz Gustavo Rodrigues Gaspar

---

## 🎯 Objetivo do Projeto

O sistema foi desenvolvido para substituir processos de estoque que anteriormente eram realizados manualmente.

Com o Eletrodex, a empresa pode:

* Cadastrar e gerenciar produtos;
* Cadastrar e gerenciar funcionários;
* Controlar lotes;
* Registrar entradas e saídas de produtos;
* Controlar a movimentação dos produtos;
* Acompanhar a localização dos produtos;
* Gerenciar diferentes níveis de acesso;
* Realizar vendas;
* Controlar formas de pagamento;
* Receber notificações sobre estoque;
* Gerenciar devoluções;
* Utilizar recursos de acessibilidade.

A proposta é melhorar a produtividade, a segurança e a organização dos processos da empresa.

---

## 🖥️ Características do Sistema

O Eletrodex possui uma interface moderna e profissional, utilizando tons de cinza e lilás.

### 🎨 Identidade visual

Principais cores utilizadas:

```text
#5E638B
#000000
#F2F0ED
#2F3248
#FFFFFF
#6B6E81
#D9D9D
```

A interface foi planejada para oferecer boa legibilidade, alto contraste e navegação por teclado.

---

## 🔐 Controle de Acesso

O acesso ao sistema é dividido de acordo com o cargo do funcionário.

O sistema prevê diferentes permissões para usuários, garantindo que cada funcionário tenha acesso somente às funcionalidades necessárias para sua função.

Entre os perfis previstos estão:

* Gerente;
* Coordenador;
* Administrador;
* RH;
* Operador de Estoque.

---

## 📦 Funcionalidades

### 👤 Funcionários

Permite:

* Cadastrar funcionários;
* Listar funcionários;
* Buscar funcionário por ID;
* Atualizar dados;
* Remover funcionários.

### 📦 Produtos

Permite:

* Cadastrar produtos;
* Listar produtos;
* Buscar produtos por ID;
* Atualizar produtos;
* Remover produtos.

Cada produto possui um identificador único.

### 🏷️ Níveis

Permite:

* Cadastrar níveis;
* Listar níveis;
* Buscar níveis;
* Atualizar níveis;
* Remover níveis.

### 📋 Lotes

O sistema permite controlar os lotes de produtos, armazenando informações como:

* Localização;
* Responsável;
* Nota fiscal;
* Valor;
* Data de entrada;
* Revisões.

### 🔄 Movimentação de produtos

O sistema registra a movimentação dos produtos, armazenando informações como:

* Localização;
* Data e hora;
* Funcionário responsável;
* Setor;
* Estado do produto;
* Data da última revisão;
* Próxima revisão.

As movimentações ficam registradas para permitir o acompanhamento do histórico dos produtos.

### 📥 Entrada de produtos

Permite registrar:

* Data de entrada;
* Produto;
* ID do produto;
* Setor;
* Lote.

### 📤 Saída de produtos

Permite registrar:

* Data e hora da saída;
* Produto;
* ID do produto;
* Setor;
* Lote;
* Registro da saída.

### 🔔 Notificações

O sistema possui notificações para informar quando a quantidade de produtos no estoque atingir níveis críticos, auxiliando na reposição.

### ↩️ Devoluções

Para realizar uma devolução, o sistema deve solicitar:

* Foto do produto;
* Motivo da devolução;
* Informações relacionadas ao lote;
* ID do produto.

Essas informações são utilizadas para análise da devolução.

### 💳 Pagamentos

O sistema aceita:

* PIX;
* Cartão de débito;
* Cartão de crédito.

O pagamento em dinheiro e vales não é aceito.

---

## ♿ Acessibilidade

A acessibilidade é um dos requisitos não funcionais do projeto.

O sistema possui:

* Alto contraste;
* Cores pensadas para melhorar a leitura;
* Navegação por teclado;
* Interface com boa legibilidade.

As páginas devem seguir diretrizes de acessibilidade e permitir que suas funcionalidades sejam utilizadas pelo teclado.

---

## 🗄️ Banco de Dados

O projeto utiliza **MySQL** para armazenamento dos dados.

Entre as principais entidades estão:

* Funcionário;
* Produto;
* Nível;
* Lote;
* Movimentação de Lote;
* Entrada;
* Saída.

O banco possui relacionamentos entre funcionários, níveis, produtos e lotes para organizar as informações do sistema.

---

## 🔌 API

A API utiliza **JSON** para requisições e respostas.

### Funcionários

| Método | Rota                | Função               |
| ------ | ------------------- | -------------------- |
| GET    | `/funcionarios`     | Lista funcionários   |
| GET    | `/funcionarios/:id` | Busca funcionário    |
| POST   | `/funcionarios`     | Cadastra funcionário |
| PUT    | `/funcionarios/:id` | Atualiza funcionário |
| DELETE | `/funcionarios/:id` | Remove funcionário   |

### Produtos

| Método | Rota            | Função           |
| ------ | --------------- | ---------------- |
| GET    | `/produtos`     | Lista produtos   |
| GET    | `/produtos/:id` | Busca produto    |
| POST   | `/produtos`     | Cadastra produto |
| PUT    | `/produtos/:id` | Atualiza produto |
| DELETE | `/produtos/:id` | Remove produto   |

### Níveis

| Método | Rota          | Função         |
| ------ | ------------- | -------------- |
| GET    | `/niveis`     | Lista níveis   |
| GET    | `/niveis/:id` | Busca nível    |
| POST   | `/niveis`     | Cadastra nível |
| PUT    | `/niveis/:id` | Atualiza nível |
| DELETE | `/niveis/:id` | Remove nível   |

### Lotes

| Método | Rota         | Função        |
| ------ | ------------ | ------------- |
| GET    | `/lotes`     | Lista lotes   |
| GET    | `/lotes/:id` | Busca lote    |
| POST   | `/lotes`     | Cadastra lote |
| PUT    | `/lotes/:id` | Atualiza lote |
| DELETE | `/lotes/:id` | Remove lote   |

### Movimentação de Lote

| Método | Rota                       | Função                |
| ------ | -------------------------- | --------------------- |
| GET    | `/movimentacao_lote`       | Lista movimentações   |
| GET    | `/movimentocacao_lote/:id` | Busca movimentação    |
| POST   | `/movimentacao_lote`       | Cadastra movimentação |
| PUT    | `/movimentacao_lote/:id`   | Atualiza movimentação |
| DELETE | `/movimentacao_lote/:id`   | Remove movimentação   |

### Entrada

| Método | Rota           | Função           |
| ------ | -------------- | ---------------- |
| GET    | `/entrada`     | Lista entradas   |
| GET    | `/entrada/:id` | Busca entrada    |
| POST   | `/entrada`     | Cadastra entrada |
| PUT    | `/entrada/:id` | Atualiza entrada |
| DELETE | `/entrada/:id` | Remove entrada   |

### Saída

| Método | Rota         | Função         |
| ------ | ------------ | -------------- |
| GET    | `/saida`     | Lista saídas   |
| GET    | `/saida/:id` | Busca saída    |
| POST   | `/saida`     | Cadastra saída |
| PUT    | `/saida/:id` | Atualiza saída |
| DELETE | `/saida/:id` | Remove saída   |

## As rotas acima seguem a documentação da API do projeto.





### Requisitos funcionais

Entre os principais requisitos funcionais estão:

* Gerenciamento de produtos;
* Cadastro de usuários;
* Devolução de produtos;
* Movimentação de produtos;
* Formas de pagamento;
* Acompanhamento das movimentações;
* Sistema de login;
* Notificações de estoque;
* Restrições de usuários.

### Requisitos não funcionais

O projeto também possui requisitos relacionados a:

* Acessibilidade;
* Performance;
* Responsividade;
* Backup;
* Segurança;
* Controle de permissões.

O sistema deve possuir boa velocidade de resposta e a documentação estabelece como referência um carregamento de tela de até 2 segundos em conexões de 10 Mbps.

---

## 📌 Regras de Negócio

Algumas das principais regras estabelecidas são:

* O sistema não deve permitir compras para menores de idade;
* Não é permitido pagamento em dinheiro;
* O sistema suporta até 100 funcionários;
* O estoque deve gerar notificações quando atingir uma quantidade mínima;
* O cadastro de produtos é restrito a coordenadores e gerentes;
* O acesso ao sistema é restrito de acordo com o cargo do funcionário.

---

## 🧪 Testes

O projeto possui uma etapa destinada à realização de testes para verificar o funcionamento das funcionalidades desenvolvidas.

Os testes devem verificar principalmente:

* Cadastro;
* Alteração;
* Exclusão;
* Consultas;
* Login;
* Controle de permissões;
* Entrada e saída de produtos;
* Movimentação de lotes;
* Notificações;
* Pagamentos;
* Devoluções.

---

## 📈 Planejamento

## O planejamento do projeto contempla atividades relacionadas ao desenvolvimento da API, banco de dados, prototipação, telas, HTML, CSS, JavaScript, testes e conferência do projeto.

## 🔄 Versionamento

O projeto possui histórico de versionamento desde a criação da documentação.

As primeiras versões foram utilizadas para estruturar a documentação, inserir requisitos funcionais e não funcionais, regras de negócio, restrições, matriz de rastreabilidade e diagramas. Posteriormente, foram realizadas revisões e implementações relacionadas ao banco de dados.

---

## 👨‍💻 Status do Projeto

**Em desenvolvimento.**

O projeto possui documentação de requisitos, documentação da API e estrutura de banco de dados, além das funcionalidades planejadas para o sistema.

---


## 📜 Licença

Projeto acadêmico desenvolvido no **Ensino Médio Integrado ao Técnico da Escola SESI/SENAI de Salto**.

---
