import { useContext } from 'react'
import PeriodoLetivoContext from '../contexts/PeriodoLetivoContext'

export default function usePeriodoLetivo() {
  const contexto = useContext(PeriodoLetivoContext)

  if (!contexto) {
    throw new Error('usePeriodoLetivo deve ser usado dentro de PeriodoLetivoProvider.')
  }

  return contexto
}
