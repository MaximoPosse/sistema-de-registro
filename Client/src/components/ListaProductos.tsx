import type { Producto } from '../types'
import TarjetaProducto from './TarjetaProducto'

interface Props {
  productos: Producto[]
  onEditar: (producto: Producto) => void
  onEliminar: (id: number) => void
}

function ListaProductos({ productos, onEditar, onEliminar }: Props) {
  if (productos.length === 0) {
    return (
      <div className="sin-productos">
        <p>No hay productos registrados todavía.</p>
        <p className="sin-productos-hint">Completá el formulario de arriba para crear uno.</p>
      </div>
    )
  }

  return (
    <div className="grid-productos">
      {productos.map((p) => (
        <TarjetaProducto key={p.id} producto={p} onEditar={onEditar} onEliminar={onEliminar} />
      ))}
    </div>
  )
}

export default ListaProductos