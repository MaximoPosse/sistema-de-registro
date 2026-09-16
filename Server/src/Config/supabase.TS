import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();


const dbConfig: sql.config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 1433,
  options: {
    encrypt: false, 
    trustServerCertificate: true 
  }
};

export const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log('Conexión exitosa a SQL Server ✅');
    return pool;
  })
  .catch(err => {
    console.error('Error de conexión con SQL Server: ', err);
    throw err;
  });

export { sql };