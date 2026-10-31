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
 *   show_visuals: false      # heater image and fan / pump popup icons (off by default)
 *   language: auto           # optional: de, fr, es, it, pt, nl, pl, ru, sv, cs, tr, ja, zh
 *                            # (default: your Home Assistant language, else English)
 *   # Optional entity overrides: status, core_temp, cabin_temp, voltage,
 *   # current, mode, power_level, target, power, estop, clear_fault, glow, fan, pump,
 *   # glow_out, fan_out, pump_rate, fan_set, pump_set
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
// Card text in the languages the controller app supports. English is the key.
const I18N = {
  de: {"Error":"Fehler","Clear fault":"Fehler löschen","Cabin temp":"Kabinentemp.","Fan":"Lüfter","Glow plug":"Glühkerze","Fuel pump":"Kraftstoffpumpe","Core temp":"Kerntemp.","Voltage":"Spannung","Current":"Strom","Thermostat":"Thermostat","Power":"Leistung","Target":"Soll","Offline":"Offline","On":"An","Off":"Aus","Stop heater":"Heizung stoppen","Start heater":"Heizung starten","Emergency stop":"Not-Aus","Heater fault (no details reported)":"Heizungsfehler (keine Details gemeldet)","Decrease target":"Soll verringern","Increase target":"Soll erhöhen","Decrease power level":"Leistungsstufe verringern","Increase power level":"Leistungsstufe erhöhen","Preheating":"Vorglühen","Igniting":"Zündung","Running":"Läuft","Cooling":"Abkühlen","Priming":"Befüllen","Fault":"Fehler","Fuel pump rate":"Kraftstoffpumpen-Rate","Fan speed":"Lüfterdrehzahl","Power level":"Leistungsstufe","Close":"Schließen","Only available in Power mode.":"Nur im Leistungsmodus verfügbar.","Decrease":"Verringern","Increase":"Erhöhen","Not available yet: update the Diesel Heater integration and the controller firmware.":"Noch nicht verfügbar: Integration „Diesel Heater“ und Controller-Firmware aktualisieren."},
  fr: {"Error":"Erreur","Clear fault":"Effacer le défaut","Cabin temp":"Temp. cabine","Fan":"Ventilateur","Glow plug":"Bougie de préchauffage","Fuel pump":"Pompe à carburant","Core temp":"Temp. cœur","Voltage":"Tension","Current":"Courant","Thermostat":"Thermostat","Power":"Puissance","Target":"Cible","Offline":"Hors ligne","On":"Marche","Off":"Arrêt","Stop heater":"Arrêter le chauffage","Start heater":"Démarrer le chauffage","Emergency stop":"Arrêt d'urgence","Heater fault (no details reported)":"Défaut du chauffage (aucun détail fourni)","Decrease target":"Diminuer la cible","Increase target":"Augmenter la cible","Decrease power level":"Diminuer le niveau de puissance","Increase power level":"Augmenter le niveau de puissance","Preheating":"Préchauffage","Igniting":"Allumage","Running":"En marche","Cooling":"Refroidissement","Priming":"Amorçage","Fault":"Défaut","Fuel pump rate":"Débit de la pompe à carburant","Fan speed":"Vitesse du ventilateur","Power level":"Niveau de puissance","Close":"Fermer","Only available in Power mode.":"Disponible uniquement en mode Puissance.","Decrease":"Diminuer","Increase":"Augmenter","Not available yet: update the Diesel Heater integration and the controller firmware.":"Pas encore disponible : mettez à jour l'intégration Diesel Heater et le firmware du contrôleur."},
  es: {"Error":"Error","Clear fault":"Borrar fallo","Cabin temp":"Temp. cabina","Fan":"Ventilador","Glow plug":"Bujía incandescente","Fuel pump":"Bomba de combustible","Core temp":"Temp. núcleo","Voltage":"Voltaje","Current":"Corriente","Thermostat":"Termostato","Power":"Potencia","Target":"Objetivo","Offline":"Sin conexión","On":"Activado","Off":"Apagado","Stop heater":"Detener calefactor","Start heater":"Iniciar calefactor","Emergency stop":"Parada de emergencia","Heater fault (no details reported)":"Fallo del calefactor (sin detalles)","Decrease target":"Reducir objetivo","Increase target":"Aumentar objetivo","Decrease power level":"Reducir nivel de potencia","Increase power level":"Aumentar nivel de potencia","Preheating":"Precalentando","Igniting":"Encendiendo","Running":"En marcha","Cooling":"Enfriando","Priming":"Cebando","Fault":"Fallo","Fuel pump rate":"Caudal de la bomba de combustible","Fan speed":"Velocidad del ventilador","Power level":"Nivel de potencia","Close":"Cerrar","Only available in Power mode.":"Solo disponible en modo Potencia.","Decrease":"Reducir","Increase":"Aumentar","Not available yet: update the Diesel Heater integration and the controller firmware.":"Aún no disponible: actualiza la integración Diesel Heater y el firmware del controlador."},
  it: {"Error":"Errore","Clear fault":"Cancella guasto","Cabin temp":"Temp. cabina","Fan":"Ventola","Glow plug":"Candeletta","Fuel pump":"Pompa carburante","Core temp":"Temp. nucleo","Voltage":"Tensione","Current":"Corrente","Thermostat":"Termostato","Power":"Potenza","Target":"Obiettivo","Offline":"Offline","On":"Acceso","Off":"Spento","Stop heater":"Ferma riscaldatore","Start heater":"Avvia riscaldatore","Emergency stop":"Arresto di emergenza","Heater fault (no details reported)":"Guasto del riscaldatore (nessun dettaglio)","Decrease target":"Diminuisci obiettivo","Increase target":"Aumenta obiettivo","Decrease power level":"Diminuisci livello di potenza","Increase power level":"Aumenta livello di potenza","Preheating":"Preriscaldamento","Igniting":"Accensione","Running":"In funzione","Cooling":"Raffreddamento","Priming":"Adescamento","Fault":"Guasto","Fuel pump rate":"Frequenza pompa carburante","Fan speed":"Velocità ventola","Power level":"Livello di potenza","Close":"Chiudi","Only available in Power mode.":"Disponibile solo in modalità Potenza.","Decrease":"Diminuisci","Increase":"Aumenta","Not available yet: update the Diesel Heater integration and the controller firmware.":"Non ancora disponibile: aggiorna l'integrazione Diesel Heater e il firmware del controller."},
  pt: {"Error":"Erro","Clear fault":"Limpar falha","Cabin temp":"Temp. cabine","Fan":"Ventoinha","Glow plug":"Vela incandescente","Fuel pump":"Bomba de combustível","Core temp":"Temp. núcleo","Voltage":"Tensão","Current":"Corrente","Thermostat":"Termóstato","Power":"Potência","Target":"Alvo","Offline":"Offline","On":"Ligado","Off":"Desligado","Stop heater":"Parar aquecedor","Start heater":"Iniciar aquecedor","Emergency stop":"Paragem de emergência","Heater fault (no details reported)":"Falha do aquecedor (sem detalhes)","Decrease target":"Diminuir alvo","Increase target":"Aumentar alvo","Decrease power level":"Diminuir nível de potência","Increase power level":"Aumentar nível de potência","Preheating":"Pré-aquecimento","Igniting":"A acender","Running":"Em funcionamento","Cooling":"A arrefecer","Priming":"Escorvamento","Fault":"Falha","Fuel pump rate":"Taxa da bomba de combustível","Fan speed":"Velocidade da ventoinha","Power level":"Nível de potência","Close":"Fechar","Only available in Power mode.":"Disponível apenas no modo Potência.","Decrease":"Diminuir","Increase":"Aumentar","Not available yet: update the Diesel Heater integration and the controller firmware.":"Ainda não disponível: atualize a integração Diesel Heater e o firmware do controlador."},
  nl: {"Error":"Fout","Clear fault":"Storing wissen","Cabin temp":"Cabinetemp.","Fan":"Ventilator","Glow plug":"Gloeibougie","Fuel pump":"Brandstofpomp","Core temp":"Kerntemp.","Voltage":"Spanning","Current":"Stroom","Thermostat":"Thermostaat","Power":"Vermogen","Target":"Doel","Offline":"Offline","On":"Aan","Off":"Uit","Stop heater":"Verwarming stoppen","Start heater":"Verwarming starten","Emergency stop":"Noodstop","Heater fault (no details reported)":"Storing verwarming (geen details gemeld)","Decrease target":"Doel verlagen","Increase target":"Doel verhogen","Decrease power level":"Vermogensniveau verlagen","Increase power level":"Vermogensniveau verhogen","Preheating":"Voorverwarmen","Igniting":"Ontsteking","Running":"Actief","Cooling":"Afkoelen","Priming":"Vullen","Fault":"Storing","Fuel pump rate":"Pompsnelheid brandstof","Fan speed":"Ventilatorsnelheid","Power level":"Vermogensniveau","Close":"Sluiten","Only available in Power mode.":"Alleen beschikbaar in de vermogensmodus.","Decrease":"Verlagen","Increase":"Verhogen","Not available yet: update the Diesel Heater integration and the controller firmware.":"Nog niet beschikbaar: werk de Diesel Heater-integratie en de controllerfirmware bij."},
  pl: {"Error":"Błąd","Clear fault":"Wyczyść usterkę","Cabin temp":"Temp. kabiny","Fan":"Wentylator","Glow plug":"Świeca żarowa","Fuel pump":"Pompa paliwa","Core temp":"Temp. rdzenia","Voltage":"Napięcie","Current":"Prąd","Thermostat":"Termostat","Power":"Moc","Target":"Cel","Offline":"Offline","On":"Wł.","Off":"Wył.","Stop heater":"Zatrzymaj nagrzewnicę","Start heater":"Uruchom nagrzewnicę","Emergency stop":"Zatrzymanie awaryjne","Heater fault (no details reported)":"Usterka nagrzewnicy (brak szczegółów)","Decrease target":"Zmniejsz cel","Increase target":"Zwiększ cel","Decrease power level":"Zmniejsz poziom mocy","Increase power level":"Zwiększ poziom mocy","Preheating":"Wstępne nagrzewanie","Igniting":"Zapłon","Running":"Pracuje","Cooling":"Chłodzenie","Priming":"Zalewanie","Fault":"Usterka","Fuel pump rate":"Częstotliwość pompy paliwa","Fan speed":"Prędkość wentylatora","Power level":"Poziom mocy","Close":"Zamknij","Only available in Power mode.":"Dostępne tylko w trybie Moc.","Decrease":"Zmniejsz","Increase":"Zwiększ","Not available yet: update the Diesel Heater integration and the controller firmware.":"Jeszcze niedostępne: zaktualizuj integrację Diesel Heater i firmware sterownika."},
  ru: {"Error":"Ошибка","Clear fault":"Сбросить неисправность","Cabin temp":"Темп. салона","Fan":"Вентилятор","Glow plug":"Свеча накаливания","Fuel pump":"Топливный насос","Core temp":"Темп. ядра","Voltage":"Напряжение","Current":"Ток","Thermostat":"Термостат","Power":"Мощность","Target":"Цель","Offline":"Не в сети","On":"Вкл.","Off":"Выкл.","Stop heater":"Остановить обогреватель","Start heater":"Запустить обогреватель","Emergency stop":"Аварийная остановка","Heater fault (no details reported)":"Неисправность обогревателя (нет подробностей)","Decrease target":"Уменьшить цель","Increase target":"Увеличить цель","Decrease power level":"Уменьшить уровень мощности","Increase power level":"Увеличить уровень мощности","Preheating":"Предпрогрев","Igniting":"Розжиг","Running":"Работает","Cooling":"Охлаждение","Priming":"Прокачка","Fault":"Неисправность","Fuel pump rate":"Частота топливного насоса","Fan speed":"Скорость вентилятора","Power level":"Уровень мощности","Close":"Закрыть","Only available in Power mode.":"Доступно только в режиме «Мощность».","Decrease":"Уменьшить","Increase":"Увеличить","Not available yet: update the Diesel Heater integration and the controller firmware.":"Пока недоступно: обновите интеграцию Diesel Heater и прошивку контроллера."},
  sv: {"Error":"Fel","Clear fault":"Rensa fel","Cabin temp":"Hyttemp.","Fan":"Fläkt","Glow plug":"Glödstift","Fuel pump":"Bränslepump","Core temp":"Kärntemp.","Voltage":"Spänning","Current":"Ström","Thermostat":"Termostat","Power":"Effekt","Target":"Mål","Offline":"Offline","On":"På","Off":"Av","Stop heater":"Stoppa värmaren","Start heater":"Starta värmaren","Emergency stop":"Nödstopp","Heater fault (no details reported)":"Värmarfel (inga detaljer rapporterade)","Decrease target":"Sänk mål","Increase target":"Höj mål","Decrease power level":"Sänk effektnivå","Increase power level":"Höj effektnivå","Preheating":"Förvärmer","Igniting":"Tänder","Running":"Igång","Cooling":"Kyler","Priming":"Primar","Fault":"Fel","Fuel pump rate":"Bränslepumpens takt","Fan speed":"Fläkthastighet","Power level":"Effektnivå","Close":"Stäng","Only available in Power mode.":"Endast tillgängligt i effektläget.","Decrease":"Sänk","Increase":"Höj","Not available yet: update the Diesel Heater integration and the controller firmware.":"Inte tillgängligt än: uppdatera integrationen Diesel Heater och styrenhetens firmware."},
  cs: {"Error":"Chyba","Clear fault":"Smazat poruchu","Cabin temp":"Teplota kabiny","Fan":"Ventilátor","Glow plug":"Žhavicí svíčka","Fuel pump":"Palivové čerpadlo","Core temp":"Teplota jádra","Voltage":"Napětí","Current":"Proud","Thermostat":"Termostat","Power":"Výkon","Target":"Cíl","Offline":"Offline","On":"Zap.","Off":"Vyp.","Stop heater":"Zastavit topení","Start heater":"Spustit topení","Emergency stop":"Nouzové zastavení","Heater fault (no details reported)":"Porucha topení (bez podrobností)","Decrease target":"Snížit cíl","Increase target":"Zvýšit cíl","Decrease power level":"Snížit úroveň výkonu","Increase power level":"Zvýšit úroveň výkonu","Preheating":"Předehřev","Igniting":"Zapalování","Running":"Běží","Cooling":"Chlazení","Priming":"Plnění","Fault":"Porucha","Fuel pump rate":"Frekvence palivového čerpadla","Fan speed":"Rychlost ventilátoru","Power level":"Úroveň výkonu","Close":"Zavřít","Only available in Power mode.":"Dostupné pouze v režimu Výkon.","Decrease":"Snížit","Increase":"Zvýšit","Not available yet: update the Diesel Heater integration and the controller firmware.":"Zatím nedostupné: aktualizujte integraci Diesel Heater a firmware řídicí jednotky."},
  tr: {"Error":"Hata","Clear fault":"Arızayı temizle","Cabin temp":"Kabin sıc.","Fan":"Fan","Glow plug":"Kızdırma bujisi","Fuel pump":"Yakıt pompası","Core temp":"Çekirdek sıc.","Voltage":"Gerilim","Current":"Akım","Thermostat":"Termostat","Power":"Güç","Target":"Hedef","Offline":"Çevrimdışı","On":"Açık","Off":"Kapalı","Stop heater":"Isıtıcıyı durdur","Start heater":"Isıtıcıyı başlat","Emergency stop":"Acil durdurma","Heater fault (no details reported)":"Isıtıcı arızası (ayrıntı bildirilmedi)","Decrease target":"Hedefi azalt","Increase target":"Hedefi artır","Decrease power level":"Güç seviyesini azalt","Increase power level":"Güç seviyesini artır","Preheating":"Ön ısıtma","Igniting":"Ateşleme","Running":"Çalışıyor","Cooling":"Soğutuyor","Priming":"Dolduruluyor","Fault":"Arıza","Fuel pump rate":"Yakıt pompası hızı","Fan speed":"Fan hızı","Power level":"Güç seviyesi","Close":"Kapat","Only available in Power mode.":"Yalnızca güç modunda kullanılabilir.","Decrease":"Azalt","Increase":"Artır","Not available yet: update the Diesel Heater integration and the controller firmware.":"Henüz kullanılamıyor: Diesel Heater entegrasyonunu ve denetleyici donanım yazılımını güncelleyin."},
  ja: {"Error":"エラー","Clear fault":"故障を解除","Cabin temp":"室温","Fan":"ファン","Glow plug":"グロープラグ","Fuel pump":"燃料ポンプ","Core temp":"コア温度","Voltage":"電圧","Current":"電流","Thermostat":"サーモスタット","Power":"パワー","Target":"目標","Offline":"オフライン","On":"オン","Off":"オフ","Stop heater":"ヒーターを停止","Start heater":"ヒーターを開始","Emergency stop":"緊急停止","Heater fault (no details reported)":"ヒーターの故障（詳細なし）","Decrease target":"目標を下げる","Increase target":"目標を上げる","Decrease power level":"パワーレベルを下げる","Increase power level":"パワーレベルを上げる","Preheating":"予熱中","Igniting":"点火中","Running":"運転中","Cooling":"冷却中","Priming":"燃料充填中","Fault":"故障","Fuel pump rate":"燃料ポンプ流量","Fan speed":"ファン速度","Power level":"パワーレベル","Close":"閉じる","Only available in Power mode.":"パワーモードでのみ利用できます。","Decrease":"下げる","Increase":"上げる","Not available yet: update the Diesel Heater integration and the controller firmware.":"まだ利用できません：Diesel Heater連携とコントローラーのファームウェアを更新してください。"},
  zh: {"Error":"错误","Clear fault":"清除故障","Cabin temp":"舱内温度","Fan":"风扇","Glow plug":"电热塞","Fuel pump":"燃油泵","Core temp":"核心温度","Voltage":"电压","Current":"电流","Thermostat":"恒温","Power":"功率","Target":"目标","Offline":"离线","On":"开","Off":"关","Stop heater":"停止加热器","Start heater":"启动加热器","Emergency stop":"紧急停止","Heater fault (no details reported)":"加热器故障（无详细信息）","Decrease target":"降低目标","Increase target":"提高目标","Decrease power level":"降低功率等级","Increase power level":"提高功率等级","Preheating":"预热中","Igniting":"点火中","Running":"运行中","Cooling":"冷却中","Priming":"燃油预充","Fault":"故障","Fuel pump rate":"燃油泵速率","Fan speed":"风扇转速","Power level":"功率等级","Close":"关闭","Only available in Power mode.":"仅在功率模式下可用。","Decrease":"降低","Increase":"提高","Not available yet: update the Diesel Heater integration and the controller firmware.":"暂不可用：请更新 Diesel Heater 集成和控制器固件。"},
};
const LANGUAGES = Object.keys(I18N);

