import { useState, type FormEvent } from 'react'
import { loginUsuario, registrarUsuario, type UsuarioSesion } from '../api'

interface Props {
  onAutenticado: (usuario: UsuarioSesion) => void
}

type Modo = 'login' | 'registro'

function Login({ onAutenticado }: Props) {
  const [modo, setModo] = useState<Modo>('login')
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const cambiarModo = (m: Modo) => {
    setModo(m)
    setError('')
  }

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError('Debe completar Email y Contraseña para continuar.')
      return
    }
    if (modo === 'registro' && !nombre.trim()) {
      setError('Debe completar el Nombre para continuar.')
      return
    }
    setError('')
    setCargando(true)
    try {
      if (modo === 'login') {
        const usuario = await loginUsuario(email, password)
        onAutenticado(usuario)
      } else {
        await registrarUsuario(nombre, email, password)
        const usuario = await loginUsuario(email, password)
        onAutenticado(usuario)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="auth">
      <div className="auth-card">
        <div className="auth-marca">
          <span className="auth-inicial">U</span>
          <h1>Urban's</h1>
          <p>Sistema de Registro de Productos</p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${modo === 'login' ? 'activo' : ''}`}
            onClick={() => cambiarModo('login')}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            className={`auth-tab ${modo === 'registro' ? 'activo' : ''}`}
            onClick={() => cambiarModo('registro')}
          >
            Registrarse
          </button>
        </div>

        <form className="auth-form" onSubmit={enviar}>
          {modo === 'registro' && (
            <label className="campo">
              <span>Nombre *</span>
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre" />
            </label>
          )}

          <label className="campo">
            <span>Email *</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tucorreo@ejemplo.com" />
          </label>

          <label className="campo">
            <span>Contraseña *</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={modo === 'registro' ? 'Mínimo 6 caracteres' : 'Tu contraseña'}
            />
          </label>

          {error && <p className="error">{error}</p>}

          <button type="submit" className="boton boton-primario auth-enviar" disabled={cargando}>
            {cargando ? 'Procesando...' : modo === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>
        </form>

        <p className="auth-hint">
          {modo === 'login'
            ? '¿No tenés cuenta? Creá una en la pestaña Registrarse.'
            : 'Tu contraseña se guarda encriptada con bcrypt.'}
        </p>
      </div>
    </div>
  )
}

export default Login