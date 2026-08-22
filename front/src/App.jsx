import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import Cadastro from './components/Cadastro'
import Home from './components/Home'
import Login from './components/Login'
import Materias from './components/Materias'
import Trabalhos from './components/Trabalhos'
import AccessLayout from './components/layout/AccessLayout'
import ProtectedRoute from './components/layout/ProtectedRoute'
import PeriodoLetivoProvider from './contexts/PeriodoLetivoProvider'
import './App.css'

const CHAVE_SESSAO = 'studyflow-usuario'

function lerUsuario(storage) {
  try {
    const valorSalvo = storage.getItem(CHAVE_SESSAO)
    if (!valorSalvo) return null

    const usuario = JSON.parse(valorSalvo)
    const usuarioValido = usuario
      && typeof usuario.id === 'number'
      && typeof usuario.nome === 'string'
      && typeof usuario.email === 'string'

    if (!usuarioValido) {
      storage.removeItem(CHAVE_SESSAO)
      return null
    }

    return usuario
  } catch {
    storage.removeItem(CHAVE_SESSAO)
    return null
  }
}

function recuperarSessao() {
  return lerUsuario(localStorage) ?? lerUsuario(sessionStorage)
}

function App() {
  const [usuarioLogado, setUsuarioLogado] = useState(recuperarSessao)

  function entrar(usuario, lembrar) {
    const usuarioPublico = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      ...(usuario.criadoEm ? { criadoEm: usuario.criadoEm } : {}),
    }

    localStorage.removeItem(CHAVE_SESSAO)
    sessionStorage.removeItem(CHAVE_SESSAO)

    const storage = lembrar ? localStorage : sessionStorage
    storage.setItem(CHAVE_SESSAO, JSON.stringify(usuarioPublico))
    setUsuarioLogado(usuarioPublico)
  }

  function sair() {
    localStorage.removeItem(CHAVE_SESSAO)
    sessionStorage.removeItem(CHAVE_SESSAO)
    setUsuarioLogado(null)
  }

  return (
    <BrowserRouter>
      <PeriodoLetivoProvider
        key={usuarioLogado?.id ?? 'sem-usuario'}
        usuarioLogado={usuarioLogado}
      >
        <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/cadastro"
          element={(
            <AccessLayout>
              <Cadastro />
            </AccessLayout>
          )}
        />
        <Route
          path="/login"
          element={(
            <AccessLayout>
              <Login onLogin={entrar} />
            </AccessLayout>
          )}
        />
        <Route
          path="/home"
          element={(
            <ProtectedRoute usuario={usuarioLogado}>
              <main className="home-page">
                <Home
                  usuarioLogado={usuarioLogado}
                  onSair={sair}
                />
              </main>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/materias"
          element={(
            <ProtectedRoute usuario={usuarioLogado}>
              <main className="home-page">
                <Materias
                  usuarioLogado={usuarioLogado}
                  onSair={sair}
                />
              </main>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/trabalhos"
          element={(
            <ProtectedRoute usuario={usuarioLogado}>
              <main className="home-page">
                <Trabalhos
                  usuarioLogado={usuarioLogado}
                  onSair={sair}
                />
              </main>
            </ProtectedRoute>
          )}
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </PeriodoLetivoProvider>
    </BrowserRouter>
  )
}

export default App
