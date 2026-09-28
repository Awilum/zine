import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { buildCommand } from './build.js';

export async function previewCommand(root, flags) {
  const result = buildCommand(root, { ...flags, quiet: true });
  const port = Number(flags.port || 4173);
  const pdfName = path.basename(result.output);
  const server = http.createServer((req, res) => {
    if (req.url === '/health') {
      res.writeHead(200, { 'content-type': 'application/json' });
      return res.end(JSON.stringify({ ok: true }));
    }
    if (req.url === `/pdf/${encodeURIComponent(pdfName)}`) {
      res.writeHead(200, {
        'content-type': 'application/pdf',
        'cache-control': 'no-cache',
      });
      return fs.createReadStream(result.output).pipe(res);
    }
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(
      `<!doctype html><html><head><meta charset="utf-8"><title>ZINE Preview</title><style>html,body{margin:0;height:100%;font:14px system-ui;background:#111;color:#fff}header{height:48px;display:flex;align-items:center;padding:0 16px;box-sizing:border-box;background:#181818}main{height:calc(100% - 48px)}iframe{width:100%;height:100%;border:0}</style></head><body><header><strong>ZINE</strong><span style="margin-left:12px;opacity:.7">${escapeHtml(result.title)} · ${result.pages} pages</span></header><main><iframe src="/pdf/${encodeURIComponent(pdfName)}"></iframe></main></body></html>`,
    );
  });
  await new Promise((resolve, reject) =>
    server.once('error', reject).listen(port, '127.0.0.1', resolve),
  );
  const url = `http://localhost:${port}`;
  console.log(
    `ZINE Preview\nLocal server: ${url}\nWatching: ${root}\nPress Ctrl+C to stop.`,
  );
  if (!flags.noOpen) openBrowser(url);
  return { url, server };
}
function escapeHtml(s) {
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ],
  );
}
function openBrowser(url) {
  const command =
    process.platform === 'darwin'
      ? 'open'
      : process.platform === 'win32'
        ? 'cmd'
        : 'xdg-open';
  const args = process.platform === 'win32' ? ['/c', 'start', '', url] : [url];
  spawn(command, args, { stdio: 'ignore', detached: true }).unref();
}
