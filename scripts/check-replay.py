"""Rebuild saved routing and compare physical copper/pads before accepting replay."""
from pathlib import Path
import os,sys,json,subprocess,shutil,hashlib,collections
import pcbnew as p,wx
wx.Log.SetLogLevel(0);app=wx.App(False)
out=Path('build/replayed');out.mkdir(parents=True,exist_ok=True)
subprocess.run([sys.executable,'routing/finalize-native.py',str(out)],check=True)
shutil.copyfile('hardware/fp-lib-table',out/'fp-lib-table')
cli=os.environ.get('KICAD_CLI','/Applications/KiCad/KiCad.app/Contents/MacOS/kicad-cli')
env={**os.environ,'FONTCONFIG_FILE':str(Path('build/fonts.conf').resolve())}
result=subprocess.run([cli,'pcb','drc','--severity-all','--all-track-errors','--format','json','--output',str(out/'drc.json'),str(out/'smartwatch-nrf52810.kicad_pcb')],capture_output=True,text=True,env=env,check=True)
assert not result.stderr.strip(),result.stderr
report=json.loads((out/'drc.json').read_text());assert not report['violations'] and not report['unconnected_items'],report
boards=[p.LoadBoard(str(f.resolve())) for f in [Path('hardware/smartwatch-nrf52810.kicad_pcb'),out/'smartwatch-nrf52810.kicad_pcb']]
def point(v):return (v.x,v.y)
def geometry(board):
 copper=[];pads=[]
 for t in board.GetTracks():
  if isinstance(t,p.PCB_VIA):copper.append(('via',t.GetNetname(),point(t.GetPosition()),t.GetWidth(p.F_Cu),t.GetDrillValue(),t.TopLayer(),t.BottomLayer()))
  else:copper.append(('track',t.GetNetname(),tuple(sorted([point(t.GetStart()),point(t.GetEnd())])),t.GetWidth(),t.GetLayer()))
 for f in board.GetFootprints():
  for a in f.Pads():pads.append((f.GetReference(),a.GetNumber(),a.GetNetname(),point(a.GetPosition()),point(a.GetSize(p.F_Cu)),point(a.GetDrillSize()),round(a.GetOrientationDegrees()%360,6)))
 return collections.Counter(copper),collections.Counter(pads)
original,replay=map(geometry,boards);assert original==replay,'Replay physical copper or pads differ'
files=['hardware/smartwatch-nrf52810.kicad_pcb','routing/finalize-native.py','scripts/check-replay.py',*[str(f) for f in Path('routing/native').iterdir() if f.is_file()]]
proof={'drc_violations':0,'unconnected':0,'native_copper_and_pads_identical':True,'copper_items':sum(original[0].values()),'pads':sum(original[1].values()),'files':{f:hashlib.sha256(Path(f).read_bytes()).hexdigest() for f in sorted(files)}}
Path('docs/checks/replay.json').write_text(json.dumps(proof,indent=2)+'\n')
print(f"PASS: replay matches {proof['copper_items']} copper items and {proof['pads']} pads; zero native DRC diagnostics.")
