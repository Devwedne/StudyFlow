import { useEffect, useMemo, useState } from 'react'
import { Bell, ClipboardList, Flag, Search, Timer, TrendingUp, UserRound } from 'lucide-react'
import Sidebar from './Sidebar'
import { ScheduleSection, StatisticsGrid, SubjectProgressSection, TasksSection } from './dashboard/DashboardSections'
import UserPopover from './dashboard/UserPopover'
import { listarUsuarios } from '../services/api'

const estatisticas = [
  {
    titulo: 'Horas estudadas',
    valor: '12h',
    detalhe: '+2h esta semana',
    tom: 'success',
    Icone: Timer,
  },
  {
    titulo: 'Trabalhos pendentes',
    valor: '4',
    detalhe: '2 para hoje',
    tom: 'danger',
    Icone: ClipboardList,
  },
  {
    titulo: 'Meta semanal',
    valor: '65%',
    progresso: 65,
    tom: 'success',
    Icone: Flag,
  },
  {
    titulo: 'Progresso geral',
    valor: '9,2',
    detalhe: 'Média estimada',
    tom: 'neutral',
    Icone: TrendingUp,
  },
]

const agenda = [
  {
    horario: '09:00',
    titulo: 'Cálculo II - Aula Prática',
    local: 'Sala 402 - Edifício de Exatas',
    tom: 'purple',
  },
  {
    horario: '11:30',
    titulo: 'Física Clássica',
    local: 'Sala 302',
    tom: 'slate',
  },
  {
    horario: '14:00',
    titulo: 'Grupo de Estudo: Programação',
    local: 'Biblioteca I',
    tom: 'green',
  },
]

const trabalhos = [
  {
    titulo: 'Lista de Exercícios 3',
    materia: 'Cálculo II',
    prazo: 'Hoje, 23:59',
    prioridade: 'Alta',
    tom: 'high',
  },
  {
    titulo: 'Projeto Final Pt. 1',
    materia: 'Sistemas',
    prazo: 'Amanhã',
    prioridade: 'Média',
    tom: 'medium',
  },
  {
    titulo: 'Resenha Artigo',
    materia: 'Metodologia',
    prazo: '15 Out',
    prioridade: 'Baixa',
    tom: 'low',
  },
  {
    titulo: 'Apresentação Slides',
    materia: 'Gestão',
    prazo: '18 Out',
    prioridade: 'Média',
    tom: 'medium',
  },
]

const progressoMaterias = [
  { nome: 'Cálculo II', percentual: 80, resumo: '4/5 Tópicos Concluídos', tom: 'purple' },
  { nome: 'Física Clássica', percentual: 45, resumo: '2/5 Tópicos Concluídos', tom: 'amber' },
  { nome: 'Sistemas Distribuídos', percentual: 95, resumo: '19/20 Tópicos Concluídos', tom: 'green' },
]

function contemTermo(valores, termo) {
  return valores.some((valor) => valor.toLocaleLowerCase('pt-BR').includes(termo))
}

function Home({ usuarioLogado, onSair }) {
  const [busca, setBusca] = useState('')
  const [notificacoesAbertas, setNotificacoesAbertas] = useState(false)
  const [perfilAberto, setPerfilAberto] = useState(false)
  const [usuarios, setUsuarios] = useState([])
  const [usuariosCarregando, setUsuariosCarregando] = useState(true)
  const [usuariosErro, setUsuariosErro] = useState('')

  useEffect(() => {
    let ativo = true

    listarUsuarios()
      .then((dados) => {
        if (ativo) setUsuarios(dados)
      })
      .catch((error) => {
        if (ativo) setUsuariosErro(error.message)
      })
      .finally(() => {
        if (ativo) setUsuariosCarregando(false)
      })

    return () => {
      ativo = false
    }
  }, [])

  const termo = busca.trim().toLocaleLowerCase('pt-BR')
  const agendaFiltrada = useMemo(
    () => agenda.filter((item) => contemTermo([item.titulo, item.local, item.horario], termo)),
    [termo],
  )
  const trabalhosFiltrados = useMemo(
    () => trabalhos.filter((item) => contemTermo([item.titulo, item.materia, item.prazo], termo)),
    [termo],
  )

  function irPara(secao) {
    document.getElementById(secao)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="dashboard-shell">
      <Sidebar paginaAtiva="dashboard" onSair={onSair} />

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <label className="dashboard-search" htmlFor="dashboard-search-input">
            <Search aria-hidden="true" />
            <input
              id="dashboard-search-input"
              type="search"
              placeholder="Search..."
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
            />
          </label>

          <div className="dashboard-actions">
            <button
              className="notification-button"
              type="button"
              aria-label="Notificações"
              aria-expanded={notificacoesAbertas}
              onClick={() => {
                setNotificacoesAbertas((abertas) => !abertas)
                setPerfilAberto(false)
              }}
            >
              <Bell aria-hidden="true" />
              <span aria-hidden="true" />
            </button>

            <button className="dashboard-avatar-button" type="button" aria-label={`Abrir usuários cadastrados. Usuário atual: ${usuarioLogado.nome}`} aria-expanded={perfilAberto} onClick={() => {
              setPerfilAberto((aberto) => !aberto)
              setNotificacoesAbertas(false)
            }}>
              <UserRound aria-hidden="true" />
            </button>

            {notificacoesAbertas && (
              <div className="dashboard-popover notification-popover" role="status">
                <strong>Você tem 2 trabalhos para hoje.</strong>
                <span>Confira os prazos na seção “Próximos Trabalhos”.</span>
              </div>
            )}

            {perfilAberto && (
              <UserPopover
                usuarioLogado={usuarioLogado}
                usuarios={usuarios}
                carregando={usuariosCarregando}
                erro={usuariosErro}
              />
            )}

          </div>
        </header>

        <section className="dashboard-canvas" id="visao-geral">
          <header className="dashboard-title">
            <h1>Visão Geral</h1>
            <p>Acompanhe seu desempenho acadêmico diário.</p>
          </header>

          <StatisticsGrid estatisticas={estatisticas} />

          <div className="dashboard-middle">
            <ScheduleSection itens={agendaFiltrada} onVerTudo={() => irPara('agenda-lista')} />
            <TasksSection trabalhos={trabalhosFiltrados} />
          </div>

          <SubjectProgressSection materias={progressoMaterias} />
        </section>
      </div>
    </div>
  )
}

export default Home
