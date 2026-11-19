import test from 'node:test';
import assert from 'node:assert/strict';
import {qualityStats,eyeState,chooseBest,canAutoShoot,analyzeScene} from '../dist/photo-analysis.js';
import {poses,posePacks,styles,analyzePose} from '../dist/coach.js';
import {estimateMetricGuide} from '../dist/metric-guide.js';
const image=(fn,w=120,h=160)=>{const data=new Uint8ClampedArray(w*h*4);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=fn(x,y);data[i]=data[i+1]=data[i+2]=v;data[i+3]=255;}return {data,width:w,height:h};};
test('sharpness distinguishes a flat image from visible detail',()=>{
  assert.equal(qualityStats(image(()=>120)).sharpness,0);assert.ok(qualityStats(image((x,y)=>(x+y)%2?220:30)).sharpness>100);
});
test('motion needs two frames and detects a changing image',()=>{
  const a=image(()=>100),first=qualityStats(a);assert.equal(first.motion,null);
  assert.equal(qualityStats(a,first.gray).motion,0);assert.ok(qualityStats(image(()=>160),first.gray).motion>50);
});
const face=(left,right,size=.2)=>({faceLandmarks:[[{x:.4,y:.3},{x:.4+size,y:.3+size}]],faceBlendshapes:[{categories:[{categoryName:'eyeBlinkLeft',score:left},{categoryName:'eyeBlinkRight',score:right}]}]});
test('eye checks preserve uncertainty and reject a tiny face',()=>{
  assert.equal(eyeState(null),'unknown');assert.equal(eyeState(face(.1,.1,.02)),'unknown');assert.equal(eyeState(face(.4,.1)),'unknown');
  assert.equal(eyeState(face(.1,.1)),'open');assert.equal(eyeState(face(.8,.1)),'closed');
});
test('best-shot ranking rejects a blink even if that frame is sharper',()=>{
  const q=[{eyes:'closed',sharpness:900,motion:0},{eyes:'open',sharpness:150,motion:1},{eyes:'open',sharpness:160,motion:20}];assert.equal(chooseBest(q.map(quality=>({quality}))),1);assert.equal(chooseBest([]),-1);
});
test('unknown eyes can rank by sharpness but cannot trigger automatic capture',()=>{
  assert.equal(chooseBest([{quality:{eyes:'unknown',sharpness:50,motion:0}},{quality:{eyes:'unknown',sharpness:200,motion:0}}]),1);
  const q={eyes:'open',sharpness:200,motion:1,at:1000,eyeAt:1000};assert.equal(canAutoShoot(true,q,1100),true);
  for(const patch of [{eyes:'unknown'},{eyes:'closed'},{motion:10},{motion:null},{sharpness:0},{at:0},{eyeAt:0}])assert.equal(canAutoShoot(true,{...q,...patch},1500),false);
  assert.equal(canAutoShoot(false,q,1100),false);
});
test('a quieter left background produces a left-third recommendation',()=>{
  const r=analyzeScene(image((x,y)=>x<60?120:(x+y)%2?230:20));assert.equal(r.meaningful,true);assert.ok(r.targetX<.5);
});
test('uniform scenes do not invent a horizon or a strong side preference',()=>{
  const r=analyzeScene(image(()=>120));assert.equal(r.meaningful,false);assert.equal(r.horizon,null);
});
test('a strong horizontal boundary is reported as a possible level edge',()=>{
  const r=analyzeScene(image((x,y)=>y<64?200:80));assert.ok(r.horizon);assert.ok(Math.abs(r.horizon.angle)<1);assert.match(r.level,/horizontal edge/);
});
test('dim-light advice depends on measured brightness',()=>{assert.match(analyzeScene(image(()=>20)).lighting,/dim/);});
test('all situation packs point to implemented poses and frame styles',()=>{
  assert.equal(posePacks.length,4);for(const pack of posePacks){assert.ok(styles[pack.style]);assert.ok(pack.poses.length>=2);for(const id of pack.poses)assert.ok(poses.some(p=>p.id===id));}
});
function seated(){
  const p=Array.from({length:33},()=>({x:.5,y:.4,visibility:1}));
  const positions={0:[.5,.22],11:[.42,.34],12:[.58,.34],13:[.4,.48],14:[.6,.48],15:[.4,.63],16:[.6,.63],23:[.45,.6],24:[.55,.6],25:[.3,.65],26:[.7,.65],27:[.3,.88],28:[.7,.88]};
  Object.entries(positions).forEach(([i,[x,y]])=>p[i]={x,y,visibility:1});return p;
}
test('seated pose refuses a confident score when knees are hidden',()=>{const p=seated();p[25].visibility=.1;const r=analyzePose(p,'seated','sit');assert.equal(r.ready,false);assert.equal(r.metrics[2].value,null);});
test('seated poses never reuse a standing metric scale',()=>{assert.equal(estimateMetricGuide(analyzePose(seated(),'seated','sit'),seated(),{}, {},'seated',.75),null);});
test('scene target is used for guidance instead of the original preset position',()=>{
  const p=seated();const a=analyzePose(p,'portrait','hands',1/3),b=analyzePose(p,'portrait','hands',2/3);
  assert.equal(a.adjustments.lateral.direction,'left');assert.equal(b.adjustments.lateral.direction,'right');
});
