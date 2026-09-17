import type { Producto, ProductoInput } from './types'

const API = 'http://localhost:3000/api'

async function manejarError(res: Response) {
  const cuerpo = await res.json().catch(() => ({}))
  throw new Error(cuerpo.error ?? cuerpo.Mensaje ?? 'Error inesperado en la API')
}

export async function getProductos(): Promise<Producto[]> {
  const res = await fetch(`${API}/Productos`)
  if (!res.ok) await manejarError(res)
  return res.json()
}

export async function crearProducto(producto: ProductoInput) {
  const res = await fetch(`${API}/Registrar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(producto),
  })
  if (!res.ok) await manejarError(res)
  return res.json()
}

export async function modificarProducto(id: number, producto: ProductoInput) {
  const res = await fetch(`${API}/Modificar/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(producto),
  })
  if (!res.ok) await manejarError(res)
  return res.json()
}

export async function eliminarProducto(id: number) {
  const res = await fetch(`${API}/Eliminar/${id}`, { method: 'DELETE' })
  if (!res.ok) await manejarError(res)
  return res.json()
}

export interface UsuarioSesion {
  id: number
  nombre: string
  email: string
}

export async function loginUsuario(email: string, password: string): Promise<UsuarioSesion> {
  const res = await fetch(`${API}/Login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) await manejarError(res)
  const cuerpo = await res.json()
  return cuerpo.usuario
}

export async function registrarUsuario(nombre: string, email: string, password: string) {
  const res = await fetch(`${API}/RegistrarUsuario`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, email, password }),
  })
  if (!res.ok) await manejarError(res)
  return res.json()
}