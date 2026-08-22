import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  Pencil,
  Plus,
} from 'lucide-react'
import { useNavigate } from 'react-router'
import ManagementLayout from './layout/ManagementLayout'
import usePeriodoLetivo from '../hooks/usePeriodoLetivo'
import {
  atualizarTrabalho as atualizarTrabalhoNaApi,
  cadastrarTrabalho as cadastrarTrabalhoNaApi,
  excluirTrabalho as excluirTrabalhoNaApi,
  listarMaterias,
  listarTrabalhos,
} from '../services/api'

const formularioVazio = {
  titulo: '',
  materiaId: '',
  dataEntrega: '',
  prioridade: 'media',
  status: 'pendente',
}

const rotulosPrioridade = { baixa: 'Baixa', media: 'Média', alta: 'Alta' }
const rotulosStatus = {
  pendente: 'Pendente',
  andamento: 'Em Andamento',
  atrasado: 'Em atraso',
  concluido: 'Concluído',
}

function classeStatus(status) {
  if (status === 'concluido') return 'complete'
  if (status === 'andamento') return 'progress'
  if (status === 'atrasado') return 'overdue'
  return 'pending'
}

function iconeStatus(status) {
  if (status === 'concluido') return CheckCircle2
  if (status === 'andamento') return Clock3
  if (status === 'atrasado') return AlertTriangle
  return Circle
}

function formatarData(data) {
  if (!data) return '—'
  return new Intl.DateTimeFormat('pt-BR').format(new Date(`${data}T12:00:00`))
}

function obterHojeLocal() {
  const agora = new Date()
  return new Date(agora.getTime() - agora.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10)
}

function obterStatusExibicao(trabalho) {
  const atrasado = trabalho.status !== 'concluido'
    && (trabalho.atrasado ?? trabalho.dataEntrega < obterHojeLocal())
  return atrasado ? 'atrasado' : trabalho.status
}

function partesDaData(data) {
  const dataLocal = new Date(`${data}T12:00:00`)
  return {
    mes: new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(dataLocal).replace('.', '').toUpperCase(),
    dia: String(dataLocal.getDate()).padStart(2, '0'),
  }
}

