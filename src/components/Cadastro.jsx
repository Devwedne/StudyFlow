import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import FormField from './form/FormField'
import SubmitButton from './form/SubmitButton'

function Cadastro({ usuarios, onCadastrar }) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [erro, setErro] = useState('')
  const navigate = useNavigate()

  function handleSubmit(event) {
    event.preventDefault()
    setErro('')

    const nomeLimpo = nome.trim()
    const emailLimpo = email.trim()

    if (!nomeLimpo || !emailLimpo || !senha || !confirmarSenha) {
      setErro('Preencha todos os campos.')
      return
    }

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.')
      return
    }

    if (usuarios.some((usuario) => usuario.email.toLowerCase() === emailLimpo.toLowerCase())) {
      setErro('Este e-mail já está cadastrado.')
      return
    }

    onCadastrar({ nome: nomeLimpo, email: emailLimpo, senha })
    navigate('/login')
  }

  return (
    <div className="card">
      <h2>Criar conta</h2>
      <p className="subtitle">Cadastre-se para organizar sua vida acadêmica.</p>

      <form onSubmit={handleSubmit} noValidate>
        <FormField id="cadastro-nome" label="Nome" placeholder="Seu nome completo" autoComplete="name" value={nome} onChange={(event) => setNome(event.target.value)} />

        <FormField id="cadastro-email" label="E-mail" type="email" placeholder="seuemail@uepb.br" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />

        <FormField id="cadastro-senha" label="Senha" type="password" placeholder="Crie uma senha" autoComplete="new-password" value={senha} onChange={(event) => setSenha(event.target.value)} />

        <FormField id="cadastro-confirmar-senha" label="Confirmar senha" type="password" placeholder="Confirme sua senha" autoComplete="new-password" value={confirmarSenha} onChange={(event) => setConfirmarSenha(event.target.value)} />

        {erro && <p className="erro" role="alert">{erro}</p>}
        <SubmitButton>Cadastrar</SubmitButton>
      </form>

      <p className="switch-page">
        Já tem conta? <Link to="/login">Entrar</Link>
      </p>
    </div>
  )
}

export default Cadastro
