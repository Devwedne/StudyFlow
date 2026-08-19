import { useMemo, useRef, useState } from 'react'
import { AlertTriangle, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Circle, Clock3, Pencil, Plus } from 'lucide-react'
import { useNavigate } from 'react-router'
import ManagementLayout from './layout/ManagementLayout'

const trabalhosIniciais = [
  {
    id: 1,
    titulo: 'Resenha Crítica - Dom Casmurro',
    materia: 'Literatura Brasileira',
    entrega: 'Hoje, 23:59',
    prioridade: 'Alta',
    status: 'Em Andamento',
  },
  {
    id: 2,
    titulo: 'Projeto Final de Software',
    materia: 'Engenharia de Software II',
    entrega: '15 Nov 2023',
    prioridade: 'Alta',
    status: 'Pendente',
  },
  {
    id: 3,
    titulo: 'Lista de Exercícios 04',
    materia: 'Cálculo III',
    entrega: '18 Nov 2023',
    prioridade: 'Média',
    status: 'Em Andamento',
  },
]

const prazos = [
  { periodo: 'HOJE', dia: '23', titulo: 'Resenha Crítica', materia: 'Literatura Brasileira', urgente: true },
  { periodo: 'NOV', dia: '15', titulo: 'Projeto Final', materia: 'Eng. de Software II' },
  { periodo: 'NOV', dia: '18', titulo: 'Lista Exercícios 04', materia: 'Cálculo III' },
]

const formularioVazio = {
  titulo: '',
  materia: '',
  entrega: '',
  prioridade: 'Média',
  status: 'Pendente',
}

function classeStatus(status) {
  if (status === 'Concluído') return 'complete'
  if (status === 'Em Andamento') return 'progress'
  return 'pending'
}

function iconeStatus(status) {
  if (status === 'Concluído') return CheckCircle2
  if (status === 'Em Andamento') return Clock3
  return Circle
}

