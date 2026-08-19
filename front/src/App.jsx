import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import Cadastro from './components/Cadastro'
import Home from './components/Home'
import Login from './components/Login'
import Materias from './components/Materias'
import Trabalhos from './components/Trabalhos'
import AccessLayout from './components/layout/AccessLayout'
import ProtectedRoute from './components/layout/ProtectedRoute'
import './App.css'

function App() {
  const [usuarioLogado, setUsuarioLogado] = useState(null)

  return (
    <BrowserRouter>
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
              <Login onLogin={setUsuarioLogado} />
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
