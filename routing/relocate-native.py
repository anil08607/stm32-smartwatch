"""Create the side-access routing seed from the previous reviewed board.

The source board path is explicit so a fresh design cannot silently reuse this migration.
Rotate the complete layout clockwise, then relocate the two switches, SWD header
and one pull-up. Rip up affected signal nets and copper inside the new lands.
"""
from pathlib import Path
import sys,json,shutil
import pcbnew as p,wx
wx.Log.SetLogLevel(0);app=wx.App(False)
b=p.LoadBoard(str(Path(sys.argv[1]).resolve()))
centre=p.VECTOR2I(p.FromMM(100),p.FromMM(100));angle=p.EDA_ANGLE(270,p.DEGREES_T)
for item in list(b.GetFootprints())+list(b.GetTracks())+list(b.Zones())+list(b.GetDrawings()):item.Rotate(centre,angle)
def point(x,y):return p.VECTOR2I(p.FromMM(100+x),p.FromMM(100-y))
positions={'SW1':(20.2,3.5,90),'SW2':(20.2,-3.5,90),'J3':(-7,-18,180),'R20':(-12,-14,270)}
rects=[]
for f in b.GetFootprints():
 if f.GetReference() not in positions:continue
 x,y,a=positions[f.GetReference()];f.SetPosition(point(x,y));f.SetOrientationDegrees(a)
 r=f.GetBoundingBox(False,False);r.Inflate(p.FromMM(.4));rects.append(r)
held=[];removed={}
for t in list(b.GetTracks()):
 if t.GetNetname() in {'BUTTON1','BUTTON2','SWCLK','SWDIO','NRST','DEBUG_GPIO'} or any(r.Intersects(t.GetBoundingBox()) for r in rects):
  removed[t.GetNetname()]=removed.get(t.GetNetname(),0)+1;b.Delete(t)
# Source placement positions and every physical land must agree before routing.
c=json.loads(Path('routing/source.circuit.json').read_text());names={x['source_component_id']:x['name'] for x in c if x['type']=='source_component'}
for f in b.GetFootprints():
 comp=next(x for x in c if x['type']=='pcb_component' and names[x['source_component_id']]==f.GetReference())
 assert abs(p.ToMM(f.GetPosition().x)-100-comp['center']['x'])<.0001,(f.GetReference(),'x')
 assert abs(100-p.ToMM(f.GetPosition().y)-comp['center']['y'])<.0001,(f.GetReference(),'y')
Path('build/native').mkdir(parents=True,exist_ok=True)
p.SaveBoard(str(Path('build/native/smartwatch-nrf52810.kicad_pcb').resolve()),b)
shutil.copyfile(Path(sys.argv[1]).with_suffix('.kicad_pro'),'build/native/smartwatch-nrf52810.kicad_pro')
print('Relocated native seed; removed copper by net:',json.dumps(removed,sort_keys=True))
