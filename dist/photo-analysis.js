export function luminance(image){
  const gray=new Float32Array(image.width*image.height);
  for(let i=0;i<gray.length;i++)gray[i]=image.data[i*4]*.2126+image.data[i*4+1]*.7152+image.data[i*4+2]*.0722;
  return gray;
}
export function qualityStats(image,previous=null){
  const gray=luminance(image),w=image.width,h=image.height;let sum=0,square=0,n=0,diff=0;
  for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
    const i=y*w+x,v=gray[i-1]+gray[i+1]+gray[i-w]+gray[i+w]-4*gray[i];sum+=v;square+=v*v;n++;
  }
  if(previous?.length===gray.length)for(let i=0;i<gray.length;i++)diff+=Math.abs(gray[i]-previous[i]);
  return {gray,sharpness:n?Math.max(0,square/n-(sum/n)**2):0,motion:previous?.length===gray.length?diff/gray.length:null};
}
export function eyeState(result){
  const points=result?.faceLandmarks?.[0],cats=result?.faceBlendshapes?.[0]?.categories;
  if(!points||!cats)return 'unknown';
  const xs=points.map(p=>p.x),ys=points.map(p=>p.y);
  if(Math.max(...xs)-Math.min(...xs)<.045||Math.max(...ys)-Math.min(...ys)<.045)return 'unknown';
  const left=cats.find(c=>c.categoryName==='eyeBlinkLeft')?.score,right=cats.find(c=>c.categoryName==='eyeBlinkRight')?.score;
  if(!Number.isFinite(left)||!Number.isFinite(right))return 'unknown';
  if(left>.55||right>.55)return 'closed';
  return left<.35&&right<.35?'open':'unknown';
}
export function qualityScore(q){
  return (q.eyes==='open'?500:q.eyes==='closed'?-500:0)+Math.log1p(Math.max(0,q.sharpness))*25-Math.min(q.motion??0,60)*5;
}
export function chooseBest(frames){
  if(!frames.length)return -1;
  return frames.reduce((best,frame,i)=>qualityScore(frame.quality)>qualityScore(frames[best].quality)?i:best,0);
}
export function canAutoShoot(poseReady,q,now){
  return !!poseReady&&!!q&&now-q.at<1000&&now-(q.eyeAt??q.at)<1000&&q.eyes==='open'&&q.motion!==null&&q.motion<7&&q.sharpness>18;
}

// Low-resolution image measurements, not semantic scene recognition. A strong
// horizontal edge is called a possible horizon because it may also be a wall.
export function analyzeScene(image,person=null){
  const w=image.width,h=image.height,g=luminance(image);
  const valid=p=>p&&(p.visibility??1)>.55;
  const points=person?.filter(valid)??[];
  const box=points.length?{l:Math.min(...points.map(p=>p.x))-.05,r:Math.max(...points.map(p=>p.x))+.05,t:Math.min(...points.map(p=>p.y))-.07,b:Math.max(...points.map(p=>p.y))+.04}:null;
  const masked=(x,y)=>box&&x/w>box.l&&x/w<box.r&&y/h>box.t&&y/h<box.b;
  const regions=[{edges:0,light:0,n:0},{edges:0,light:0,n:0}];let brightness=0;
  for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
    const i=y*w+x;brightness+=g[i];if(masked(x,y))continue;
    const j=x<w*.45?0:x>w*.55?1:-1;if(j<0)continue;
    regions[j].edges+=Math.abs(g[i+1]-g[i])+Math.abs(g[i+w]-g[i]);regions[j].light+=g[i];regions[j].n++;
  }
  const [left,right]=regions.map(r=>r.n?r.edges/r.n:0),contrast=Math.abs(left-right);
  const meaningful=regions.every(r=>r.n>w*h*.08)&&contrast>3&&Math.max(left,right)>Math.min(left,right)*1.3;
  const targetX=meaningful?(left<right?1/3:2/3):.64;
  const busy=(left+right)/2>35,style=busy?'portrait':'travel';
  const light=brightness/Math.max(1,(w-2)*(h-2));
  let faceLight=null;
  if(valid(person?.[0])){
    const p=person[0],radius=Math.max(3,Math.abs((person[11]?.x??p.x)-(person[12]?.x??p.x))*w*.3);let sum=0,n=0;
    for(let y=Math.max(0,Math.floor(p.y*h-radius));y<Math.min(h,p.y*h+radius);y++)for(let x=Math.max(0,Math.floor(p.x*w-radius));x<Math.min(w,p.x*w+radius);x++){sum+=g[y*w+x];n++;}faceLight=n?sum/n:null;
  }
  let lighting=light<48?'The scene is dim. Find more light and hold the phone steady.':light>220?'The scene is very bright. Avoid losing detail in highlights.':faceLight!==null&&faceLight<85&&light>faceLight*1.65?'Your face is darker than the background. Try facing the light.':'Brightness looks usable. Keep checking the face as you move.';
  const edges=[];
  for(let x=3;x<w-3;x+=3){let best=18,row=-1;for(let y=Math.floor(h*.16);y<h*.7;y++){if(masked(x,y))continue;const e=Math.abs(g[(y+1)*w+x]-g[(y-1)*w+x]);if(e>best){best=e;row=y;}}if(row>=0)edges.push([x,row]);}
  let horizon=null,bestGroup=[];
  for(const [,y] of edges){const group=edges.filter(p=>Math.abs(p[1]-y)<h*.04);if(group.length>bestGroup.length)bestGroup=group;}
  if(bestGroup.length>w/3*.45){
    const n=bestGroup.length,mx=bestGroup.reduce((s,p)=>s+p[0],0)/n,my=bestGroup.reduce((s,p)=>s+p[1],0)/n;
    const variance=bestGroup.reduce((s,p)=>s+(p[0]-mx)**2,0),slope=variance?bestGroup.reduce((s,p)=>s+(p[0]-mx)*(p[1]-my),0)/variance:0;
    const error=Math.sqrt(bestGroup.reduce((s,p)=>s+(p[1]-my-slope*(p[0]-mx))**2,0)/n);
    if(error<h*.018)horizon={y:my/h,angle:Math.atan(slope)*180/Math.PI};
  }
  return {targetX,style,meaningful,lighting,horizon,summary:busy?'Try a tighter portrait.':meaningful?`Place the person on the ${targetX<.5?'left':'right'} third.`:'Try a balanced travel frame.',reason:busy?'A tighter crop can reduce the busy background.':meaningful?'That side has fewer background edges around the subject.':'The sides look similar. Leave room for the surroundings.',level:horizon?Math.abs(horizon.angle)>1.5?`Possible horizon: rotate the phone ${horizon.angle>0?'clockwise':'counterclockwise'} about ${Math.round(Math.abs(horizon.angle))}°.`:'A strong horizontal edge looks level.':'No reliable horizon found. Keep the phone level.'};
}
