import http from 'http';

export function startHealthServer(port = 3000) {
  const server = http.createServer((req, res) => {
    if (req.url === '/health') {
      res.statusCode = 200;
      res.end('ok');
      return;
    }
    res.statusCode = 404;
    res.end('not found');
  });
  server.listen(port, () => console.log(`[health] listening on :${port}`));
  return server;
}
