const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')

async function requisicao(caminho, opcoes = {}) {
  let resposta

  try {
    resposta = await fetch(`${API_URL}${caminho}`, opcoes)
  } catch {
    throw new Error('Não foi possível conectar à API. Verifique se o servidor está no ar.')
  }

  const tipo = resposta.headers.get('content-type') || ''
  const corpo = tipo.includes('application/json') ? await resposta.json() : null

  if (!resposta.ok) {
    throw new Error(corpo?.erro || 'Não foi possível concluir a solicitação.')
  }

  return corpo
}

export function listarUsuarios() {
  return requisicao('/usuarios')
}

export function cadastrarUsuario(dados) {
  return requisicao('/usuarios', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  })
}

export function fazerLogin(email, senha) {
  return requisicao('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  })
}

export function listarMaterias(usuarioId, periodoId) {
  const query = periodoId ? `?periodoId=${periodoId}` : ''
  return requisicao(`/usuarios/${usuarioId}/materias${query}`)
}

export function cadastrarMateria(usuarioId, dados) {
  return requisicao(`/usuarios/${usuarioId}/materias`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  })
}

export function atualizarMateria(usuarioId, materiaId, dados) {
  return requisicao(`/usuarios/${usuarioId}/materias/${materiaId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  })
}

export function excluirMateria(usuarioId, materiaId) {
  return requisicao(`/usuarios/${usuarioId}/materias/${materiaId}`, {
    method: 'DELETE',
  })
}

export function listarProvas(usuarioId, periodoId) {
  const query = periodoId ? `?periodoId=${periodoId}` : ''
  return requisicao(`/usuarios/${usuarioId}/provas${query}`)
}

export function cadastrarProva(usuarioId, materiaId, dados) {
  return requisicao(`/usuarios/${usuarioId}/materias/${materiaId}/provas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  })
}

export function excluirProva(usuarioId, materiaId, provaId) {
  return requisicao(`/usuarios/${usuarioId}/materias/${materiaId}/provas/${provaId}`, {
    method: 'DELETE',
  })
}

export function listarPeriodos(usuarioId) {
  return requisicao(`/usuarios/${usuarioId}/periodos`)
}

export function cadastrarPeriodo(usuarioId, dados) {
  return requisicao(`/usuarios/${usuarioId}/periodos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  })
}

export function atualizarPeriodo(usuarioId, periodoId, dados) {
  return requisicao(`/usuarios/${usuarioId}/periodos/${periodoId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  })
}

export function definirPeriodoAtual(usuarioId, periodoId) {
  return requisicao(`/usuarios/${usuarioId}/periodo-atual`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ periodoId }),
  })
}

export function listarTrabalhos(usuarioId, periodoId) {
  const query = periodoId ? `?periodoId=${periodoId}` : ''
  return requisicao(`/usuarios/${usuarioId}/trabalhos${query}`)
}

export function cadastrarTrabalho(usuarioId, dados) {
  return requisicao(`/usuarios/${usuarioId}/trabalhos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  })
}

export function atualizarTrabalho(usuarioId, trabalhoId, dados) {
  return requisicao(`/usuarios/${usuarioId}/trabalhos/${trabalhoId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  })
}

export function excluirTrabalho(usuarioId, trabalhoId) {
  return requisicao(`/usuarios/${usuarioId}/trabalhos/${trabalhoId}`, {
    method: 'DELETE',
  })
}

export function obterDashboard(usuarioId, periodoId) {
  return requisicao(`/usuarios/${usuarioId}/dashboard?periodoId=${periodoId}`)
}
