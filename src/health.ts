import http from 'http';

export function startHealthServer(port = 3000) {
  const server = http.createServer((req, res) => {
    // Verificar se o método HTTP é GET
    if (req.method !== 'GET') {
      res.statusCode = 405;
      res.setHeader('Allow', 'GET');
      res.end('Method Not Allowed');
      return;
    }

    if (req.url === '/health') {
      res.statusCode = 200;
      res.end('ok');
      return;
    }
    res.statusCode = 404;
    res.end('not found');
  });

  // Adicionar listener de erro para tratar conflitos de porta e outros erros
  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`[health] Port ${port} is already in use`);
    } else {
      console.error(`[health] Server error:`, error.message);
    }
  });

  server.listen(port, () => console.log(`[health] listening on :${port}`));
  return server;
}
