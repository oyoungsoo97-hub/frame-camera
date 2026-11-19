"""Preserve only relevant generated QA evidence, excluding bulky xcresult internals."""
from pathlib import Path
import json, zipfile
root = Path('evidence')
for group in ['Android-QA-31-phone','Android-QA-36-phone','Android-QA-36-fold']:
    screenshots = list((root/group).rglob('FRAME-qa-*.png'))
    assert len(screenshots) == 6, f'{group}: expected six screenshot files, got {len(screenshots)}'

with zipfile.ZipFile('release-evidence/FRAME-2.1.0-QA-evidence.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
    for name in ['qa-run.json','qa-jobs.json','android-qa-run.json','android-qa-jobs.json']:
        archive.write(name, name)
    for p in root.rglob('*'):
        if not p.is_file() or any(part.endswith('.xcresult') for part in p.parts):
            continue
        if p.suffix == '.png' or p.name in ['android-logcat.txt','android-webview.txt','xcode-tests.log','selected-simulator.json','host-kernel-tail.txt'] or p.name.endswith('-audit.json') or (p.suffix == '.xml' and p.name.startswith('TEST-')) or (p.name == 'manifest.json' and 'native-screenshots' in p.parts):
            archive.write(p, p.relative_to(root))
for p in root.rglob('android-logcat.txt'):
    print(f'--- {p} ---')
    lines=p.read_text(errors='replace').splitlines()
    relevant=[i for i,s in enumerate(lines) if any(x in s for x in ['FATAL','Fatal','FRAME_QA','crash','tombstone','OutOfMemory','lmkd'])]
    selected=set()
    for i in relevant[-30:]:selected.update(range(max(0,i-2),min(len(lines),i+5)))
    for i in sorted(selected):print(lines[i])
    print('\n'.join(lines[-60:]))
