export function obterPeriodoLetivoAtual() {
  const agora = new Date()
  const semestre = agora.getMonth() < 6 ? 1 : 2
  return `${agora.getFullYear()}.${semestre}`
}
