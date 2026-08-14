import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import Cadastro from './components/Cadastro'
import Home from './components/Home'
import Login from './components/Login'
import Materias from './components/Materias'
import Trabalhos from './components/Trabalhos'
import AccessLayout from './components/layout/AccessLayout'
import ProtectedRoute from './components/layout/ProtectedRoute'
import { usuariosIniciais } from './data/usuarios'
import './App.css'

function App() {
  const [usuarios, setUsuarios] = useState(usuariosIniciais)
  const [usuarioLogado, setUsuarioLogado] = useState(null)

  function cadastrar(novoUsuario) {
    setUsuarios((usuariosAtuais) => {
      const proximoId = Math.max(0, ...usuariosAtuais.map((usuario) => usuario.id)) + 1
      return [...usuariosAtuais, { id: proximoId, ...novoUsuario }]
    })
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/cadastro"
          element={(
            <AccessLayout>
              <Cadastro usuarios={usuarios} onCadastrar={cadastrar} />
            </AccessLayout>
          )}
        />
        <Route
          path="/login"
          element={(
            <AccessLayout>
              <Login usuarios={usuarios} onLogin={setUsuarioLogado} />
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
                  usuarios={usuarios}
                  onSair={() => setUsuarioLogado(null)}
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
                  onSair={() => setUsuarioLogado(null)}
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
                  onSair={() => setUsuarioLogado(null)}
                />
              </main>
            </ProtectedRoute>
          )}
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
