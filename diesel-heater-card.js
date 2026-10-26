/* Diesel Heater card for Home Assistant (no dependencies)
 *
 * Add it from the dashboard card picker ("Diesel Heater"); the visual editor
 * selects the heater and the layout.
 * YAML:
 *   type: custom:diesel-heater-card
 *   device: <device id>      # optional, first heater is used if omitted
 *   name: Diesel Heater      # optional
 *   layout: classic          # classic | compact | hero | split | minimal |
 *                            # gauge | banner | accent | wide | console
 *   show_outputs: true       # fan / glow / pump indicators
 *   show_estop: true         # emergency stop while the heater is running
 *   # Optional entity overrides: status, core_temp, cabin_temp, voltage,
 *   # current, mode, power_level, target, power, estop, glow, fan, pump,
 *   # glow_out, fan_out, pump_rate
 */
const STATE_STYLE = {
  Off:        { color: "var(--secondary-text-color)", icon: "mdi:power-off" },
  Preheating: { color: "#f5a623", icon: "mdi:heat-wave" },
  Igniting:   { color: "#ff7a1a", icon: "mdi:fire-alert" },
  Running:    { color: "#e8590c", icon: "mdi:fire" },
  Cooling:    { color: "#2d9cdb", icon: "mdi:snowflake" },
  Priming:    { color: "#f5a623", icon: "mdi:gas-station" },
  Fault:      { color: "var(--error-color, #d32f2f)", icon: "mdi:alert-octagon" },
};
const ACTIVE_STATES = ["Preheating", "Igniting", "Running", "Priming"];

const LAYOUTS = [
  { value: "classic", label: "1. Classic - stacked tiles" },
  { value: "compact", label: "2. Compact - dense and small" },
  { value: "hero", label: "3. Hero - large core temperature" },
  { value: "split", label: "4. Split - readings left, controls right" },
  { value: "minimal", label: "5. Minimal - clean list" },
  { value: "gauge", label: "6. Gauge - temperature ring" },
  { value: "banner", label: "7. Banner - coloured status bar" },
  { value: "accent", label: "8. Accent - colour-edged cards" },
  { value: "wide", label: "9. Wide - horizontal strip" },
  { value: "console", label: "10. Console - dark instrument panel" },
];

// [domain, entity id suffix] used to find each entity on the selected heater.
const ENTITY_SPEC = {
  status: ["sensor", "_status"],
  core_temp: ["sensor", "_core_temperature"],
  cabin_temp: ["sensor", "_cabin_temperature"],
  voltage: ["sensor", "_voltage"],
  current: ["sensor", "_current"],
  mode: ["select", ""],
  power_level: ["number", "_power_level"],
  target: ["number", "_target_temperature"],
  power: ["switch", ""],
  estop: ["button", ""],
  glow: ["binary_sensor", "_glow_plug"],
  fan: ["binary_sensor", "_fan"],
  pump: ["binary_sensor", "_fuel_pump"],
  glow_out: ["sensor", "_glow_plug_output"],
  fan_out: ["sensor", "_fan_output"],
  pump_rate: ["sensor", "_fuel_pump_rate"],
};
const DEFAULT_ENTITIES = {
  status: "sensor.diesel_heater_status",
  core_temp: "sensor.diesel_heater_core_temperature",
  cabin_temp: "sensor.diesel_heater_cabin_temperature",
  voltage: "sensor.diesel_heater_voltage",
  current: "sensor.diesel_heater_current",
  mode: "select.diesel_heater_operating_mode",
  power_level: "number.diesel_heater_power_level",
  target: "number.diesel_heater_target_temperature",
  power: "switch.diesel_heater_power",
  estop: "button.diesel_heater_emergency_stop",
  glow: "binary_sensor.diesel_heater_glow_plug",
  fan: "binary_sensor.diesel_heater_fan",
  pump: "binary_sensor.diesel_heater_fuel_pump",
  glow_out: "sensor.diesel_heater_glow_plug_output",
  fan_out: "sensor.diesel_heater_fan_output",
  pump_rate: "sensor.diesel_heater_fuel_pump_rate",
};

