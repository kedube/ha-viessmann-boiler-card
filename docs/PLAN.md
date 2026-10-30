# Viessmann Boiler Card: Plan

_Last updated 2026-10-30. Status: built, and installed through HACS from release v0.2.0. Usage tab added since._

A Home Assistant dashboard card for the built-in **Viessmann ViCare** integration (`vicare`). It shows a realistic rendering of the chosen Viessmann unit inside its full hydronic system: heating loops, zones and the hot water tank loop. Water flow is animated from live states, and every entity and setting the integration provides is available in the card.

## Decisions

| Topic | Decision |
|---|---|
| Rendering | Equipment is rendered in Blender as realistic, straight-on front views. The card arranges them in a 2D system diagram and draws pipes, flow and labels live. The earlier 3/4 room view was dropped as too busy. |
| Flow style | Glow inside copper: pipes stay copper, and a soft stream moves along the inside of each pipe, coloured by water temperature. |
| Models | The owner's Vitocrossal 300 CU3A 199 and Vitocell 300-V. Other models were dropped when the card became private. |
| CAD sources | Public files only: viessmann.ca (via vitoteam), MEPcontent and technical manuals. No Partner Portal. |
| Distribution | For the owner's use, installed through HACS as a custom repository from the public GitHub repo. The build is committed in `dist/` with each part's render and ports, because HACS installs from there. |
| Schedules and holiday mode | Not for now. Home Assistant doesn't expose them. |
| Primary screen | Assumed: landscape tablet and desktop first. Phones get a zoomable diagram with tabs. |
| Usage history | Read from Home Assistant's recorder, never from Viessmann. Burner run time comes from on/off history where the recorder still has it (10 days by default), and from the burner hour counter's long-term statistics before that, in whole hours. |

## Reference installation

The owner's system provides the default layout, the test data and the first target.

**Equipment**

- Vitocrossal 300 CU3A 199 with Vitotronic 200 (type HO1) control, Vitoconnect OPTO2 gateway and an outdoor sensor
- Vitocell 300-V, 56 gal, indirect, with a thermostatic mixing valve on the hot outlet
- Plate heat exchanger separating the boiler loop from the radiant loop
- Viessmann mixing valve with motor (circuit 2)
- Circulators labelled BOILER, RADIANT and DHW
- Air separator, pressure gauge, two-pipe polypropylene venting
- Supply and return manifolds, 7 Caleffi Z-one zone valves, staple-up radiant
- 7 Nest thermostats, one per zone

**Loops.** These are also the animation rules.

| Loop | Path | Flows when | Colour from |
|---|---|---|---|
| Heating loop (circuit 1, "Boiler Loop") | boiler top → BOILER pump (warm, top of the loop) → heat exchanger, boiler side → out of its bottom (cooler) → straight back to the boiler | circuit 1 pump is on | boiler temperature, circuit 1 supply |
| Tank charging (DHW loop) | boiler → DHW pump (hot) → tank's upper coil connection → out of its lower connection (cooler) → back to the boiler, following Viessmann's Vitocell piping | DHW pump is on | boiler temperature → tank temperature |
| Radiant loop (circuit 2, "Radiant Staple Up") | heat exchanger, radiant side → mixing valve → RADIANT pump → supply manifold → zone valves → zones → return manifold → back | circuit 2 pump is on **and** at least one zone is calling | circuit 2 supply |
| Zone *n* (×7) | its manifold branch and zone valve | its Nest's `hvac_action` is `heating` | circuit 2 supply |

- The heating loop and the DHW loop are separate loops through the boiler. They share no header or tees, so the diagram gives the boiler its own pair of connections for each.
- ViCare reports the RADIANT pump as on even when no zone is calling, so zone calls decide whether the radiant loop flows.
- ViCare also reports a house hot water recirculation pump as on. This install has no such loop, so it's hidden. The card still supports one for other installs.
- One Nest also controls cooling. It's assumed to run a separate AC and isn't drawn.
- Return temperatures aren't measured. Return pipes are tinted cooler, with no number shown, unless extra sensors are configured.

