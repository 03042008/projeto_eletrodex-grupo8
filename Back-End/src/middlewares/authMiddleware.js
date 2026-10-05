const SessionService = require("../services/SessionService");

function authenticate(req, res, next) {
  const authorization = req.get("Authorization") || "";
  const match = /^Bearer ([a-f0-9]{64})$/i.exec(authorization);
  const user = match && SessionService.find(match[1]);

  if (!user) {
    return res.status(401).json({ erro: "Autenticação necessária." });
  }

  req.usuario = user;
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