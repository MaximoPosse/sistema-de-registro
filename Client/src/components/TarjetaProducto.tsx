import { useState } from 'react'
import type { Producto } from '../types'

interface Props {
  producto: Producto
  onEditar: (producto: Producto) => void
  onEliminar: (id: number) => void
}

function TarjetaProducto({ producto, onEditar, onEliminar }: Props) {
  const [imgRota, setImgRota] = useState(false)
  const mostrarImagen = producto.imagen && !imgRota

  return (
    <article className="tarjeta">
      <div className="tarjeta-imagen">
        {mostrarImagen ? (
          <img src={producto.imagen} alt={producto.nombre} loading="lazy" onError={() => setImgRota(true)} />
        ) : (
          <span className="tarjeta-inicial">{producto.nombre.charAt(0).toUpperCase()}</span>
        )}
      </div>

      <div className="tarjeta-cuerpo">
        <div className="tarjeta-cabecera">
          <h3 className="tarjeta-nombre">{producto.nombre}</h3>
          <span className={`tarjeta-badge ${producto.stock > 0 ? 'tarjeta-en-stock' : 'tarjeta-sin-stock'}`}>
            {producto.stock > 0 ? `${producto.stock} en stock` : 'Sin stock'}
          </span>
        </div>

        <p className="tarjeta-codigo">{producto.codigo}</p>
        {producto.descripcion && <p className="tarjeta-descripcion">{producto.descripcion}</p>}

        <div className="tarjeta-detalles">
          {producto.talle && <span className="tarjeta-detalle">Talle: <strong>{producto.talle}</strong></span>}
        </div>

        <p className="tarjeta-precio">${Number(producto.precio).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>

        <div className="tarjeta-acciones">
          <button className="boton boton-secundario" onClick={() => onEditar(producto)}>
            Modificar
          </button>
          <button className="boton boton-peligro" onClick={() => onEliminar(producto.id)}>
            Eliminar
          </button>
        </div>
      </div>
    </article>
  )
}

export default TarjetaProducto