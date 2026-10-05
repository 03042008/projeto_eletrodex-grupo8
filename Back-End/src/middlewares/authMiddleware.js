const SessionService = require("../services/SessionService");
const FuncionarioRepository = require("../repositories/FuncionarioRepository");

async function authenticate(req, res, next) {
  const authorization = req.get("Authorization") || "";
  const match = /^Bearer\s+(\S+)$/i.exec(authorization);
  const sessionUser = match && SessionService.find(match[1]);

  if (!sessionUser) {
    return res.status(401).json({ erro: "Autenticação necessária." });
  }

  try {
    const user = await FuncionarioRepository.findById(sessionUser.id_funcionario);
    if (!user) {
      SessionService.destroy(match[1]);
      return res.status(401).json({ erro: "Sessão inválida." });
    }

    req.usuario = {
      ...sessionUser,
      id_nivel: user.id_nivel,
      nome: user.nome,
      email: user.email,
      nivel: user.nivel,
    };
    req.sessionToken = match[1];
    return next();
  } catch (error) {
    return res.status(500).json({ erro: "Não foi possível validar a sessão." });
  }
}

function permitirCargos(...allowedRoles) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ erro: "Autenticação necessária." });
    }
    if (!allowedRoles.includes(req.usuario.nivel)) {
      return res.status(403).json({ erro: "Seu cargo não tem permissão para esta função." });
    }
    return next();
  };
}

module.exports = {
  authenticate,
  permitirCargos,
  authorize: permitirCargos,
};
