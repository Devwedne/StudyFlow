import { useEffect, useMemo, useRef, useState } from 'react'
import { BookOpen, CalendarDays, EllipsisVertical, GraduationCap, Plus } from 'lucide-react'
import ManagementLayout from './layout/ManagementLayout'
import usePeriodoLetivo from '../hooks/usePeriodoLetivo'
import {
  atualizarMateria as atualizarMateriaNaApi,
  cadastrarMateria as cadastrarMateriaNaApi,
  cadastrarProva as cadastrarProvaNaApi,
  excluirMateria as excluirMateriaNaApi,
  excluirProva as excluirProvaNaApi,
  listarMaterias,
  listarProvas,
} from '../services/api'

const formularioVazio = {
  nome: '',
  professor: '',
  dataInicio: '',
  dataTermino: '',
  nota1: '',
  nota2: '',
}

const formularioProvaVazio = { titulo: '', data: '' }

function formatarData(data) {
  if (!data) return '—'
  return new Intl.DateTimeFormat('pt-BR').format(new Date(`${data.slice(0, 10)}T12:00:00`))
}

function formatarNota(nota) {
  return nota === null || nota === undefined ? '—' : Number(nota).toFixed(1)
}

function obterResultadoMateria(materia) {
  if (
    materia.status !== 'concluida'
    || materia.media === null
    || materia.media === undefined
  ) {
    return null
  }

  return Number(materia.media) >= 7 ? 'Aprovado' : 'Reprovado'
}

function ordenarMaterias(materias) {
  return [...materias].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
}

function ordenarProvas(provas) {
  return [...provas].sort((a, b) => a.data.localeCompare(b.data) || a.id - b.id)
}

function obterProximaProva(provas, materiaId) {
  const agora = new Date()
  const hoje = new Date(agora.getTime() - agora.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10)
  return provas.find((prova) => prova.materiaId === materiaId && prova.data >= hoje) ?? null
}

function descreverProximaProva(provas, materiaId) {
  const prova = obterProximaProva(provas, materiaId)
  return prova ? `${prova.titulo}: ${formatarData(prova.data)}` : 'Nenhuma avaliação marcada'
}

