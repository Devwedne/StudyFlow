import { useMemo, useState } from 'react'
import { CalendarRange, Plus } from 'lucide-react'
import usePeriodoLetivo from '../hooks/usePeriodoLetivo'

function formularioInicial() {
  const agora = new Date()
  const ano = agora.getFullYear()
  const semestre = agora.getMonth() < 6 ? 1 : 2

  return {
    ano: String(ano),
    semestre: String(semestre),
    dataInicio: `${ano}-${semestre === 1 ? '01-01' : '07-01'}`,
    dataTermino: `${ano}-${semestre === 1 ? '06-30' : '12-31'}`,
  }
}

function PeriodoLetivoSelector() {
  const {
    periodoSelecionadoId,
    periodosDisponiveis,
    carregandoPeriodo,
    criarPeriodoLetivo,
    selecionarPeriodoLetivo,
  } = usePeriodoLetivo()
  const [modalAberto, setModalAberto] = useState(false)
  const [formulario, setFormulario] = useState(formularioInicial)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const periodosOrdenados = useMemo(
    () => [...periodosDisponiveis].sort(
      (periodoA, periodoB) => periodoA.ano - periodoB.ano
        || periodoA.semestre - periodoB.semestre,
    ),
    [periodosDisponiveis],
  )

  function atualizarAno(ano) {
    setFormulario((atual) => ({
      ...atual,
      ano,
      ...( /^\d{4}$/.test(ano)
        ? {
            dataInicio: `${ano}-${atual.semestre === '1' ? '01-01' : '07-01'}`,
            dataTermino: `${ano}-${atual.semestre === '1' ? '06-30' : '12-31'}`,
          }
        : {}),
    }))
  }

  function atualizarSemestre(semestre) {
    const ano = Number(formulario.ano) || new Date().getFullYear()
    setFormulario((atual) => ({
      ...atual,
      semestre,
      dataInicio: `${ano}-${semestre === '1' ? '01-01' : '07-01'}`,
      dataTermino: `${ano}-${semestre === '1' ? '06-30' : '12-31'}`,
    }))
  }

  async function criarPeriodo(event) {
    event.preventDefault()
    const ano = Number(formulario.ano)

    if (!Number.isInteger(ano) || ano < 1900 || ano > 2200) {
      setErro('Informe um ano válido.')
      return
    }
    if (!formulario.dataInicio || !formulario.dataTermino || formulario.dataTermino < formulario.dataInicio) {
      setErro('Confira as datas do período.')
      return
    }

    setSalvando(true)
    try {
      await criarPeriodoLetivo({
        ano,
        semestre: Number(formulario.semestre),
        dataInicio: formulario.dataInicio,
        dataTermino: formulario.dataTermino,
      })
      setFormulario(formularioInicial())
      setErro('')
      setModalAberto(false)
    } catch (error) {
      setErro(error.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <>
      <div className="global-period-control">
        <label className="global-period-selector">
          <CalendarRange aria-hidden="true" />
          <span>Período</span>
          <select
            aria-label="Período letivo atual do sistema"
            value={periodoSelecionadoId ?? ''}
            disabled={carregandoPeriodo}
            onChange={(event) => selecionarPeriodoLetivo(Number(event.target.value))}
          >
            {carregandoPeriodo && <option value="">Carregando...</option>}
            {periodosOrdenados.map((periodo) => (
              <option value={periodo.id} key={periodo.id}>
                {periodo.nome}{periodo.status === 'encerrado' ? ' · encerrado' : ''}
              </option>
            ))}
          </select>
        </label>
        <button
          className="global-period-add"
          type="button"
          aria-label="Criar período letivo"
          title="Criar período letivo"
          onClick={() => {
            setErro('')
            setModalAberto(true)
          }}
        >
          <Plus aria-hidden="true" />
        </button>
      </div>

      {modalAberto && (
        <div className="management-modal-backdrop" role="presentation" onMouseDown={() => !salvando && setModalAberto(false)}>
          <section className="management-modal period-modal" role="dialog" aria-modal="true" aria-labelledby="periodo-form-titulo" onMouseDown={(event) => event.stopPropagation()}>
            <h2 id="periodo-form-titulo">Novo período letivo</h2>
            <p>Crie o semestre que será usado por matérias, trabalhos e Dashboard.</p>
            <form onSubmit={criarPeriodo} noValidate>
              <div className="management-form-grid">
                <label>
                  Ano
                  <input
                    type="number"
                    min="1900"
                    max="2200"
                    value={formulario.ano}
                    onChange={(event) => atualizarAno(event.target.value)}
                  />
                </label>
                <label>
                  Semestre
                  <select value={formulario.semestre} onChange={(event) => atualizarSemestre(event.target.value)}>
                    <option value="1">1º semestre</option>
                    <option value="2">2º semestre</option>
                  </select>
                </label>
              </div>
              <div className="management-form-grid">
                <label>
                  Data de início
                  <input type="date" value={formulario.dataInicio} onChange={(event) => setFormulario((atual) => ({ ...atual, dataInicio: event.target.value }))} />
                </label>
                <label>
                  Data de término
                  <input type="date" min={formulario.dataInicio} value={formulario.dataTermino} onChange={(event) => setFormulario((atual) => ({ ...atual, dataTermino: event.target.value }))} />
                </label>
              </div>
              {erro && <p className="management-form-error" role="alert">{erro}</p>}
              <div className="management-modal-actions">
                <button type="button" disabled={salvando} onClick={() => setModalAberto(false)}>Cancelar</button>
                <button type="submit" disabled={salvando}>{salvando ? 'Criando...' : 'Criar período'}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  )
}

export default PeriodoLetivoSelector
