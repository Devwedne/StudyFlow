import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  cadastrarPeriodo,
  definirPeriodoAtual,
  listarPeriodos,
} from '../services/api'
import { obterPeriodoLetivoAtual } from '../utils/periodoLetivo'
import PeriodoLetivoContext from './PeriodoLetivoContext'

function dadosDoPeriodoAtual() {
  const [anoTexto, semestreTexto] = obterPeriodoLetivoAtual().split('.')
  const ano = Number(anoTexto)
  const semestre = Number(semestreTexto)

  return {
    ano,
    semestre,
    dataInicio: `${ano}-${semestre === 1 ? '01-01' : '07-01'}`,
    dataTermino: `${ano}-${semestre === 1 ? '06-30' : '12-31'}`,
  }
}

function PeriodoLetivoProvider({ usuarioLogado, children }) {
  const usuarioId = usuarioLogado?.id
  const [periodos, setPeriodos] = useState([])
  const [periodoAtual, setPeriodoAtual] = useState(null)
  const [carregando, setCarregando] = useState(Boolean(usuarioId))
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!usuarioId) return undefined

    let ativo = true

    async function carregar() {
      try {
        let dados = await listarPeriodos(usuarioId)

        if (dados.length === 0) {
          const periodoCriado = await cadastrarPeriodo(usuarioId, dadosDoPeriodoAtual())
          dados = [periodoCriado]
        }

        if (!ativo) return
        setPeriodos(dados)
        setPeriodoAtual(dados.find((periodo) => periodo.atual) ?? dados[0])
        setErro('')
      } catch (error) {
        if (ativo) setErro(error.message)
      } finally {
        if (ativo) setCarregando(false)
      }
    }

    carregar()

    return () => {
      ativo = false
    }
  }, [usuarioId])

  const selecionarPeriodoLetivo = useCallback(async (periodoId) => {
    if (!usuarioId || !periodoId || periodoAtual?.id === Number(periodoId)) return

    const periodo = await definirPeriodoAtual(usuarioId, Number(periodoId))
    setPeriodoAtual(periodo)
    setPeriodos((atuais) => atuais.map((item) => ({
      ...item,
      atual: item.id === periodo.id,
    })))
  }, [periodoAtual?.id, usuarioId])

  const criarPeriodoLetivo = useCallback(async (dados) => {
    if (!usuarioId) return null

    const periodo = await cadastrarPeriodo(usuarioId, dados)
    setPeriodos((atuais) => [
      { ...periodo, atual: true },
      ...atuais.map((item) => ({ ...item, atual: false })),
    ])
    setPeriodoAtual({ ...periodo, atual: true })
    return periodo
  }, [usuarioId])

  const valor = useMemo(() => ({
    periodoAtual,
    periodoSelecionado: periodoAtual?.nome ?? '',
    periodoSelecionadoId: periodoAtual?.id ?? null,
    periodosDisponiveis: periodos,
    carregandoPeriodo: carregando,
    erroPeriodo: erro,
    criarPeriodoLetivo,
    selecionarPeriodoLetivo,
  }), [carregando, criarPeriodoLetivo, erro, periodoAtual, periodos, selecionarPeriodoLetivo])

  return (
    <PeriodoLetivoContext.Provider value={valor}>
      {children}
    </PeriodoLetivoContext.Provider>
  )
}

export default PeriodoLetivoProvider
