import "../src/viessmann-boiler-card";
import type { ViessmannBoilerCard } from "../src/card";
import type { ViessmannBoilerCardEditor } from "../src/editor";
import type { BoilerCardConfig } from "../src/types";
import { FakeHass } from "./fake-hass";
import { DEV_CONFIG } from "./fixtures";
import { SCENARIOS } from "./scenarios";

// URL parameters make screenshots reproducible:
// ?scenario=zones&theme=dark&units=F&width=1100&anim=0&tab=heating&editor=1
const params = new URLSearchParams(location.search);
const fake = new FakeHass();
fake.dark = params.get("theme") === "dark";
fake.unit = params.get("units") === "F" ? "°F" : "°C";

const stage = document.getElementById("stage")!;
const log = document.getElementById("log")!;
const editorHost = document.getElementById("editor-host")!;
const configOut = document.getElementById("config")!;

const card = document.createElement("viessmann-boiler-card") as ViessmannBoilerCard;
card.setConfig({ ...DEV_CONFIG, animation: params.get("anim") !== "0" });
const tab = params.get("tab");
if (tab) (card as unknown as { _tab: string })._tab = tab;
card.addEventListener("hass-more-info", (ev) => {
  fake.log.unshift(`more-info ${(ev as CustomEvent<{ entityId: string }>).detail.entityId}`);
  render();
});
card.addEventListener("hass-notification", (ev) => {
  fake.log.unshift(`toast: ${(ev as CustomEvent<{ message: string }>).detail.message}`);
  render();
});
stage.append(card);

const editor = document.createElement("viessmann-boiler-card-editor") as ViessmannBoilerCardEditor;
editor.setConfig(DEV_CONFIG);
editor.addEventListener("config-changed", (ev) => {
  const config = (ev as CustomEvent<{ config: BoilerCardConfig }>).detail.config;
  card.setConfig(config);
  configOut.textContent = JSON.stringify(config, null, 2);
});
editorHost.prepend(editor);
editorHost.hidden = params.get("editor") !== "1";

let scenario = params.get("scenario") ?? "idle";
let width = Number(params.get("width") ?? 1100);

function render(): void {
  document.body.classList.toggle("dark", fake.dark);
  stage.style.width = `${width}px`;
  card.hass = fake.snapshot();
  editor.hass = card.hass;
  log.textContent = fake.log.slice(0, 8).join("\n");
  for (const el of document.querySelectorAll<HTMLButtonElement>("[data-scenario]")) {
    el.classList.toggle("active", el.dataset.scenario === scenario);
  }
}

function button(label: string, onClick: () => void, attrs: Record<string, string> = {}): HTMLButtonElement {
  const b = document.createElement("button");
  b.textContent = label;
  for (const [k, v] of Object.entries(attrs)) b.setAttribute(k, v);
  b.addEventListener("click", onClick);
  return b;
}

const controls = document.getElementById("controls")!;
for (const [key, s] of Object.entries(SCENARIOS)) {
  controls.append(
    button(
      s.label,
      () => {
        scenario = key;
        s.apply(fake);
        render();
      },
      { "data-scenario": key },
    ),
  );
}
controls.append(
  button("Light / dark", () => {
    fake.dark = !fake.dark;
    render();
  }),
  button("°C / °F", () => {
    fake.unit = fake.unit === "°C" ? "°F" : "°C";
    render();
  }),
  ...[1300, 1100, 800, 390].map((w) =>
    button(`${w}px`, () => {
      width = w;
      render();
    }),
  ),
  button("Editor", () => {
    editorHost.hidden = !editorHost.hidden;
  }),
);

fake.onChange(render);
SCENARIOS[scenario]?.apply(fake);
render();