// Same icons the controller's WebUI dashboard uses.
const ICON_FAN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="2"/><path d="M12 10c-1-5 1-7 3-7 2 1 2 4-1 8M14 12c5-1 7 1 7 3-1 2-4 2-8-1M12 14c1 5-1 7-3 7-2-1-2-4 1-8M10 12c-5 1-7-1-7-3 1-2 4-2 8 1"/></svg>';
const ICON_GLOW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M13 2S7 8 7 13a5 5 0 0 0 10 0c0-3-1.7-5.7-4-8 .2 3-1.5 4.5-1.5 4.5S12 5.5 13 2Z"/></svg>';
const ICON_PUMP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2S6 9 6 14a6 6 0 0 0 12 0c0-5-6-12-6-12Z"/></svg>';

function firstHeaterDevice(hass) {
  const e = Object.values(hass.entities || {}).find((x) => x.platform === "diesel_heater" && x.device_id);
  return e ? e.device_id : undefined;
}

const CARD_CSS = `
  :host { display:block; }
  [hidden] { display:none !important; }
  ha-card { padding:0; overflow:hidden; container-type:inline-size; --st:var(--secondary-text-color); }
  .head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:16px 16px 0; }
  .title { font-size:1.1rem; font-weight:500; }
  .status { display:flex; align-items:center; gap:8px; font-weight:600; color:var(--st); }
  .status ha-icon { --mdc-icon-size:26px; }
  .body { display:flex; flex-direction:column; gap:14px; padding:14px 16px 16px; }

  .hero-block { display:none; justify-content:center; }
  .ring { width:160px; height:160px; border-radius:50%; display:grid; place-items:center;
    background:conic-gradient(var(--st) calc(var(--pct,0) * 1%), var(--secondary-background-color) 0); }
  .ring-in { width:80%; height:80%; border-radius:50%; background:var(--ha-card-background, var(--card-background-color, #fff));
    display:flex; flex-direction:column; align-items:center; justify-content:center; }
  .big { font-size:2.2rem; font-weight:500; line-height:1; }
  .big .u { font-size:1rem; font-weight:400; color:var(--secondary-text-color); margin-left:2px; }
  .ring-l { font-size:.75rem; color:var(--secondary-text-color); margin-top:4px; }

  .tiles { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
  .tile { background:var(--secondary-background-color); border-radius:12px; padding:12px 8px; text-align:center; min-width:0; }
  .tile .v { font-size:1.45rem; font-weight:600; line-height:1.2; }
  .tile .u { font-size:.8rem; font-weight:400; color:var(--secondary-text-color); margin-left:2px; }
  .tile .l { font-size:.75rem; color:var(--secondary-text-color); margin-top:2px; }
  .tile.core .v { color:var(--accent, inherit); }

  .outputs { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
  .out { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; padding:18px 6px 14px;
    border-radius:14px; text-align:center; background:var(--secondary-background-color); color:var(--primary-text-color);
    transition:background .2s,color .2s; min-width:0; }
  .out svg { width:44px; height:44px; flex:0 0 44px; color:var(--secondary-text-color); transition:.2s; }
  .out b { display:block; font-size:1.1rem; white-space:nowrap; }
  .out small { display:block; margin-top:3px; font-size:.65rem; text-transform:uppercase; letter-spacing:.09em; color:var(--secondary-text-color); }
  .out.on { background:linear-gradient(135deg,#f26826,#ff873e); color:#fff; }
  .out.on svg, .out.on small { color:#fff; }
  .out.on svg { filter:drop-shadow(0 0 8px #fff8); }

  .controls { display:flex; flex-direction:column; gap:14px; min-width:0; }
  .seg { display:grid; grid-template-columns:1fr 1fr; background:var(--secondary-background-color); border-radius:12px; padding:4px; gap:4px; }
  .seg button { border:0; border-radius:9px; padding:10px; cursor:pointer; font:inherit; font-weight:500; background:transparent; color:var(--primary-text-color); }
  .seg button.on { background:var(--primary-color); color:var(--text-primary-color,#fff); }
  .seg button:disabled { opacity:.5; cursor:default; }
  .row { display:flex; align-items:center; gap:8px; }
  .row .lbl { min-width:64px; font-size:.85rem; color:var(--secondary-text-color); }
  .row input[type=range] { flex:1; min-width:0; accent-color:var(--primary-color); }
  .row .val { min-width:44px; text-align:right; font-weight:600; }
  .step { flex:0 0 36px; width:36px; height:36px; border-radius:50%; border:0; cursor:pointer; padding:0;
    font:inherit; font-size:1.4rem; line-height:1; background:var(--secondary-background-color); color:var(--primary-text-color);
    display:grid; place-items:center; user-select:none; touch-action:manipulation; }
  .step:active { background:var(--primary-color); color:var(--text-primary-color,#fff); }
  .actions { display:flex; gap:10px; }
  .actions button { flex:1; border:0; border-radius:12px; padding:12px; cursor:pointer; font:inherit; font-weight:600;
    display:flex; align-items:center; justify-content:center; gap:6px; }
  .actions button:disabled { opacity:.5; cursor:default; }
  .start { background:var(--primary-color); color:var(--text-primary-color,#fff); }
  .stop { background:#d32f2f; color:#fff; }
  .estop { background:#8e0000; color:#fff; box-shadow:inset 0 0 0 2px #ff5252; }
  .estop svg { width:18px; height:18px; }
  .fault { padding:8px 12px; border-radius:10px; background:var(--error-color,#d32f2f); color:#fff; font-size:.85rem; }
  .unavail { opacity:.5; }

  /* 2. compact */
  [data-layout=compact] .head { padding:10px 12px 0; }
  [data-layout=compact] .title { font-size:1rem; }
  [data-layout=compact] .body, [data-layout=compact] .controls { gap:8px; }
  [data-layout=compact] .body { padding:8px 12px 12px; }
  [data-layout=compact] .tile { padding:6px 4px; border-radius:8px; }
  [data-layout=compact] .tile .v { font-size:1.1rem; }
  [data-layout=compact] .tile .l { font-size:.65rem; }
  [data-layout=compact] .outputs { gap:6px; }
  [data-layout=compact] .out { padding:8px 4px; gap:3px; border-radius:8px; }
  [data-layout=compact] .out svg { width:26px; height:26px; flex-basis:26px; }
  [data-layout=compact] .out b { font-size:.85rem; }
  [data-layout=compact] .out small { display:none; }
  [data-layout=compact] .seg button { padding:6px; }
  [data-layout=compact] .actions button { padding:8px; }
  [data-layout=compact] .step { width:30px; height:30px; flex-basis:30px; }

  /* 3. hero / 6. gauge share the big temperature block */
  [data-layout=hero] .hero-block, [data-layout=gauge] .hero-block { display:flex; }
  [data-layout=hero] .ring { width:auto; height:auto; background:none; border-radius:0; }
  [data-layout=hero] .ring-in { width:auto; height:auto; background:none; padding:6px 0; }
  [data-layout=hero] .big { font-size:3.8rem; font-weight:300; color:var(--st); }
  [data-layout=hero] .big .u { font-size:1.4rem; }
  [data-layout=hero] .head { flex-direction:column; align-items:center; gap:4px; }

  /* 4. split */
  [data-layout=split] .body { display:grid; grid-template-columns:1fr 1fr; gap:14px; align-items:start; }
  [data-layout=split] .tiles { grid-column:1; grid-template-columns:1fr; gap:6px; }
  [data-layout=split] .tile { display:flex; flex-direction:row-reverse; justify-content:space-between; align-items:center; text-align:left; padding:10px 12px; }
  [data-layout=split] .tile .l { margin:0; font-size:.85rem; }
  [data-layout=split] .outputs { grid-column:1; gap:6px; }
  [data-layout=split] .out { padding:12px 2px 10px; }
  [data-layout=split] .out svg { width:32px; height:32px; flex-basis:32px; }
  [data-layout=split] .out b { font-size:.9rem; }
  [data-layout=split] .controls { grid-column:2; grid-row:1 / span 3; }
  [data-layout=split] .fault { grid-column:1 / -1; }
  [data-layout=split] .row { flex-wrap:wrap; }
  [data-layout=split] .row .lbl { flex:1 1 100%; }
  [data-layout=split] .row input[type=range] { min-width:50px; }
  [data-layout=split] .actions { flex-direction:column; }
  @container (max-width:430px) {
    [data-layout=split] .body { grid-template-columns:1fr; }
    [data-layout=split] .controls { grid-column:1; grid-row:auto; }
  }

  /* 5. minimal */
  [data-layout=minimal] .tiles { grid-template-columns:1fr; gap:0; }
  [data-layout=minimal] .tile { background:none; border-radius:0; display:flex; flex-direction:row-reverse; justify-content:space-between;
    align-items:baseline; padding:8px 0; border-bottom:1px solid var(--divider-color); text-align:left; }
  [data-layout=minimal] .tile .l { margin:0; font-size:.9rem; }
  [data-layout=minimal] .outputs { display:flex; gap:20px; justify-content:space-around; flex-wrap:wrap; }
  [data-layout=minimal] .out { background:none; padding:0; border-radius:0; }
  [data-layout=minimal] .out.on { background:none; color:#f26826; }
  [data-layout=minimal] .out.on svg { color:#f26826; filter:none; }
  [data-layout=minimal] .out.on small { color:var(--secondary-text-color); }
  [data-layout=minimal] .seg { background:none; border-radius:0; padding:0; border-bottom:1px solid var(--divider-color); }
  [data-layout=minimal] .seg button { border-radius:0; color:var(--secondary-text-color); }
  [data-layout=minimal] .seg button.on { background:none; color:var(--primary-color); box-shadow:inset 0 -2px var(--primary-color); }
  [data-layout=minimal] .step { background:none; border:1px solid var(--divider-color); }
  [data-layout=minimal] .actions button { background:none; border:1px solid currentColor; box-shadow:none; }
  [data-layout=minimal] .start { color:var(--primary-color); }
  [data-layout=minimal] .stop, [data-layout=minimal] .estop { color:#d32f2f; }

  /* 6. gauge */
  [data-layout=gauge] .ring { width:170px; height:170px; }

  /* 7. banner */
  [data-layout=banner] .head { background:color-mix(in srgb, var(--st) 85%, #000); color:#fff; padding:14px 16px; }
  [data-layout=banner] .status { color:#fff; }
  [data-layout=banner] .body { padding-top:16px; }

  /* 8. accent */
  [data-layout=accent] .tile { border-left:4px solid var(--st); border-radius:8px; text-align:left; padding-left:12px; box-shadow:0 1px 3px rgba(0,0,0,.25); }
  [data-layout=accent] .out { border-top:4px solid var(--divider-color); border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,.25); }
  [data-layout=accent] .out.on { border-top-color:#ffd9c2; }
  [data-layout=accent] .seg, [data-layout=accent] .actions button { border-radius:8px; }

  /* 9. wide */
  [data-layout=wide] .body { flex-direction:row; flex-wrap:wrap; align-items:center; }
  [data-layout=wide] .tiles { flex:1 1 240px; }
  [data-layout=wide] .outputs { flex:1 1 240px; }
  [data-layout=wide] .out { padding:12px 4px 10px; }
  [data-layout=wide] .out svg { width:36px; height:36px; flex-basis:36px; }
  [data-layout=wide] .controls { flex:2 1 300px; }
  [data-layout=wide] .fault { flex:1 1 100%; }

  /* 10. console */
  [data-layout=console] ha-card { background:#101417; color:#cfe8d2; border:1px solid #1f2a2f;
    font-family:ui-monospace,Menlo,Consolas,monospace; }
  [data-layout=console] .title { letter-spacing:.12em; text-transform:uppercase; font-size:.9rem; color:#7a9a82; }
  [data-layout=console] .tile, [data-layout=console] .out, [data-layout=console] .seg {
    background:#0a0d0f; border:1px solid #1f2a2f; border-radius:4px; color:#cfe8d2; }
  [data-layout=console] .tile .v { color:#7cfc98; font-weight:400; text-shadow:0 0 8px rgba(124,252,152,.35); }
  [data-layout=console] .tile .l, [data-layout=console] .tile .u, [data-layout=console] .row .lbl { color:#5f7a66; }
  [data-layout=console] .out svg, [data-layout=console] .out small { color:#5f7a66; }
  [data-layout=console] .out.on { background:#2a1608; border-color:#f26826; color:#ffb27a; }
  [data-layout=console] .out.on svg { color:#ff873e; filter:drop-shadow(0 0 5px #ff873e); }
  [data-layout=console] .out.on small { color:#c98a5e; }
  [data-layout=console] .seg button { color:#7a9a82; border-radius:3px; }
  [data-layout=console] .seg button.on { background:#7cfc98; color:#0a0d0f; }
  [data-layout=console] .step { background:#0a0d0f; border:1px solid #2a3a40; color:#7cfc98; }
  [data-layout=console] .row .val { color:#7cfc98; }
  [data-layout=console] .row input[type=range] { accent-color:#7cfc98; }
  [data-layout=console] .actions button { border-radius:4px; text-transform:uppercase; letter-spacing:.08em; }
  [data-layout=console] .start { background:#7cfc98; color:#0a0d0f; }
`;

