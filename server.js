const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

function serveFile(res, filePath) {
  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Server error');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const rawPath = url.pathname === '/' ? '/index.html' : url.pathname;
  const safePath = path.normalize(rawPath).replace(/^\.{1,2}[\/\\]+/, '');
  const candidatePath = path.join(PUBLIC_DIR, safePath);
  const rootCandidatePath = path.join(ROOT_DIR, safePath);

  const isAllowed = (target) => {
    const normalizedTarget = path.normalize(target);
    return normalizedTarget.startsWith(PUBLIC_DIR) || normalizedTarget.startsWith(ROOT_DIR);
  };

  if (safePath.includes('..')) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Invalid path');
    return;
  }

  const finalPath = isAllowed(candidatePath) ? candidatePath : null;
  const modulePath = isAllowed(rootCandidatePath) ? rootCandidatePath : null;

  if (finalPath && fs.existsSync(finalPath) && fs.statSync(finalPath).isFile()) {
    serveFile(res, finalPath);
    return;
  }

  if (modulePath && fs.existsSync(modulePath) && fs.statSync(modulePath).isFile()) {
    serveFile(res, modulePath);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`CampusCare prototype running at http://localhost:${PORT}`);
});
