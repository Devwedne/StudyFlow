import { BookOpen, BriefcaseBusiness, LayoutDashboard } from 'lucide-react'
import { useNavigate } from 'react-router'
import studyFlowLogo from '../assets/studyflowlogo.png'

const itens = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    rota: '/home',
    Icone: LayoutDashboard,
  },
  {
    id: 'materias',
    label: 'Matérias',
    rota: '/materias',
    Icone: BookOpen,
  },
  {
    id: 'trabalhos',
    label: 'Trabalhos',
    rota: '/trabalhos',
    Icone: BriefcaseBusiness,
  },
]

function Sidebar({ paginaAtiva, onSair }) {
  const navigate = useNavigate()

  function sair() {
    onSair()
    navigate('/login')
  }

  return (
    <aside className="dashboard-sidebar" aria-label="Navegação principal">
      <button className="dashboard-brand" type="button" onClick={() => navigate('/home')}>
        <img src={studyFlowLogo} alt="StudyFlow" />
      </button>

      <nav className="dashboard-nav">
        {itens.map((item) => {
          const ativo = item.id === paginaAtiva
          const Icone = item.Icone

          return (
            <button
              className={`dashboard-nav-item${ativo ? ' active' : ''}`}
              type="button"
              aria-current={ativo ? 'page' : undefined}
              key={item.id}
              onClick={() => navigate(item.rota)}
            >
              <Icone aria-hidden="true" />
              {item.label}
            </button>
          )
        })}
      </nav>

      <button className="dashboard-logout" type="button" onClick={sair}>
        Sair
      </button>
    </aside>
  )
}

export default Sidebar