class DieselHeaterCard extends HTMLElement {
  setConfig(config) {
    this._config = { ...config };
    this._ids = this._entities();
    this._pending = {};
    if (!this.shadowRoot) this._build();
    else if (this._hass) this._update();
  }

  getCardSize() { return 5; }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 4 }; }

  static getConfigElement() { return document.createElement("diesel-heater-card-editor"); }

  // A new card picks the first heater automatically.
  static getStubConfig(hass) {
    const device = hass ? firstHeaterDevice(hass) : undefined;
    return { ...(device ? { device } : {}), layout: "classic" };
  }

  _deviceName() {
    const d = this._hass && this._config.device && this._hass.devices
      ? this._hass.devices[this._config.device] : null;
    return d ? (d.name_by_user || d.name) : "";
  }

  // Entity ids: explicit override > entities of the selected heater > default ids.
  _entities() {
    const found = {};
    const hass = this._hass, cfg = this._config || {};
    const deviceId = cfg.device || (hass ? firstHeaterDevice(hass) : undefined);
    if (hass && deviceId && hass.entities) {
      const mine = Object.values(hass.entities).filter(
        (e) => e.device_id === deviceId && !e.entity_category);
      for (const [key, [domain, suffix]] of Object.entries(ENTITY_SPEC)) {
        const match = mine.find((e) => e.entity_id.startsWith(domain + ".") && e.entity_id.endsWith(suffix));
        if (match) found[key] = match.entity_id;
      }
    }
    const out = {};
    for (const key of Object.keys(ENTITY_SPEC)) {
      out[key] = cfg[key] || found[key] || DEFAULT_ENTITIES[key];
    }
    return out;
  }

  set hass(hass) {
    this._hass = hass;
    if (this._root) this._update();
  }

  _build() {
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>${CARD_CSS}</style>
      <ha-card>
        <div class="head">
          <div class="title"></div>
          <div class="status"><ha-icon></ha-icon><span></span></div>
        </div>
        <div class="body">
          <div class="hero-block">
            <div class="ring"><div class="ring-in">
              <div class="big"><span id="bigCore">--</span><span class="u">°C</span></div>
              <div class="ring-l">Cabin temp</div>
            </div></div>
          </div>
          <div class="outputs">
            <div class="out" id="outFan">${ICON_FAN}<div><b>0%</b><small>Fan</small></div></div>
            <div class="out" id="outGlow">${ICON_GLOW}<div><b>Off</b><small>Glow plug</small></div></div>
            <div class="out" id="outPump">${ICON_PUMP}<div><b>0.00 Hz</b><small>Fuel pump</small></div></div>
          </div>
          <div class="tiles">
            <div class="tile core"><div><span class="v" id="core">--</span><span class="u">°C</span></div><div class="l">Core temp</div></div>
            <div class="tile"><div><span class="v" id="volt">--</span><span class="u">V</span></div><div class="l">Voltage</div></div>
            <div class="tile"><div><span class="v" id="amp">--</span><span class="u">A</span></div><div class="l">Current</div></div>
          </div>
          <div class="controls">
            <div class="seg">
              <button data-mode="Thermostat">Thermostat</button>
              <button data-mode="Power">Power</button>
            </div>
            <div class="row" id="thermoRow">
              <span class="lbl">Target</span>
              <button class="step" data-key="target" data-dir="-1" aria-label="Decrease target">&minus;</button>
              <input type="range" id="targetSlider" min="5" max="35" step="1">
              <button class="step" data-key="target" data-dir="1" aria-label="Increase target">+</button>
              <span class="val" id="targetVal"></span>
            </div>
            <div class="row" id="powerRow">
              <span class="lbl">Power</span>
              <button class="step" data-key="power_level" data-dir="-1" aria-label="Decrease power level">&minus;</button>
              <input type="range" id="levelSlider" min="1" max="10" step="1">
              <button class="step" data-key="power_level" data-dir="1" aria-label="Increase power level">+</button>
              <span class="val" id="levelVal"></span>
            </div>
            <div class="actions">
              <button id="toggle"></button>
              <button id="estop" class="estop" hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 2h8l6 6v8l-6 6H8l-6-6V8z"/><path d="M12 7v6M12 16.5v.5"/></svg>
                Emergency stop
              </button>
            </div>
          </div>
          <div class="fault" id="fault" hidden></div>
        </div>
      </ha-card>`;
    this._root = this.shadowRoot;
    const $ = (s) => this._root.querySelector(s);

    this._root.querySelectorAll(".seg button").forEach((b) =>
      b.addEventListener("click", () =>
        this._hass.callService("select", "select_option", {
          entity_id: this._ids.mode, option: b.dataset.mode })));

    const sliders = { target: ["#targetSlider", "#targetVal", "°C"], power_level: ["#levelSlider", "#levelVal", ""] };
    // Dragging updates the label; the service is called on release.
    for (const [key, [sel, valSel, suffix]] of Object.entries(sliders)) {
      const el = $(sel);
      el.addEventListener("input", () => { this._dragging = key; $(valSel).textContent = el.value + suffix; });
      el.addEventListener("change", () => { this._dragging = null; this._commit(key, Number(el.value)); });
    }
    // + / - buttons nudge the slider; rapid taps are batched into one call.
    this._root.querySelectorAll(".step").forEach((b) =>
      b.addEventListener("click", () => this._bump(b.dataset.key, Number(b.dataset.dir))));

    $("#toggle").addEventListener("click", () => {
      const on = $("#toggle").dataset.on === "1";
      this._hass.callService("switch", on ? "turn_off" : "turn_on", { entity_id: this._ids.power });
    });
    $("#estop").addEventListener("click", () =>
      this._hass.callService("button", "press", { entity_id: this._ids.estop }));
    this._update();
  }

  _range(key) {
    const st = this._hass.states[this._ids[key]];
    const a = st ? st.attributes : {};
    const def = key === "target" ? [5, 35] : [1, 10];
    return { min: Number(a.min ?? def[0]), max: Number(a.max ?? def[1]), step: Number(a.step ?? 1) };
  }

  _bump(key, dir) {
    const sel = key === "target" ? "#targetSlider" : "#levelSlider";
    const valSel = key === "target" ? "#targetVal" : "#levelVal";
    const suffix = key === "target" ? "°C" : "";
    const el = this._root.querySelector(sel);
    const { min, max, step } = this._range(key);
    const next = Math.min(max, Math.max(min, Number(el.value) + dir * step));
    el.value = next;
    this._root.querySelector(valSel).textContent = next + suffix;
    clearTimeout(this._pending[key]);
    this._pending[key] = setTimeout(() => { delete this._pending[key]; this._commit(key, next); }, 350);
  }

  _commit(key, value) {
    this._hass.callService("number", "set_value", { entity_id: this._ids[key], value });
  }

  _num(entityId, digits) {
    const s = this._hass.states[entityId];
    if (!s || isNaN(parseFloat(s.state))) return null;
    return digits === undefined ? parseFloat(s.state) : parseFloat(s.state).toFixed(digits);
  }

  _isOn(entityId) {
    const s = this._hass.states[entityId];
    return !!s && s.state === "on";
  }

  _setOutput(sel, on, value) {
    const el = this._root.querySelector(sel);
    el.classList.toggle("on", on);
    el.querySelector("b").textContent = value;
  }

  _update() {
    if (!this._hass || !this._config) return;
    const h = this._hass, $ = (s) => this._root.querySelector(s);
    const c = this._ids = this._entities();
    const cfg = this._config;
    const st = h.states[c.status];
    const state = st ? st.state : "unavailable";
    const style = STATE_STYLE[state] || { color: "var(--secondary-text-color)", icon: "mdi:help-circle" };

    const card = $("ha-card");
    const layout = LAYOUTS.some((l) => l.value === cfg.layout) ? cfg.layout : "classic";
    card.dataset.layout = layout;
    card.dataset.state = state;
    card.style.setProperty("--st", style.color);

    $(".title").textContent = cfg.name || this._deviceName() || "Diesel Heater";
    const statusEl = $(".status");
    statusEl.querySelector("ha-icon").setAttribute("icon", style.icon);
    statusEl.querySelector("span").textContent = state === "unavailable" ? "Offline" : state;
    $(".body").classList.toggle("unavail", !st || state === "unavailable");

    const coreRaw = this._num(c.core_temp);
    const core = coreRaw === null ? null : coreRaw.toFixed(1);
    $("#core").textContent = core ?? "--";
    // Hero / gauge layouts feature the cabin temperature; ring spans 0-40 °C.
    const cabinRaw = this._num(c.cabin_temp);
    $("#bigCore").textContent = cabinRaw === null ? "--" : cabinRaw.toFixed(1);
    card.style.setProperty("--pct", cabinRaw === null ? 0 : Math.max(0, Math.min(100, (cabinRaw / 40) * 100)));
    $(".tile.core").style.setProperty("--accent", state === "Running" || state === "Igniting" ? style.color : "inherit");
    $("#volt").textContent = this._num(c.voltage, 1) ?? "--";
    $("#amp").textContent = this._num(c.current, 1) ?? "--";

    // Output states (fan / glow plug / fuel pump)
    $(".outputs").hidden = cfg.show_outputs === false;
    const fanPct = this._num(c.fan_out), pumpHz = this._num(c.pump_rate), glowPct = this._num(c.glow_out);
    this._setOutput("#outFan", this._isOn(c.fan), fanPct === null ? (this._isOn(c.fan) ? "On" : "Off") : Math.round(fanPct) + "%");
    this._setOutput("#outGlow", this._isOn(c.glow),
      this._isOn(c.glow) ? (glowPct !== null && glowPct < 100 ? Math.round(glowPct) + "%" : "On") : "Off");
    this._setOutput("#outPump", this._isOn(c.pump), (pumpHz === null ? 0 : pumpHz).toFixed(2) + " Hz");

    const modeState = h.states[c.mode] ? h.states[c.mode].state : "";
    this._root.querySelectorAll(".seg button").forEach((b) => {
      b.classList.toggle("on", b.dataset.mode === modeState);
      b.disabled = !h.states[c.mode];
    });
    $("#thermoRow").hidden = modeState !== "Thermostat";
    $("#powerRow").hidden = modeState !== "Power";

    for (const [key, sel, valSel, suffix] of [
      ["target", "#targetSlider", "#targetVal", "°C"], ["power_level", "#levelSlider", "#levelVal", ""]]) {
      const el = $(sel), { min, max, step } = this._range(key);
      el.min = min; el.max = max; el.step = step;
      if (this._dragging === key || this._pending[key]) continue;
      const v = this._num(c[key]);
      if (v !== null) { el.value = v; $(valSel).textContent = v + suffix; }
    }

    const sw = h.states[c.power];
    const isOn = !!sw && sw.state === "on";
    const btn = $("#toggle");
    btn.dataset.on = isOn ? "1" : "0";
    btn.textContent = isOn ? "Stop heater" : "Start heater";
    btn.className = isOn ? "stop" : "start";
    btn.disabled = !sw || (state === "Cooling" && !isOn);

    // Emergency stop is only offered while the heater is running.
    $("#estop").hidden = !(ACTIVE_STATES.includes(state) && h.states[c.estop] && cfg.show_estop !== false);

    const fault = $("#fault");
    const msg = st && st.attributes ? st.attributes.fault : "";
    fault.hidden = !(state === "Fault" && msg);
    fault.textContent = msg || "";
  }
}

// Visual editor: pick the heater and the layout; entity overrides are optional.
class DieselHeaterCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._form) this._form.hass = hass;
    else this._render();
  }

  _schema() {
    const entity = (name, domain) => ({ name, selector: { entity: { domain } } });
    return [
      { name: "device", selector: { device: { integration: "diesel_heater" } } },
      { name: "layout", selector: { select: { mode: "dropdown", options: LAYOUTS } } },
      { name: "name", selector: { text: {} } },
      { name: "cabin_temp", selector: { entity: { domain: "sensor", device_class: "temperature" } } },
      {
        type: "grid", name: "", schema: [
          { name: "show_outputs", selector: { boolean: {} } },
          { name: "show_estop", selector: { boolean: {} } },
        ],
      },
      {
        type: "expandable",
        name: "",
        title: "Entity overrides (optional)",
        schema: [
          entity("status", "sensor"), entity("core_temp", "sensor"),
          entity("voltage", "sensor"),
          entity("current", "sensor"), entity("mode", "select"),
          entity("power_level", "number"), entity("target", "number"),
          entity("power", "switch"), entity("estop", "button"),
          entity("glow", "binary_sensor"), entity("fan", "binary_sensor"),
          entity("pump", "binary_sensor"), entity("glow_out", "sensor"),
          entity("fan_out", "sensor"), entity("pump_rate", "sensor"),
        ],
      },
    ];
  }

  _render() {
    if (!this._config || !this._hass) return;
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.computeLabel = (s) => ({
        device: "Heater", layout: "Layout", name: "Name (optional)",
        show_outputs: "Show fan / glow / pump", show_estop: "Show emergency stop",
        status: "Status sensor", core_temp: "Core temperature sensor",
        cabin_temp: "Cabin temperature sensor (optional)", voltage: "Voltage sensor",
        current: "Current sensor", mode: "Operating mode select",
        power_level: "Power level number", target: "Target temperature number",
        power: "Power switch", estop: "Emergency stop button",
        glow: "Glow plug on/off", fan: "Fan on/off", pump: "Fuel pump on/off",
        glow_out: "Glow plug output %", fan_out: "Fan output %", pump_rate: "Fuel pump rate (Hz)",
      }[s.name] || s.name);
      this._form.computeHelper = (s) => ({
        device: "Entities are found automatically from the selected heater.",
        cabin_temp: "Use any temperature sensor for the cabin reading. Leave empty to use the heater's own cabin temperature.",
      }[s.name] || "");
      this._form.addEventListener("value-changed", (ev) => {
        const value = {};
        for (const [k, v] of Object.entries(ev.detail.value)) {
          if (v !== "" && v !== undefined && v !== null) value[k] = v;
        }
        this._config = { type: this._config.type, ...value };
        this.dispatchEvent(new CustomEvent("config-changed", {
          detail: { config: this._config }, bubbles: true, composed: true,
        }));
      });
      this.appendChild(this._form);
    }
    this._form.hass = this._hass;
    this._form.schema = this._schema();
    // Show defaults for the toggles without writing them into the config.
    this._form.data = { layout: "classic", show_outputs: true, show_estop: true, ...this._config };
  }
}

if (!customElements.get("diesel-heater-card")) {
  customElements.define("diesel-heater-card", DieselHeaterCard);
  customElements.define("diesel-heater-card-editor", DieselHeaterCardEditor);
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: "diesel-heater-card",
    name: "Diesel Heater",
    preview: true,
    description: "Status, core temperature, volts/amps, outputs and mode control for the ESP32 diesel heater controller. 10 layouts.",
    documentationURL: "https://github.com/horizon10t/diesel-heater-card",
  });
}