function Materias({ usuarioLogado, onSair }) {
  const [materias, setMaterias] = useState([])
  const [provas, setProvas] = useState([])
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState('todas')
  const [modalAberto, setModalAberto] = useState(false)
  const [modalProvaAberto, setModalProvaAberto] = useState(false)
  const [materiaEditando, setMateriaEditando] = useState(null)
  const [materiaDaProva, setMateriaDaProva] = useState(null)
  const [menuAberto, setMenuAberto] = useState(null)
  const [formulario, setFormulario] = useState(formularioVazio)
  const [formularioProva, setFormularioProva] = useState(formularioProvaVazio)
  const [erro, setErro] = useState('')
  const [erroPagina, setErroPagina] = useState('')
  const [erroProva, setErroProva] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [periodoCarregadoId, setPeriodoCarregadoId] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [salvandoProva, setSalvandoProva] = useState(false)
  const [excluindoId, setExcluindoId] = useState(null)
  const [excluindoProvaId, setExcluindoProvaId] = useState(null)
  const primeiroCampoRef = useRef(null)
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
      listarMaterias(usuarioLogado.id, periodoSelecionadoId),
      listarProvas(usuarioLogado.id, periodoSelecionadoId),
    ])
      .then(([dadosMaterias, dadosProvas]) => {
        if (ativo) {
          setMaterias(dadosMaterias)
          setProvas(dadosProvas)
          setErroPagina('')
        }
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

  const materiasFiltradas = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR')

    return materias.filter((materia) => {
      const correspondeBusca = [materia.nome, materia.professor]
        .some((valor) => valor.toLocaleLowerCase('pt-BR').includes(termo))
      const correspondeFiltro = filtro === 'todas'
        || (filtro === 'andamento' && materia.status === 'andamento')
        || (filtro === 'concluidas' && materia.status === 'concluida')
      const correspondePeriodo = materia.periodoId === periodoSelecionadoId

      return correspondeBusca && correspondeFiltro && correspondePeriodo
    })
  }, [busca, filtro, materias, periodoSelecionadoId])

  function abrirModal(materia = null) {
    const datasDoPeriodo = {
      dataInicio: periodoAtual?.dataInicio?.slice(0, 10) ?? '',
      dataTermino: periodoAtual?.dataTermino?.slice(0, 10) ?? '',
    }

    setMateriaEditando(materia)
    setFormulario(materia
      ? {
          nome: materia.nome,
          professor: materia.professor,
          ...datasDoPeriodo,
          nota1: materia.nota1 ?? '',
          nota2: materia.nota2 ?? '',
        }
      : { ...formularioVazio, ...datasDoPeriodo })
    setErro('')
    setMenuAberto(null)
    setModalAberto(true)
    window.setTimeout(() => primeiroCampoRef.current?.focus(), 0)
  }

  function fecharModal() {
    if (salvando) return
    setModalAberto(false)
    setMateriaEditando(null)
    setErro('')
  }

  function abrirModalProva(materia) {
    setMateriaDaProva(materia)
    setFormularioProva(formularioProvaVazio)
    setErroProva('')
    setMenuAberto(null)
    setModalProvaAberto(true)
  }

  function fecharModalProva() {
    if (salvandoProva) return
    setModalProvaAberto(false)
    setMateriaDaProva(null)
    setErroProva('')
  }

  async function salvarProva(event) {
    event.preventDefault()
    const titulo = formularioProva.titulo.trim()

    if (!titulo || !formularioProva.data) {
      setErroProva('Informe o título e a data da avaliação.')
      return
    }

    if (
      periodoAtual
      && (
        formularioProva.data < periodoAtual.dataInicio
        || formularioProva.data > periodoAtual.dataTermino
      )
    ) {
      setErroProva(
        `A avaliação deve ser marcada entre ${formatarData(periodoAtual.dataInicio)} e ${formatarData(periodoAtual.dataTermino)}.`,
      )
      return
    }

    setSalvandoProva(true)

    try {
      const novaProva = await cadastrarProvaNaApi(
        usuarioLogado.id,
        materiaDaProva.id,
        { titulo, data: formularioProva.data },
      )

      setProvas((atuais) => ordenarProvas([...atuais, novaProva]))
      setFormularioProva(formularioProvaVazio)
      setErroProva('')
      setMensagem('Avaliação adicionada com sucesso.')
    } catch (error) {
      setErroProva(error.message)
    } finally {
      setSalvandoProva(false)
    }
  }

  async function excluirProva(provaId) {
    setExcluindoProvaId(provaId)

    try {
      await excluirProvaNaApi(usuarioLogado.id, materiaDaProva.id, provaId)
      setProvas((atuais) => atuais.filter((prova) => prova.id !== provaId))
      setErroProva('')
      setMensagem('Avaliação removida.')
    } catch (error) {
      setErroProva(error.message)
    } finally {
      setExcluindoProvaId(null)
    }
  }

  async function salvarMateria(event) {
    event.preventDefault()
    const nome = formulario.nome.trim()
    const professor = formulario.professor.trim()

    if (!nome || !professor) {
      setErro('Preencha matéria e professor.')
      primeiroCampoRef.current?.focus()
      return
    }

    if (!periodoSelecionadoId || !periodoAtual) {
      setErro('Selecione um período letivo antes de cadastrar a matéria.')
      return
    }

    const nota1 = formulario.nota1 === '' ? null : Number(formulario.nota1)
    const nota2 = formulario.nota2 === '' ? null : Number(formulario.nota2)

    if ([nota1, nota2].some((nota) => nota !== null && (Number.isNaN(nota) || nota < 0 || nota > 10))) {
      setErro('As notas devem estar entre 0 e 10.')
      return
    }

    const dadosBasicos = { nome, professor, periodoId: periodoSelecionadoId }
    setSalvando(true)

    try {
      if (materiaEditando) {
        const materiaAtualizada = await atualizarMateriaNaApi(
          usuarioLogado.id,
          materiaEditando.id,
          { ...dadosBasicos, nota1, nota2 },
        )

        setMaterias((atuais) => ordenarMaterias(
          atuais.map((materia) => materia.id === materiaAtualizada.id ? materiaAtualizada : materia),
        ))
        setMensagem('Matéria atualizada com sucesso.')
      } else {
        const novaMateria = await cadastrarMateriaNaApi(usuarioLogado.id, {
          ...dadosBasicos,
          ...(nota1 !== null ? { nota1 } : {}),
          ...(nota2 !== null ? { nota2 } : {}),
        })

        setMaterias((atuais) => ordenarMaterias([...atuais, novaMateria]))
        setMensagem('Matéria adicionada com sucesso.')
      }

      setFormulario(formularioVazio)
      setMateriaEditando(null)
      setModalAberto(false)
      setErroPagina('')
    } catch (error) {
      setErro(error.message)
    } finally {
      setSalvando(false)
    }
  }

  async function excluirMateria(id) {
    setExcluindoId(id)

    try {
      await excluirMateriaNaApi(usuarioLogado.id, id)
      setMaterias((atuais) => atuais.filter((materia) => materia.id !== id))
      setProvas((atuais) => atuais.filter((prova) => prova.materiaId !== id))
      setMenuAberto(null)
      setErroPagina('')
      setMensagem('Matéria removida.')
    } catch (error) {
      setErroPagina(error.message)
    } finally {
      setExcluindoId(null)
    }
  }

  return (
    <ManagementLayout
      paginaAtiva="materias"
      usuarioLogado={usuarioLogado}
      onSair={onSair}
      topbar={{
        placeholder: 'Buscar matéria ou professor...',
        busca,
        onBusca: setBusca,
      }}
    >
      <section className="management-canvas subjects-page" aria-labelledby="materias-titulo">
        <header className="management-page-heading">
          <div>
            <h1 id="materias-titulo">Matérias</h1>
            <p>Gerencie disciplinas, notas e avaliações de {periodoSelecionado}.</p>
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

            <button className="management-primary-button" type="button" disabled={!periodoAtual} onClick={() => abrirModal()}>
              <Plus aria-hidden="true" />
              Adicionar Matéria
            </button>
          </div>
        </header>

        {carregando && (
          <p className="management-empty-result" role="status">Carregando matérias...</p>
        )}

        {erroPagina && (
          <p className="management-form-error" role="alert">{erroPagina}</p>
        )}

        {!carregando && (
          <div className="subjects-grid">
            {materiasFiltradas.map((materia) => {
              const resultado = obterResultadoMateria(materia)

              return (
              <article className="subject-card" key={materia.id}>
                <div className="subject-card-topline">
                  <span className="subject-code">
                    {materia.status === 'concluida' ? 'Concluída' : 'Em andamento'} · {materia.periodoLetivo}
                  </span>
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
                      <button type="button" onClick={() => abrirModalProva(materia)}>Adicionar avaliação</button>
                      <button type="button" onClick={() => abrirModal(materia)}>Editar matéria</button>
                      <button
                        type="button"
                        disabled={excluindoId === materia.id}
                        onClick={() => excluirMateria(materia.id)}
                      >
                        {excluindoId === materia.id ? 'Excluindo...' : 'Excluir matéria'}
                      </button>
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
                    <small>Data de início</small>
                    <strong>{formatarData(materia.dataInicio)}</strong>
                  </span>
                  <span>
                    <small>Data de término</small>
                    <strong>{formatarData(materia.dataTermino)}</strong>
                  </span>
                </div>

                <div className="subject-metrics subject-grade-metrics">
                  <span><small>1ª nota</small><strong>{formatarNota(materia.nota1)}</strong></span>
                  <span><small>2ª nota</small><strong>{formatarNota(materia.nota2)}</strong></span>
                  <span>
                    <small>Média</small>
                    <strong className="subject-average">
                      {formatarNota(materia.media)}
                      {resultado && (
                        <span className={`subject-result subject-${resultado.toLowerCase()}`}>
                          {resultado}
                        </span>
                      )}
                    </strong>
                  </span>
                </div>

                <div className="subject-progress-heading">
                  <span>Conclusão da disciplina</span>
                  <strong>{materia.progresso}%</strong>
                </div>
                <div className="subject-card-progress" aria-label={`${materia.progresso}% concluído`}>
                  <span style={{ width: `${materia.progresso}%` }} />
                </div>

                <footer className="subject-card-footer">
                  <span className="subject-ok">
                    <CalendarDays aria-hidden="true" />
                    {descreverProximaProva(provas, materia.id)}
                  </span>
                  <button type="button" onClick={() => abrirModalProva(materia)}>Avaliações</button>
                </footer>
              </article>
              )
            })}
          </div>
        )}

        {!carregando && materias.length > 0 && materiasFiltradas.length === 0 && (
          <p className="management-empty-result" role="status">Nenhuma matéria corresponde aos filtros selecionados.</p>
        )}

        {!carregando && !erroPagina && materias.length === 0 && (
          <section className="subjects-empty-state" aria-labelledby="primeira-materia-titulo">
            <span className="subjects-empty-icon">
              <BookOpen aria-hidden="true" />
            </span>
            <h2 id="primeira-materia-titulo">Nenhuma matéria cadastrada</h2>
            <p>Você ainda não adicionou nenhuma matéria para este semestre. Comece agora para organizar seus estudos.</p>
            <button type="button" onClick={() => abrirModal()}>
              <Plus aria-hidden="true" />
              Adicionar sua primeira matéria
            </button>
          </section>
        )}
      </section>

      {modalAberto && (
        <div className="management-modal-backdrop" role="presentation" onMouseDown={fecharModal}>
          <section className="management-modal" role="dialog" aria-modal="true" aria-labelledby="materia-form-titulo" onMouseDown={(event) => event.stopPropagation()}>
            <h2 id="materia-form-titulo">{materiaEditando ? 'Editar Matéria' : 'Adicionar Matéria'}</h2>
            <p>As datas acompanham o período {periodoSelecionado}. Notas podem ser adicionadas agora ou depois.</p>
            <form onSubmit={salvarMateria} noValidate>
              <label>
                <span className="management-field-label">
                  Nome da matéria <span aria-hidden="true">*</span>
                </span>
                <input
                  ref={primeiroCampoRef}
                  value={formulario.nome}
                  onChange={(event) => setFormulario((atual) => ({ ...atual, nome: event.target.value }))}
                  placeholder="Ex.: Estruturas de Dados"
                />
              </label>

              <label>
                <span className="management-field-label">
                  Professor <span aria-hidden="true">*</span>
                </span>
                <input
                  value={formulario.professor}
                  onChange={(event) => setFormulario((atual) => ({ ...atual, professor: event.target.value }))}
                  placeholder="Nome do professor"
                />
              </label>

              <div className="management-form-grid">
                <label>
                  <span className="management-field-label">
                    Data de início <span aria-hidden="true">*</span>
                  </span>
                  <input
                    type="date"
                    value={formulario.dataInicio}
                    disabled
                  />
                </label>
                <label>
                  <span className="management-field-label">
                    Data de término <span aria-hidden="true">*</span>
                  </span>
                  <input
                    type="date"
                    value={formulario.dataTermino}
                    disabled
                  />
                </label>
              </div>

              <p className="management-calculated-field">
                Período {periodoSelecionado}: <strong>{formatarData(periodoAtual?.dataInicio)} até {formatarData(periodoAtual?.dataTermino)}</strong>
              </p>

              <div className="management-form-grid">
                <label>
                  1ª nota <small>(opcional)</small>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={formulario.nota1}
                    onChange={(event) => setFormulario((atual) => ({ ...atual, nota1: event.target.value }))}
                    placeholder="0 a 10"
                  />
                </label>
                <label>
                  2ª nota <small>(opcional)</small>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={formulario.nota2}
                    onChange={(event) => setFormulario((atual) => ({ ...atual, nota2: event.target.value }))}
                    placeholder="0 a 10"
                  />
                </label>
              </div>

              <p className="management-calculated-field">
                Média calculada: <strong>{formatarNota(
                  formulario.nota1 !== '' && formulario.nota2 !== ''
                    ? (Number(formulario.nota1) + Number(formulario.nota2)) / 2
                    : null,
                )}</strong>
              </p>

              {erro && <p className="management-form-error" role="alert">{erro}</p>}
              <div className="management-modal-actions">
                <button type="button" disabled={salvando} onClick={fecharModal}>Cancelar</button>
                <button type="submit" disabled={salvando}>
                  {salvando
                    ? 'Salvando...'
                    : materiaEditando ? 'Salvar alterações' : 'Adicionar'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {modalProvaAberto && materiaDaProva && (
        <div className="management-modal-backdrop" role="presentation" onMouseDown={fecharModalProva}>
          <section className="management-modal" role="dialog" aria-modal="true" aria-labelledby="prova-form-titulo" onMouseDown={(event) => event.stopPropagation()}>
            <h2 id="prova-form-titulo">Avaliações — {materiaDaProva.nome}</h2>
            <p>Cadastre provas, trabalhos e outras avaliações desta disciplina.</p>

            <form onSubmit={salvarProva} noValidate>
              <div className="management-form-grid">
                <label>
                  <span className="management-field-label">
                    Título da avaliação <span aria-hidden="true">*</span>
                  </span>
                  <input
                    value={formularioProva.titulo}
                    onChange={(event) => setFormularioProva((atual) => ({ ...atual, titulo: event.target.value }))}
                    placeholder="Ex.: 1ª prova ou trabalho final"
                  />
                </label>
                <label>
                  <span className="management-field-label">
                    Data da avaliação <span aria-hidden="true">*</span>
                  </span>
                  <input
                    type="date"
                    min={periodoAtual?.dataInicio || undefined}
                    max={periodoAtual?.dataTermino || undefined}
                    value={formularioProva.data}
                    onChange={(event) => setFormularioProva((atual) => ({ ...atual, data: event.target.value }))}
                  />
                </label>
              </div>

              {erroProva && <p className="management-form-error" role="alert">{erroProva}</p>}

              <div className="management-modal-actions">
                <button type="button" disabled={salvandoProva} onClick={fecharModalProva}>Fechar</button>
                <button type="submit" disabled={salvandoProva}>
                  {salvandoProva ? 'Adicionando...' : 'Adicionar avaliação'}
                </button>
              </div>
            </form>

            <section className="subject-exams-list" aria-labelledby="avaliacoes-cadastradas-titulo">
              <h3 id="avaliacoes-cadastradas-titulo">Avaliações cadastradas</h3>
              {provas.filter((prova) => prova.materiaId === materiaDaProva.id).length === 0 ? (
                <p>Nenhuma avaliação cadastrada para esta matéria.</p>
              ) : (
                <ul>
                  {provas
                    .filter((prova) => prova.materiaId === materiaDaProva.id)
                    .map((prova) => (
                      <li key={prova.id}>
                        <span><strong>{prova.titulo}</strong><small>{formatarData(prova.data)}</small></span>
                        <button
                          type="button"
                          disabled={excluindoProvaId === prova.id}
                          onClick={() => excluirProva(prova.id)}
                        >
                          {excluindoProvaId === prova.id ? 'Removendo...' : 'Remover'}
                        </button>
                      </li>
                    ))}
                </ul>
              )}
            </section>
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
