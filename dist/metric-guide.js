import {analyzePose,styles} from './coach.js?v=9';

// A user-supplied scale, not a depth sensor. Units follow a pinhole approximation
// with an upright subject, unchanged camera intrinsics and a near-level phone.
export function parseMeasurement(value){
  const text=String(value??'').trim();
  return /^\d+(?:[.,]\d+)?$/.test(text)?Number(text.replace(',','.')):NaN;
}
export function formatDistance(meters){
  if(!Number.isFinite(meters)||meters<0)return '—';
  if(meters===0)return '0 cm';
  const rounded=Math.max(.05,Math.round(meters*20)/20);
  return rounded<1?`≈${Math.round(rounded*100)} cm`:`≈${(Math.round(meters*10)/10).toFixed(1)} m`;
}
export function createCalibration({heightCm,distanceM,raw,visible,context}){
  const h=parseMeasurement(heightCm),d=parseMeasurement(distanceM);
  if(!Number.isFinite(h)||h<50||h>250)throw Error('Enter the person’s height between 50 and 250 cm.');
  if(!Number.isFinite(d)||d<.5||d>20)throw Error('Enter the current camera-to-person distance between 0.5 and 20 m.');
  const full=analyzePose(raw,'full'),framed=analyzePose(visible,'full'),portrait=analyzePose(raw,'portrait');
  if(!full.adjustments||full.adjustments.depth.change===null||!framed.adjustments||framed.adjustments.depth.change===null)
    throw Error('Show the entire person, including the head and both feet, then try again.');
  if(!Number.isFinite(context.width)||!Number.isFinite(context.height)||context.width<=0||context.height<=0)
    throw Error('Wait for the camera image to load, then try again.');
  const shoulderX=(raw[11].x+raw[12].x)/2,hipX=(raw[23].x+raw[24].x)/2;
  const shoulderY=(raw[11].y+raw[12].y)/2,hipY=(raw[23].y+raw[24].y)/2;
  if(hipY<=shoulderY||Math.abs(shoulderX-hipX)*context.width/context.height>(hipY-shoulderY)*.35)
    throw Error('Stand upright and hold the phone level before calibrating.');
  return {heightMeters:h/100,distanceMeters:d,fullSpan:full.height,portraitSpan:portrait.height,context:{...context}};
}
export function sameCamera(calibration,context){
  return !!calibration&&['mode','epoch','width','height','facing','zoom'].every(key=>calibration.context[key]===context[key]);
}
export function estimateMetricGuide(result,raw,calibration,context,styleId,frameAspect){
  if(styleId==='seated')return null;
  if(!sameCamera(calibration,context)||!result?.adjustments||result.adjustments.depth.change===null||!Number.isFinite(frameAspect)||frameAspect<=0)return null;
  const source=analyzePose(raw,styleId);
  if(!source.adjustments||source.adjustments.depth.change===null)return null;
  const full=styles[styleId].full;
  const referenceSpan=full?calibration.fullSpan:calibration.portraitSpan;
  const physicalSpan=calibration.heightMeters*referenceSpan/calibration.fullSpan;
  const currentDistance=calibration.distanceMeters*referenceSpan/source.height;
  const metersPerImageHeight=physicalSpan/result.height;
  return {
    lateral:Math.abs(result.adjustments.lateral.delta)*frameAspect*metersPerImageHeight,
    depth:Math.abs(currentDistance*result.adjustments.depth.change),
    currentDistance,
  };
}

// Replace all movement percentages in the camera cue, including speech. Alignment
// scores elsewhere remain percentages and do not pretend to measure distance.
export function metricPresentation(result,measurements,calibrated=false){
  const r={...result,metric:measurements};
  if(!r.adjustments)return r;
  const {lateral:l,depth:d,vertical:v}=r.adjustments;
  if(r.kind==='position'){
    r.instruction=measurements?`Move ${l.direction} ${formatDistance(measurements.lateral)}.`:`Move the person ${l.direction}.`;
    r.detail=measurements?'Estimated sideways movement. Follow the screen arrow and keep the camera still.':calibrated?'Keep the full body visible for a distance estimate.':'Tap Set cm / m and enter height and camera distance for a metric estimate.';
  }else if(r.kind==='distance'&&d.change!==null){
    r.instruction=measurements?`Move camera ${d.direction} ${formatDistance(measurements.depth)}.`:`Move the camera ${d.direction}.`;
    r.detail=measurements?'Estimated movement from your calibration. Keep the person still, the phone level and zoom unchanged.':calibrated?'The body must be clearly visible to estimate the remaining distance.':'Tap Set cm / m and enter height and camera distance for a metric estimate.';
  }else if(r.kind==='vertical'){
    r.detail=`Tilt until the person moves ${v.imageDirection} to the guide. Keep your distance; this is a rotation, not a step.`;
  }
  return r;
}
