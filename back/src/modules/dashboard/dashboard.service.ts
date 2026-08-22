import { AppError } from '../../errors/app-error.js'
import { listarMateriasPorUsuario } from '../materias/materia.repository.js'
import { buscarPeriodoPorUsuario } from '../periodos/periodo.repository.js'
import { listarProvasPorUsuario } from '../provas/prova.repository.js'
import { listarTrabalhosPorUsuario } from '../trabalhos/trabalho.repository.js'

export async function obterDashboard(usuarioId: number, periodoId: number) {
  const periodo = await buscarPeriodoPorUsuario(usuarioId, periodoId)
  if (!periodo) throw new AppError('Periodo letivo nao encontrado.', 404)

  const [materias, trabalhos, avaliacoes] = await Promise.all([
    listarMateriasPorUsuario(usuarioId, periodoId),
    listarTrabalhosPorUsuario(usuarioId, periodoId),
    listarProvasPorUsuario(usuarioId, periodoId),
  ])
  const medias = materias
    .filter((materia) => materia.media !== null)
    .map((materia) => Number(materia.media))
  const mediaGeral = medias.length > 0
    ? medias.reduce((total, media) => total + media, 0) / medias.length
    : null
  const progressoGeral = materias.length > 0
    ? Math.round(materias.reduce((total, materia) => total + materia.progresso, 0) / materias.length)
    : 0
  const hoje = new Date().toISOString().slice(0, 10)
  const trabalhosConcluidos = trabalhos.filter((trabalho) => trabalho.status === 'concluido').length
  const trabalhosEmAtraso = trabalhos.filter((trabalho) => trabalho.atrasado).length
  const trabalhosPendentes = trabalhos.filter((trabalho) => (
    trabalho.status !== 'concluido' && !trabalho.atrasado
  )).length

  return {
    periodo,
    resumo: {
      disciplinas: materias.length,
      concluidas: materias.filter((materia) => materia.status === 'concluida').length,
      aprovadas: materias.filter((materia) => (
        materia.status === 'concluida'
        && materia.media !== null
        && Number(materia.media) >= 7
      )).length,
      reprovadas: materias.filter((materia) => (
        materia.status === 'concluida'
        && materia.media !== null
        && Number(materia.media) < 7
      )).length,
      mediaGeral,
      progressoGeral,
      trabalhosPendentes,
      trabalhosConcluidos,
      trabalhosEmAtraso,
    },
    materias,
    proximosTrabalhos: trabalhos
      .filter((trabalho) => (
        trabalho.status !== 'concluido'
        && !trabalho.atrasado
        && trabalho.dataEntrega >= hoje
      ))
      .slice(0, 6),
    proximasAvaliacoes: avaliacoes.filter((avaliacao) => avaliacao.data >= hoje).slice(0, 6),
  }
}