function Trabalhos({ usuarioLogado, onSair }) {
  const [trabalhos, setTrabalhos] = useState(trabalhosIniciais)
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState('Todos')
  const [modalAberto, setModalAberto] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [formulario, setFormulario] = useState(formularioVazio)
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')
  const primeiroCampoRef = useRef(null)
  const navigate = useNavigate()

  const trabalhosFiltrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR')

    return trabalhos.filter((trabalho) => {
      const correspondeBusca = [trabalho.titulo, trabalho.materia, trabalho.entrega]
        .some((valor) => valor.toLocaleLowerCase('pt-BR').includes(termo))
      const correspondeFiltro = filtro === 'Todos'
        || (filtro === 'Pendentes' && trabalho.status === 'Pendente')
        || (filtro === 'Em Andamento' && trabalho.status === 'Em Andamento')
        || (filtro === 'Concluídos' && trabalho.status === 'Concluído')

      return correspondeBusca && correspondeFiltro
    })
  }, [busca, filtro, trabalhos])

  function abrirNovoTrabalho() {
    setEditandoId(null)
    setFormulario(formularioVazio)
    setErro('')
    setModalAberto(true)
    window.setTimeout(() => primeiroCampoRef.current?.focus(), 0)
  }

  function abrirEdicao(trabalho) {
    setEditandoId(trabalho.id)
    setFormulario({
      titulo: trabalho.titulo,
      materia: trabalho.materia,
      entrega: trabalho.entrega,
      prioridade: trabalho.prioridade,
      status: trabalho.status,
    })
    setErro('')
    setModalAberto(true)
    window.setTimeout(() => primeiroCampoRef.current?.focus(), 0)
  }

  function salvarTrabalho(event) {
    event.preventDefault()
    const titulo = formulario.titulo.trim()
    const materia = formulario.materia.trim()
    const entrega = formulario.entrega.trim()

    if (!titulo || !materia || !entrega) {
      setErro('Preencha trabalho, matéria e data de entrega.')
      primeiroCampoRef.current?.focus()
      return
    }

    if (editandoId) {
      setTrabalhos((atuais) => atuais.map((trabalho) => (
        trabalho.id === editandoId ? { ...trabalho, ...formulario, titulo, materia, entrega } : trabalho
      )))
      setMensagem('Trabalho atualizado com sucesso.')
    } else {
      setTrabalhos((atuais) => [
        ...atuais,
        {
          id: Math.max(0, ...atuais.map((trabalho) => trabalho.id)) + 1,
          ...formulario,
          titulo,
          materia,
          entrega,
        },
      ])
      setMensagem('Trabalho adicionado com sucesso.')
    }

    setModalAberto(false)
  }

  return (
    <ManagementLayout
      paginaAtiva="trabalhos"
      usuarioLogado={usuarioLogado}
      onSair={onSair}
      topbar={{
        titulo: 'Trabalhos',
        placeholder: 'Buscar trabalhos...',
        busca,
        onBusca: setBusca,
      }}
    >

        <section className="management-canvas work-page" aria-labelledby="meus-trabalhos-titulo">
          <div className="work-main-column">
            <header className="work-page-heading">
              <div>
                <h1 id="meus-trabalhos-titulo">Meus Trabalhos</h1>
                <p>Gerencie e acompanhe o status das suas entregas acadêmicas.</p>
              </div>
              <button className="management-primary-button" type="button" onClick={abrirNovoTrabalho}>
                <Plus aria-hidden="true" />
                Novo Trabalho
              </button>
            </header>

            <div className="work-filter-row" aria-label="Filtrar trabalhos">
              {['Todos', 'Pendentes', 'Em Andamento', 'Concluídos'].map((opcao) => (
                <button
                  className={filtro === opcao ? 'active' : ''}
                  type="button"
                  aria-pressed={filtro === opcao}
                  key={opcao}
                  onClick={() => setFiltro(opcao)}
                >
                  {opcao}
                </button>
              ))}
            </div>

            <section className="work-table-card" aria-label="Lista de trabalhos">
              <div className="work-table-scroll">
                <div className="work-table-row work-table-header" role="row">
                  <span>Trabalho</span>
                  <span>Matéria</span>
                  <span>Data de<br />Entrega</span>
                  <span>Prioridade</span>
                  <span>Status</span>
                  <span>Ações</span>
                </div>

                {trabalhosFiltrados.map((trabalho) => (
                  <article className="work-table-row work-table-data" key={trabalho.id}>
                    <strong>{trabalho.titulo}</strong>
                    <span>{trabalho.materia}</span>
                    <time className={trabalho.entrega.startsWith('Hoje') ? 'deadline-today' : ''}>{trabalho.entrega}</time>
                    <span className={`work-priority priority-${trabalho.prioridade.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`}>
                      {trabalho.prioridade !== 'Baixa' && (
                        <AlertTriangle aria-hidden="true" />
                      )}
                      {trabalho.prioridade}
                    </span>
                    <span className={`work-status status-${classeStatus(trabalho.status)}`}>
                      {(() => {
                        const IconeStatus = iconeStatus(trabalho.status)
                        return <IconeStatus aria-hidden="true" />
                      })()}
                      {trabalho.status}
                    </span>
                    <button className="work-edit-button" type="button" aria-label={`Editar ${trabalho.titulo}`} onClick={() => abrirEdicao(trabalho)}>
                      <Pencil aria-hidden="true" />
                    </button>
                  </article>
                ))}

                {trabalhosFiltrados.length === 0 && (
                  <p className="management-empty-result" role="status">Nenhum trabalho corresponde à busca.</p>
                )}
              </div>

              <footer className="work-table-footer">
                <span>Mostrando 1 a {trabalhosFiltrados.length} de 12 trabalhos</span>
                <nav aria-label="Paginação dos trabalhos">
                  <button type="button" aria-label="Página anterior"><ChevronLeft aria-hidden="true" /></button>
                  <button className="active" type="button" aria-current="page">1</button>
                  <button type="button">2</button>
                  <button type="button">3</button>
                  <button type="button" aria-label="Próxima página"><ChevronRight aria-hidden="true" /></button>
                </nav>
              </footer>
            </section>
          </div>

          <aside className="work-summary-column" aria-label="Resumo de trabalhos">
            <section className="work-summary-card">
              <h2>Visão Geral</h2>
              <div className="work-overview-grid">
                <article>
                  <span><Circle aria-hidden="true" /> Pendentes</span>
                  <strong>5</strong>
                </article>
                <article className="overview-progress">
                  <span><Clock3 aria-hidden="true" /> Em Andamento</span>
                  <strong>3</strong>
                </article>
                <article className="overview-complete">
                  <span><CheckCircle2 aria-hidden="true" /> Concluídos este mês</span>
                  <strong>12</strong>
                  <div className="completion-ring" aria-label="75% concluído">
                    <small>75%</small>
                  </div>
                </article>
              </div>
            </section>

            <section className="work-summary-card deadlines-card">
              <header>
                <h2>Próximos Prazos</h2>
                <button type="button" onClick={() => setFiltro('Todos')}>Ver todos</button>
              </header>
              <div className="deadline-list">
                {prazos.map((prazo) => (
                  <article className={prazo.urgente ? 'urgent' : ''} key={`${prazo.periodo}-${prazo.dia}`}>
                    <time>
                      <small>{prazo.periodo}</small>
                      <strong>{prazo.dia}</strong>
                    </time>
                    <span>
                      <strong>{prazo.titulo}</strong>
                      <small>{prazo.materia}</small>
                    </span>
                  </article>
                ))}
              </div>
              <button className="open-calendar-button" type="button" onClick={() => navigate('/home')}>
                <CalendarDays aria-hidden="true" />
                Abrir Agenda
              </button>
            </section>
          </aside>
        </section>
      {modalAberto && (
        <div className="management-modal-backdrop" role="presentation" onMouseDown={() => setModalAberto(false)}>
          <section className="management-modal" role="dialog" aria-modal="true" aria-labelledby="trabalho-modal-titulo" onMouseDown={(event) => event.stopPropagation()}>
            <h2 id="trabalho-modal-titulo">{editandoId ? 'Editar Trabalho' : 'Novo Trabalho'}</h2>
            <p>Preencha os dados da entrega acadêmica.</p>
            <form onSubmit={salvarTrabalho} noValidate>
              <label>
                Trabalho
                <input
                  ref={primeiroCampoRef}
                  value={formulario.titulo}
                  onChange={(event) => setFormulario((atual) => ({ ...atual, titulo: event.target.value }))}
                  placeholder="Título do trabalho"
                />
              </label>
              <label>
                Matéria
                <input
                  value={formulario.materia}
                  onChange={(event) => setFormulario((atual) => ({ ...atual, materia: event.target.value }))}
                  placeholder="Disciplina"
                />
              </label>
              <label>
                Data de entrega
                <input
                  value={formulario.entrega}
                  onChange={(event) => setFormulario((atual) => ({ ...atual, entrega: event.target.value }))}
                  placeholder="Ex.: 18 Nov 2023"
                />
              </label>
              <div className="management-form-row">
                <label>
                  Prioridade
                  <select value={formulario.prioridade} onChange={(event) => setFormulario((atual) => ({ ...atual, prioridade: event.target.value }))}>
                    <option>Baixa</option>
                    <option>Média</option>
                    <option>Alta</option>
                  </select>
                </label>
                <label>
                  Status
                  <select value={formulario.status} onChange={(event) => setFormulario((atual) => ({ ...atual, status: event.target.value }))}>
                    <option>Pendente</option>
                    <option>Em Andamento</option>
                    <option>Concluído</option>
                  </select>
                </label>
              </div>
              {erro && <p className="management-form-error" role="alert">{erro}</p>}
              <div className="management-modal-actions">
                <button type="button" onClick={() => setModalAberto(false)}>Cancelar</button>
                <button type="submit">Salvar</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {mensagem && (
        <button className="management-toast" type="button" aria-live="polite" onClick={() => setMensagem('')}>
          {mensagem}
        </button>
      )}
    </ManagementLayout>
  )
}

export default Trabalhos
