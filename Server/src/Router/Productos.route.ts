import { Router } from "express";
import {RegistrarProductos, ObtenerProductos, ModificarProducto, EliminarProducto}from '../Controller/Productos'

const Rutas=Router()

Rutas.post('/Registrar',RegistrarProductos)
Rutas.get('/Productos',ObtenerProductos)
Rutas.put('/Modificar/:id',ModificarProducto)
Rutas.delete('/Eliminar/:id',EliminarProducto)

export default Rutas