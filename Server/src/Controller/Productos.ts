import {sql,poolPromise} from '../Config/supabase'
import {Response,Request} from 'express'

export async function RegistrarProductos(req:Request,res:Response){
    try{
        const {codigo,nombre,descripcion,talle,precio,stock,imagen}=req.body;
        if(!codigo || !nombre){
            return res.status(400).json({Mensaje: 'Debe Completar los campos de Codigo y Nombre para continuar'})
        }
        const pool= await poolPromise;
        await pool.request()
        // -->db ,tipo ,parametro 
        .input('codigo',sql.VarChar,codigo)
        .input('nombre',sql.VarChar,nombre)
        .input('descripcion',sql.VarChar(sql.MAX),descripcion)
        .input('talle',sql.VarChar,talle)
        .input('precio',sql.Decimal(10,2),precio ?? 0)
        .input('stock',sql.Int,stock ?? 0)
        .input('imagen',sql.VarChar ,imagen ?? null)

        .query('INSERT INTO Tarjetas (codigo,nombre,descripcion,talle,precio,stock,imagen)VALUES(@codigo,@nombre,@descripcion,@talle,@precio,@stock,@imagen)')

        return res.status(201).json({Mensaje:'Productos Registrado ✅'})
    }
    catch(error){
        console.error('No se logro registrar el Producto')
        return res.status(500).json({error:'Error al Cargar la Base de Datos'})
    }
}

// --->Funcion de Obtencion de Productos

export async function ObtenerProductos(req:Request,res:Response){
    try{
        const pool= await poolPromise;
        const Resultado=await pool.request()
        .query('SELECT id,codigo,nombre,descripcion,talle,precio,stock,imagen FROM Tarjetas ORDER BY id DESC')

        return res.status(200).json(Resultado.recordset)
    }
    catch(error){
        console.error('No se logro obtener los Productos')
        return res.status(500).json({error:'Error al Cargar la Base de Datos'})
    }
}

// --->Funcion de Modificacion de Productos

export async function ModificarProducto(req:Request,res:Response){
    try{
        // --> Indicamos el Parametro a Comparar
        const {id}=req.params;
        const {codigo,nombre,descripcion,talle,precio,stock,imagen}=req.body;
        if(!codigo || !nombre){
            return res.status(400).json({Mensaje: 'Debe Completar los campos de Codigo y Nombre para continuar'})
        }
        // --> Verificamos si el ID se paso por parametro
        if(!id){
            console.error('No se encontro el ID')
            return res.status(400).json({error:'Debe Ingresar un ID para continuar'})
        }
        const pool= await poolPromise;
        const Resultado=await pool.request()
        // -->db ,tipo ,parametro 
        .input('id',sql.Int,id)
        .input('codigo',sql.VarChar,codigo)
        .input('nombre',sql.VarChar,nombre)
        .input('descripcion',sql.VarChar(sql.MAX),descripcion)
        .input('talle',sql.VarChar,talle)
        .input('precio',sql.Decimal(10,2),precio ?? 0)
        .input('stock',sql.Int,stock ?? 0)
        .input('imagen',sql.VarChar ,imagen ?? null)

        .query(`UPDATE Tarjetas
                SET 
                codigo=@codigo,
                nombre=@nombre,
                descripcion=@descripcion,
                talle=@talle,
                precio=@precio,
                stock=@stock,
                imagen=@imagen
                WHERE id=@id
            `)
        if(Resultado.rowsAffected[0]===0){
            return res.status(404).json({error:'No se Logro Encontrar el Producto'})
        }

        return res.status(200).json({Mensaje:'Productos Modificados Correctamente ✅'})
    }
    catch(error){
        console.error('No se logro modificar el Producto')
        return res.status(500).json({error:'Error al Cargar la Base de Datos'})
    }
}


export async function EliminarProducto(req:Request,res:Response){
    try{
        const {id}=req.params;
        if(!id){
            console.error('No se encontro el ID')
            return res.status(400).json({error:'Debe Ingresar un ID para continuar'})
        }
        const pool= await poolPromise;
        const Resultado=await pool.request()
        .input('id',sql.Int,id)
        .query(`DELETE FROM Tarjetas WHERE id=@id`)
        if(Resultado.rowsAffected[0]===0){
            return res.status(404).json({error:'No se Logro Encontrar el Producto'})
        }
        return res.status(200).json({Mensaje:'Productos Eliminado Correctamente ✅'})
    }
    catch(error){
        console.error('No se logro eliminar el Producto')
        return res.status(500).json({error:'Error al Cargar la Base de Datos'})
    }
}