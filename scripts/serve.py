#!/usr/bin/env python3
"""Local server for Shanmu's redesign: serves the build, with no caching on the HTML so a refresh shows the latest.
Usage:  python3 serve.py [port]   (default 8000). Python 3 standard library only."""
import http.server, os, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000

class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)
    def end_headers(self):
        p = self.path.split('?')[0]
        if p in ('/', '/index.html') or p.endswith('.html'):
            self.send_header('Cache-Control', 'no-store')
        super().end_headers()

if __name__ == '__main__':
    print(f'Open http://localhost:{PORT}', flush=True)
    http.server.ThreadingHTTPServer(('', PORT), H).serve_forever()
