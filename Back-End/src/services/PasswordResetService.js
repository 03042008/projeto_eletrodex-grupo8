const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const FuncionarioRepository = require("../repositories/FuncionarioRepository");
const SessionService = require("./SessionService");

const RESET_TTL_MS = 30 * 60 * 1000;
const BCRYPT_ROUNDS = 12;
const resetTokens = new Map();

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function createMailer() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD || !process.env.SMTP_FROM || !process.env.FRONTEND_URL) {
    throw { status: 503, mensagem: "A recuperação de senha não está configurada. Entre em contato com o suporte de TI." };
  }

  const port = Number(SMTP_PORT);
  if (!Number.isInteger(port) || port <= 0) {
    throw { status: 503, mensagem: "A recuperação de senha não está configurada. Entre em contato com o suporte de TI." };
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  });
}

class PasswordResetService {
  async solicitar(emailInput) {
    const email = typeof emailInput === "string" ? emailInput.trim().toLowerCase() : "";
    if (!email || email.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw { status: 400, mensagem: "Informe um e-mail válido." };
    }

    const mailer = createMailer();
    const funcionario = await FuncionarioRepository.findForPasswordReset(email);
    const mensagem = "Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.";
    if (!funcionario) return { sucesso: true, mensagem };

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(token);
    const frontendUrl = process.env.FRONTEND_URL.replace(/\/+$/, "");
    const resetUrl = `${frontendUrl}/index.html?token=${token}`;

    for (const [storedHash, value] of resetTokens.entries()) {
      if (value.idFuncionario === funcionario.id_funcionario || value.expiresAt <= Date.now()) {
        resetTokens.delete(storedHash);
      }
    }
    resetTokens.set(tokenHash, {
      idFuncionario: funcionario.id_funcionario,
      expiresAt: Date.now() + RESET_TTL_MS,
    });

    try {
      await mailer.sendMail({
        from: process.env.SMTP_FROM,
        to: funcionario.email,
        subject: "Redefinição de senha — Eletrodex",
        text: `Use este link para redefinir sua senha (válido por 30 minutos): ${resetUrl}`,
        html: `<p>Recebemos uma solicitação para redefinir sua senha do Eletrodex.</p><p><a href="${resetUrl}">Redefinir senha</a></p><p>O link expira em 30 minutos. Se você não solicitou, ignore este e-mail.</p>`,
      });
    } catch (error) {
      resetTokens.delete(tokenHash);
      throw { status: 503, mensagem: "Não foi possível enviar o e-mail de recuperação. Tente novamente mais tarde." };
    }

    return { sucesso: true, mensagem };
  }

  async redefinir(tokenInput, senhaInput) {
    const token = typeof tokenInput === "string" ? tokenInput : "";
    const senha = typeof senhaInput === "string" ? senhaInput : "";
    if (!/^[a-f0-9]{64}$/i.test(token)) {
      throw { status: 400, mensagem: "Link de redefinição inválido ou expirado." };
    }
    if (senha.trim().length < 8 || Buffer.byteLength(senha, "utf8") > 72) {
      throw { status: 400, mensagem: "A senha deve ter ao menos 8 caracteres e até 72 bytes." };
    }

    const tokenHash = hashToken(token);
    const reset = resetTokens.get(tokenHash);
    if (!reset || reset.expiresAt <= Date.now()) {
      resetTokens.delete(tokenHash);
      throw { status: 400, mensagem: "Link de redefinição inválido ou expirado." };
    }

    const senhaHash = await bcrypt.hash(senha, BCRYPT_ROUNDS);
    const updated = await FuncionarioRepository.updatePasswordById(reset.idFuncionario, senhaHash);
    resetTokens.delete(tokenHash);
    if (!updated) throw { status: 400, mensagem: "Link de redefinição inválido ou expirado." };

    SessionService.destroyByUser(reset.idFuncionario);
    for (const [storedHash, value] of resetTokens.entries()) {
      if (value.idFuncionario === reset.idFuncionario) resetTokens.delete(storedHash);
    }

    return { sucesso: true, mensagem: "Senha redefinida. Entre com sua nova senha." };
  }
}

module.exports = new PasswordResetService();