const FuncionarioRepository = require("../repositories/FuncionarioRepository");
const SessionService = require("./SessionService");
const bcrypt = require("bcryptjs");

const BCRYPT_ROUNDS = 12;

function normalizarCpf(cpf) {
  if (typeof cpf !== "string" || !/^[\d.\-\s]+$/.test(cpf)) return null;
  const digitos = cpf.replace(/\D/g, "");
  if (digitos.length !== 11 || /^(\d)\1{10}$/.test(digitos)) return null;

  const calcularDigito = (base, pesoInicial) => {
    const soma = base.split("").reduce(
      (total, digito, indice) => total + Number(digito) * (pesoInicial - indice),
      0
    );
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  if (calcularDigito(digitos.slice(0, 9), 10) !== Number(digitos[9])) return null;
  if (calcularDigito(digitos.slice(0, 10), 11) !== Number(digitos[10])) return null;

  return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9)}`;
}

function validarDadosFuncionario(dados) {
  const nome = typeof dados?.nome === "string" ? dados.nome.trim() : "";
  const email = typeof dados?.email === "string" ? dados.email.trim().toLowerCase() : "";
  const cpf = normalizarCpf(dados?.cpf);
  const senha = typeof dados?.senha === "string" ? dados.senha : "";

  if (!nome || nome.length > 100) {
    throw { status: 400, mensagem: "Nome é obrigatório e deve ter até 100 caracteres." };
  }
  if (email.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw { status: 400, mensagem: "Informe um e-mail válido com até 100 caracteres." };
  }
  if (!cpf) {
    throw { status: 400, mensagem: "Informe um CPF válido." };
  }
  if (senha.trim().length < 8 || Buffer.byteLength(senha, "utf8") > 72) {
    throw { status: 400, mensagem: "A senha deve ter ao menos 8 caracteres e até 72 bytes." };
  }

  return { nome, email, cpf, senha };
}

class FuncionarioService {
  async autenticarFuncionario(dados) {
    const email = typeof dados?.email === "string" ? dados.email.trim().toLowerCase() : "";
    const senha = typeof dados?.senha === "string" ? dados.senha : "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !senha) {
      throw { status: 400, mensagem: "Informe um e-mail válido e a senha." };
    }

    const funcionario = await FuncionarioRepository.findByEmailForLogin(email);
    const senhaValida = funcionario && await bcrypt.compare(senha, funcionario.senha);
    if (!senhaValida) {
      throw { status: 401, mensagem: "E-mail ou senha inválidos." };
    }

    const usuario = {
      id_funcionario: funcionario.id_funcionario,
      id_nivel: funcionario.id_nivel,
      nome: funcionario.nome,
      email: funcionario.email,
      nivel: funcionario.nivel,
    };

    return {
      sucesso: true,
      token: SessionService.create(usuario),
      usuario,
    };
  }

  async listarFuncionarios() {
    const funcionarios = await FuncionarioRepository.findAll();
    return {
      sucesso: true,
      dados: funcionarios,
      total: funcionarios.length,
    };
  }

  async buscarFuncionarioPorId(id) {
    if (!id || Number.isNaN(Number(id))) {
      throw { status: 400, mensagem: "ID inválido" };
    }

    const funcionario = await FuncionarioRepository.findById(id);
    if (!funcionario) {
      throw { status: 404, mensagem: "Funcionário não encontrado" };
    }

    return { sucesso: true, dados: funcionario };
  }

  async cadastrarFuncionario(dados) {
    const { id_nivel } = dados || {};

    if (!Number.isInteger(Number(id_nivel)) || Number(id_nivel) < 1) {
      throw { status: 400, mensagem: "Campo id_nivel inválido" };
    }

    const funcionario = validarDadosFuncionario(dados);
    const existente = await FuncionarioRepository.findByEmailOrCpf(funcionario.email, funcionario.cpf);
    if (existente) {
      throw { status: 409, mensagem: "E-mail ou CPF já cadastrado." };
    }

    const senhaHash = await bcrypt.hash(funcionario.senha, BCRYPT_ROUNDS);
    let id;
    try {
      id = await FuncionarioRepository.create({
        id_nivel: Number(id_nivel),
        ...funcionario,
        senha: senhaHash,
      });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        throw { status: 409, mensagem: "E-mail ou CPF já cadastrado." };
      }
      throw error;
    }

    return { sucesso: true, mensagem: "Funcionário cadastrado com sucesso", id };
  }

  async cadastrarConta(dados) {
    const idNivel = await FuncionarioRepository.findNivelIdByDescricao("Funcionário");
    if (!idNivel) {
      throw { status: 500, mensagem: "Nível básico para cadastro não configurado." };
    }
    return this.cadastrarFuncionario({ ...dados, id_nivel: idNivel });
  }

  async atualizarFuncionario(id, dados, actorId) {
    if (!id || Number.isNaN(Number(id))) {
      throw { status: 400, mensagem: "ID inválido" };
    }

    if (Number(id) === Number(actorId) && dados.id_nivel !== undefined) {
      throw { status: 403, mensagem: "Você não pode alterar o próprio cargo." };
    }

    const existente = await FuncionarioRepository.findById(id);
    if (!existente) {
      throw { status: 404, mensagem: "Funcionário não encontrado" };
    }

    const atualizacao = {};

    if (dados.id_nivel !== undefined) {
      if (Number.isNaN(Number(dados.id_nivel))) {
        throw { status: 400, mensagem: "Campo id_nivel inválido" };
      }
      atualizacao.id_nivel = Number(dados.id_nivel);
    }

    if (dados.nome !== undefined) {
      if (String(dados.nome).trim() === "") {
        throw { status: 400, mensagem: "Nome não pode ser vazio" };
      }
      atualizacao.nome = String(dados.nome).trim();
    }

    if (dados.email !== undefined) {
      if (String(dados.email).trim() === "") {
        throw { status: 400, mensagem: "Email não pode ser vazio" };
      }
      atualizacao.email = String(dados.email).trim();
    }

    if (dados.senha !== undefined) {
      if (typeof dados.senha !== "string" || dados.senha.trim().length < 8 || Buffer.byteLength(dados.senha, "utf8") > 72) {
        throw { status: 400, mensagem: "A senha deve ter ao menos 8 caracteres e até 72 bytes." };
      }
      atualizacao.senha = await bcrypt.hash(dados.senha, BCRYPT_ROUNDS);
    }

    if (dados.cpf !== undefined) {
      if (String(dados.cpf).trim() === "") {
        throw { status: 400, mensagem: "CPF não pode ser vazio" };
      }
      atualizacao.cpf = String(dados.cpf).trim();
    }

    if (Object.keys(atualizacao).length === 0) {
      throw { status: 400, mensagem: "Nenhum dado válido enviado para atualização" };
    }

    await FuncionarioRepository.update(id, atualizacao);

    return { sucesso: true, mensagem: "Funcionário atualizado com sucesso" };
  }

  async deletarFuncionario(id) {
    if (!id || Number.isNaN(Number(id))) {
      throw { status: 400, mensagem: "ID inválido" };
    }

    const existente = await FuncionarioRepository.findById(id);
    if (!existente) {
      throw { status: 404, mensagem: "Funcionário não encontrado" };
    }

    await FuncionarioRepository.delete(id);

    return { sucesso: true, mensagem: "Funcionário removido com sucesso" };
  }
}

module.exports = new FuncionarioService();
