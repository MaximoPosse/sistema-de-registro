import express from 'express';
import dotenv from 'dotenv';
import Rutas from './Router/Productos.route';
import RutasAuth from './Router/Auth.route';

// Carga las variables de entorno del .env
dotenv.config();

// Crea la aplicacion Express
const app = express();

// Middleware para leer JSON en el body de las peticiones
app.use(express.json());

// Middleware CORS para permitir peticiones del frontend (Vite)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use('/api', Rutas);
app.use('/api', RutasAuth);

export default app;