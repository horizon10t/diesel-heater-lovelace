# Diesel Heater Card

A Lovelace card for the [ESP32-S3 Diesel Heater Controller](https://deanfourie.me/product/diesel-heater-controller/).

- Status, core temperature, volts and amps
- **Fan, glow plug and fuel pump** output indicators (orange when active, like the controller WebUI)
- Thermostat / Power mode toggle with a **target / power-level slider and + / - buttons**
- **Stop heater** and, while the heater is running, a red **Emergency stop** button
- A prominent **error banner** with the full error message from the controller, shown as soon as there is an error (a fault or an emergency stop) and gone when it clears
- A **Clear fault** button inside the error banner while the heater is in a fault. It does the same as the Clear button in the controller web interface, including waiting for the fault cooldown
- **Tap for details:** tapping **Glow plug**, **Core temp**, **Voltage** or **Current** opens the normal Home Assistant more-info dialog (history graph and settings) for that entity. Tapping **Fan** opens a popup to set the fan speed and tapping **Fuel pump** opens one to set the fuel pump rate, each with a slider and − / + buttons and the live value. These use the integration's fan speed and fuel pump rate entities and work in Power mode only (like the tuning in the controller web interface); they are not saved and reset when the power level changes or the heater stops. Needs the latest controller firmware
- **Languages:** the card text follows your Home Assistant language: German, French, Spanish, Italian, Portuguese, Dutch, Polish, Russian, Swedish, Czech, Turkish, Japanese and Chinese (Simplified), otherwise English. Set `language: de` (or another code) in the card YAML to force one. Error messages are shown exactly as the controller reports them, so they stay in English
- **10 selectable layouts** chosen in the card editor

It needs the **[Diesel Heater Controller integration](https://github.com/horizon10t/diesel-heater-ha) version 1.6.0 or newer** installed and set up first (the emergency stop and clear fault buttons and output sensors come from it), and the controller firmware flashed with the latest version.

## Screenshots

<!-- The images live in the images/ folder (screenshot_1.png to screenshot_5.png). -->

| Screenshot 1 | Screenshot 2 | Screenshot 3 |
|---|---|---|
| ![Screenshot 1](https://raw.githubusercontent.com/horizon10t/diesel-heater-lovelace/main/images/screenshot_1.png) | ![Screenshot 2](https://raw.githubusercontent.com/horizon10t/diesel-heater-lovelace/main/images/screenshot_2.png) | ![Screenshot 3](https://raw.githubusercontent.com/horizon10t/diesel-heater-lovelace/main/images/screenshot_3.png) |

With `show_visuals: true`, the card shows a picture of the heater at the top, and the fan speed and fuel pump rate popups (opened by tapping **Fan** or **Fuel pump**) get a matching icon:

| Heater image | Fan speed popup |
|---|---|
| ![Heater image on the card](https://raw.githubusercontent.com/horizon10t/diesel-heater-lovelace/main/images/screenshot_4.png) | ![Fan speed popup](https://raw.githubusercontent.com/horizon10t/diesel-heater-lovelace/main/images/screenshot_5.png) |

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

`cabin_temp: sensor.my_room_temperature` overrides the cabin temperature shown by the card (default: the heater's own cabin temperature sensor). Other options: `show_outputs: false` hides the fan / glow / pump row, `show_estop: false` hides the emergency stop button, and `show_visuals: true` adds a picture of the heater at the top of the card and a fan / fuel pump icon in the two popups (off by default; also a toggle in the card editor). Tip: the fan speed and fuel pump rate popups use `fan_set` and `pump_set` if you need to point the card at specific entities.

## The controller

This works with the [Diesel Heater Controller](https://deanfourie.me/product/diesel-heater-controller/) from [deanfourie.me](https://deanfourie.me). See the product page for details, hardware and firmware.
