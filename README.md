# Diesel Heater Card

A Lovelace card for the ESP32-S3 diesel heater controller. It shows the heater status, core temperature, volts and amps, a Thermostat/Power mode toggle with the matching slider, and a start/stop button.

It needs the **[Diesel Heater Controller integration](https://github.com/horizon10t/diesel-heater-ha)** installed and set up first, because the card reads that integration's entities.

## Install with HACS

1. In Home Assistant open **HACS**, then the three-dot menu (top right) > **Custom repositories**.
2. Add `https://github.com/horizon10t/diesel-heater-card` with category **Dashboard** (older HACS versions call it **Lovelace**) and click **Add**.
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

`false` means the resource is not loaded. Check **Settings > Dashboards > Resources** (turn on Advanced mode in your profile) for `/hacsfiles/diesel-heater-card/diesel-heater-card.js`.
