import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { homeForRole } from '../auth/ProtectedRoute.jsx';

const barcodeHeights = [60, 90, 40, 75, 100, 55, 85, 30, 70, 95, 50, 80];

function cpfIsValid(cpf) {
  if (!/^[\d.\-\s]+$/.test(cpf)) return false;
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;

  const calculateDigit = (base, firstWeight) => {
    const sum = [...base].reduce((total, digit, index) => total + Number(digit) * (firstWeight - index), 0);
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  return calculateDigit(digits.slice(0, 9), 10) === Number(digits[9])
    && calculateDigit(digits.slice(0, 10), 11) === Number(digits[10]);
}

function Field({ label, id, ...inputProps }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} {...inputProps} />
    </div>
  );
}

export default function LoginPage() {
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [highContrast, setHighContrast] = useState(() => document.body.classList.contains('high-contrast'));
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function selectMode(nextMode) {
    setMode(nextMode);
    setError('');
    setSuccess('');
  }

  async function handleLogin(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') || '').trim();
    const senha = String(formData.get('senha') || '');

    if (!email || !senha) {
      setError('Informe e-mail e senha para entrar.');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await login(email, senha);
      navigate(homeForRole(user.nivel), { replace: true });
    } catch (requestError) {
      setError(requestError instanceof TypeError
        ? 'Não foi possível conectar ao servidor. Verifique se o backend está iniciado.'
        : requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    const form = event.currentTarget;
    const formData = new FormData(form);
    const details = {
      nome: String(formData.get('nome') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      cpf: String(formData.get('cpf') || '').trim(),
      senha: String(formData.get('senha') || ''),
    };
    const confirmacao = String(formData.get('confirmacao') || '');

    if (!details.nome || !details.email || !details.cpf || !details.senha || !confirmacao) {
      setError('Preencha todos os campos.');
      return;
    }
    if (!form.elements.email.validity.valid) {
      setError('Informe um e-mail válido.');
      form.elements.email.focus();
      return;
    }
    if (!cpfIsValid(details.cpf)) {
      setError('Informe um CPF válido.');
      form.elements.cpf.focus();
      return;
    }
    if (details.senha.trim().length < 8 || new TextEncoder().encode(details.senha).length > 72) {
      setError('A senha deve ter ao menos 8 caracteres e até 72 bytes.');
      form.elements.senha.focus();
      return;
    }
    if (details.senha !== confirmacao) {
      setError('As senhas informadas não coincidem.');
      form.elements.confirmacao.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await register(details);
      setSuccess(result.mensagem || 'Cadastro realizado. Você já pode entrar.');
      form.reset();
      setMode('login');
    } catch (requestError) {
      setError(requestError instanceof TypeError
        ? 'Não foi possível conectar ao servidor. Verifique se o backend está iniciado.'
        : requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <a className="skip-link" href="#auth-main">Pular para o conteúdo</a>
      <div className="login-shell">
        <section className="scan-panel" aria-hidden="true">
          <div className="scan-content">
            <div className="brand-mark"><span>Eletrodex</span><span className="dot">●</span></div>
            <div className="barcode-wrap">
              <div className="scan-line" />
              <div className="barcode">
                {barcodeHeights.map((height, index) => <span key={index} style={{ height: `${height}%` }} />)}
              </div>
            </div>
            <div className="scan-text">
              <h2>Cada produto acompanhado do estoque à venda.</h2>
              <p>Cadastro, movimentação e controle de produtos em um só lugar, com acesso organizado por cargo.</p>
            </div>
          </div>
        </section>

        <main className="login-panel" id="auth-main">
          <button
            type="button"
            className="contrast-toggle"
            aria-pressed={highContrast}
            onClick={() => {
              const next = !highContrast;
              setHighContrast(next);
              document.body.classList.toggle('high-contrast', next);
            }}
          >
            {highContrast ? 'Contraste padrão' : 'Alto contraste'}
          </button>

          <div className="login-card">
            <p className="eyebrow">Sistema de gerenciamento</p>
            <div className="auth-tabs" role="tablist" aria-label="Acesso ao Eletrodex">
              <button type="button" className={`auth-tab ${mode === 'login' ? 'active' : ''}`} role="tab" aria-selected={mode === 'login'} onClick={() => selectMode('login')}>Entrar</button>
              <button type="button" className={`auth-tab ${mode === 'register' ? 'active' : ''}`} role="tab" aria-selected={mode === 'register'} onClick={() => selectMode('register')}>Criar conta</button>
            </div>

            {location.state?.denied && <div className="form-error visible" role="alert">Seu cargo não tem acesso àquela página.</div>}
            {error && <div className="form-error visible" role="alert">{error}</div>}
            {success && <div className="form-error visible success" role="status">{success}</div>}

            {mode === 'login' ? (
              <section role="tabpanel" aria-label="Entrar">
                <h1>Entrar no Eletrodex</h1>
                <form onSubmit={handleLogin}>
                  <Field label="E-mail" id="login-email" name="email" type="email" autoComplete="email" placeholder="nome@empresa.com" required maxLength={100} />
                  <Field label="Senha" id="login-password" name="senha" type="password" autoComplete="current-password" placeholder="••••••••" required />
                  <p className="field-hint">Acesso conforme seu cargo: Administrador, Gerente, Estoquista, Vendedor ou Funcionário.</p>
                  <button type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Verificando...' : 'Entrar'}</button>
                  <div className="login-foot"><span>Entre com seu e-mail cadastrado</span><span>Suporte: TI</span></div>
                </form>
              </section>
            ) : (
              <section role="tabpanel" aria-label="Criar conta">
                <h1>Criar conta</h1>
                <form onSubmit={handleRegister}>
                  <Field label="Nome completo" id="register-name" name="nome" type="text" autoComplete="name" placeholder="Seu nome completo" required maxLength={100} />
                  <Field label="E-mail" id="register-email" name="email" type="email" autoComplete="email" placeholder="voce@empresa.com" required maxLength={100} />
                  <Field label="CPF" id="register-cpf" name="cpf" type="text" autoComplete="off" inputMode="numeric" placeholder="000.000.000-00" required maxLength={14} />
                  <Field label="Senha" id="register-password" name="senha" type="password" autoComplete="new-password" placeholder="Mínimo de 8 caracteres" required minLength={8} maxLength={72} />
                  <Field label="Confirmar senha" id="register-confirmation" name="confirmacao" type="password" autoComplete="new-password" placeholder="Digite a senha novamente" required minLength={8} maxLength={72} />
                  <button type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Enviando...' : 'Criar conta'}</button>
                  <p className="field-hint register-hint">Novas contas recebem o perfil Funcionário.</p>
                </form>
              </section>
            )}
          </div>
        </main>
      </div>
    </>
  );
}