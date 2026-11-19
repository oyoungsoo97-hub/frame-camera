import json,os
from pathlib import Path
family=os.environ['DEVICE_FAMILY']
data=json.loads(Path('build/qa/simulators.json').read_text())
choices=[]
for runtime,devices in data['devices'].items():
 if 'iOS' not in runtime:continue
 for d in devices:
  if d.get('isAvailable') and family in d['name']:
   choices.append((runtime,'Pro Max' in d['name'] or '13-inch' in d['name'],d['name'],d['udid']))
if not choices:raise SystemExit('No installed simulator for '+family)
runtime,_,name,udid=sorted(choices,reverse=True)[0]
print('Testing actual simulator:',name,runtime,udid)
with open(os.environ['GITHUB_ENV'],'a') as out:out.write('FRAME_SIMULATOR='+udid+'\n')
Path('build/qa/selected-device.json').write_text(json.dumps({'family':family,'name':name,'runtime':runtime,'udid':udid},indent=2))
