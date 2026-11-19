import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzePose,projectLandmarks} from '../dist/coach.js';
import {createCalibration,estimateMetricGuide,sameCamera,formatDistance,parseMeasurement,metricPresentation} from '../dist/metric-guide.js';

const context={mode:'camera',epoch:1,width:768,height:1024,facing:'environment',zoom:1};
function person(){
  const p=Array.from({length:33},()=>({x:.64,y:.4,visibility:1}));
  const points={0:[.64,.25],11:[.58,.35],12:[.70,.35],13:[.56,.48],14:[.72,.48],15:[.56,.60],16:[.72,.60],23:[.60,.60],24:[.68,.60],25:[.60,.74],26:[.68,.74],27:[.60,.88],28:[.68,.88],29:[.60,.89],30:[.68,.89],31:[.59,.90],32:[.69,.90]};
  Object.entries(points).forEach(([i,[x,y]])=>p[i]={x,y,visibility:1});return p;
}
const calibration=()=>createCalibration({heightCm:'180',distanceM:'3',raw:person(),visible:person(),context});
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);

test('metric calibration accepts decimal comma and rejects ambiguous or invalid input',()=>{
  assert.equal(parseMeasurement(' 3,5 '),3.5);assert.ok(Number.isNaN(parseMeasurement('3,5.2')));
  for(const [heightCm,distanceM] of [['','3'],['0','3'],['180',''],['180','0'],['180','1e2'],['400','3']])
    assert.throws(()=>createCalibration({heightCm,distanceM,raw:person(),visible:person(),context}));
});
test('calibration requires a reliable whole person in the visible image',()=>{
  const hidden=person();hidden[27].visibility=.1;
  assert.throws(()=>createCalibration({heightCm:'180',distanceM:'3',raw:hidden,visible:hidden,context}),/entire person/);
  const cropped=projectLandmarks(person(),768,1024,400,400);
  assert.throws(()=>createCalibration({heightCm:'180',distanceM:'3',raw:person(),visible:cropped,context}),/entire person/);
});
test('metric sideways movement uses person height, image aspect ratio and visible body span',()=>{
  const p=person().map(p=>({...p,x:p.x-.12})),r=analyzePose(p);
  const m=estimateMetricGuide(r,p,calibration(),context,'travel',.75);
  close(m.lateral,.12*.75*1.8/.73);assert.equal(formatDistance(m.lateral),'≈20 cm');
  assert.match(metricPresentation(r,m,true).instruction,/right ≈20 cm/);
});
test('forward/back follows changing distance instead of repeatedly using the starting distance',()=>{
  const p=person().map(p=>({...p,y:.535+(p.y-.535)*.75})),r=analyzePose(p);
  const m=estimateMetricGuide(r,p,calibration(),context,'travel',.75);
  close(m.currentDistance,4);close(m.depth,4-3*.73/.69);assert.equal(formatDistance(m.depth),'≈85 cm');
  assert.equal(r.adjustments.depth.direction,'closer');
});
test('movement to the target converges to zero in metric units',()=>{
  const scale=.69/.73,p=person().map(p=>({...p,y:.535+(p.y-.535)*scale}));
  const m=estimateMetricGuide(analyzePose(p),p,calibration(),context,'travel',.75);
  close(m.depth,0);close(m.lateral,0);
});
test('portrait mode uses the calibrated head-to-hip span, not full person height',()=>{
  const p=person(),r=analyzePose(p,'portrait');
  const m=estimateMetricGuide(r,p,calibration(),context,'portrait',.75);
  close(m.currentDistance,3);close(m.lateral,.14*.75*1.8/.73);
});
test('aspect-ratio cropping does not change the metric sideways amount for the same scene',()=>{
  const raw=person(),normal=analyzePose(raw,'portrait');
  const square=analyzePose(projectLandmarks(raw,768,1024,400,400),'portrait');
  const a=estimateMetricGuide(normal,raw,calibration(),context,'portrait',.75);
  const b=estimateMetricGuide(square,raw,calibration(),context,'portrait',1);
  close(a.lateral,b.lateral);close(a.currentDistance,b.currentDistance);
});
test('camera restart, source, lens zoom, dimensions and facing invalidate calibration',()=>{
  const c=calibration();assert.equal(sameCamera(c,context),true);
  for(const [key,value] of [['mode','demo'],['epoch',2],['zoom',2],['width',1024],['facing','user']]){
    const changed={...context,[key]:value};assert.equal(sameCamera(c,changed),false);
    assert.equal(estimateMetricGuide(analyzePose(person()),person(),c,changed,'travel',.75),null);
  }
});
test('missing or cropped person never produces metric movement',()=>{
  const p=person();p[27].y=1.1;
  assert.equal(estimateMetricGuide(analyzePose(p),p,calibration(),context,'travel',.75),null);
  assert.equal(estimateMetricGuide(analyzePose(null),null,calibration(),context,'travel',.75),null);
  assert.equal(estimateMetricGuide(analyzePose(person()),person(),null,context,'travel',.75),null);
});
test('centimeters switch to meters and avoid centimeter-level false precision',()=>{
  assert.equal(formatDistance(.27),'≈25 cm');assert.equal(formatDistance(1.24),'≈1.2 m');
  assert.equal(formatDistance(.01),'≈5 cm');assert.equal(formatDistance(NaN),'—');assert.equal(formatDistance(0),'0 cm');
});
test('uncalibrated movement cues request setup and never claim metric values or percentages',()=>{
  const p=person().map(p=>({...p,y:.535+(p.y-.535)*.75}));
  const r=metricPresentation(analyzePose(p),null);
  assert.equal(r.instruction,'Move the camera closer.');assert.doesNotMatch(r.instruction+r.detail,/%|≈\d/);assert.match(r.detail,/Set cm \/ m/);
});
