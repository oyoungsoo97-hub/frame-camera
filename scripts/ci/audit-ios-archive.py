"""Inspect a compiled unsigned device archive; do not imply signing/store acceptance."""
import json,plistlib
from pathlib import Path
archive=Path('build/FRAME-unsigned.xcarchive');apps=list((archive/'Products/Applications').glob('*.app'))
assert len(apps)==1,'Expected exactly one archived app';app=apps[0]
info=plistlib.loads((app/'Info.plist').read_bytes())
assert info['CFBundleIdentifier']=='io.github.oyoungsoo97hub.framecamera'
assert info['CFBundleShortVersionString']=='2.1.0';assert info['CFBundleVersion']=='20100'
assert info['MinimumOSVersion']=='15.4';assert info['CFBundleSupportedPlatforms']==['iPhoneOS']
assert info.get('NSCameraUsageDescription') and info.get('NSPhotoLibraryAddUsageDescription')
assert 'NSMicrophoneUsageDescription' not in info and 'NSLocationWhenInUseUsageDescription' not in info
assert not list(app.rglob('*.xctest')),'Test bundle leaked into archive'
for name in ['index.html','privacy.html','support.html','vendor/pose_landmarker_lite.task','vendor/face_landmarker.task','vendor/wasm/vision_wasm_internal.wasm']:
 assert (app/'public'/name).stat().st_size>0,'Missing local asset '+name
manifest=plistlib.loads((app/'PrivacyInfo.xcprivacy').read_bytes())
assert manifest['NSPrivacyTracking'] is False;assert manifest['NSPrivacyCollectedDataTypes']==[]
assert any(n['NSPrivacyAccessedAPIType']=='NSPrivacyAccessedAPICategoryFileTimestamp' and 'C617.1' in n['NSPrivacyAccessedAPITypeReasons'] for n in manifest['NSPrivacyAccessedAPITypes'])
for lang in ['de','en','ko']:assert (app/f'{lang}.lproj/InfoPlist.strings').exists(),'Missing permission localization '+lang
report={'version':info['CFBundleShortVersionString'],'build':info['CFBundleVersion'],'minimum_iOS':info['MinimumOSVersion'],'sdk':info.get('DTSDKName'),'platforms':info['CFBundleSupportedPlatforms'],'privacy_manifests':[str(p.relative_to(app)) for p in app.rglob('PrivacyInfo.xcprivacy')],'signing':'Unsigned; Apple team, provisioning, signed beta and App Store validation pending'}
Path('build/qa/ios-archive-audit.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
