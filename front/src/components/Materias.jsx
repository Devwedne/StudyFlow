import { useMemo, useRef, useState } from 'react'
import { BookOpen, CheckCircle2, CirclePlus, EllipsisVertical, GraduationCap, Plus } from 'lucide-react'
import ManagementLayout from './layout/ManagementLayout'

const materiasIniciais = [
  {
    id: 1,
    codigo: 'COMP-301',
    nome: 'Estruturas de Dados Avançadas',
    professor: 'Prof. Dr. Silva Ramos',
    carga: 60,
    horas: 24,
    progresso: 40,
    pendencias: 2,
    status: 'andamento',
  },
  {
    id: 2,
    codigo: 'MAT-205',
    nome: 'Cálculo Diferencial e Integral III',
    professor: 'Profa. Dra. Elena Costa',
    carga: 90,
    horas: 65,
    progresso: 72,
    pendencias: 0,
    status: 'concluida',
  },
  {
    id: 3,
    codigo: 'MAT-205',
    nome: 'Cálculo Diferencial e Integral III',
    professor: 'Profa. Dra. Elena Costa',
    carga: 90,
    horas: 65,
    progresso: 72,
    pendencias: 0,
    status: 'concluida',
  },
]

const formularioVazio = { codigo: '', nome: '', professor: '', carga: '60' }