function Trabalhos({ usuarioLogado, onSair }) {
  const [trabalhos, setTrabalhos] = useState([])
  const [materias, setMaterias] = useState([])
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState('todos')
  const [modalAberto, setModalAberto] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [formulario, setFormulario] = useState(formularioVazio)
  const [erro, setErro] = useState('')
  const [erroPagina, setErroPagina] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [periodoCarregadoId, setPeriodoCarregadoId] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [excluindo, setExcluindo] = useState(false)
  const primeiroCampoRef = useRef(null)
  const navigate = useNavigate()
  const {
    carregandoPeriodo,
    periodoAtual,
    periodoSelecionado,
    periodoSelecionadoId,
  } = usePeriodoLetivo()

  useEffect(() => {
    if (!periodoSelecionadoId) return undefined

    let ativo = true

    Promise.all([
      listarTrabalhos(usuarioLogado.id, periodoSelecionadoId),
      listarMaterias(usuarioLogado.id, periodoSelecionadoId),
    ])
      .then(([dadosTrabalhos, dadosMaterias]) => {
        if (!ativo) return
        setTrabalhos(dadosTrabalhos)
        setMaterias(dadosMaterias)
        setErroPagina('')
      })
      .catch((error) => {
        if (ativo) setErroPagina(error.message)
      })
      .finally(() => {
        if (ativo) setPeriodoCarregadoId(periodoSelecionadoId)
      })

    return () => {
      ativo = false
    }
  }, [periodoSelecionadoId, usuarioLogado.id])

  const carregando = carregandoPeriodo || (
    Boolean(periodoSelecionadoId)
    && periodoCarregadoId !== periodoSelecionadoId
  )

  const materiasAtuais = useMemo(
    () => materias.filter((materia) => materia.periodoId === periodoSelecionadoId),
    [materias, periodoSelecionadoId],
  )
  const trabalhosAtuais = useMemo(
    () => trabalhos.filter((trabalho) => trabalho.periodoId === periodoSelecionadoId),
    [periodoSelecionadoId, trabalhos],
  )

  const trabalhosFiltrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR')

    return trabalhosAtuais.filter((trabalho) => {
      const correspondeBusca = [trabalho.titulo, trabalho.materiaNome, formatarData(trabalho.dataEntrega)]
        .some((valor) => valor.toLocaleLowerCase('pt-BR').includes(termo))
      const correspondeFiltro = filtro === 'todos' || obterStatusExibicao(trabalho) === filtro
      return correspondeBusca && correspondeFiltro
    })
  }, [busca, filtro, trabalhosAtuais])

  const resumo = useMemo(() => {
    const concluidos = trabalhosAtuais.filter((trabalho) => trabalho.status === 'concluido').length
    return {
      pendentes: trabalhosAtuais.filter((trabalho) => obterStatusExibicao(trabalho) === 'pendente').length,
      andamento: trabalhosAtuais.filter((trabalho) => obterStatusExibicao(trabalho) === 'andamento').length,
      atrasados: trabalhosAtuais.filter((trabalho) => obterStatusExibicao(trabalho) === 'atrasado').length,
      concluidos,
      percentual: trabalhosAtuais.length > 0 ? Math.round((concluidos / trabalhosAtuais.length) * 100) : 0,
    }
  }, [trabalhosAtuais])

  const proximosPrazos = useMemo(() => trabalhosAtuais
    .filter((trabalho) => (
      trabalho.status !== 'concluido'
      && trabalho.dataEntrega >= obterHojeLocal()
    ))
    .slice(0, 3), [trabalhosAtuais])

  function abrirNovoTrabalho() {
    setEditandoId(null)
    setFormulario({ ...formularioVazio, materiaId: materiasAtuais[0] ? String(materiasAtuais[0].id) : '' })
    setErro('')
    setModalAberto(true)
    window.setTimeout(() => primeiroCampoRef.current?.focus(), 0)
  }

  function abrirEdicao(trabalho) {
    setEditandoId(trabalho.id)
    setFormulario({
      titulo: trabalho.titulo,
      materiaId: String(trabalho.materiaId),
      dataEntrega: trabalho.dataEntrega,
      prioridade: trabalho.prioridade,
      status: trabalho.status,
    })
    setErro('')
    setModalAberto(true)
    window.setTimeout(() => primeiroCampoRef.current?.focus(), 0)
  }

  async function salvarTrabalho(event) {
    event.preventDefault()
    const titulo = formulario.titulo.trim()
    const materiaId = Number(formulario.materiaId)

    if (!titulo || !materiaId || !formulario.dataEntrega) {
      setErro('Preencha trabalho, matéria e data de entrega.')
      primeiroCampoRef.current?.focus()
      return
    }

    if (
      periodoAtual
      && (
        formulario.dataEntrega < periodoAtual.dataInicio
        || formulario.dataEntrega > periodoAtual.dataTermino
      )
    ) {
      setErro(
        `A entrega deve ficar entre ${formatarData(periodoAtual.dataInicio)} e ${formatarData(periodoAtual.dataTermino)}.`,
      )
      return
    }

    const dados = {
      titulo,
      materiaId,
      dataEntrega: formulario.dataEntrega,
      prioridade: formulario.prioridade,
      status: formulario.status,
    }
    setSalvando(true)

    try {
      if (editandoId) {
        const atualizado = await atualizarTrabalhoNaApi(usuarioLogado.id, editandoId, dados)
        setTrabalhos((atuais) => atuais.map((trabalho) => trabalho.id === atualizado.id ? atualizado : trabalho))
        setMensagem('Trabalho atualizado com sucesso.')
      } else {
        const novo = await cadastrarTrabalhoNaApi(usuarioLogado.id, dados)
        setTrabalhos((atuais) => [...atuais, novo].sort((a, b) => a.dataEntrega.localeCompare(b.dataEntrega)))
        setMensagem('Trabalho adicionado com sucesso.')
      }
      setModalAberto(false)
      setErro('')
    } catch (error) {
      setErro(error.message)
    } finally {
      setSalvando(false)
    }
  }

  async function excluirTrabalho() {
    if (!editandoId) return
    setExcluindo(true)

    try {
      await excluirTrabalhoNaApi(usuarioLogado.id, editandoId)
      setTrabalhos((atuais) => atuais.filter((trabalho) => trabalho.id !== editandoId))
      setModalAberto(false)
      setMensagem('Trabalho removido.')
    } catch (error) {
      setErro(error.message)
    } finally {
      setExcluindo(false)
    }
  }

  return (
    <ManagementLayout
      paginaAtiva="trabalhos"
      usuarioLogado={usuarioLogado}
      onSair={onSair}
      topbar={{ titulo: 'Trabalhos', placeholder: 'Buscar trabalhos...', busca, onBusca: setBusca }}
    >
      <section className="management-canvas work-page" aria-labelledby="meus-trabalhos-titulo">
        <div className="work-main-column">
          <header className="work-page-heading">
            <div>
              <h1 id="meus-trabalhos-titulo">Meus Trabalhos</h1>
              <p>Entregas acadêmicas vinculadas ao período {periodoSelecionado}.</p>
            </div>
            <button className="management-primary-button" type="button" disabled={materiasAtuais.length === 0} onClick={abrirNovoTrabalho}>
              <Plus aria-hidden="true" />
              Novo Trabalho
            </button>
          </header>

          {erroPagina && <p className="management-form-error" role="alert">{erroPagina}</p>}
          {carregando && <p className="management-empty-result" role="status">Carregando trabalhos...</p>}
          {!carregando && materiasAtuais.length === 0 && (
            <p className="management-empty-result">Cadastre uma matéria neste período antes de adicionar trabalhos.</p>
          )}

          <div className="work-filter-row" aria-label="Filtrar trabalhos">
            {[
              ['todos', 'Todos'],
              ['pendente', 'Pendentes'],
              ['andamento', 'Em Andamento'],
              ['atrasado', 'Em atraso'],
              ['concluido', 'Concluídos'],
            ].map(([valor, rotulo]) => (
              <button className={filtro === valor ? 'active' : ''} type="button" aria-pressed={filtro === valor} key={valor} onClick={() => setFiltro(valor)}>
                {rotulo}
              </button>
            ))}
          </div>

          <section className="work-table-card" aria-label="Lista de trabalhos">
            <div className="work-table-scroll">
              <div className="work-table-row work-table-header" role="row">
                <span>Trabalho</span><span>Matéria</span><span>Data de<br />Entrega</span>
                <span>Prioridade</span><span>Status</span><span>Ações</span>
              </div>

              {trabalhosFiltrados.map((trabalho) => {
                const statusExibicao = obterStatusExibicao(trabalho)
                const IconeStatus = iconeStatus(statusExibicao)
                return (
                  <article className="work-table-row work-table-data" key={trabalho.id}>
                    <strong>{trabalho.titulo}</strong>
                    <span>{trabalho.materiaNome}</span>
                    <time>{formatarData(trabalho.dataEntrega)}</time>
                    <span className={`work-priority priority-${trabalho.prioridade}`}>
                      {trabalho.prioridade !== 'baixa' && <AlertTriangle aria-hidden="true" />}
                      {rotulosPrioridade[trabalho.prioridade]}
                    </span>
                    <span className={`work-status status-${classeStatus(statusExibicao)}`}>
                      <IconeStatus aria-hidden="true" />{rotulosStatus[statusExibicao]}
                    </span>
                    <button className="work-edit-button" type="button" aria-label={`Editar ${trabalho.titulo}`} onClick={() => abrirEdicao(trabalho)}>
                      <Pencil aria-hidden="true" />
                    </button>
                  </article>
                )
              })}

              {!carregando && trabalhosFiltrados.length === 0 && (
                <p className="management-empty-result" role="status">Nenhum trabalho encontrado neste período.</p>
              )}
            </div>
            <footer className="work-table-footer">
              <span>Mostrando {trabalhosFiltrados.length} de {trabalhosAtuais.length} trabalhos</span>
            </footer>
          </section>
        </div>

        <aside className="work-summary-column" aria-label="Resumo de trabalhos">
          <section className="work-summary-card">
            <h2>Visão Geral</h2>
            <div className="work-overview-grid">
              <article><span><Circle aria-hidden="true" /> Pendentes</span><strong>{resumo.pendentes}</strong></article>
              <article className="overview-progress"><span><Clock3 aria-hidden="true" /> Em Andamento</span><strong>{resumo.andamento}</strong></article>
              <article className="overview-overdue"><span><AlertTriangle aria-hidden="true" /> Em atraso</span><strong>{resumo.atrasados}</strong></article>
              <article className="overview-complete">
                <span><CheckCircle2 aria-hidden="true" /> Concluídos</span><strong>{resumo.concluidos}</strong>
                <div className="completion-ring" aria-label={`${resumo.percentual}% concluído`} style={{ background: `conic-gradient(#10b981 0 ${resumo.percentual}%, #d1fae5 ${resumo.percentual}% 100%)` }}>
                  <small>{resumo.percentual}%</small>
                </div>
              </article>
            </div>
          </section>

          <section className="work-summary-card deadlines-card">
            <header><h2>Próximos Prazos</h2><button type="button" onClick={() => setFiltro('todos')}>Ver todos</button></header>
            <div className="deadline-list">
              {proximosPrazos.map((trabalho) => {
                const data = partesDaData(trabalho.dataEntrega)
                return (
                  <article key={trabalho.id}>
                    <time><small>{data.mes}</small><strong>{data.dia}</strong></time>
                    <span><strong>{trabalho.titulo}</strong><small>{trabalho.materiaNome}</small></span>
                  </article>
                )
              })}
              {proximosPrazos.length === 0 && <p className="empty-state">Nenhum prazo neste período.</p>}
            </div>
            <button className="open-calendar-button" type="button" onClick={() => navigate('/home')}>
              <CalendarDays aria-hidden="true" />Abrir Dashboard
            </button>
          </section>
        </aside>
      </section>

      {modalAberto && (
        <div className="management-modal-backdrop" role="presentation" onMouseDown={() => !salvando && setModalAberto(false)}>
          <section className="management-modal" role="dialog" aria-modal="true" aria-labelledby="trabalho-modal-titulo" onMouseDown={(event) => event.stopPropagation()}>
            <h2 id="trabalho-modal-titulo">{editandoId ? 'Editar Trabalho' : 'Novo Trabalho'}</h2>
            <p>O trabalho será associado ao período {periodoSelecionado}.</p>
            <form onSubmit={salvarTrabalho} noValidate>
              <label>
                <span className="management-field-label">Trabalho <span aria-hidden="true">*</span></span>
                <input ref={primeiroCampoRef} value={formulario.titulo} onChange={(event) => setFormulario((atual) => ({ ...atual, titulo: event.target.value }))} placeholder="Título do trabalho" />
              </label>
              <label>
                <span className="management-field-label">Matéria <span aria-hidden="true">*</span></span>
                <select value={formulario.materiaId} onChange={(event) => setFormulario((atual) => ({ ...atual, materiaId: event.target.value }))}>
                  {materiasAtuais.map((materia) => <option value={materia.id} key={materia.id}>{materia.nome}</option>)}
                </select>
              </label>
              <label>
                <span className="management-field-label">Data de entrega <span aria-hidden="true">*</span></span>
                <input
                  type="date"
                  min={periodoAtual?.dataInicio || undefined}
                  max={periodoAtual?.dataTermino || undefined}
                  value={formulario.dataEntrega}
                  onChange={(event) => setFormulario((atual) => ({ ...atual, dataEntrega: event.target.value }))}
                />
              </label>
              <div className="management-form-row">
                <label>Prioridade<select value={formulario.prioridade} onChange={(event) => setFormulario((atual) => ({ ...atual, prioridade: event.target.value }))}><option value="baixa">Baixa</option><option value="media">Média</option><option value="alta">Alta</option></select></label>
                <label>Status<select value={formulario.status} onChange={(event) => setFormulario((atual) => ({ ...atual, status: event.target.value }))}><option value="pendente">Pendente</option><option value="andamento">Em Andamento</option><option value="concluido">Concluído</option></select></label>
              </div>
              {erro && <p className="management-form-error" role="alert">{erro}</p>}
              <div className="management-modal-actions">
                {editandoId && <button type="button" disabled={salvando || excluindo} onClick={excluirTrabalho}>{excluindo ? 'Excluindo...' : 'Excluir'}</button>}
                <button type="button" disabled={salvando || excluindo} onClick={() => setModalAberto(false)}>Cancelar</button>
                <button type="submit" disabled={salvando || excluindo}>{salvando ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {mensagem && <button className="management-toast" type="button" aria-live="polite" onClick={() => setMensagem('')}>{mensagem}</button>}
    </ManagementLayout>
  )
}

export default Trabalhos
