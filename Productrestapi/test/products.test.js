const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const app = require('../index');

test('product writes validate input and preserve records after rejected updates', async t => {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => { server.closeAllConnections(); server.close(); });
  const base = `http://127.0.0.1:${server.address().port}`;
  const send = (path, body, method = 'POST') => fetch(base + path, {method, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)});
  for (const body of [null, [], {}, {name: ' ', price: 3}, {name: 'Test', price: -1}, {name: 'Test', price: '3'}]) {
    assert.equal((await send('/products', body)).status, 400);
  }
  const response = await send('/products', {name: '  Valid product  ', price: 0});
  assert.equal(response.status, 201);
  const created = await response.json();
  assert.equal(created.name, 'Valid product');
  assert.equal((await send(`/products/${created.id}`, {price: -5}, 'PUT')).status, 400);
  assert.equal((await (await fetch(`${base}/products/${created.id}`)).json()).price, 0);
  assert.equal((await send(`/products/${created.id}`, {price: 12}, 'PUT')).status, 200);
  assert.equal((await fetch(`${base}/products/${created.id}`, {method: 'DELETE'})).status, 200);
  assert.equal((await fetch(`${base}/products/${created.id}`)).status, 404);
});

test('unsupported request encodings return 415 without exposing parser details or changing products', async t => {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => { server.closeAllConnections(); server.close(); });
  const base = `http://127.0.0.1:${server.address().port}`;
  const before = await (await fetch(base + '/products')).json();
  for (const headers of [
    { 'Content-Type': 'application/json; charset=invalid-charset' },
    { 'Content-Type': 'application/json', 'Content-Encoding': 'unsupported' },
  ]) {
    for (const method of ['POST', 'PUT']) {
      const response = await fetch(base + (method === 'PUT' ? '/products/1' : '/products'), {
        method, headers, body: JSON.stringify({ name: 'Rejected product', price: 1 }),
      });
      assert.equal(response.status, 415);
      assert.deepEqual(await response.json(), { message: 'Unsupported request encoding' });
    }
  }
  assert.deepEqual(await (await fetch(base + '/products')).json(), before);
  const valid = await fetch(base + '/products', {
    method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ name: 'Supported product', price: 1 }),
  });
  assert.equal(valid.status, 201);
  const created = await valid.json();
  await fetch(`${base}/products/${created.id}`, { method: 'DELETE' });
});
