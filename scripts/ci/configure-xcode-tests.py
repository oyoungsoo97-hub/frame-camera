from pathlib import Path
p=Path('ios/App/App.xcodeproj/project.pbxproj')
s=p.read_text()
# Stable IDs; test target uses the actual production App as its host.
ids={name:f'F100000000000000000000{i:02X}' for i,name in enumerate(['target','product','source','buildsource','resource','buildresource','group','sources','resources','frameworks','configlist','debug','release','proxy','dependency'],1)}
x=ids
objects=f'''
\t\t{x['source']} = {{isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = FRAMEIntegrationTests.swift; sourceTree = "<group>"; }};
\t\t{x['resource']} = {{isa = PBXFileReference; lastKnownFileType = sourcecode.javascript; path = scenarios.js; sourceTree = "<group>"; }};
\t\t{x['product']} = {{isa = PBXFileReference; explicitFileType = wrapper.cfbundle; path = FRAMEIntegrationTests.xctest; sourceTree = BUILT_PRODUCTS_DIR; }};
\t\t{x['buildsource']} = {{isa = PBXBuildFile; fileRef = {x['source']}; }};
\t\t{x['buildresource']} = {{isa = PBXBuildFile; fileRef = {x['resource']}; }};
\t\t{x['group']} = {{isa = PBXGroup; children = ({x['source']}, {x['resource']}); path = FRAMEIntegrationTests; sourceTree = "<group>"; }};
\t\t{x['sources']} = {{isa = PBXSourcesBuildPhase; buildActionMask = 2147483647; files = ({x['buildsource']}); runOnlyForDeploymentPostprocessing = 0; }};
\t\t{x['resources']} = {{isa = PBXResourcesBuildPhase; buildActionMask = 2147483647; files = ({x['buildresource']}); runOnlyForDeploymentPostprocessing = 0; }};
\t\t{x['frameworks']} = {{isa = PBXFrameworksBuildPhase; buildActionMask = 2147483647; files = (); runOnlyForDeploymentPostprocessing = 0; }};
\t\t{x['proxy']} = {{isa = PBXContainerItemProxy; containerPortal = 504EC2FC1FED79650016851F; proxyType = 1; remoteGlobalIDString = 504EC3031FED79650016851F; remoteInfo = App; }};
\t\t{x['dependency']} = {{isa = PBXTargetDependency; target = 504EC3031FED79650016851F; targetProxy = {x['proxy']}; }};
\t\t{x['target']} = {{isa = PBXNativeTarget; buildConfigurationList = {x['configlist']}; buildPhases = ({x['sources']}, {x['frameworks']}, {x['resources']}); buildRules = (); dependencies = ({x['dependency']}); name = FRAMEIntegrationTests; productName = FRAMEIntegrationTests; productReference = {x['product']}; productType = "com.apple.product-type.bundle.unit-test"; }};
\t\t{x['configlist']} = {{isa = XCConfigurationList; buildConfigurations = ({x['debug']}, {x['release']}); defaultConfigurationIsVisible = 0; defaultConfigurationName = Release; }};
'''
for configuration in ['Debug','Release']:
 objects+=f'''\t\t{x[configuration.lower()]} = {{isa = XCBuildConfiguration; name = {configuration}; buildSettings = {{
 BUNDLE_LOADER = "$(TEST_HOST)"; TEST_HOST = "$(BUILT_PRODUCTS_DIR)/App.app/App";
 CODE_SIGN_STYLE = Automatic; GENERATE_INFOPLIST_FILE = YES; IPHONEOS_DEPLOYMENT_TARGET = 15.4;
 PRODUCT_BUNDLE_IDENTIFIER = io.github.oyoungsoo97hub.framecamera.tests; PRODUCT_NAME = "$(TARGET_NAME)";
 SWIFT_VERSION = 5.0; TARGETED_DEVICE_FAMILY = "1,2"; SDKROOT = iphoneos;
 LD_RUNPATH_SEARCH_PATHS = ("$(inherited)","@executable_path/Frameworks","@loader_path/Frameworks");
 }}; }};
'''
if x['target'] not in s:
 s=s.replace('objects = {','objects = {'+objects,1)
 s=s.replace('504EC3061FED79650016851F /* App */,','504EC3061FED79650016851F /* App */,\n\t\t\t\t'+x['group']+',',1)
 s=s.replace('504EC3041FED79650016851F /* App.app */,','504EC3041FED79650016851F /* App.app */,\n\t\t\t\t'+x['product']+',',1)
 s=s.replace('504EC3031FED79650016851F /* App */,','504EC3031FED79650016851F /* App */,\n\t\t\t\t'+x['target']+',',1)
 p.write_text(s)
scheme=Path('ios/App/App.xcodeproj/xcshareddata/xcschemes/FrameTests.xcscheme');scheme.parent.mkdir(parents=True,exist_ok=True)
def ref(id,name,product):return f'<BuildableReference BuildableIdentifier="primary" BlueprintIdentifier="{id}" BuildableName="{product}" BlueprintName="{name}" ReferencedContainer="container:App.xcodeproj"/>'
scheme.write_text(f'''<?xml version="1.0" encoding="UTF-8"?>
<Scheme LastUpgradeVersion="2600" version="1.3">
<BuildAction parallelizeBuildables="YES" buildImplicitDependencies="YES"><BuildActionEntries>
<BuildActionEntry buildForTesting="YES" buildForRunning="YES" buildForProfiling="NO" buildForArchiving="NO" buildForAnalyzing="YES">{ref('504EC3031FED79650016851F','App','App.app')}</BuildActionEntry>
<BuildActionEntry buildForTesting="YES" buildForRunning="NO" buildForProfiling="NO" buildForArchiving="NO" buildForAnalyzing="YES">{ref(x['target'],'FRAMEIntegrationTests','FRAMEIntegrationTests.xctest')}</BuildActionEntry>
</BuildActionEntries></BuildAction>
<TestAction buildConfiguration="Debug" selectedDebuggerIdentifier="Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier="Xcode.IDEFoundation.Launcher.LLDB" shouldUseLaunchSchemeArgsEnv="YES"><Testables><TestableReference skipped="NO" parallelizable="NO">{ref(x['target'],'FRAMEIntegrationTests','FRAMEIntegrationTests.xctest')}</TestableReference></Testables></TestAction>
<LaunchAction buildConfiguration="Debug" selectedDebuggerIdentifier="Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier="Xcode.IDEFoundation.Launcher.LLDB"><BuildableProductRunnable runnableDebuggingMode="0">{ref('504EC3031FED79650016851F','App','App.app')}</BuildableProductRunnable></LaunchAction>
<AnalyzeAction buildConfiguration="Debug"/><ArchiveAction buildConfiguration="Release" revealArchiveInOrganizer="YES"/>
</Scheme>''')
