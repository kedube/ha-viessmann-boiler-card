# Viessmann Boiler Card

A personal Home Assistant dashboard card for a Viessmann boiler on the built-in **Viessmann ViCare** integration. It draws the heating system as a 2D diagram with realistic renders of the equipment: the Vitocrossal 300 CU3A, the Vitocell tank, the pumps, the plate heat exchanger and valves, and the seven radiant zones. Water moves through the loops as the pumps and thermostats call: orange on the hot side, blue on the cold side. Tabs give access to every setting the integration exposes.

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
- **Usage:** from Home Assistant's history, so it uses none of the Viessmann API allowance:
  - a chart of the last 24 hours, where you choose which temperatures to show: boiler, each circuit's supply, and the hot water tank;
  - burner run time per day for the last 30 days, with today so far, yesterday and the daily average.
- **Diagnostics:** burner hours, starts and average run per start, circuit pumps and frost protection, and every ViCare entity on the device.

Tapping any part, zone or reading opens Home Assistant's more-info dialog for it.

### Where run time comes from

- **On/off history:** run time comes from the burner's on/off history, accurate to ViCare's poll of about a minute.
- **Older days:** Home Assistant keeps that history for 10 days by default. For days before that, the run time comes from the burner hour counter's long-term statistics, which Home Assistant keeps for good. The counter only counts whole hours, so those days are hatched on the chart.
- **More precise days:** to get them for the whole month, keep 30 days of history in `configuration.yaml`. This applies to every entity, so the database grows:

  ```yaml
  recorder:
    purge_keep_days: 30
  ```

### How changes are sent

- **Paced:** a change is sent once you stop adjusting, and shows as pending until ViCare reports it back. Viessmann allows 1,450 API calls a day.
- **Curve changes need Apply:** they appear as a dashed line on the chart first. If both slope and shift change, the shift waits until ViCare reports the new slope, because the integration writes the two together.

## Install

Through HACS, as a custom repository:

1. In HACS, open **⋮ → Custom repositories** and add `https://github.com/kedube/ha-viessmann-boiler-card` with the type **Dashboard**.
2. Open **Viessmann Boiler Card** in HACS and download it. HACS installs the card with its renders and adds the dashboard resource. Reload the browser when it asks.
3. Add **Viessmann Boiler Card** from the card picker. It finds the ViCare boiler and starts with one zone per Nest thermostat. Everything else is in the visual editor.

HACS offers each new release as an update.

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
  - `asset_url` changes where the renders load from (default: the `viessmann-boiler-card` folder beside the card's script).

## Development

Requires Node 20+.

```sh
npm run dev        # dev page at http://localhost:5178
npm test           # unit and component tests
npm run typecheck
npm run build      # dist/: the card and its renders, as HACS installs them
```

The dev page runs the card against a simulated Home Assistant built from the real installation's diagnostics.

- **Scenarios:** idle, zones heating, hot water charging, everything, standby.
- **History:** a made-up month of burner cycles and temperatures for the Usage tab. On/off history is kept for 10 days, as Home Assistant does by default.
- **Display:** light and dark, °C and °F, and the visual editor.
- **URL parameters:** make screenshots reproducible, e.g. `/dev/?scenario=zones&theme=dark&units=F&width=1100&tab=heating&editor=1`.

The renders come from Blender scripts in [tools/render](tools/render). Each part's `render.webp` and `ports.json` are committed under `assets/renders/`, and the build copies them into `dist/`.

### Releasing

HACS installs `dist/` from the latest GitHub release, so `dist/` is committed.

```sh
npm version patch          # rebuilds dist/ with the new version, then commits and tags it
git push --follow-tags
gh release create v0.2.1 --generate-notes
```

To try a change on Home Assistant before releasing it, mount the config share (the Samba add-on works) and run `npm run deploy -- /Volumes/config/www`. That copies `dist/` into `/config/www`. While testing, point the dashboard resource at `/local/viessmann-boiler-card.js?v=<n>` instead of the HACS one, raising `n` after each deploy.

Viessmann, Vitocrossal, Vitocell and Vitotronic are trademarks of their owners. This is a personal project, not affiliated with Viessmann or Carrier.
