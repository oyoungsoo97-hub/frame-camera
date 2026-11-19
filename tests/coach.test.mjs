import test from 'node:test';
import assert from 'node:assert/strict';
import {cropRect,projectLandmarks,analyzePose,smoothLandmarks} from '../dist/coach.js';

// A plausible full-length person occupying a travel guide, arms at their sides.
const person=()=>{
  const p=Array.from({length:33},()=>({x:.64,y:.4,visibility:1}));
  const points={0:[.64,.25],11:[.58,.35],12:[.70,.35],13:[.56,.48],14:[.72,.48],15:[.56,.60],16:[.72,.60],23:[.60,.60],24:[.68,.60],25:[.60,.74],26:[.68,.74],27:[.60,.88],28:[.68,.88],29:[.60,.89],30:[.68,.89],31:[.59,.90],32:[.69,.90]};
  Object.entries(points).forEach(([i,[x,y]])=>p[i]={x,y,visibility:1});return p;
};
test('landscape camera is cropped to exactly the visible portrait region',()=>{assert.deepEqual(cropRect(1920,1080,300,400),{x:555,y:0,width:810,height:1080});});
test('selfie positions reverse after cropping, while vertical coordinates stay fixed',()=>{const p=[{x:.6,y:.25,visibility:.9}];const a=projectLandmarks(p,1920,1080,300,400),b=projectLandmarks(p,1920,1080,300,400,true);assert.ok(Math.abs(a[0].x+b[0].x-1)<1e-8);assert.equal(b[0].y,.25);assert.equal(b[0].visibility,.9);});
test('no person never offers a score or a ready-to-shoot signal',()=>{const r=analyzePose(null);assert.equal(r.ready,false);assert.equal(r.score,null);assert.equal(r.kind,'find');});
test('full-body travel framing with relaxed arms is ready',()=>{const r=analyzePose(person());assert.equal(r.ready,true);assert.ok(r.score>=85);});
test('person too far left gets a screen-right placement instruction',()=>{const p=person().map(x=>({...x,x:x.x-.22}));const r=analyzePose(p);assert.equal(r.kind,'position');assert.match(r.instruction,/right/);assert.equal(r.ready,false);});
test('cropped feet take priority over pose suggestions',()=>{const p=person();p[27].y=1.1;p[28].y=1.1;const r=analyzePose(p,'travel','wave');assert.equal(r.kind,'distance');assert.equal(r.ready,false);});
test('hidden ankles do not count as a verified full-body shot',()=>{const p=person();p[27].visibility=.1;p[28].visibility=.1;assert.equal(analyzePose(p).ready,false);});
test('occluded arms never report a perfect pose score',()=>{const p=person();p[15].visibility=.1;const r=analyzePose(p);assert.equal(r.metrics[2].value,null);assert.equal(r.ready,false);});
test('raised hand is distinct from relaxed-arm target',()=>{const p=person();p[16].y=.22;p[14].y=.32;assert.equal(analyzePose(p,'travel','wave').ready,true);assert.equal(analyzePose(p,'travel','relax').ready,false);});
test('missing torso confidence is treated as no reliable detection',()=>{const p=person();p[11].visibility=.2;assert.equal(analyzePose(p).detected,false);});
test('horizontal crop cannot silently claim visibility of offscreen feet',()=>{const p=person();const projected=projectLandmarks(p,1080,1440,400,400);assert.equal(analyzePose(projected).ready,false);});

test('sideways guidance measures remaining image width and approximate shoulder widths',()=>{
  const r=analyzePose(person().map(p=>({...p,x:p.x-.12})));
  assert.equal(r.kind,'position');assert.equal(r.adjustments.lateral.percent,12);
  assert.equal(r.adjustments.lateral.shoulderWidths,1);assert.equal(r.arrow,'→');assert.match(r.actor,/PERSON/);
});
test('small placement error now gets a correction instead of being marked ready',()=>{
  const r=analyzePose(person().map(p=>({...p,x:p.x+.05})));
  assert.equal(r.ready,false);assert.equal(r.adjustments.lateral.direction,'left');assert.equal(r.adjustments.lateral.percent,5);
});
test('a smaller subject gives a relative closer estimate, never a measured distance',()=>{
  const p=person().map(p=>({...p,y:.535+(p.y-.535)*.75}));
  const r=analyzePose(p);assert.equal(r.kind,'distance');assert.equal(r.adjustments.depth.direction,'closer');
  assert.equal(r.adjustments.depth.percent,20);assert.match(r.instruction,/≈20%/);assert.doesNotMatch(r.instruction,/cm|meters/);
});
test('a larger fully visible subject gives a back estimate',()=>{
  const p=person().map(p=>({...p,y:.535+(p.y-.535)*1.15}));
  const r=analyzePose(p);assert.equal(r.adjustments.depth.direction,'back');assert.equal(r.adjustments.depth.percent,20);
});
test('cropped or uncertain feet suppress numeric distance estimates',()=>{
  for(const mode of ['cropped','hidden']){const p=person();p[27][mode==='cropped'?'y':'visibility']=mode==='cropped'?1.1:.1;
    const r=analyzePose(p);assert.equal(r.adjustments.depth.percent,null);assert.equal(r.adjustments.vertical.available,false);assert.equal(r.ready,false);}
});
test('camera tilt and resulting image movement have opposite directions',()=>{
  const p=person().map(p=>({...p,y:p.y-.07}));const r=analyzePose(p);
  assert.equal(r.kind,'vertical');assert.equal(r.adjustments.vertical.direction,'up');assert.equal(r.adjustments.vertical.imageDirection,'down');assert.equal(r.adjustments.vertical.percent,7);
});
test('selfie guidance uses displayed screen coordinates, not unmirrored source coordinates',()=>{
  const p=person().map(p=>({...p,x:p.x-.18}));
  const normal=analyzePose(projectLandmarks(p,300,400,300,400,false),'full');
  const mirrored=analyzePose(projectLandmarks(p,300,400,300,400,true),'full');
  assert.equal(normal.adjustments.lateral.direction,'right');assert.equal(mirrored.adjustments.lateral.direction,'left');
  assert.equal(normal.adjustments.lateral.percent,mirrored.adjustments.lateral.percent);
});
test('no reliable person means no movement measurements',()=>{assert.equal(analyzePose(null).adjustments,null);});
test('live smoothing reduces jitter but removes lost tracks immediately',()=>{
  const before=person(),after=person().map(p=>({...p,x:p.x+.1}));
  const smooth=smoothLandmarks(before,after);assert.ok(smooth[0].x>before[0].x&&smooth[0].x<after[0].x);
  assert.equal(smoothLandmarks(before,null),null);after[15].visibility=.1;assert.equal(smoothLandmarks(before,after)[15].visibility,.1);
});
