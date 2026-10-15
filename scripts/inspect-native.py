"""Extract exact segment widths and independently inspect native connectivity."""
import pcbnew as p,wx,json,math,sys,hashlib
from pathlib import Path
wx.Log.SetLogLevel(0);app=wx.App(False)
file=Path(sys.argv[1] if len(sys.argv)>1 else 'hardware/smartwatch-nrf52810.kicad_pcb');b=p.LoadBoard(str(file.resolve()));layers={p.F_Cu:'top',p.In1_Cu:'inner1',p.In2_Cu:'inner2',p.B_Cu:'bottom'}
def xy(v):return {'x':round(p.ToMM(v.x)-100,6),'y':round(100-p.ToMM(v.y),6)}
tracks=[];vias=[];stats={};plane_conflicts=[];antenna_errors=[]
def crosses(a,b,margin=0):
 lo,hi=0.,1.
 for axis,mn,mx in [('x',17-margin,23+margin),('y',2.3-margin,9.3+margin)]:
  d=b[axis]-a[axis]
  if abs(d)<1e-12:
   if not mn<=a[axis]<=mx:return False
  else:
   x,y=sorted(((mn-a[axis])/d,(mx-a[axis])/d));lo=max(lo,x);hi=min(hi,y)
   if lo>hi:return False
 return True
for t in b.GetTracks():
 net=t.GetNetname();s=stats.setdefault(net,{'length_mm':0,'vias':0,'layers':set(),'widths_mm':set()})
 if isinstance(t,p.PCB_VIA):
  s['vias']+=1
  vxy=xy(t.GetPosition())
  if crosses(vxy,vxy,p.ToMM(t.GetWidth(p.F_Cu))/2):antenna_errors.append(f'{net}: via enters antenna keepout')
  vias.append({'net':net,**xy(t.GetPosition()),'outer_diameter':p.ToMM(t.GetWidth(p.F_Cu)),'hole_diameter':p.ToMM(t.GetDrillValue()),'layers':list(layers.values())})
 else:
  start,end=xy(t.GetStart()),xy(t.GetEnd());w=p.ToMM(t.GetWidth());layer=layers[t.GetLayer()];s['length_mm']+=p.ToMM(t.GetLength());s['layers'].add(layer);s['widths_mm'].add(w);tracks.append({'net':net,'route':[{'route_type':'wire',**q,'width':w,'layer':layer} for q in [start,end]]})
  if crosses(start,end,w/2) and not(net=='RF_FEED' and layer=='top'):antenna_errors.append(f'{net}: {layer} track enters antenna keepout')
  # Conservative RF corridor bounding-box audit. Potential crossings are review holds.
  if layer=='inner1' and net!='GND' and max(start['x'],end['x'])>2 and min(start['x'],end['x'])<17 and max(start['y'],end['y'])>4.3 and min(start['y'],end['y'])<6.8:plane_conflicts.append({'net':net,'start':start,'end':end})
for s in stats.values():s['layers']=sorted(s['layers']);s['widths_mm']=sorted(s['widths_mm'])
expected=json.loads(Path('hardware/pin-net-manifest.json').read_text());errors=list(antenna_errors);positions={};actual={}
for f in b.GetFootprints():
 ref=f.GetReference();actual[ref]={};positions[ref]={'center':xy(f.GetPosition()),'rotation':f.GetOrientationDegrees(),'pad1':None}
 for a in f.Pads():
  num=a.GetNumber()
  if not num:continue
  net=a.GetNetname() or None;actual[ref][num]=net
  if num=='1':positions[ref]['pad1']=xy(a.GetPosition())
  if num not in expected.get(ref,{}) and net is None and num in {'J2':['3','4'],'J5':['3','4'],'J3':['7','8']}.get(ref,[]):continue
  if num not in expected.get(ref,{}) or expected[ref][num]!=net:errors.append(f'{ref}.{num}: native {net} differs from source {expected.get(ref,{}).get(num)}')
 for num in expected.get(ref,{}):
  if num not in actual[ref]:errors.append(f'{ref}.{num}: missing native land')
for net in ['HF_X1','HF_X2','LF_X1','LF_X2','RTC_OSCI','RTC_OSCO','NRF_DEC1','NRF_DEC2','NRF_DEC3','NRF_DEC4','RF_ANT','RF_50','RF_FEED']:
 if stats[net]['vias'] or stats[net]['layers']!=['top']:errors.append(f'{net}: critical path must remain on top without vias')
for net in ['HF_X1','HF_X2','LF_X1','LF_X2','RTC_OSCI','RTC_OSCO']:
 if stats[net]['length_mm']>10:errors.append(f'{net}: path exceeds 10 mm including load branches')
for net in ['NRF_DEC1','NRF_DEC2','NRF_DEC3','NRF_DEC4']:
 if stats[net]['length_mm']>5:errors.append(f'{net}: regulator decoupling route exceeds 5 mm')
report={'board_sha256':hashlib.sha256(file.read_bytes()).hexdigest(),'component_count':len(positions),'native_pad_net_manifest':actual,'positions':positions,'stats':stats,'rf_reference_corridor_candidates':plane_conflicts,'errors':errors}
Path('routing/native-copper.json').write_text(json.dumps({'tracks':tracks,'vias':vias},indent=2)+'\n');Path('docs/checks/native-geometry.json').write_text(json.dumps(report,indent=2)+'\n');print(f'{len(tracks)} exact-width segments, {len(vias)} vias; {len(errors)} source/native or critical-route errors; {len(plane_conflicts)} RF reference-plane candidates')
if errors:print('\n'.join(errors));sys.exit(1)