function Materias({ usuarioLogado, onSair }) {
  const [materias, setMaterias] = useState(materiasIniciais)
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState('todas')
  const [modalAberto, setModalAberto] = useState(false)
  const [menuAberto, setMenuAberto] = useState(null)
  const [formulario, setFormulario] = useState(formularioVazio)
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')
  const primeiroCampoRef = useRef(null)

  const materiasFiltradas = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR')

    return materias.filter((materia) => {
      const correspondeBusca = [materia.codigo, materia.nome, materia.professor]
        .some((valor) => valor.toLocaleLowerCase('pt-BR').includes(termo))
      const correspondeFiltro = filtro === 'todas'
        || (filtro === 'andamento' && materia.status === 'andamento')
        || (filtro === 'concluidas' && materia.status === 'concluida')

      return correspondeBusca && correspondeFiltro
    })
  }, [busca, filtro, materias])

  function abrirModal() {
    setFormulario(formularioVazio)
    setErro('')
    setModalAberto(true)
    window.setTimeout(() => primeiroCampoRef.current?.focus(), 0)
  }

  function cadastrarMateria(event) {
    event.preventDefault()
    const codigo = formulario.codigo.trim()
    const nome = formulario.nome.trim()
    const professor = formulario.professor.trim()

    if (!codigo || !nome || !professor) {
      setErro('Preencha código, matéria e professor.')
      primeiroCampoRef.current?.focus()
      return
    }

    setMaterias((atuais) => [
      ...atuais,
      {
        id: Math.max(0, ...atuais.map((materia) => materia.id)) + 1,
        codigo,
        nome,
        professor,
        carga: Number(formulario.carga) || 60,
        horas: 0,
        progresso: 0,
        pendencias: 0,
        status: 'andamento',
      },
    ])
    setModalAberto(false)
    setMensagem('Matéria adicionada com sucesso.')
  }

  function excluirMateria(id) {
    setMaterias((atuais) => atuais.filter((materia) => materia.id !== id))
    setMenuAberto(null)
    setMensagem('Matéria removida.')
  }

  return (
    <ManagementLayout
      paginaAtiva="materias"
      usuarioLogado={usuarioLogado}
      onSair={onSair}
      topbar={{
        placeholder: 'Search...',
        busca,
        onBusca: setBusca,
      }}
    >

        <section className="management-canvas subjects-page" aria-labelledby="materias-titulo">
          <header className="management-page-heading">
            <div>
              <h1 id="materias-titulo">Matérias</h1>
              <p>Gerencie suas disciplinas e acompanhe seu progresso.</p>
            </div>

            <div className="management-heading-actions">
              <div className="segmented-filter" aria-label="Filtrar matérias">
                {[
                  ['todas', 'Todas'],
                  ['andamento', 'Em Andamento'],
                  ['concluidas', 'Concluídas'],
                ].map(([valor, rotulo]) => (
                  <button
                    className={filtro === valor ? 'active' : ''}
                    type="button"
                    aria-pressed={filtro === valor}
                    key={valor}
                    onClick={() => setFiltro(valor)}
                  >
                    {rotulo}
                  </button>
                ))}
              </div>

              <button className="management-primary-button" type="button" onClick={abrirModal}>
                <Plus aria-hidden="true" />
                Adicionar Matéria
              </button>
            </div>
          </header>

          <div className="subjects-grid">
            {materiasFiltradas.map((materia) => (
              <article className="subject-card" key={materia.id}>
                <div className="subject-card-topline">
                  <span className="subject-code">{materia.codigo}</span>
                  <button
                    className="subject-menu-button"
                    type="button"
                    aria-label={`Ações de ${materia.nome}`}
                    aria-expanded={menuAberto === materia.id}
                    onClick={() => setMenuAberto((aberto) => aberto === materia.id ? null : materia.id)}
                  >
                    <EllipsisVertical aria-hidden="true" />
                  </button>
                  {menuAberto === materia.id && (
                    <div className="subject-card-menu">
                      <button type="button" onClick={() => excluirMateria(materia.id)}>Excluir matéria</button>
                    </div>
                  )}
                </div>

                <h2>{materia.nome}</h2>
                <p className="subject-professor">
                  <GraduationCap aria-hidden="true" />
                  {materia.professor}
                </p>

                <div className="subject-metrics">
                  <span>
                    <small>Carga Horária</small>
                    <strong>{materia.carga}h totais</strong>
                  </span>
                  <span>
                    <small>Horas Estudadas</small>
                    <strong>{materia.horas}h</strong>
                  </span>
                </div>

                <div className="subject-progress-heading">
                  <span>Progresso do Semestre</span>
                  <strong>{materia.progresso}%</strong>
                </div>
                <div className="subject-card-progress" aria-label={`${materia.progresso}% concluído`}>
                  <span style={{ width: `${materia.progresso}%` }} />
                </div>

                <footer className="subject-card-footer">
                  {materia.pendencias > 0 ? (
                    <span className="subject-pending">
                      <CirclePlus aria-hidden="true" />
                      {materia.pendencias} Trabalhos Pendentes
                    </span>
                  ) : (
                    <span className="subject-ok">
                      <CheckCircle2 aria-hidden="true" />
                      Tudo em dia
                    </span>
                  )}
                  <button type="button">Ver detalhes</button>
                </footer>
              </article>
            ))}
          </div>

          {materiasFiltradas.length === 0 && (
            <p className="management-empty-result" role="status">Nenhuma matéria corresponde à busca.</p>
          )}

          <section className="subjects-empty-state" aria-labelledby="primeira-materia-titulo">
            <span className="subjects-empty-icon">
              <BookOpen aria-hidden="true" />
            </span>
            <h2 id="primeira-materia-titulo">Nenhuma matéria cadastrada</h2>
            <p>Você ainda não adicionou nenhuma matéria para este semestre. Comece agora para organizar seus estudos.</p>
            <button type="button" onClick={abrirModal}>
              <Plus aria-hidden="true" />
              Adicionar sua primeira matéria
            </button>
          </section>
        </section>
      {modalAberto && (
        <div className="management-modal-backdrop" role="presentation" onMouseDown={() => setModalAberto(false)}>
          <section className="management-modal" role="dialog" aria-modal="true" aria-labelledby="nova-materia-titulo" onMouseDown={(event) => event.stopPropagation()}>
            <h2 id="nova-materia-titulo">Adicionar Matéria</h2>
            <p>Cadastre os dados principais da disciplina.</p>
            <form onSubmit={cadastrarMateria} noValidate>
              <label>
                Código
                <input
                  ref={primeiroCampoRef}
                  value={formulario.codigo}
                  onChange={(event) => setFormulario((atual) => ({ ...atual, codigo: event.target.value }))}
                  placeholder="Ex.: COMP-301"
                />
              </label>
              <label>
                Matéria
                <input
                  value={formulario.nome}
                  onChange={(event) => setFormulario((atual) => ({ ...atual, nome: event.target.value }))}
                  placeholder="Nome da disciplina"
                />
              </label>
              <label>
                Professor
                <input
                  value={formulario.professor}
                  onChange={(event) => setFormulario((atual) => ({ ...atual, professor: event.target.value }))}
                  placeholder="Nome do professor"
                />
              </label>
              <label>
                Carga horária
                <input
                  type="number"
                  min="1"
                  value={formulario.carga}
                  onChange={(event) => setFormulario((atual) => ({ ...atual, carga: event.target.value }))}
                />
              </label>
              {erro && <p className="management-form-error" role="alert">{erro}</p>}
              <div className="management-modal-actions">
                <button type="button" onClick={() => setModalAberto(false)}>Cancelar</button>
                <button type="submit">Adicionar</button>
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

export default Materias
