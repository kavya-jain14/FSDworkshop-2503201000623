const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const app = require('../index');
const { gzipSync, deflateSync, brotliCompressSync } = require('node:zlib');

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

test('malformed compressed JSON returns 400 and valid compressed writes still succeed', async t => {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => { server.closeAllConnections(); server.close(); });
  const base = `http://127.0.0.1:${server.address().port}`;
  const before = await (await fetch(base + '/products')).json();
  const codecs = [['gzip', gzipSync], ['deflate', deflateSync], ['br', brotliCompressSync]];
  for (const [encoding, compress] of codecs) {
    for (const method of ['POST', 'PUT']) {
      const response = await fetch(base + (method === 'PUT' ? '/products/1' : '/products'), {
        method, headers: { 'Content-Type': 'application/json', 'Content-Encoding': encoding },
        body: 'private product details, not a compressed stream',
      });
      assert.equal(response.status, 400, `${encoding} ${method}`);
      assert.deepEqual(await response.json(), { message: 'Send a valid request body' });
    }
    const response = await fetch(base + '/products', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Encoding': encoding },
      body: compress(JSON.stringify({ name: 'Valid compressed product', price: 1 })),
    });
    assert.equal(response.status, 201, `${encoding} should remain supported`);
    const created = await response.json();
    assert.equal(created.name, 'Valid compressed product');
    await fetch(`${base}/products/${created.id}`, { method: 'DELETE' });
  }
  const truncated = gzipSync(JSON.stringify({ name: 'Truncated product', price: 2 })).subarray(0, 10);
  const truncatedResponse = await fetch(base + '/products', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Encoding': 'gzip' }, body: truncated,
  });
  assert.equal(truncatedResponse.status, 400);
  assert.deepEqual(await truncatedResponse.json(), { message: 'Send a valid request body' });
  const oversizedResponse = await fetch(base + '/products', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Encoding': 'gzip' },
    body: gzipSync(JSON.stringify({ name: 'x'.repeat(110000), price: 1 })),
  });
  assert.equal(oversizedResponse.status, 413);
  assert.deepEqual(await oversizedResponse.json(), { message: 'Request body is too large' });
  assert.deepEqual(await (await fetch(base + '/products')).json(), before);
});
