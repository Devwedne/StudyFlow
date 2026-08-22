import type { ErrorRequestHandler } from 'express'
import { ZodError } from 'zod'
import { env } from '../config/env.js'
import { AppError } from '../errors/app-error.js'

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({ erro: error.message })
    return
  }

  if (error instanceof ZodError) {
    response.status(400).json({
      erro: 'Dados invalidos.',
      detalhes: error.issues.map((issue) => ({
        campo: issue.path.join('.'),
        mensagem: issue.message,
      })),
    })
    return
  }

  console.error(error)
  response.status(500).json({
    erro: 'Erro interno do servidor.',
    ...(env.NODE_ENV === 'development' && error instanceof Error
      ? { detalhe: error.message }
      : {}),
  })
}
