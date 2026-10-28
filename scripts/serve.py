#!/usr/bin/env python3
"""Preview server for Shanmu's redesign, with the feedback overlay's save endpoint.
Usage:  python3 serve.py [port]   (default 8000). Python 3 standard library only."""
import http.server, json, os, sys, tempfile

ROOT = os.path.dirname(os.path.abspath(__file__))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000

def atomic_write(name, data):
    fd, tmp = tempfile.mkstemp(dir=ROOT, prefix='.' + name)
    with os.fdopen(fd, 'w', encoding='utf-8') as f:
        f.write(data)
    os.replace(tmp, os.path.join(ROOT, name))

class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)
    def end_headers(self):
        p = self.path.split('?')[0]
        if p in ('/', '/index.html') or p.endswith('.html') or p.startswith('/__feedback'):
            self.send_header('Cache-Control', 'no-store')
        super().end_headers()
    def do_GET(self):
        if self.path.split('?')[0] == '/__feedback':
            path = os.path.join(ROOT, 'feedback.json')
            body = open(path, 'rb').read() if os.path.exists(path) else b'{}'
            self.send_response(200); self.send_header('Content-Type', 'application/json'); self.send_header('Content-Length', str(len(body))); self.end_headers(); self.wfile.write(body)
            return
        super().do_GET()
    def do_POST(self):
        if self.path.split('?')[0] != '/__feedback':
            self.send_error(404); return
        try:
            n = int(self.headers.get('Content-Length', 0))
            data = json.loads(self.rfile.read(n) or b'{}')
            md = data.pop('markdown', '')
            atomic_write('feedback.json', json.dumps(data, indent=2, ensure_ascii=False))
            atomic_write('feedback.md', md + '\n')
            self.send_response(204); self.end_headers()
        except Exception as e:
            self.send_error(400, str(e))
    def log_message(self, fmt, *args):
        if 'POST' in (args[0] if args else ''):
            print('feedback saved ->', os.path.join(ROOT, 'feedback.md'), flush=True)

if __name__ == '__main__':
    print(f'Open http://localhost:{PORT}   (comments save to {os.path.join(ROOT, "feedback.md")})', flush=True)
    http.server.ThreadingHTTPServer(('', PORT), H).serve_forever()
