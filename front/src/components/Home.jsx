import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  Bell,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Flag,
  Search,
  TrendingUp,
  UserRound,
} from 'lucide-react'
import Sidebar from './Sidebar'
import PeriodoLetivoSelector from './PeriodoLetivoSelector'
import { ScheduleSection, StatisticsGrid, SubjectProgressSection, TasksSection } from './dashboard/DashboardSections'
import UserPopover from './dashboard/UserPopover'
import usePeriodoLetivo from '../hooks/usePeriodoLetivo'
import { listarUsuarios, obterDashboard } from '../services/api'

const rotulosPrioridade = { baixa: 'Baixa', media: 'Média', alta: 'Alta' }
const tonsPrioridade = { baixa: 'low', media: 'medium', alta: 'high' }
const MATERIAS_VAZIAS = []

function formatarData(data) {
  if (!data) return '—'
  return new Intl.DateTimeFormat('pt-BR').format(new Date(`${data}T12:00:00`))
}

function contemTermo(valores, termo) {
  return valores.some((valor) => String(valor).toLocaleLowerCase('pt-BR').includes(termo))
}

function Home({ usuarioLogado, onSair }) {
  const [busca, setBusca] = useState('')
  const [notificacoesAbertas, setNotificacoesAbertas] = useState(false)
  const [perfilAberto, setPerfilAberto] = useState(false)
  const [usuarios, setUsuarios] = useState([])
  const [usuariosCarregando, setUsuariosCarregando] = useState(true)
  const [usuariosErro, setUsuariosErro] = useState('')
  const [dashboard, setDashboard] = useState(null)
  const [erroDashboard, setErroDashboard] = useState('')
  const [periodoDashboardCarregadoId, setPeriodoDashboardCarregadoId] = useState(null)
  const {
    carregandoPeriodo,
    periodoSelecionado,
    periodoSelecionadoId,
  } = usePeriodoLetivo()

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

  useEffect(() => {
    if (!periodoSelecionadoId) return undefined

    let ativo = true

    obterDashboard(usuarioLogado.id, periodoSelecionadoId)
      .then((dados) => {
        if (!ativo) return
        setDashboard(dados)
        setErroDashboard('')
      })
      .catch((error) => {
        if (ativo) setErroDashboard(error.message)
      })
      .finally(() => {
        if (ativo) setPeriodoDashboardCarregadoId(periodoSelecionadoId)
      })

    return () => {
      ativo = false
    }
  }, [periodoSelecionadoId, usuarioLogado.id])

  const carregandoDashboard = carregandoPeriodo || (
    Boolean(periodoSelecionadoId)
    && periodoDashboardCarregadoId !== periodoSelecionadoId
  )
  const termo = busca.trim().toLocaleLowerCase('pt-BR')
  const dashboardAtual = dashboard?.periodo.id === periodoSelecionadoId ? dashboard : null
  const materias = dashboardAtual?.materias ?? MATERIAS_VAZIAS
  const agendaFiltrada = useMemo(() => (dashboardAtual?.proximasAvaliacoes ?? [])
    .map((avaliacao, indice) => ({
      horario: formatarData(avaliacao.data),
      titulo: avaliacao.titulo,
      local: materias.find((materia) => materia.id === avaliacao.materiaId)?.nome ?? 'Matéria',
      tom: ['purple', 'slate', 'green'][indice % 3],
    }))
    .filter((item) => contemTermo([item.titulo, item.local, item.horario], termo)), [dashboardAtual?.proximasAvaliacoes, materias, termo])
  const trabalhosFiltrados = useMemo(() => (dashboardAtual?.proximosTrabalhos ?? [])
    .map((trabalho) => ({
      titulo: trabalho.titulo,
      materia: trabalho.materiaNome,
      prazo: formatarData(trabalho.dataEntrega),
      prioridade: rotulosPrioridade[trabalho.prioridade],
      tom: tonsPrioridade[trabalho.prioridade],
    }))
    .filter((trabalho) => contemTermo([trabalho.titulo, trabalho.materia, trabalho.prazo], termo)), [dashboardAtual?.proximosTrabalhos, termo])
  const progressoMaterias = useMemo(() => materias.map((materia, indice) => ({
    id: materia.id,
    nome: materia.nome,
    percentual: materia.progresso,
    resumo: materia.status === 'concluida' ? 'Disciplina concluída' : 'Disciplina em andamento',
    tom: ['purple', 'amber', 'green'][indice % 3],
  })), [materias])
  const estatisticas = useMemo(() => {
    const resumo = dashboardAtual?.resumo
    const media = resumo?.mediaGeral === null || resumo?.mediaGeral === undefined
      ? '—'
      : Number(resumo.mediaGeral).toFixed(1).replace('.', ',')

    return [
      {
        titulo: 'Disciplinas',
        valor: String(resumo?.disciplinas ?? 0),
        detalhe: `${resumo?.concluidas ?? 0} concluída(s)`,
        tom: 'success',
        Icone: BookOpen,
      },
      {
        titulo: 'Atividades pendentes',
        valor: String(resumo?.trabalhosPendentes ?? 0),
        detalhe: `Período ${periodoSelecionado}`,
        tom: 'neutral',
        Icone: ClipboardList,
      },
      {
        titulo: 'Atividades em atraso',
        valor: String(resumo?.trabalhosEmAtraso ?? 0),
        detalhe: `Período ${periodoSelecionado}`,
        tom: 'danger',
        Icone: AlertTriangle,
      },
      {
        titulo: 'Atividades concluídas',
        valor: String(resumo?.trabalhosConcluidos ?? 0),
        detalhe: `Período ${periodoSelecionado}`,
        tom: 'success',
        Icone: CheckCircle2,
      },
      {
        titulo: 'Progresso geral',
        valor: `${resumo?.progressoGeral ?? 0}%`,
        progresso: resumo?.progressoGeral ?? 0,
        tom: 'success',
        Icone: Flag,
      },
      {
        titulo: 'Média geral',
        valor: media,
        detalhe: `${resumo?.aprovadas ?? 0} aprovada(s) · ${resumo?.reprovadas ?? 0} reprovada(s)`,
        tom: 'neutral',
        Icone: TrendingUp,
      },
    ]
  }, [dashboardAtual?.resumo, periodoSelecionado])

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
            <input id="dashboard-search-input" type="search" placeholder="Buscar no período..." value={busca} onChange={(event) => setBusca(event.target.value)} />
          </label>

          <div className="dashboard-actions">
            <PeriodoLetivoSelector />
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
              {(
                (dashboardAtual?.resumo.trabalhosPendentes ?? 0)
                + (dashboardAtual?.resumo.trabalhosEmAtraso ?? 0)
              ) > 0 && <span aria-hidden="true" />}
            </button>
            <button
              className="dashboard-avatar-button"
              type="button"
              aria-label={`Abrir usuários cadastrados. Usuário atual: ${usuarioLogado.nome}`}
              aria-expanded={perfilAberto}
              onClick={() => {
                setPerfilAberto((aberto) => !aberto)
                setNotificacoesAbertas(false)
              }}
            >
              <UserRound aria-hidden="true" />
            </button>

            {notificacoesAbertas && (
              <div className="dashboard-popover notification-popover" role="status">
                <strong>{dashboardAtual?.resumo.trabalhosPendentes ?? 0} trabalho(s) pendente(s).</strong>
                <strong>{dashboardAtual?.resumo.trabalhosEmAtraso ?? 0} trabalho(s) em atraso.</strong>
                <span>Dados referentes ao período {periodoSelecionado}.</span>
              </div>
            )}
            {perfilAberto && (
              <UserPopover usuarioLogado={usuarioLogado} usuarios={usuarios} carregando={usuariosCarregando} erro={usuariosErro} />
            )}
          </div>
        </header>

        <section className="dashboard-canvas" id="visao-geral">
          <header className="dashboard-title">
            <h1>Visão Geral</h1>
            <p>Desempenho acadêmico consolidado do período {periodoSelecionado}.</p>
          </header>
          {carregandoDashboard && (
            <p className="management-empty-result" role="status">Carregando Dashboard...</p>
          )}
          {erroDashboard && <p className="management-form-error" role="alert">{erroDashboard}</p>}
          {!carregandoDashboard && (
            <>
              <StatisticsGrid estatisticas={estatisticas} />
              <div className="dashboard-middle">
                <ScheduleSection itens={agendaFiltrada} onVerTudo={() => irPara('agenda-lista')} />
                <TasksSection trabalhos={trabalhosFiltrados} />
              </div>
              <SubjectProgressSection materias={progressoMaterias} />
            </>
          )}
        </section>
      </div>
    </div>
  )
}

export default Home
