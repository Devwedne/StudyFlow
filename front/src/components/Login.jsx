import { useRef, useState } from 'react'
import { LockKeyhole, Mail } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import FormField from './form/FormField'
import PasswordToggle from './form/PasswordToggle'
import SubmitButton from './form/SubmitButton'
import { fazerLogin } from '../services/api'

function Login({ onLogin }) {
  const [email, setEmail] = useState(() => localStorage.getItem('studyflow-email') ?? '')
  const [senha, setSenha] = useState('')
  const [lembrar, setLembrar] = useState(() => Boolean(localStorage.getItem('studyflow-email')))
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erros, setErros] = useState({})
  const [carregando, setCarregando] = useState(false)
  const emailRef = useRef(null)
  const senhaRef = useRef(null)
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()

    const emailLimpo = email.trim()
    const novosErros = {}

    if (!emailLimpo) {
      novosErros.email = 'Digite seu e-mail.'
    } else if (!/^\S+@\S+\.\S+$/.test(emailLimpo)) {
      novosErros.email = 'Digite um e-mail válido.'
    }

    if (!senha) {
      novosErros.senha = 'Digite sua senha.'
    }

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros)
      if (novosErros.email) emailRef.current?.focus()
      else senhaRef.current?.focus()
      return
    }

    setErros({})
    setCarregando(true)

    try {
      const usuario = await fazerLogin(emailLimpo, senha)

      if (lembrar) localStorage.setItem('studyflow-email', emailLimpo)
      else localStorage.removeItem('studyflow-email')

      onLogin(usuario)
      navigate('/home')
    } catch (error) {
      setErros({ formulario: error.message })
      emailRef.current?.focus()
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="card auth-card login-card">
      <div className="login-card-body">
        <header className="card-heading">
          <h2>Bem-vindo de volta</h2>
          <p>Acesse sua conta para continuar</p>
        </header>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <FormField
            ref={emailRef}
            id="login-email"
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            value={email}
            error={erros.email}
            Icon={Mail}
            onChange={(event) => {
              setEmail(event.target.value)
              if (erros.email || erros.formulario) setErros({})
            }}
          />

          <FormField
            ref={senhaRef}
            id="login-senha"
            label="Senha"
            type={mostrarSenha ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="current-password"
            value={senha}
            error={erros.senha}
            Icon={LockKeyhole}
            endAdornment={(
              <PasswordToggle
                visible={mostrarSenha}
                onToggle={() => setMostrarSenha((valorAtual) => !valorAtual)}
              />
            )}
            onChange={(event) => {
              setSenha(event.target.value)
              if (erros.senha || erros.formulario) setErros({})
            }}
          />

          <label className="remember-me">
            <input
              type="checkbox"
              checked={lembrar}
              onChange={(event) => setLembrar(event.target.checked)}
            />
            <span>Lembrar de mim</span>
          </label>

          {erros.formulario && (
            <p
              className="form-message form-error"
              role="alert"
              aria-live="polite"
            >
              {erros.formulario}
            </p>
          )}

          <SubmitButton showArrow disabled={carregando}>
            {carregando ? 'Entrando...' : 'Entrar'}
          </SubmitButton>
        </form>

        <p className="switch-page">
          Não tem uma conta? <Link to="/cadastro">Criar conta</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
