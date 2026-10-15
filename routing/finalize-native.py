"""Reproduce the reviewed native finishing operations from the saved SES.

Run with KiCad 10's Python: python routing/finalize-native.py build/replayed
This is specific to the committed routing seed. New layouts require a new review.
"""
import sys, math, json
from pathlib import Path
import pcbnew as p
import wx

wx.Log.SetLogLevel(0)
app = wx.App(False)
out = Path(sys.argv[1] if len(sys.argv) > 1 else 'build/replayed')
out.mkdir(parents=True, exist_ok=True)
source = p.LoadBoard(str(Path('routing/native/placement.kicad_pcb').resolve()))
routed = p.LoadBoard(str(Path('routing/native/router-base.kicad_pcb').resolve()))
assert p.ImportSpecctraSES(routed, str(Path('routing/native/routed.ses').resolve()))
held = []
rf_nets = {"RF_ANT", "RF_50", "RF_FEED"}
fixed_rf = [(t.GetNetname(), t.GetStart(), t.GetEnd(), t.GetLayer(), p.ToMM(t.GetWidth())) for t in source.GetTracks() if t.GetNetname() in rf_nets]
for t in list(source.GetTracks()):
    held.append(t)
    source.Remove(t)

def point(x, y):
    return p.VECTOR2I(p.FromMM(100 + x), p.FromMM(100 - y))

def add_segment(net, start, end, layer, width):
    t = p.PCB_TRACK(source)
    t.SetStart(start)
    t.SetEnd(end)
    t.SetLayer(layer)
    t.SetWidth(p.FromMM(width))
    source.Add(t)
    t.SetNet(source.FindNet(net))
    return t

for t in routed.GetTracks():
    name = t.GetNetname()
    if name in rf_nets:
        continue
    if isinstance(t, p.PCB_VIA):
        item = p.PCB_VIA(source)
        item.SetPosition(t.GetPosition())
        item.SetWidth(t.GetWidth(p.F_Cu))
        item.SetDrill(t.GetDrillValue())
        item.SetViaType(t.GetViaType())
        item.SetLayerPair(t.TopLayer(), t.BottomLayer())
        source.Add(item)
        item.SetNet(source.FindNet(name))
    else:
        layer = p.B_Cu if name == 'V3V0' and t.GetLayer() == p.In1_Cu else t.GetLayer()
        item = add_segment(name, t.GetStart(), t.GetEnd(), layer, max(.1, p.ToMM(t.GetWidth())))
    assert item.GetNetname() == name

for args in fixed_rf:
    add_segment(*args)

# One unfinished motor net is completed explicitly; never duplicate another route.
assert not any(t.GetNetname() == 'MOTOR_EN' for t in source.GetTracks()), 'New route differs: review motor finishing first'
for a, b, layer in [((-7, 5.8), (-7.6, 5.8125), p.F_Cu),
                     ((-7.6, 5.8125), (-4.4, 5.8), p.B_Cu),
                     ((-4.4, 5.8), (4.6, 14.8), p.B_Cu),
                     ((4.6, 14.8), (5.29, 14.8), p.F_Cu)]:
    add_segment('MOTOR_EN', point(*a), point(*b), layer, .15)
for x, y in [(-7.6, 5.8125), (4.6, 14.8)]:
    via = p.PCB_VIA(source)
    via.SetPosition(point(x, y))
    via.SetWidth(p.FromMM(.4))
    via.SetDrill(p.FromMM(.2))
    via.SetViaType(p.VIATYPE_THROUGH)
    via.SetLayerPair(p.F_Cu, p.B_Cu)
    source.Add(via)
    via.SetNet(source.FindNet('MOTOR_EN'))

# Preserve >=0.1 mm clearance on both sides of the motor/interrupt escape.
changed = 0
for t in source.GetTracks():
    if t.GetNetname() != 'CHG_INT':
        continue
    pairs = [(t.GetPosition, t.SetPosition)] if isinstance(t, p.PCB_VIA) else [(t.GetStart, t.SetStart), (t.GetEnd, t.SetEnd)]
    for getter, setter in pairs:
        a = getter()
        if abs(p.ToMM(a.y) - 94.5452) < .001 and 91.8 < p.ToMM(a.x) < 93:
            setter(p.VECTOR2I(a.x, p.FromMM(94.563)))
            changed += 1
assert changed >= 3, 'Saved escape geometry changed; a new clearance review is required'

for z in source.Zones():
    if z.GetIsRuleArea():
        z.SetDoNotAllowTracks(False)  # RF_FEED is checked separately; pours/vias remain forbidden.
        z.SetDoNotAllowVias(True)
        z.SetDoNotAllowPads(False)
        z.SetDoNotAllowFootprints(False)
for layer in (p.F_Cu, p.In1_Cu, p.In2_Cu, p.B_Cu):
    z = p.ZONE(source)
    z.SetLayer(layer)
    z.SetNet(source.FindNet('GND'))
    z.SetLocalClearance(p.FromMM(.15))
    z.SetThermalReliefGap(p.FromMM(.2))
    z.SetThermalReliefSpokeWidth(p.FromMM(.2))
    z.SetPadConnection(p.ZONE_CONNECTION_FULL)
    z.SetMinThickness(p.FromMM(.1))
    poly = z.Outline()
    poly.NewOutline()
    for cx, cy, angle in [(15, 15, 0), (-15, 15, 90), (-15, -15, 180), (15, -15, 270)]:
        for i in range(17):
            t = math.radians(angle + i * 90 / 16)
            a = point(cx + 7.7 * math.cos(t), cy + 7.7 * math.sin(t))
            poly.Append(a.x, a.y)
    source.Add(z)

pretty = out / 'Smartwatch.pretty'
pretty.mkdir(exist_ok=True)
for f in source.GetFootprints():
    f.Value().SetVisible(False)
    f.Reference().SetVisible(False)
    for item in list(f.GraphicalItems()):
        if item.GetLayer() in (p.F_SilkS, p.B_SilkS):
            held.append(item)
            f.Remove(item)
    f.SetFPID(p.LIB_ID('Smartwatch', f.GetReference() + '_exact'))
    p.PCB_IO_KICAD_SEXPR().FootprintSave(str(pretty.resolve()), f)
for item in list(source.GetDrawings()):
    if item.GetLayer() in (p.F_SilkS, p.B_SilkS):
        held.append(item)
        source.Remove(item)
text = p.PCB_TEXT(source)
text.SetText('ANIL')
text.SetPosition(point(-11, -20))
text.SetTextSize(p.VECTOR2I(p.FromMM(.8), p.FromMM(.8)))
text.SetTextThickness(p.FromMM(.12))
text.SetLayer(p.F_SilkS)
source.Add(text)
source.GetDesignSettings().SetAuxOrigin(point(-23, -23))
p.ZONE_FILLER(source).Fill(source.Zones())
p.SaveBoard(str((out / 'smartwatch-nrf52810.kicad_pcb').resolve()), source)
print('Replayed copper, power reference-plane change, motor escape, pours and silk. Run native checks before accepting.')
