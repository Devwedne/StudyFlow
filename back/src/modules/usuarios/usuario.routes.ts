import { Router } from 'express'
import { cadastrar, listar, login } from './usuario.controller.js'

export const usuarioRoutes = Router()

usuarioRoutes.get('/usuarios', listar)
usuarioRoutes.post('/usuarios', cadastrar)
usuarioRoutes.post('/login', login)
