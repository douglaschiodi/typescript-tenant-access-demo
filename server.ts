import { createServer, type ServerResponse, type IncomingMessage } from 'node:http';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';

type Identity = { tenant: string; role: 'writer' | 'reader' };
type Project = { id: string; tenant: string; name: string };
const identities: Record<string, Identity> = {
  alice: {tenant:'north', role:'writer'},
  bob: {tenant:'south', role:'writer'},
  reader: {tenant:'north', role:'reader'}
};

function reply(res: ServerResponse, status: number, value: unknown) {
  res.writeHead(status, {'Content-Type':'application/json', 'Cache-Control':'no-store'});
  res.end(JSON.stringify(value));
}

async function body(req: IncomingMessage) {
  let size = 0;
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    const bytes = Buffer.from(chunk);
    size += bytes.length;
    if (size > 8192) {
      // Drain rather than destroy the request, so the client receives a 413.
      req.resume();
      throw new RangeError('body too large');
    }
    chunks.push(bytes);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
}

export function createDemoServer() {
  const projects: Project[] = [
    {id:'north-1', tenant:'north', name:'Synthetic North'},
    {id:'south-1', tenant:'south', name:'Synthetic South'}
  ];
  return createServer(async (req, res) => {
    try {
      const path = new URL(req.url ?? '/', 'http://localhost').pathname;
      if (path === '/health' && req.method === 'GET') return reply(res, 200, {status:'ok', demo:true});
      const rawIdentity = req.headers['x-demo-identity'];
      const identity = typeof rawIdentity === 'string' && Object.hasOwn(identities, rawIdentity)
        ? identities[rawIdentity] : undefined;
      if (!identity) return reply(res, 401, {error:'Choose a documented demo identity'});
      if (path === '/projects' && req.method === 'GET')
        return reply(res, 200, projects.filter(p => p.tenant === identity.tenant));
      if (path === '/projects' && req.method === 'POST') {
        if (identity.role !== 'writer') return reply(res, 403, {error:'Write access required'});
        const input = await body(req);
        if (!input || typeof input !== 'object' || Array.isArray(input))
          return reply(res, 400, {error:'Object required'});
        const values = input as Record<string, unknown>;
        if (Object.keys(values).some(k => k !== 'name') || typeof values.name !== 'string'
            || !values.name.trim() || values.name.length > 120)
          return reply(res, 400, {error:'Only a name of 1 to 120 characters is accepted'});
        const project = {id:randomUUID(), tenant:identity.tenant, name:values.name.trim()};
        projects.push(project);
        return reply(res, 201, project);
      }
      if (path.startsWith('/projects/') && req.method === 'GET') {
        const id = decodeURIComponent(path.slice('/projects/'.length));
        const project = projects.find(p => p.id === id && p.tenant === identity.tenant);
        return project ? reply(res, 200, project) : reply(res, 404, {error:'Not found'});
      }
      return reply(res, 404, {error:'Not found'});
    } catch (error) {
      return reply(res, error instanceof RangeError ? 413 : 400, {error:'Invalid request'});
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT ?? 3000);
  createDemoServer().listen(port, '127.0.0.1', () => console.log('Demo API: http://127.0.0.1:' + port));
}
