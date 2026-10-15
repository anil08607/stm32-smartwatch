"""Prepare fresh world-coordinate pad images and protected DSN routing input."""
from pathlib import Path
import math
import pcbnew as p
import wx
wx.Log.SetLogLevel(0)
app = wx.App(False)
b = p.LoadBoard(str(Path('build/native/smartwatch-nrf52810.kicad_pcb').resolve()))
Path('build').mkdir(exist_ok=True)
held = []
for f in b.GetFootprints():
    pads = [(a, p.VECTOR2I(a.GetPosition().x, a.GetPosition().y), a.GetOrientationDegrees(), a.GetLayerSet()) for a in f.Pads()]
    f.SetOrientationDegrees(0)
    f.SetFPID(p.LIB_ID('', f.GetReference() + '_route'))
    for a, position, angle, layers in pads:
        a.SetPosition(position)
        a.SetOrientationDegrees(angle)
        a.SetLayerSet(layers)
for z in list(b.Zones()):
    held.append(z)
    b.Remove(z)
z = p.ZONE(b)
z.SetIsRuleArea(True)
z.SetDoNotAllowTracks(True)
z.SetDoNotAllowVias(True)
z.SetLayerSet(p.LSET.AllCuMask(4))
poly = z.Outline()
poly.NewOutline()
for x, y in [(17, 2.3), (23, 2.3), (23, 9.3), (17, 9.3)]:
    poly.Append(p.FromMM(100 + x), p.FromMM(100 - y))
b.Add(z)
p.SaveBoard(str(Path('build/router-base.kicad_pcb').resolve()), b)
assert p.ExportSpecctraDSN(b, str(Path('build/input.dsn').resolve()))
path = Path('build/input.dsn')
s = path.read_text()
start = s.index('(class kicad_default')
i, depth = start, 0
while i < len(s):
    if s[i] == '(':
        depth += 1
    if s[i] == ')':
        depth -= 1
        if depth == 0:
            break
    i += 1
head, tail = s[start:i + 1].split('(circuit', 1)
power = {'BAT', 'SYS', 'V3V0', 'USB5V', 'BUCK_L1', 'BUCK_L2'}
head = ' '.join(w for w in head.split() if w not in power) + '\n'
classes = head + '(circuit' + tail
for name in sorted(power):
    width = 400 if name in ['BAT', 'USB5V'] else 300
    classes += f'\n(class power_{name} {name} (circuit (use_via "Via[0-3]_400:200_um")) (rule (width {width})(clearance 100)))'
s = (s[:start] + classes + s[i + 1:]).replace('(type route)', '(type protect)')
s = s.replace(s.splitlines()[0], '(pcb "smartwatch-nrf52810"', 1)
path.write_text(s)
print('Prepared build/router-base.kicad_pcb and build/input.dsn; source pad world coordinates preserved.')
