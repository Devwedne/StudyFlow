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
