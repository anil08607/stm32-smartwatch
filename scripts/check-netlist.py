import json,xml.etree.ElementTree as E
from pathlib import Path
expected=json.loads(Path('hardware/pin-net-manifest.json').read_text());actual={}
for net in E.parse('hardware/electrical-netlist.xml').getroot().findall('./nets/net'):
 name=net.attrib['name']
 for n in net.findall('node'):
  ref,pin=n.attrib['ref'],n.attrib['pin']
  if ref.startswith('#'):continue
  if name.startswith('unconnected-'):continue
  actual.setdefault(ref,{})[pin]=name
want={r:{p:n for p,n in pins.items() if n is not None} for r,pins in expected.items()}
assert actual==want,{'unexpected':{r:v for r,v in actual.items() if v!=want.get(r)},'missing':{r:v for r,v in want.items() if v!=actual.get(r)}}
print(f'PASS: native schematic netlist matches every connected source pin on {len(want)} components.')
