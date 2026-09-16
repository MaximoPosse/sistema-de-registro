import app from './app';

// Configura el puerto (del .env o 3000 por defecto)
const PORT = parseInt(process.env.PORT || '3000', 10);

// Levanta el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});