**Zones.** Garage, Den, Living Room, Entryway, Bathroom, Hallway, Master Bath. Each zone is mapped to its Nest in the card editor.

**Default layout.** A 2D diagram organised by loop rather than a copy of the room.
- Left: the Vitocell and the boiler, joined by the DHW loop: hot water through the DHW pump on the upper line into the tank's upper coil connection, cooler water back from the lower one.
- Above and right of the boiler: the heating loop, warm over the top through the BOILER pump, back from the bottom of the heat exchanger.
- Venting and gas lines aren't drawn: the diagram shows the water loops only.
- Middle: the plate heat exchanger.
- Right: the mixing valve, RADIANT pump, supply manifold, the seven zone coils and the return manifold.
- Domestic water comes and goes on top of the tank:
  - cold water comes in beside the hot outlet;
  - a branch of the cold main and the tank's hot water feed a thermostatic mixing valve;
  - the tempered water leaves for the taps.
- Both domestic lines end at labelled shut-off valves. A test checks that no pipe ends in mid-air.

**Example config.** Illustrative only; option names may change.

```yaml
type: custom:viessmann-boiler-card
device_id: <your ViCare device>
model: vitocrossal-300-cu3a-199
layout: plant-room
asset_url: /local/viessmann-boiler-card/
hot_water:
  tank: vitocell-300-v
  charging: pump            # pump | three_way_valve | combi
  recirculation: false
circuits:
  - circuit: 1              # "Boiler Loop": boiler side of the heat exchanger
    pump_label: BOILER
  - circuit: 2              # "Radiant Staple Up"
    separated_by: heat_exchanger
    mixing_valve: true
    pump_label: RADIANT
    zones:
      - name: Garage
        thermostat: climate.garage                # placeholder IDs
      - name: 1st Floor Office
        thermostat: climate.first_floor_office
      # …5 more
```

## Entities

These are the entities ViCare is expected to provide for the reference install, based on its diagnostics. They'll be confirmed against the live system in phase 1.

| Area | Entities | Used for |
|---|---|---|
| Boiler | boiler temperature, burner on/off, burner modulation, burner hours, burner starts | boiler readout, burner light, average run per start (about 10½ min today) |
| Outside | outside temperature | header, heating-curve chart |
| Each circuit | climate, supply temperature, circulation pump, frost protection, heating-curve shift and slope, normal, reduced and comfort temperatures | loop colour and flow, Heating tab |
| Hot water | water heater, tank temperature, hot water target (10–60 °C), charging, DHW pump | tank colour, charging flow, Hot water tab |
| Zones | 7 Nest climate entities | branch flow, zone labels (temperature and setpoint), tap to open more-info |
| Hidden | hot water recirculation pump; hot water outlet temperature, if created (sensor not fitted) | Diagnostics tab only |

This controller doesn't provide return temperatures, gas or energy use, a one-time hot water charge, or a hot water mode. The card shows them for models that do.

## Card design

**Layers, bottom to top**

1. **Pipes.** SVG with layered strokes (shadow, body, highlight) for a copper look, with press-fit elbows and tees. Zone coils are drawn as white PEX.
2. **Flow.** A canvas layer that draws soft glowing streams along each pipe's centre line.
   - Colour shows the side of the loop: the hot side in orange, deepening to red-orange as it gets hotter, and the cold side in blue. Zone coils fade from orange to blue as the water gives off its heat.
   - Speed follows pump state and burner modulation.
   - Capped at 30 fps. Paused when off-screen, when the tab is hidden, or when reduced motion is on.
