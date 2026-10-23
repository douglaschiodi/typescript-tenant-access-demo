import test from 'node:test';
import assert from 'node:assert/strict';
import { createDemoServer } from './server.ts';

test('HTTP tenant boundary, validation and role enforcement', async () => {
  const server = createDemoServer();
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const addr = server.address();
  assert.ok(addr && typeof addr !== 'string');
  const base = 'http://127.0.0.1:' + addr.port;
  const request = (path: string, identity = 'alice', init: RequestInit = {}) =>
    fetch(base + path, {...init, headers: {'X-Demo-Identity': identity, 'Content-Type': 'application/json'}});
  try {
    assert.equal((await fetch(base + '/health')).status, 200);
    assert.equal((await fetch(base + '/projects')).status, 401);
    const a = await (await request('/projects')).json() as {id:string, tenant:string}[];
    assert.deepEqual(a.map(x => x.tenant), ['north']);
    assert.equal((await request('/projects/south-1')).status, 404);
    assert.equal((await request('/projects/north-1', 'bob')).status, 404);
    assert.equal((await request('/projects', 'reader', {method:'POST', body:'{"name":"x"}'})).status, 403);
    assert.equal((await request('/projects', 'alice', {method:'POST', body:'{"name":"x","tenant":"south"}'})).status, 400);
    assert.equal((await request('/projects', 'alice', {method:'POST', body:'not json'})).status, 400);
    assert.equal((await request('/projects', 'alice', {method:'POST', body:'{"name":""}'})).status, 400);
    assert.equal((await request('/projects', 'alice', {method:'POST', body: JSON.stringify({name:'x'.repeat(20000)})})).status, 413);
    const made = await request('/projects', 'alice', {method:'POST', body:'{"name":"Synthetic plan"}'});
    assert.equal(made.status, 201);
    const row = await made.json() as {id:string,tenant:string};
    assert.equal(row.tenant, 'north');
    assert.equal((await request('/projects/' + row.id, 'bob')).status, 404);
    assert.equal((await request('/projects/' + row.id, 'reader')).status, 200);
    assert.equal((await request('/projects', 'unknown')).status, 401);
    assert.equal((await request('/absent')).status, 404);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) => server.close(e => e ? reject(e) : resolve()));
  }
});
