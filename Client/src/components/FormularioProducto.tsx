import { useState, type ChangeEvent, type FormEvent } from 'react'
import type { Producto, ProductoInput } from '../types'

interface Props {
  productoEditar: Producto | null
  cargando: boolean
  onGuardar: (producto: ProductoInput) => Promise<void>
  onCancelar: () => void
}

interface Campos {
  codigo: string
  nombre: string
  descripcion: string
  talle: string
  precio: string
  stock: string
  imagen: string
}

const VACIO: Campos = { codigo: '', nombre: '', descripcion: '', talle: '', precio: '', stock: '', imagen: '' }

function camposIniciales(producto: Producto | null): Campos {
  if (!producto) return VACIO
  return {
    codigo: producto.codigo,
    nombre: producto.nombre,
    descripcion: producto.descripcion ?? '',
    talle: producto.talle ?? '',
    precio: String(producto.precio),
    stock: String(producto.stock),
    imagen: producto.imagen ?? '',
  }
}

function FormularioProducto({ productoEditar, cargando, onGuardar, onCancelar }: Props) {
  const [campos, setCampos] = useState<Campos>(() => camposIniciales(productoEditar))
  const [error, setError] = useState('')

  const editando = productoEditar !== null

  const cambiar = (campo: keyof Campos) => (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setCampos((prev) => ({ ...prev, [campo]: e.target.value }))

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    if (!campos.codigo.trim() || !campos.nombre.trim()) {
      setError('Debe completar los campos Código y Nombre para continuar.')
      return
    }
    setError('')
    await onGuardar({
      codigo: campos.codigo.trim(),
      nombre: campos.nombre.trim(),
      descripcion: campos.descripcion.trim(),
      talle: campos.talle.trim(),
      precio: Number(campos.precio) || 0,
      stock: Number(campos.stock) || 0,
      imagen: campos.imagen.trim(),
    })
  }

  return (
    <form className="formulario" onSubmit={enviar}>
      <h2 className="formulario-titulo">
        {editando ? `Modificar producto #${productoEditar!.id}` : 'Registrar producto'}
      </h2>

      <div className="formulario-grid">
        <label className="campo">
          <span>Código *</span>
          <input value={campos.codigo} onChange={cambiar('codigo')} placeholder="Ej: URB-005" />
        </label>

        <label className="campo">
          <span>Nombre *</span>
          <input value={campos.nombre} onChange={cambiar('nombre')} placeholder="Nombre del producto" />
        </label>

        <label className="campo campo-ancho">
          <span>Descripción</span>
          <textarea value={campos.descripcion} onChange={cambiar('descripcion')} placeholder="Descripción opcional" rows={2} />
        </label>

        <label className="campo">
          <span>Talle</span>
          <input value={campos.talle} onChange={cambiar('talle')} placeholder="Ej: M / 41" />
        </label>

        <label className="campo">
          <span>Precio ($)</span>
          <input type="number" step="0.01" min="0" value={campos.precio} onChange={cambiar('precio')} placeholder="0.00" />
        </label>

        <label className="campo">
          <span>Stock</span>
          <input type="number" min="0" value={campos.stock} onChange={cambiar('stock')} placeholder="0" />
        </label>

        <label className="campo campo-ancho">
          <span>Imagen (URL)</span>
          <input value={campos.imagen} onChange={cambiar('imagen')} placeholder="https://..." />
        </label>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="formulario-acciones">
        <button type="submit" className="boton boton-primario" disabled={cargando}>
          {cargando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Registrar'}
        </button>
        {editando && (
          <button type="button" className="boton boton-secundario" onClick={onCancelar} disabled={cargando}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}

export default FormularioProducto