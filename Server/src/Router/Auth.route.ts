import { Router } from "express";
import { RegistrarUsuario, IniciarSesion } from '../Controller/Auth'

const Rutas = Router()

Rutas.post('/RegistrarUsuario', RegistrarUsuario)
Rutas.post('/Login', IniciarSesion)

export default Rutas