3. **Equipment.** Blender renders (WebP with transparency), with one consistent soft drop shadow added by the card. Each comes with a `ports.json` listing its pipe connection points, so pipes meet the rendered stubs exactly. Pumps carry a printed tag (BOILER, DHW, RADIANT) and a status light; zone valves light up while their zone calls.
4. **Labels and touch targets.** Temperatures and states, scaled with the card. Tapping a part opens its entity's more-info dialog; tapping a zone opens its thermostat.
5. **Burner.** A soft warm glow over the combustion area while the burner fires, brighter at higher modulation. No flames.

**Tabs:** System (the diagram), Heating, Hot water, Usage, Diagnostics.

**Usage tab**

- Temperatures over the last 24 hours: boiler, each circuit's supply and the tank. Each one can be shown or hidden, and the colours were checked for colour-blind separation in light and dark.
- Burner run time per day for 30 days, with today so far, yesterday and the daily average.
- Both charts show values on hover, tap or arrow keys.
- The recorder is read when the tab opens, and again every 5 minutes while it stays open.

**Controls**

- Writes are debounced, and heating-curve changes ask for confirmation. Viessmann's API allows 1,450 calls a day.
- Per circuit:
  - ViCare mode via `vicare.set_vicare_mode`: hot water only, hot water and heating, forced normal, forced reduced, standby
  - comfort and eco presets
  - normal, reduced and comfort temperatures
  - heating-curve shift and slope, with a live chart of the curve and the current operating point
- Hot water target temperature.

**Topology.** The card config lists the components (boiler, heat exchanger, mixing valve, pumps, tank, manifold, zones) and how they connect. A layout engine places them, starting from presets: the plant-room layout above, plus simpler presets for wall-hung and combi boilers.

**Entity discovery.** Pick the ViCare device in the editor, and entities are matched by the integration's `translation_key`. Circuits are told apart through the entity registry, and any match can be overridden in the editor.

**Tech.** TypeScript, Lit, Vite (Rollup underneath, single-file bundle) and Vitest. HACS metadata, sections-view sizing and a visual editor.

**Render contract.** Every render is a straight-on orthographic front view at 1 px per mm, with a transparent background and no baked shadows. Every connection points left, right, up or down, never toward the viewer, so pipes can join it in 2D. Each render ships a `ports.json` with its anchor pixel and connection positions. The card refuses renders that aren't front views. In the diagram, appliances are drawn at 0.36 px per mm and small parts at 0.5 px per mm, so pumps and valves stay legible.

## Render pipeline (`tools/render/`)

- **Setup.** Blender 5.0 with headless Python scripts. Every component is rendered as a straight-on orthographic front view.
- **Lighting.** A free CC0 studio light setup from Poly Haven, with the key light from the front upper left. Transparent background, no baked shadows.
- **Vitocrossal 300 CU3A.**
  - Viessmann's Revit package is a simplified model (rated low complexity). It does have exact dimensions and the position and size of all six connections: 1¼" supply and return, ¾" gas, 4" flue, 3" air intake, and power.
  - Rebuild it to those dimensions, then add the panel gaps, red stripe, orange Vitotronic housing, feet and venting from photos.
  - Viessmann uses one product image for the 94 and 125 and another for the 160 and 199, so two cabinets should cover all four sizes.
- **Vitocell 300-V.** Technical-manual dimensions plus the photo.
- **Vitodens 100-W and 200-W.** MEPcontent DWG and IFC files (European versions; IFC opens in Blender with the Bonsai add-on), checked against North American manuals and product photos. The combi versions show the internal plate heat exchanger path.
- **Generic parts, unbranded.** Circulators (red and black), plate heat exchanger, mixing valve and motor, thermostatic mixing valve, zone valves. Air separator, pressure gauge and venting are left out of the diagram.
- **Logos.** A separate optional decal, off by default.
- **Tools to add.** LibreDWG via Homebrew (to read the 2D DWG) and the Bonsai add-on for Blender.
- **Never committed.** CAD downloads and Blender's full-size output. Each part's `render.webp` and `ports.json` are committed.

## Phases

