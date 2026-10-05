const SessionService = require("../services/SessionService");
const FuncionarioRepository = require("../repositories/FuncionarioRepository");

async function authenticate(req, res, next) {
  const authorization = req.get("Authorization") || "";
  const match = /^Bearer ([a-f0-9]{64})$/i.exec(authorization);
  const sessionUser = match && SessionService.find(match[1]);

  if (!sessionUser) {
    return res.status(401).json({ erro: "Autenticação necessária." });
  }

  try {
    const user = await FuncionarioRepository.findAccessById(sessionUser.id_funcionario);
    if (!user) {
      SessionService.destroy(match[1]);
      return res.status(401).json({ erro: "Sessão inválida." });
    }

    SessionService.update(match[1], user);
    req.usuario = user;
  } catch (error) {
    return res.status(500).json({ erro: "Não foi possível validar a sessão." });
  }

  req.sessionToken = match[1];
  next();
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ erro: "Autenticação necessária." });
    }
    if (!allowedRoles.includes(req.usuario.nivel)) {
      return res.status(403).json({ erro: "Seu cargo não tem permissão para esta função." });
    }
    next();
  };
}

module.exports = { authenticate, authorize };