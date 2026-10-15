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
