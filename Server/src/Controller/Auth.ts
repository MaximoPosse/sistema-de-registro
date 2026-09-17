import { sql, poolPromise } from '../Config/supabase'
import { Response, Request } from 'express'
import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10

export async function RegistrarUsuario(req: Request, res: Response) {
    try {
        const { nombre, email, password } = req.body;

        if (!nombre || !email || !password) {
            return res.status(400).json({ Mensaje: 'Debe completar los campos de Nombre, Email y Contraseña para continuar' });
        }
        if (password.length < 6) {
            return res.status(400).json({ Mensaje: 'La contraseña debe tener al menos 6 caracteres' });
        }

        // --> Hasheamos la contraseña con bcrypt antes de guardarla
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        const pool = await poolPromise;
        await pool.request()
            .input('nombre', sql.VarChar, nombre)
            .input('email', sql.VarChar, email)
            .input('password_hash', sql.VarChar, passwordHash)
            .query('INSERT INTO Usuarios (nombre, email, password_hash) VALUES (@nombre, @email, @password_hash)');

        return res.status(201).json({ Mensaje: 'Usuario registrado correctamente ✅' });
    }
    catch (error: any) {
        // --> Error 2627 = violación de restricción UNIQUE (email duplicado)
        if (error?.number === 2627) {
            return res.status(409).json({ error: 'Ya existe un usuario registrado con ese email' });
        }
        console.error('No se logro registrar el usuario', error);
        return res.status(500).json({ error: 'Error al registrar el usuario' });
    }
}

export async function IniciarSesion(req: Request, res: Response) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ Mensaje: 'Debe completar los campos de Email y Contraseña para continuar' });
        }

        const pool = await poolPromise;
        const Resultado = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT id, nombre, email, password_hash FROM Usuarios WHERE email = @email');

        if (Resultado.recordset.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const usuario = Resultado.recordset[0];

        // --> Comparamos la contraseña ingresada contra el hash almacenado
        const passwordValida = await bcrypt.compare(password, usuario.password_hash);

        if (!passwordValida) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        return res.status(200).json({
            Mensaje: 'Inicio de sesión exitoso ✅',
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email
            }
        });
    }
    catch (error) {
        console.error('No se logro iniciar sesion', error);
        return res.status(500).json({ error: 'Error al iniciar sesion' });
    }
}