0. **Data capture.** Done: ViCare and Nest diagnostics, plant-room photo.
1. **Project setup.** Done.
   - Build tooling and a dev page with a fake Home Assistant, built from cleaned-up diagnostics.
   - Scenario switches: idle, burner firing, tank charging, zones calling.
   - HACS metadata.
2. **Render prototype, then review.** Done and approved: the CU3A 199, the Vitocell, the circulators, the heat exchanger, the mixing valve, the tempering valve and the zone valves, in the 2D diagram.
3. **Diagram engine.** Done for the reference installation: its layout, pipe routing, flow rules, burner glow and labels. Building other layouts from the config was dropped with phase 6.
4. **Entities and controls.** Done: System, Heating, Hot water and Diagnostics tabs, the heating-curve chart, and guarded writes. Component tests check every service call.
5. **Visual editor.** Done: ViCare device, title, animation, circuit names and pump tags, zones with their thermostats (matched by name or chosen), render folder.
6. **More models.** Skipped: the card is for the owner's own boiler.
7. **Polish.** Done:
   - The diagram keeps a readable size and scrolls sideways on narrow cards.
   - Light and dark themes, °C and °F, reduced motion.
   - Released through HACS as a custom repository. `dist/` is committed, and `npm version` rebuilds it before tagging.
   - `npm run deploy` copies a build into `/config/www` to try a change before releasing it.
   - Renders are requested with the card version, because HACS serves files with long cache headers.
8. **Usage tab.** Built: temperature history and burner run time from the recorder. Next, check it against the live recorder:
   - the temperatures match Home Assistant's own history graphs;
   - the day where the on/off history begins joins the hour counter cleanly.

## Testing

- **Unit tests:** discovery, layout, flow rules, the temperature scale and the heating-curve maths.
  - The published Viessmann curve formula matches live data. Circuit 1 (slope 1.2, shift 20, normal 29 °C) at 15.9 °C outside predicts about 68 °C, and the boiler read 66 °C with the burner idle.
- **Dev page:** a scenario for every flow state.
- **Live:** install through HACS on the owner's Home Assistant (2026.10). Read-only checks first, then try each control once.

## Risks

- **Copper realism.** SVG pipes may not match the renders. The phase 2 review catches this. The fallback is Blender-rendered pipe pieces (straight, elbow, tee) assembled as images.
- **Lag.** ViCare polls every 60 s. Zone flow depends on Nest reporting a call for heat, and the Nest diagnostics show frequent stream reconnects (465), so measure how quickly `hvac_action` updates arrive.
- **API limit.** 120 calls per 10 minutes and 1,450 a day, shared with every other ViCare use. The card only reads Home Assistant state, and its writes are debounced.
- **Licensing.** Viessmann trademarks and images derived from its CAD. The renders are in the public repo so HACS can install them. They carry no logos, and the README names the trademark owners.

## Out of scope for now

- Schedules and holiday mode
- Cooling and air handlers
- Heat pumps (Vitocal)
- House hot water recirculation on the reference install. It's still supported as an option for other installs.

## Open items

- First run on the owner's Home Assistant: confirm entity discovery, the circuit numbering from the registry, and each zone's thermostat match.
- Confirm that the Nest with cooling runs a separate AC.

## Sources

- [Home Assistant: Viessmann ViCare integration](https://www.home-assistant.io/integrations/vicare/)
- [Vitocrossal 300 CU3A CAD files (PDF, DWG, Revit)](https://www.vitoteam.com/Pages/eng/cad/drawings.php?b1=CU3A-94&b2=CU3A-125&b3=CU3A-160&b4=CU3A-199&clean=Y&title=Vitocrossal+300)
- [MEPcontent: Vitodens 200-W BIM files](https://www.mepcontent.com/de/bim-files/detail/30551/vitodens-200-w/)
- [Viessmann US downloads](https://www.viessmann-us.com/en/services/downloads.html)