// Picks the card language: the card's own `language` option, otherwise the
// Home Assistant user language. Anything unsupported falls back to English.
function cardLanguage(hass, cfg) {
  const own = cfg && cfg.language && cfg.language !== "auto" ? cfg.language : "";
  const raw = String(own || (hass && hass.language) || "en").toLowerCase();
  const base = raw.split(/[-_]/)[0];
  return LANGUAGES.includes(base) ? base : "en";
}
function translate(lang, text) {
  const table = I18N[lang];
  return (table && table[text]) || text;
}

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
  status: ["sensor", "_status", "status"],
  core_temp: ["sensor", "_core_temperature", "core_temperature"],
  cabin_temp: ["sensor", "_cabin_temperature", "cabin_temperature"],
  voltage: ["sensor", "_voltage", "voltage"],
  current: ["sensor", "_current", "current"],
  mode: ["select", "", "operating_mode"],
  power_level: ["number", "_power_level", "power_level"],
  target: ["number", "_target_temperature", "target_temperature"],
  power: ["switch", "", "power"],
  estop: ["button", "_emergency_stop", "emergency_stop"],
  clear_fault: ["button", "_clear_fault", "clear_fault"],
  glow: ["binary_sensor", "_glow_plug", "glow_on"],
  fan: ["binary_sensor", "_fan", "fan_on"],
  pump: ["binary_sensor", "_fuel_pump", "pump_on"],
  glow_out: ["sensor", "_glow_plug_output", "glow_output"],
  fan_out: ["sensor", "_fan_output", "fan_output"],
  pump_rate: ["sensor", "_fuel_pump_rate", "pump_rate"],
  fan_set: ["number", "_fan_speed", "fan_speed"],
  pump_set: ["number", "_fuel_pump_rate", "fuel_pump_rate"],
  fault: ["sensor", "_fault_message", "fault_message"],
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
  clear_fault: "button.diesel_heater_clear_fault",
  glow: "binary_sensor.diesel_heater_glow_plug",
  fan: "binary_sensor.diesel_heater_fan",
  pump: "binary_sensor.diesel_heater_fuel_pump",
  glow_out: "sensor.diesel_heater_glow_plug_output",
  fan_out: "sensor.diesel_heater_fan_output",
  pump_rate: "sensor.diesel_heater_fuel_pump_rate",
  fan_set: "number.diesel_heater_fan_speed",
  pump_set: "number.diesel_heater_fuel_pump_rate",
  fault: "sensor.diesel_heater_fault_message",
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
  [data-more], [data-adjust] { cursor:pointer; -webkit-tap-highlight-color:transparent; }
  [data-more], [data-adjust] { outline:none; }
  .tile[data-more]:hover, .out[data-adjust]:hover, .out[data-more]:hover { filter:brightness(1.08); }

  dialog.adjust { border:0; border-radius:16px; padding:20px; width:min(360px, calc(100vw - 32px));
    background:var(--card-background-color, #fff); color:var(--primary-text-color); box-shadow:0 8px 32px #0006; }
  dialog.adjust::backdrop { background:#0008; }
  .visual { position:relative; height:128px; border-radius:14px; overflow:hidden; background:#000;
    display:flex; justify-content:center; align-items:center; }
  .visual::before { content:""; position:absolute; inset:0;
    background:radial-gradient(ellipse at 50% 100%, var(--st) 0%, transparent 65%); opacity:.28; }
  .visual img { position:relative; height:100%; width:auto; display:block; }
  .adjust-head { display:flex; align-items:center; gap:16px; margin-bottom:6px; }
  .adjust-icon { flex:0 0 64px; width:64px; height:64px; border-radius:50%; display:grid; place-items:center;
    background:var(--secondary-background-color); color:var(--primary-color); }
  .adjust-icon svg { width:36px; height:36px; }
  .adjust-icon.on { background:linear-gradient(135deg,#f26826,#ff873e); color:#fff; }
  .adjust-icon.spin svg { animation:dh-spin 1.2s linear infinite; }
  @keyframes dh-spin { to { transform:rotate(360deg); } }
  .adjust .now { margin:2px 0 0; }
  .adjust h3 { margin:0 0 4px; font-size:1.1rem; font-weight:500; }
  .adjust .val { min-width:64px; }
  .adjust .now { font-size:2.2rem; font-weight:600; margin:8px 0 16px; }
  .adjust .hint { margin:14px 0 0; font-size:.8rem; color:var(--secondary-text-color); }
  .adjust .close { margin-top:16px; width:100%; border:0; border-radius:10px; padding:10px; cursor:pointer; font:inherit;
    font-weight:500; background:var(--secondary-background-color); color:var(--primary-text-color); }

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
  .fault { padding:10px 12px; border-radius:10px; background:var(--error-color,#d32f2f); color:#fff; font-size:.85rem; }
  .fault b { display:block; font-size:.7rem; text-transform:uppercase; letter-spacing:.08em; opacity:.85; margin-bottom:3px; }
  .fault span { display:block; white-space:pre-wrap; overflow-wrap:anywhere; user-select:text; }
  .fault button { margin-top:8px; border:1px solid #fff; border-radius:8px; padding:6px 12px; cursor:pointer; font:inherit; font-weight:600; background:rgba(255,255,255,.15); color:#fff; }
  .fault button:hover { background:rgba(255,255,255,.3); }
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
  [data-layout=split] .body { display:grid; grid-template-columns:1fr 1fr; column-gap:14px; row-gap:0; align-items:start;
    grid-template-areas:"fault fault" "outputs controls" "tiles controls"; }
  [data-layout=split] .tiles { grid-area:tiles; grid-template-columns:1fr; gap:6px; }
  [data-layout=split] .tile { display:flex; flex-direction:row-reverse; justify-content:space-between; align-items:center; text-align:left; padding:10px 12px; }
  [data-layout=split] .tile .l { margin:0; font-size:.85rem; }
  [data-layout=split] .outputs { grid-area:outputs; gap:6px; margin-bottom:14px; }
  [data-layout=split] .out { padding:12px 2px 10px; }
  [data-layout=split] .out svg { width:32px; height:32px; flex-basis:32px; }
  [data-layout=split] .out b { font-size:.9rem; }
  [data-layout=split] .controls { grid-area:controls; }
  [data-layout=split] .fault { grid-area:fault; margin-bottom:14px; }
  [data-layout=split] .row { flex-wrap:wrap; }
  [data-layout=split] .row .lbl { flex:1 1 100%; }
  [data-layout=split] .row input[type=range] { min-width:50px; }
  [data-layout=split] .actions { flex-direction:column; }
  @container (max-width:430px) {
    [data-layout=split] .body { grid-template-columns:1fr; grid-template-areas:"fault" "outputs" "tiles" "controls"; }
    [data-layout=split] .tiles { margin-bottom:14px; }

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
      // Entity ids follow the Home Assistant language, so match on the entity's
      // translation key first and fall back to the English id suffix.
      const all = Object.values(hass.entities).filter((e) => e.device_id === deviceId);
      for (const [key, [domain, suffix, translationKey]] of Object.entries(ENTITY_SPEC)) {
        const byKey = all.find((e) => e.translation_key === translationKey && e.entity_id.startsWith(domain + "."));
        if (byKey) { found[key] = byKey.entity_id; continue; }
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
          <div class="visual"><img alt="" src="data:image/jpeg;base64,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"></div>
          <div class="fault" id="fault" hidden><b data-t="Error">Error</b><span id="faultText"></span><button id="clearFault" data-t="Clear fault" hidden>Clear fault</button></div>
          <div class="hero-block">
            <div class="ring"><div class="ring-in">
              <div class="big"><span id="bigCore">--</span><span class="u">°C</span></div>
              <div class="ring-l" data-t="Cabin temp">Cabin temp</div>
            </div></div>
          </div>
          <div class="outputs">
            <div class="out" id="outFan" data-adjust="fan" role="button" tabindex="0">${ICON_FAN}<div><b>0%</b><small data-t="Fan">Fan</small></div></div>
            <div class="out" id="outGlow" data-more="glow" role="button" tabindex="0">${ICON_GLOW}<div><b>Off</b><small data-t="Glow plug">Glow plug</small></div></div>
            <div class="out" id="outPump" data-adjust="pump" role="button" tabindex="0">${ICON_PUMP}<div><b>0.00 Hz</b><small data-t="Fuel pump">Fuel pump</small></div></div>
          </div>
          <div class="tiles">
            <div class="tile core" data-more="core_temp" role="button" tabindex="0"><div><span class="v" id="core">--</span><span class="u">°C</span></div><div class="l" data-t="Core temp">Core temp</div></div>
            <div class="tile" data-more="voltage" role="button" tabindex="0"><div><span class="v" id="volt">--</span><span class="u">V</span></div><div class="l" data-t="Voltage">Voltage</div></div>
            <div class="tile" data-more="current" role="button" tabindex="0"><div><span class="v" id="amp">--</span><span class="u">A</span></div><div class="l" data-t="Current">Current</div></div>
          </div>
          <div class="controls">
            <div class="seg">
              <button data-mode="Thermostat" data-t="Thermostat">Thermostat</button>
              <button data-mode="Power" data-t="Power">Power</button>
            </div>
            <div class="row" id="thermoRow">
              <span class="lbl" data-t="Target">Target</span>
              <button class="step" data-key="target" data-dir="-1" aria-label="Decrease target" data-ta="Decrease target">&minus;</button>
              <input type="range" id="targetSlider" min="5" max="35" step="1">
              <button class="step" data-key="target" data-dir="1" aria-label="Increase target" data-ta="Increase target">+</button>
              <span class="val" id="targetVal"></span>
            </div>
            <div class="row" id="powerRow">
              <span class="lbl" data-t="Power">Power</span>
              <button class="step" data-key="power_level" data-dir="-1" aria-label="Decrease power level" data-ta="Decrease power level">&minus;</button>
              <input type="range" id="levelSlider" min="1" max="10" step="1">
              <button class="step" data-key="power_level" data-dir="1" aria-label="Increase power level" data-ta="Increase power level">+</button>
              <span class="val" id="levelVal"></span>
            </div>
            <div class="actions">
              <button id="toggle"></button>
              <button id="estop" class="estop" hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 2h8l6 6v8l-6 6H8l-6-6V8z"/><path d="M12 7v6M12 16.5v.5"/></svg>
                <span data-t="Emergency stop">Emergency stop</span>
              </button>
            </div>
          </div>
        </div>
      </ha-card>
      <dialog class="adjust" id="adjust">
        <div class="adjust-head">
          <div class="adjust-icon" id="adjustIcon"></div>
          <div><h3 id="adjustTitle"></h3><div class="now" id="adjustNow"></div></div>
        </div>
        <div class="row" id="adjustRow">
          <button class="step" id="adjustDown" aria-label="Decrease" data-ta="Decrease">&minus;</button>
          <input type="range" id="adjustSlider" min="0" max="100" step="1">
          <button class="step" id="adjustUp" aria-label="Increase" data-ta="Increase">+</button>
          <span class="val" id="adjustVal"></span>
        </div>
        <p class="hint" id="adjustHint" hidden></p>
        <button class="close" id="adjustClose" data-t="Close">Close</button>
      </dialog>`;
    this._root = this.shadowRoot;
    const $ = (s) => this._root.querySelector(s);

    // Glow plug, core temperature, voltage and current open the usual more-info dialog.
    this._root.querySelectorAll("[data-more]").forEach((el) => {
      const open = () => this.dispatchEvent(new CustomEvent("hass-more-info", {
        detail: { entityId: this._ids[el.dataset.more] }, bubbles: true, composed: true }));
      el.addEventListener("click", open);
      el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
    });
    // Fan and fuel pump open a popup that steps the power level, which drives both.
    this._root.querySelectorAll("[data-adjust]").forEach((el) => {
      const open = () => this._openAdjust(el.dataset.adjust);
      el.addEventListener("click", open);
      el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
    });
    const dlg = $("#adjust"), slider = $("#adjustSlider");
    $("#adjustClose").addEventListener("click", () => dlg.close());
    dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener("close", () => { this._adjusting = null; });
    // Fan speed / fuel pump rate: the popup edits the matching number entity.
    slider.addEventListener("input", () => {
      this._dragging = this._adjustKey(); $("#adjustVal").textContent = this._adjustText(Number(slider.value));
    });
    slider.addEventListener("change", () => { this._dragging = null; this._commit(this._adjustKey(), Number(slider.value)); });
    $("#adjustDown").addEventListener("click", () => this._adjustBump(-1));
    $("#adjustUp").addEventListener("click", () => this._adjustBump(1));

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
    this._root.querySelectorAll(".step[data-key]").forEach((b) =>
      b.addEventListener("click", () => this._bump(b.dataset.key, Number(b.dataset.dir))));

    $("#toggle").addEventListener("click", () => {
      const on = $("#toggle").dataset.on === "1";
      this._hass.callService("switch", on ? "turn_off" : "turn_on", { entity_id: this._ids.power });
    });
    $("#clearFault").addEventListener("click", () =>
      this._hass.callService("button", "press", { entity_id: this._ids.clear_fault }));
    $("#estop").addEventListener("click", () =>
      this._hass.callService("button", "press", { entity_id: this._ids.estop }));
    this._update();
  }

  _range(key) {
    const st = this._hass.states[this._ids[key]];
    const a = st ? st.attributes : {};
    const def = { target: [5, 35], fan_set: [0, 100], pump_set: [1.5, 8] }[key] || [1, 10];
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

  // The fan / fuel pump popup edits the fan speed or fuel pump rate number entity.
  _adjustKey() { return this._adjusting === "pump" ? "pump_set" : "fan_set"; }

  _adjustText(v) { return this._adjusting === "pump" ? v.toFixed(1) + " Hz" : Math.round(v) + "%"; }

  _adjustBump(dir) {
    const key = this._adjustKey(), slider = this._root.querySelector("#adjustSlider");
    const { min, max } = this._range(key);
    const step = this._adjusting === "pump" ? 0.1 : 5;
    const next = Math.min(max, Math.max(min, Math.round((Number(slider.value) + dir * step) * 10) / 10));
    slider.value = next;
    this._root.querySelector("#adjustVal").textContent = this._adjustText(next);
    clearTimeout(this._pending[key]);
    this._pending[key] = setTimeout(() => { delete this._pending[key]; this._commit(key, next); }, 350);
  }

  _openAdjust(kind) {
    this._adjusting = kind;
    this._update();
    this._root.querySelector("#adjust").showModal();
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
    const lang = cardLanguage(h, this._config);
    const t = (s) => translate(lang, s);
    if (this._lang !== lang) {
      this._lang = lang;
      this._root.querySelectorAll("[data-t]").forEach((el) => { el.textContent = translate(lang, el.dataset.t); });
      this._root.querySelectorAll("[data-ta]").forEach((el) => el.setAttribute("aria-label", translate(lang, el.dataset.ta)));
    }
    const c = this._ids = this._entities();
    const cfg = this._config;
    // Heater image and popup icons are optional (off unless show_visuals: true).
    $(".visual").hidden = !cfg.show_visuals;
    $("#adjustIcon").hidden = !cfg.show_visuals;
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
    statusEl.querySelector("span").textContent = t(state === "unavailable" ? "Offline" : state);
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
    this._setOutput("#outFan", this._isOn(c.fan), fanPct === null ? t(this._isOn(c.fan) ? "On" : "Off") : Math.round(fanPct) + "%");
    this._setOutput("#outGlow", this._isOn(c.glow),
      this._isOn(c.glow) ? (glowPct !== null && glowPct < 100 ? Math.round(glowPct) + "%" : t("On")) : t("Off"));
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

    // Fan / fuel pump popup: live reading plus the shared power level control.
    if (this._adjusting) {
      const icon = $("#adjustIcon"), isPump = this._adjusting === "pump", running = this._isOn(isPump ? c.pump : c.fan);
      if (icon.dataset.kind !== this._adjusting) { icon.dataset.kind = this._adjusting; icon.innerHTML = isPump ? ICON_PUMP : ICON_FAN; }
      icon.classList.toggle("on", running);
      icon.classList.toggle("spin", running && !isPump);
      $("#adjustTitle").textContent = t(this._adjusting === "fan" ? "Fan speed" : "Fuel pump rate");
      $("#adjustNow").textContent = this._adjusting === "fan"
        ? (fanPct === null ? "--" : Math.round(fanPct) + "%")
        : (pumpHz === null ? "--" : pumpHz.toFixed(2) + " Hz");
    }
    if (this._adjusting) {
      const key = this._adjustKey(), ds = $("#adjustSlider");
      // If the usual lookup missed, take any number entity with the expected name ending.
      if (!h.states[c[key]]) {
        const tail = ENTITY_SPEC[key][1];
        const alt = Object.keys(h.states).find((id) => id.startsWith("number.") && id.endsWith(tail));
        if (alt) c[key] = alt;
      }
      const { min, max, step } = this._range(key);
      // The slider is always shown; it is disabled (with the reason) when the
      // entity is missing (older integration) or the heater is not in Power mode.
      const exists = !!h.states[c[key]] && h.states[c[key]].state !== "unavailable";
      const inPower = modeState === "Power";
      ds.min = min; ds.max = max; ds.step = step;
      this._root.querySelectorAll("#adjustRow input, #adjustRow button").forEach((el) => { el.disabled = !(exists && inPower); });
      $("#adjustRow").style.opacity = exists && inPower ? "" : ".5";
      const hint = $("#adjustHint");
      hint.hidden = exists && inPower;
      hint.textContent = exists ? t("Only available in Power mode.")
        : t("Not available yet: update the Diesel Heater integration and the controller firmware.") + " (" + c[key] + ")";
      if (this._dragging !== key && !this._pending[key]) {
        const v = this._num(c[key]);
        if (v !== null) { ds.value = v; $("#adjustVal").textContent = this._adjustText(v); }
      }
    }

    const sw = h.states[c.power];
    const isOn = !!sw && sw.state === "on";
    const btn = $("#toggle");
    btn.dataset.on = isOn ? "1" : "0";
    btn.textContent = t(isOn ? "Stop heater" : "Start heater");
    btn.className = isOn ? "stop" : "start";
    btn.disabled = !sw || (state === "Cooling" && !isOn);

    // Emergency stop is only offered while the heater is running.
    $("#estop").hidden = !(ACTIVE_STATES.includes(state) && h.states[c.estop] && cfg.show_estop !== false);

    // The full current error. Shown whenever the controller reports one, which
    // also covers an emergency stop (the heater is then cooling, not in Fault).
    const fault = $("#fault");
    const faultEntity = h.states[c.fault];
    let msg = "";
    if (faultEntity && !["none", "unknown", "unavailable", ""].includes(String(faultEntity.state).toLowerCase())) {
      msg = (faultEntity.attributes && faultEntity.attributes.message) || faultEntity.state;
    }
    if (!msg && st && st.attributes && st.attributes.fault) msg = st.attributes.fault;
    if (!msg && state === "Fault") msg = t("Heater fault (no details reported)");
    fault.hidden = !msg;
    $("#faultText").textContent = msg;
    // Clearing is only possible from a real fault, not while cooling after an emergency stop.
    $("#clearFault").hidden = !(state === "Fault" && h.states[c.clear_fault]);
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
          { name: "show_visuals", selector: { boolean: {} } },
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
          entity("power", "switch"), entity("estop", "button"), entity("clear_fault", "button"),
          entity("glow", "binary_sensor"), entity("fan", "binary_sensor"),
          entity("pump", "binary_sensor"), entity("glow_out", "sensor"),
          entity("fan_out", "sensor"), entity("pump_rate", "sensor"), entity("fan_set", "number"),
          entity("pump_set", "number"), entity("fault", "sensor"),
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
        show_visuals: "Show heater image and popup icons",
        status: "Status sensor", core_temp: "Core temperature sensor",
        cabin_temp: "Cabin temperature sensor (optional)", voltage: "Voltage sensor",
        current: "Current sensor", mode: "Operating mode select",
        power_level: "Power level number", target: "Target temperature number",
        power: "Power switch", estop: "Emergency stop button", clear_fault: "Clear fault button",
        glow: "Glow plug on/off", fan: "Fan on/off", pump: "Fuel pump on/off",
        glow_out: "Glow plug output %", fan_out: "Fan output %", pump_rate: "Fuel pump rate (Hz)",
        fan_set: "Fan speed number", pump_set: "Fuel pump rate number", fault: "Fault message sensor",
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
    this._form.data = { layout: "classic", show_outputs: true, show_estop: true, show_visuals: false, ...this._config };
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
    documentationURL: "https://github.com/horizon10t/diesel-heater-lovelace",
  });
}
