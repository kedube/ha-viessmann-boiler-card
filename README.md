# Viessmann Boiler Card

A private Home Assistant dashboard card for a Viessmann boiler on the built-in **Viessmann ViCare** integration. It draws the heating system as a 2D diagram with realistic renders of the equipment: the Vitocrossal 300 CU3A, the Vitocell tank, the pumps, the plate heat exchanger and valves, and the seven radiant zones. Water moves through the loops as the pumps and thermostats call: orange on the hot side, blue on the cold side. Tabs give access to every setting the integration exposes.

## What it shows

- **System:** the boiler's heating loop to the heat exchanger, the tank charging loop, the radiant loop with its mixing valve, manifolds and zone coils, and domestic water through the mixing valve on the tank.
  - Pumps carry their tags (BOILER, DHW, RADIANT) and a status light.
  - Zones light up while their Nest calls for heat.
  - The boiler glows while the burner fires.
- **Heating:** per circuit:
  - ViCare mode and program (schedule, comfort, eco);
  - normal, reduced and comfort room temperatures;
  - heating curve slope and shift, with a chart of the curve and where the system is running now.
- **Hot water:** tank temperature, target, and charging state.
- **Diagnostics:** burner hours, starts and average run per start, circuit pumps and frost protection, and every ViCare entity on the device.

Tapping any part, zone or reading opens Home Assistant's more-info dialog for it.

### How changes are sent

- **Paced:** a change is sent once you stop adjusting, and shows as pending until ViCare reports it back. Viessmann allows 1,450 API calls a day.
- **Curve changes need Apply:** they appear as a dashed line on the chart first. If both slope and shift change, the shift waits until ViCare reports the new slope, because the integration writes the two together.

## Install

1. Mount Home Assistant's config share (the Samba add-on works) and run:
   ```sh
   npm install
   npm run deploy -- /Volumes/config/www
   ```
   This builds the card and copies it, with the renders, into `/config/www`.
2. Add the resource `/local/viessmann-boiler-card.js?v=0.2.0` (JavaScript module) under **Settings → Dashboards → ⋮ → Resources**. After each later deploy, raise the `?v=` number so browsers load the new version.
3. Add **Viessmann Boiler Card** from the card picker. It finds the ViCare boiler and starts with one zone per Nest thermostat. Everything else is in the visual editor.

### YAML

```yaml
type: custom:viessmann-boiler-card
circuits:
  - circuit: 1
    name: Boiler Loop
    pump_label: BOILER
  - circuit: 2
    name: Radiant Staple Up
    separated_by: heat_exchanger
    mixing_valve: true
    pump_label: RADIANT
    zones:
      - name: Garage
      - name: Den
      - name: Living Room
      - name: Entryway
      - name: Bathroom
      - name: Hallway
      - name: Master Bath
```

- **Thermostats:** each zone finds its thermostat by name, so "Living Room" finds `climate.living_room` or a "Living Room Thermostat". Add `thermostat: climate.…` to a zone to choose one explicitly.
- **Other options:**
  - `title` replaces the boiler name.
  - `device_id` selects a specific ViCare device.
  - `animation: false` turns the flow animation off.
  - `asset_url` changes where the renders live (default `/local/viessmann-boiler-card/`).

## Development

Requires Node 20+.

```sh
npm run dev        # dev page at http://localhost:5178
npm test           # unit and component tests
npm run typecheck
npm run build      # dist/viessmann-boiler-card.js
```

The dev page runs the card against a simulated Home Assistant built from the real installation's diagnostics.

- **Scenarios:** idle, zones heating, hot water charging, everything, standby.
- **Display:** light and dark, °C and °F, and the visual editor.
- **URL parameters:** make screenshots reproducible, e.g. `/dev/?scenario=zones&theme=dark&units=F&width=1100&tab=heating&editor=1`.

The renders come from Blender scripts in [tools/render](tools/render) and are kept out of git; `npm run deploy` copies them from `assets/renders/`.

Viessmann, Vitocrossal, Vitocell and Vitotronic are trademarks of their owners. This is a personal project, not affiliated with Viessmann or Carrier.
