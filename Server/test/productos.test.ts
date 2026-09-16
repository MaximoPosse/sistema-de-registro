import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import app from '../src/app';

let server: Server;
let base: string;

const PREFIJO = `TEST-${Date.now()}`;

function productoPrueba(tag: string) {
  return {
    codigo: `${PREFIJO}-${tag}`,
    nombre: 'Producto de Prueba',
    descripcion: 'Descripcion generada por el test',
    talle: 'M',
    precio: 10.5,
    stock: 5,
    imagen: '',
  };
}

async function crearProducto(body: Record<string, unknown>) {
  return fetch(`${base}/api/Registrar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function listarProductos(): Promise<any[]> {
  const res = await fetch(`${base}/api/Productos`);
  assert.equal(res.status, 200, 'GET /api/Productos deberia responder 200');
  return res.json();
}

async function buscarPorCodigo(codigo: string) {
  const lista = await listarProductos();
  return lista.find((p: any) => p.codigo === codigo) ?? null;
}

async function limpiarPruebas() {
  const lista = await listarProductos();
  for (const p of lista.filter((x: any) => x.codigo?.startsWith('TEST-'))) {
    await fetch(`${base}/api/Eliminar/${p.id}`, { method: 'DELETE' });
  }
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
  await limpiarPruebas();
  server.close();
});

// =====================================================================
// METODO MODIFICAR PRODUCTO (PUT /api/Modificar/:id)
// =====================================================================

test('Modificar: modifica un producto existente (200/cambios aplicados)', async () => {
  const data = productoPrueba('mod-exito');
  const creado = await crearProducto(data);
  assert.equal(creado.status, 201, 'El POST deberia crear el producto');

  const existente = await buscarPorCodigo(data.codigo);
  assert.ok(existente, 'El producto deberia existir luego de crearlo');

  const cambios = {
    ...data,
    nombre: 'Producto Modificado por Test',
    precio: 99.99,
    stock: 42,
  };

  const res = await fetch(`${base}/api/Modificar/${existente.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cambios),
  });
  assert.equal(res.status, 200, 'El PUT deberia responder 200');

  const modificado = await buscarPorCodigo(data.codigo);
  assert.equal(modificado.nombre, 'Producto Modificado por Test');
  assert.equal(Number(modificado.precio), 99.99);
  assert.equal(Number(modificado.stock), 42);
});

test('Modificar: id inexistente devuelve 404', async () => {
  const res = await fetch(`${base}/api/Modificar/999999999`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productoPrueba('id-inexistente')),
  });
  assert.equal(res.status, 404);
});

test('Modificar: falta codigo/nombre devuelve 400', async () => {
  const res = await fetch(`${base}/api/Modificar/1`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ descripcion: 'sin codigo ni nombre' }),
  });
  assert.equal(res.status, 400);
});

// =====================================================================
// METODO ELIMINAR PRODUCTO (DELETE /api/Eliminar/:id)
// =====================================================================

test('Eliminar: elimina un producto existente (200/ya no figura)', async () => {
  const data = productoPrueba('del-exito');
  const creado = await crearProducto(data);
  assert.equal(creado.status, 201);

  const existente = await buscarPorCodigo(data.codigo);
  assert.ok(existente, 'El producto deberia existir antes de eliminar');

  const res = await fetch(`${base}/api/Eliminar/${existente.id}`, {
    method: 'DELETE',
  });
  assert.equal(res.status, 200, 'El DELETE deberia responder 200');

  const despues = await buscarPorCodigo(data.codigo);
  assert.equal(despues, null, 'El producto no deberia existir luego de eliminarlo');
});

test('Eliminar: id inexistente devuelve 404', async () => {
  const res = await fetch(`${base}/api/Eliminar/999999999`, {
    method: 'DELETE',
  });
  assert.equal(res.status, 404);
});