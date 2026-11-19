"""Inspect actual release outputs, not just source manifests."""
import json,sys,zipfile,xml.etree.ElementTree as ET
from pathlib import Path
root=Path('android/app/build');out=Path('build/qa');out.mkdir(parents=True,exist_ok=True)
aabs=list((root/'outputs/bundle/release').glob('*.aab'))
assert len(aabs)==1,'Expected one release AAB'
with zipfile.ZipFile(aabs[0]) as z:
 names=z.namelist();native=[n for n in names if n.endswith('.so')]
 assert not native,'New native ELF libraries require explicit 16-KB alignment verification: '+str(native)
 for file in ['index.html','app.js','privacy.html','support.html','vendor/pose_landmarker_lite.task','vendor/face_landmarker.task','vendor/wasm/vision_wasm_internal.wasm']:
  assert z.getinfo('base/assets/public/'+file).file_size>0,'Missing bundled '+file
 assert not any('scenarios.js' in n or 'FRAMEIntegrationTests' in n for n in names),'Test harness leaked into release'
manifest=list((root/'intermediates/merged_manifests/release').rglob('AndroidManifest.xml'))
assert len(manifest)==1,'Expected final merged release manifest'
tree=ET.parse(manifest[0]);ns='{http://schemas.android.com/apk/res/android}'
permissions=sorted(n.attrib[ns+'name'] for n in tree.findall('uses-permission'))
expected={'android.permission.CAMERA','android.permission.INTERNET'}
# AndroidX Core declares an app-private signature permission for dynamic receivers.
private_receiver='io.github.oyoungsoo97hub.framecamera.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION'
assert set(permissions)-{private_receiver}==expected,permissions
if private_receiver in permissions:
 definitions=[n for n in tree.findall('permission') if n.get(ns+'name')==private_receiver]
 assert len(definitions)==1 and definitions[0].get(ns+'protectionLevel')=='signature','Receiver permission must stay signature-only'
app=tree.find('application');assert app.get(ns+'debuggable','false')=='false','Debuggable release'
assert app.get(ns+'allowBackup')=='false','Backup unexpectedly enabled'
sdk=tree.find('uses-sdk');assert sdk.get(ns+'targetSdkVersion')=='36';assert sdk.get(ns+'minSdkVersion')=='24'
report={'aab':str(aabs[0]),'permissions':permissions,'minSdk':24,'targetSdk':36,'debuggable':False,'native_ELF_libraries':native,'page_size_note':'No packaged native .so libraries; MediaPipe uses WASM. Recheck if dependencies change. This does not certify physical-device behavior.','signing':'Unsigned CI bundle; production signing pending'}
(out/'android-release-audit.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
