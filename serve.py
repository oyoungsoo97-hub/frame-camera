#!/usr/bin/env python3
"""Launch FRAME locally. No package installation is needed."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import errno
import webbrowser

root = Path(__file__).resolve().parent / 'dist'
handler = partial(SimpleHTTPRequestHandler, directory=str(root))
server = None
for port in range(4173, 4183):
    try:
        server = ThreadingHTTPServer(('127.0.0.1', port), handler)
        break
    except OSError as error:
        if error.errno != errno.EADDRINUSE:
            raise
if server is None:
    raise SystemExit('Ports 4173–4182 are unavailable.')
url = f'http://127.0.0.1:{server.server_port}/'
print(f'\nFRAME — Camera coach\n{url}\n\nPress Control+C to stop the local server.\n', flush=True)
webbrowser.open(url)
try:
    server.serve_forever()
except KeyboardInterrupt:
    pass
finally:
    server.server_close()
