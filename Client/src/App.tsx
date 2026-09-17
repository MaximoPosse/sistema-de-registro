import { useEffect, useState } from 'react'
import Login from './components/Login'
import FormularioProducto from './components/FormularioProducto'
import ListaProductos from './components/ListaProductos'
import { getProductos, crearProducto, modificarProducto, eliminarProducto, type UsuarioSesion } from './api'
import type { Producto, ProductoInput } from './types'

const CLAVE_SESION = 'urban-usuario'

function App() {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(() => {
    const guardado = sessionStorage.getItem(CLAVE_SESION)
    return guardado ? (JSON.parse(guardado) as UsuarioSesion) : null
  })
  const [productos, setProductos] = useState<Producto[]>([])
  const [productoEditar, setProductoEditar] = useState<Producto | null>(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  const autenticar = (u: UsuarioSesion) => {
    sessionStorage.setItem(CLAVE_SESION, JSON.stringify(u))
    setUsuario(u)
  }

  const cerrarSesion = () => {
    sessionStorage.removeItem(CLAVE_SESION)
    setUsuario(null)
  }

  const cargar = async () => {
    try {
      const data = await getProductos()
      setProductos(data)
    } catch {
      setError('No se pudo conectar con la API.')
    }
  }

  useEffect(() => {
    if (!usuario) return
    let activo = true
    getProductos()
      .then((data) => {
        if (activo) setProductos(data)
      })
      .catch(() => {
        if (activo) setError('No se pudo conectar con la API.')
      })
    return () => {
      activo = false
    }
  }, [usuario])

  const guardar = async (data: ProductoInput) => {
    setCargando(true)
    try {
      if (productoEditar) {
        await modificarProducto(productoEditar.id, data)
        setMensaje('Producto modificado correctamente.')
      } else {
        await crearProducto(data)
        setMensaje('Producto registrado correctamente.')
      }
      setProductoEditar(null)
      await cargar()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al guardar el producto.'
      setError(msg)
    } finally {
      setCargando(false)
    }
  }

  const editar = (p: Producto) => {
    setProductoEditar(p)
    setMensaje('')
    setError('')
  }

  const cancelar = () => {
    setProductoEditar(null)
    setError('')
  }

  const eliminar = async (id: number) => {
    if (!window.confirm('¿Seguro que desea eliminar este producto?')) return
    try {
      await eliminarProducto(id)
      setMensaje('Producto eliminado correctamente.')
      await cargar()
    } catch {
      setError('Error al eliminar el producto.')
    }
  }

  if (!usuario) {
    return <Login onAutenticado={autenticar} />
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Sistema de Registro de Productos</h1>
        <div className="app-usuario">
          <p className="app-subtitulo">
            Hola, <strong>{usuario.nombre}</strong> ({usuario.email}) · Urban's - Gestión de inventario
          </p>
          <button className="boton boton-secundario" onClick={cerrarSesion}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="app-main">
        <FormularioProducto
          key={productoEditar ? String(productoEditar.id) : 'nuevo'}
          productoEditar={productoEditar}
          cargando={cargando}
          onGuardar={guardar}
          onCancelar={cancelar}
        />

        {error && <p className="alerta alerta-error">{error}</p>}
        {mensaje && <p className="alerta alerta-ok">{mensaje}</p>}

        <h2 className="seccion-titulo">Productos registrados ({productos.length})</h2>
        <ListaProductos productos={productos} onEditar={editar} onEliminar={eliminar} />
      </main>
    </div>
  )
}

export default App