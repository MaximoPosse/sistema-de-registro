import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import bcrypt from 'bcrypt';
import { poolPromise, sql } from '../src/Config/supabase';
import app from '../src/app';

let server: Server;
let base: string;

const EMAIL = `test-${Date.now()}@correo.com`;
const PASSWORD = 'clave-secreta-123';

function credencial(email: string, password: string) {
  return { nombre: 'Usuario de Prueba', email, password };
}

async function listarHash(email: string): Promise<string | null> {
  const pool = await poolPromise;
  const res = await pool.request()
    .input('email', sql.VarChar, email)
    .query('SELECT password_hash FROM Usuarios WHERE email = @email');
  return res.recordset.length > 0 ? res.recordset[0].password_hash : null;
}

async function limpiarUsuario(email: string) {
  const pool = await poolPromise;
  await pool.request()
    .input('email', sql.VarChar, email)
    .query('DELETE FROM Usuarios WHERE email = @email');
}

before(async () => {
  server = await new Promise<Server>((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  const address = server.address();
  if (address && typeof address === 'object') {
    base = `http://localhost:${address.port}`;
  } else {
    throw new Error('No se pudo obtener el puerto del servidor de prueba');
  }
});

after(async () => {
  await limpiarUsuario(EMAIL);
  server.close();
});

// =====================================================================
// HASHING DE CONTRASEÑA (POST /api/RegistrarUsuario)
// =====================================================================

test('Registro: hashea la contraseña y la guarda encriptada (no en texto plano)', async () => {
  const res = await fetch(`${base}/api/RegistrarUsuario`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credencial(EMAIL, PASSWORD)),
  });
  assert.equal(res.status, 201);

  const hash = await listarHash(EMAIL);
  assert.ok(hash, 'Deberia existir un hash en la base de datos');

  // El hash NO es la contraseña en texto plano
  assert.notEqual(hash, PASSWORD);

  // El hash tiene el prefijo de bcrypt ($2b$...) y 60 caracteres
  assert.ok(hash!.startsWith('$2'), 'El hash deberia usar el formato bcrypt');
  assert.equal(hash!.length, 60);

  // bcrypt.compare debe confirmar que la contraseña coincide con el hash
  const coincide = await bcrypt.compare(PASSWORD, hash!);
  assert.equal(coincide, true, 'La contraseña deberia coincidir con el hash');

  // Una contraseña distinta NO debe coincidir
  const noCoincide = await bcrypt.compare('otra-clave', hash!);
  assert.equal(noCoincide, false);
});

test('Registro: email duplicado devuelve 409', async () => {
  const res = await fetch(`${base}/api/RegistrarUsuario`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credencial(EMAIL, PASSWORD)),
  });
  assert.equal(res.status, 409);
});

test('Registro: falta un campo devuelve 400', async () => {
  const res = await fetch(`${base}/api/RegistrarUsuario`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre: 'Sin password' }),
  });
  assert.equal(res.status, 400);
});

test('Registro: contraseña de menos de 6 caracteres devuelve 400', async () => {
  const res = await fetch(`${base}/api/RegistrarUsuario`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credencial(`corta-${Date.now()}@correo.com`, '123')),
  });
  assert.equal(res.status, 400);
});

// =====================================================================
// VALIDACION / VERIFICACION DE CONTRASEÑA (POST /api/Login)
// =====================================================================

test('Login: contraseña correcta devuelve 200 y el usuario', async () => {
  const res = await fetch(`${base}/api/Login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  assert.equal(res.status, 200);

  const cuerpo = await res.json();
  assert.equal(cuerpo.Mensaje, 'Inicio de sesión exitoso ✅');
  assert.equal(cuerpo.usuario.email, EMAIL);
});

test('Login: contraseña incorrecta devuelve 401 (hash no coincide)', async () => {
  const res = await fetch(`${base}/api/Login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: 'clave-incorrecta' }),
  });
  assert.equal(res.status, 401);
});

test('Login: email inexistente devuelve 401', async () => {
  const res = await fetch(`${base}/api/Login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'nadie@correo.com', password: PASSWORD }),
  });
  assert.equal(res.status, 401);
});

test('Login: falta un campo devuelve 400', async () => {
  const res = await fetch(`${base}/api/Login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL }),
  });
  assert.equal(res.status, 400);
});