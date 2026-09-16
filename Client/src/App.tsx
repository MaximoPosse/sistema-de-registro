import { useEffect, useState } from 'react'
import FormularioProducto from './components/FormularioProducto'
import ListaProductos from './components/ListaProductos'
import { getProductos, crearProducto, modificarProducto, eliminarProducto } from './api'
import type { Producto, ProductoInput } from './types'

function App() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [productoEditar, setProductoEditar] = useState<Producto | null>(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  const cargar = async () => {
    try {
      const data = await getProductos()
      setProductos(data)
    } catch {
      setError('No se pudo conectar con la API.')
    }
  }

  useEffect(() => {
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
  }, [])

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

  return (
    <div className="app">
      <header className="app-header">
        <h1>Sistema de Registro de Productos</h1>
        <p className="app-subtitulo">Urban's - Gestión de inventario</p>
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