# Diesel Heater Card

A Lovelace card for the [ESP32-S3 Diesel Heater Controller](https://deanfourie.me/product/diesel-heater-controller/).

- Status, core temperature, volts and amps
- **Fan, glow plug and fuel pump** output indicators (orange when active, like the controller WebUI)
- Thermostat / Power mode toggle with a **target / power-level slider and + / - buttons**
- **Stop heater** and, while the heater is running, a red **Emergency stop** button
- A prominent **error banner** with the full error message from the controller, shown as soon as there is an error (a fault or an emergency stop) and gone when it clears
- **10 selectable layouts** chosen in the card editor

It needs the **[Diesel Heater Controller integration](https://github.com/horizon10t/diesel-heater-ha) version 1.5.0 or newer** installed and set up first (the emergency stop button and output sensors come from it), and the controller firmware flashed with the latest version.

## Screenshots

<!-- Replace the three files in the images/ folder with your screenshots (keep the same file names). -->

| Screenshot 1 | Screenshot 2 | Screenshot 3 |
|---|---|---|
| ![Screenshot 1](https://raw.githubusercontent.com/horizon10t/diesel-heater-lovelace/main/images/screenshot_1.png) | ![Screenshot 2](https://raw.githubusercontent.com/horizon10t/diesel-heater-lovelace/main/images/screenshot_2.png) | ![Screenshot 3](https://raw.githubusercontent.com/horizon10t/diesel-heater-lovelace/main/images/screenshot_3.png) |

## Install with HACS

1. In Home Assistant open **HACS**, then the three-dot menu (top right) > **Custom repositories**.
2. Add `https://github.com/horizon10t/diesel-heater-lovelace` with category **Dashboard** (older HACS versions call it **Lovelace**) and click **Add**.
3. Search for **Diesel Heater Card** in HACS, open it and click **Download**.
4. Hard-refresh the browser (Ctrl+F5). HACS adds the dashboard resource for you, so there is nothing to configure by hand.

## Add the card

1. Open a dashboard and choose **Edit > Add card**.
2. Search for **Diesel Heater**.
3. Pick your **Heater**. The first one is selected for you, and all entities are found automatically from that device.

The editor has a collapsed **Entity overrides** section if you want to swap any single entity.

YAML equivalent:

```yaml
type: custom:diesel-heater-card
device: <device id>   # optional - first heater if omitted
name: Diesel Heater   # optional
```

Updates appear in HACS when a new GitHub release is published (tag like `v1.0.0`).

## If the card does not show up

Open the browser console (F12) after a hard refresh and run:

```js
!!customElements.get('diesel-heater-card')
```

`false` means the resource is not loaded. Check **Settings > Dashboards > Resources** (turn on Advanced mode in your profile) for `/hacsfiles/diesel-heater-lovelace/diesel-heater-card.js`.

## Layouts

Choose one in the card editor under **Layout** (or `layout:` in YAML).

| `layout` | Style |
|---|---|
| `classic` | Stacked tiles (default) |
| `compact` | Dense and small |
| `hero` | Large cabin temperature |
| `split` | Readings on the left, controls on the right |
| `minimal` | Clean list, no tiles |
| `gauge` | Cabin temperature ring |
| `banner` | Coloured status bar across the top |
| `accent` | Colour-edged cards |
| `wide` | Horizontal strip (best on full-width cards) |
| `console` | Dark instrument-panel look |

`cabin_temp: sensor.my_room_temperature` overrides the cabin temperature shown by the card (default: the heater's own cabin temperature sensor). Other options: `show_outputs: false` hides the fan / glow / pump row, and `show_estop: false` hides the emergency stop button.

## The controller

This works with the [Diesel Heater Controller](https://deanfourie.me/product/diesel-heater-controller/) from [deanfourie.me](https://deanfourie.me). See the product page for details, hardware and firmware.
