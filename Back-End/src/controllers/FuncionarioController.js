const FuncionarioService = require("../services/FuncionarioService");
const SessionService = require("../services/SessionService");

class FuncionarioController {
  async listar(req, res) {
    try {
      const funcionarios = await FuncionarioService.listarFuncionarios();
      res.status(200).json(funcionarios);
    } catch (error) {
      const code = error.status || 500;
      res.status(code).json({ erro: error.mensagem || error.message });
    }
  }

  async buscarPorId(req, res) {
    try {
      const funcionario = await FuncionarioService.buscarFuncionarioPorId(req.params.id);
      res.status(200).json(funcionario);
    } catch (error) {
      const code = error.status || 400;
      res.status(code).json({ erro: error.mensagem || error.message });
    }
  }

  async cadastrar(req, res) {
    try {
      const resultado = await FuncionarioService.cadastrarFuncionario(req.body);
      res.status(201).json(resultado);
    } catch (error) {
      const code = error.status || 400;
      res.status(code).json({ erro: error.mensagem || error.message });
    }
  }

  async login(req, res) {
    try {
      const resultado = await FuncionarioService.autenticarFuncionario(req.body);
      res.status(200).json(resultado);
    } catch (error) {
      const status = error.status || 500;
      const mensagem = status === 500
        ? "Não foi possível entrar. Tente novamente mais tarde."
        : error.mensagem;
      res.status(status).json({ erro: mensagem });
    }
  }

  sessaoAtual(req, res) {
    res.status(200).json({ sucesso: true, usuario: req.usuario });
  }

  logout(req, res) {
    SessionService.destroy(req.sessionToken);
    res.status(204).end();
  }

  async cadastrarConta(req, res) {
    try {
      const resultado = await FuncionarioService.cadastrarConta(req.body);
      res.status(201).json(resultado);
    } catch (error) {
      const status = error.status || (error.code === "ER_DUP_ENTRY" ? 409 : 500);
      const mensagem = status === 500
        ? "Não foi possível cadastrar o funcionário. Tente novamente mais tarde."
        : error.mensagem || "E-mail ou CPF já cadastrado.";
      res.status(status).json({ erro: mensagem });
    }
  }

  async atualizar(req, res) {
    try {
      const id = req.params.id;
      const resultado = await FuncionarioService.atualizarFuncionario(
        id,
        req.body,
        req.usuario.id_funcionario
      );
      res.status(200).json(resultado);
    } catch (error) {
      const code = error.status || 400;
      res.status(code).json({ erro: error.mensagem || error.message });
    }
  }

  async deletar(req, res) {
    try {
      const resultado = await FuncionarioService.deletarFuncionario(req.params.id);
      res.status(200).json(resultado);
    } catch (error) {
      const code = error.status || 400;
      res.status(code).json({ erro: error.mensagem || error.message });
    }
  }
}

module.exports = new FuncionarioController();
