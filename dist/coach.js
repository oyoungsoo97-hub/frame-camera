// All measurements refer to the visible, cropped viewfinder, never the raw camera frame.
export const styles = {
  travel: { name: 'Travel', x: 0.64, height: 0.69, top: 0.19, bottom: 0.90, full: true, description: 'A little you. A little scenery.' },
  full: { name: 'Full body', x: 0.5, height: 0.79, top: 0.10, bottom: 0.90, full: true, description: 'A balanced frame, from head to toe.' },
  portrait: { name: 'Portrait', x: 0.5, height: 0.75, top: 0.12, bottom: 0.94, full: false, description: 'Let your expression take the spotlight.' },
  seated: { name: 'Seated', x: 0.5, height: 0.64, top: 0.16, bottom: 0.80, full: false, extent:'knees', description: 'Frame your face, hands and bent knees.' },
};
export const poses = [
  { id: 'relax', name: 'Relaxed', sub: 'Drop your shoulders. Let your arms relax.', tip: 'Let both arms hang loosely by your sides.', icon: 'relax' },
  { id: 'hip', name: 'Hand on hip', sub: 'Create a little space with one arm.', tip: 'Rest one hand on your hip, with your elbow pointing out.', icon: 'hip' },
  { id: 'step', name: 'One step', sub: 'A small step makes it feel effortless.', tip: 'Place one foot slightly forward, keeping your weight on your back foot.', icon: 'step' },
  { id: 'wave', name: 'Wave', sub: 'A little wave. A little personality.', tip: 'Raise one hand beside your face for a gentle wave.', icon: 'wave' },
  { id: 'hands', name: 'Hands together', sub: 'Bring your hands together loosely at your waist.', tip: 'Bring both hands together in front of your waist.', icon:'hands', gaze:'Look just past the camera.' },
  { id: 'sit', name: 'Easy seat', sub: 'Sit on a stable seat and keep your back comfortably upright.', tip: 'Bend your knees and rest your hands near your thighs.', icon:'sit', seated:true, gaze:'Look toward the camera; relax your jaw.' },
  { id: 'chin', name: 'Thoughtful', sub: 'Sit comfortably, with one hand lightly near your chin.', tip: 'Bring one hand near your chin while keeping your knees bent.', icon:'chin', seated:true, gaze:'Look slightly past the camera.' },
];
export const posePacks=[
  {id:'travel',name:'Travel',style:'travel',poses:['relax','step','wave']},
  {id:'cafe',name:'Café',style:'portrait',poses:['hands','hip','chin']},
  {id:'full',name:'Full body',style:'full',poses:['relax','hip','step','hands']},
  {id:'seated',name:'Seated',style:'seated',poses:['sit','chin']},
];
export const clamp = (v, min=0, max=1) => Math.min(max, Math.max(min, v));
export function cropRect(sw, sh, vw, vh) {
  const scale = Math.max(vw/sw, vh/sh);
  return { x: (sw-vw/scale)/2, y: (sh-vh/scale)/2, width: vw/scale, height: vh/scale };
}
export function projectLandmarks(points, sw, sh, vw, vh, mirror=false) {
  const r = cropRect(sw,sh,vw,vh);
  return points.map(p => ({...p, x: mirror ? 1-(p.x*sw-r.x)/r.width : (p.x*sw-r.x)/r.width, y:(p.y*sh-r.y)/r.height}));
}
const reliable = p => !!p && Number.isFinite(p.x) && Number.isFinite(p.y) && (p.visibility ?? 1) > .55;
const inside = p => reliable(p) && p.x > .015 && p.x < .985 && p.y > .015 && p.y < .985;
// Smooth only reliable coordinates. A missing person/joint is never held on screen.
export function smoothLandmarks(previous, current, alpha=.45) {
  if (!current) return null;
  return current.map((p,i)=>reliable(p)&&reliable(previous?.[i])
    ? {...p,x:previous[i].x+(p.x-previous[i].x)*alpha,y:previous[i].y+(p.y-previous[i].y)*alpha}
    : {...p});
}
const percent = value => Math.max(1,Math.round(Math.abs(value)*100));
const approximatePercent = value => Math.max(5,Math.round(Math.abs(value)*100/5)*5);
function poseFit(p, id, full) {
  const ids = id==='step' ? [23,24,27,28] : [11,12,13,14,15,16,23,24];
  if (!ids.every(i=>reliable(p[i]))) return {value:null,good:false,text:'Keep your arms and torso in view.'};
  if (id==='step' && (!full || !inside(p[27]) || !inside(p[28]))) return {value:null,good:false,text:'Choose a full-body frame that includes your feet.'};
  const shoulderY=(p[11].y+p[12].y)/2, hipY=(p[23].y+p[24].y)/2;
  const torso=Math.max(.08,Math.abs(hipY-shoulderY));
  let value;
  if (id==='relax') value=clamp((Math.min(p[15].y,p[16].y)-shoulderY)/torso);
  if (id==='hip') {
    const scores=[[15,13,23],[16,14,24]].map(([w,e,h])=> {
      const near=1-clamp(Math.hypot(p[w].x-p[h].x,p[w].y-p[h].y)/(torso*.7));
      const bend=clamp(Math.abs(p[e].x-p[w].x)/(torso*.2));
      return near*.65+bend*.35;
    }); value=Math.max(...scores);
  }
  if (id==='step') value=clamp(Math.hypot(p[27].x-p[28].x,p[27].y-p[28].y)/(torso*.55));
  if (id==='wave') value=clamp((shoulderY-Math.min(p[15].y,p[16].y)+torso*.2)/(torso*.5));
  if (id==='hands') value=clamp(1-Math.hypot(p[15].x-p[16].x,p[15].y-p[16].y)/(torso*.65))*clamp(1-Math.abs((p[15].y+p[16].y)/2-hipY)/torso);
  if (id==='sit'||id==='chin') {
    if(![25,26].every(i=>inside(p[i])))return {value:null,good:false,text:'Keep both knees visible to check the seated pose.'};
    const seated=clamp(1-Math.abs((p[25].y+p[26].y)/2-hipY)/(torso*.9));
    const hand=id==='chin'?clamp(1-Math.min(...[15,16].map(i=>Math.hypot(p[i].x-p[0].x,p[i].y-p[0].y)))/(torso*.7)):clamp(1-Math.abs((p[15].y+p[16].y)/2-(hipY+(p[25].y+p[26].y)/2)/2)/torso);
    value=Math.min(seated,hand);
  }
  return {value:Math.round(value*100),good:value>=.72,text:value>=.72?'Looks good. Hold that pose.':poses.find(v=>v.id===id).tip};
}
export function analyzePose(p, styleId='travel', poseId='relax',targetX=null) {
  const s={...styles[styleId]};if(Number.isFinite(targetX))s.x=clamp(targetX,.25,.75);
  if (!p || ![0,11,12,23,24].every(i=>inside(p[i]))) return {detected:false,ready:false,score:null,instruction:'Step into the frame.',detail:'Keep one person visible from face to hips to begin.',kind:'find',metrics:[],adjustments:null};
  const center=(p[11].x+p[12].x+p[23].x+p[24].x)/4;
  const shoulderY=(p[11].y+p[12].y)/2;
  const head=p[0].y-Math.abs(shoulderY-p[0].y)*.8;
  const foot=Math.max(...[27,28,29,30,31,32].filter(i=>reliable(p[i])).map(i=>p[i].y),0);
  const hip=(p[23].y+p[24].y)/2;
  const feetVisible=[27,28].every(i=>inside(p[i]));
  const kneesVisible=[25,26].every(i=>inside(p[i]));
  const extent=s.extent==='knees'?Math.max(p[25]?.y??hip,p[26]?.y??hip):s.full?foot:hip;
  const height=extent-head;
  const position=clamp(1-Math.abs(center-s.x)/.30);
  const spacing=s.full && !feetVisible ? .20 : clamp(1-Math.abs(height-s.height)/.4 - (head<.04?.4:0) - (extent>.98?.4:0));
  const fit=poseFit(p,poseId,s.full);
  const score=Math.round((position*.4+spacing*.35+(fit.value??0)/100*.25)*100);
  const metrics=[{label:'Position',value:Math.round(position*100),good:position>.78},{label:'Framing',value:Math.round(spacing*100),good:spacing>.72},{label:'Pose',value:fit.value,good:fit.good}];
  const dx=s.x-center, dy=s.top+s.height/2-(head+extent)/2;
  const shoulderWidth=Math.abs(p[11].x-p[12].x);
  const widths=shoulderWidth>.045?Math.round(Math.abs(dx)/shoulderWidth*4)/4:null;
  const lateral={direction:dx>0?'right':'left',delta:dx,percent:percent(dx),shoulderWidths:widths,aligned:Math.abs(dx)<=.03};
  // Image scale is inverse to distance only when focal length, pose and viewing angle stay fixed.
  // This is a relative estimate, never a measured distance in cm/metres.
  const scaleReliable=height>.15&&head>.015&&extent<.985&&(!s.full||feetVisible)&&(s.extent!=='knees'||kneesVisible);
  const distanceChange=scaleReliable?height/s.height-1:null;
  const depth={direction:height>s.height?'back':'closer',change:distanceChange,percent:distanceChange===null?null:approximatePercent(distanceChange),aligned:scaleReliable&&Math.abs(distanceChange)<=.08,currentHeight:Math.round(height*100),targetHeight:Math.round(s.height*100)};
  const vertical={direction:dy>0?'up':'down',imageDirection:dy>0?'down':'up',delta:dy,percent:percent(dy),aligned:Math.abs(dy)<=.035,available:scaleReliable};
  let kind='ready', instruction='That is your shot.', detail='Position, size and pose are aligned. Hold still and tap the shutter.',actor='READY TO SHOOT',arrow='✓';
  if (!scaleReliable) {
    kind='distance';actor='CHECK THE FRAME';arrow='◎';
    const cropped=head<.015||extent>=.985||(s.full&&[27,28].some(i=>reliable(p[i])&&!inside(p[i])));
    instruction=cropped?'Move the camera back slowly.':s.full?'Keep both feet visible.':s.extent==='knees'?'Keep both knees visible.':'Keep your face and hips in view.';
    detail=cropped?`The body is cropped. Show the ${s.full?'head and feet':'head and hips'} before an amount can be estimated.`:s.full?'A foot is hidden or unclear. Uncover it and hold still to measure the framing.':'Move closer until your face and torso are clear enough to measure.';
    depth.direction=cropped?'back':'unknown';depth.aligned=false;
  } else if (!depth.aligned) {
    kind='distance';actor='MOVE THE CAMERA';arrow=depth.direction==='back'?'−':'+';
    instruction=`Move camera ${depth.direction} ≈${depth.percent}%.`;
    detail=`Of the current camera-to-person distance. Body height: ${depth.currentHeight}% → ${depth.targetHeight}% of the image. Keep zoom and pose fixed.`;
  } else if (!lateral.aligned) {
    kind='position';actor='MOVE THE PERSON · SCREEN DIRECTION';arrow=dx>0?'→':'←';
    const amount=widths!==null&&widths>=.25&&widths<=5?`≈${widths} shoulder ${widths===1?'width':'widths'}`:`${lateral.percent}% of image width`;
    instruction=`Move ${lateral.direction} ${amount}.`;
    detail=`Shift the person ${lateral.percent}% of the image width ${lateral.direction}, as seen on this screen. Keep the camera still.`;
  } else if (!vertical.aligned) {
    kind='vertical';actor='TILT THE CAMERA';arrow=dy>0?'↑':'↓';
    instruction=`Tilt camera ${vertical.direction} slightly.`;
    detail=`Move the person ${vertical.imageDirection} by ${vertical.percent}% of the image height. Follow the vertical arrow; keep your distance.`;
  } else if (!fit.good) {
    kind='pose';actor='ADJUST THE POSE';arrow='✧';instruction=fit.text;detail=poses.find(v=>v.id===poseId).sub;
  }
  return {detected:true,ready:kind==='ready',score,instruction,detail,kind,actor,arrow,metrics,center,head,foot,height,extent,bodyCenter:(head+extent)/2,adjustments:{lateral,depth,vertical}};
}
