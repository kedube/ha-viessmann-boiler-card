// @vitest-environment happy-dom
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { FakeHass } from "../dev/fake-hass";
import { DEV_CONFIG } from "../dev/fixtures";
import type { HomeAssistant } from "../src/types";

// These drive the real card and check exactly which Home Assistant services it
// calls, since the controls change settings on a real boiler.

class Observer {
  observe() {}
  disconnect() {}
}

type Card = HTMLElement & {
  hass: HomeAssistant;
  setConfig(config: unknown): void;
  updateComplete: Promise<boolean>;
};

let fake: FakeHass;
let card: Card;
let calls: Array<[string, string, Record<string, unknown>]>;

beforeAll(async () => {
  Object.assign(globalThis, { ResizeObserver: Observer, IntersectionObserver: Observer });
  globalThis.fetch = (() => Promise.reject(new Error("offline"))) as typeof fetch;
  await import("../src/viessmann-boiler-card");
});

beforeEach(async () => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
  fake = new FakeHass();
  calls = [];
  card = document.createElement("viessmann-boiler-card") as Card;
  card.setConfig(DEV_CONFIG);
  setHass();
  document.body.append(card);
  await card.updateComplete;
});

afterEach(() => {
  card.remove();
  vi.useRealTimers();
});

function setHass(): void {
  const hass = fake.snapshot();
  hass.callService = async (domain, service, data = {}) => {
    calls.push([domain, service, data]);
  };
  card.hass = hass;
}

const root = () => card.shadowRoot!;
const buttons = (selector = "button") => [...root().querySelectorAll<HTMLButtonElement>(selector)];
const byText = (text: string, selector = "button") => buttons(selector).find((b) => b.textContent?.trim() === text);

async function openTab(name: string): Promise<void> {
  byText(name, ".tabs button")!.click();
  await card.updateComplete;
}

function panelFor(title: string): HTMLElement {
  return [...root().querySelectorAll<HTMLElement>(".panel")].find((p) => p.querySelector("h3")?.textContent === title)!;
}

function stepperIn(panel: HTMLElement, label: string): { lower: HTMLButtonElement; raise: HTMLButtonElement } {
  const field = [...panel.querySelectorAll(".field")].find((f) => f.querySelector(".field-label")?.textContent === label)!;
  const [lower, raise] = field.querySelectorAll<HTMLButtonElement>(".step");
  return { lower, raise };
}

describe("card controls", () => {
  it("sets a circuit's ViCare mode", async () => {
    await openTab("Heating");
    byText("Always normal", `.panel:last-child .segmented button`)!.click();
    expect(calls).toEqual([
      ["vicare", "set_vicare_mode", { entity_id: "climate.vscotho1_200_20_heating_2", vicare_mode: "forcedNormal" }],
    ]);
  });

  it("waits for a pause before sending a room temperature", async () => {
    await openTab("Heating");
    const { raise } = stepperIn(panelFor("Radiant Staple Up"), "Normal room");
    raise.click();
    await card.updateComplete;
    raise.click();
    await card.updateComplete;
    expect(calls).toEqual([]);
    vi.advanceTimersByTime(1600);
    expect(calls).toEqual([["number", "set_value", { entity_id: "number.vscotho1_200_20_normal_temperature_2", value: 31 }]]);
  });

  it("sends a curve change only on Apply, slope first and shift once the slope is reported", async () => {
    await openTab("Heating");
    const panel = panelFor("Boiler Loop");
    stepperIn(panel, "Curve slope").raise.click();
    await card.updateComplete;
    stepperIn(panelFor("Boiler Loop"), "Curve shift").lower.click();
    await card.updateComplete;
    vi.advanceTimersByTime(5000);
    expect(calls).toEqual([]);

    byText("Apply")!.click();
    await card.updateComplete;
    expect(calls).toEqual([["number", "set_value", { entity_id: "number.vscotho1_200_20_heating_curve_slope", value: 1.3 }]]);

    fake.set("number.vscotho1_200_20_heating_curve_slope", "1.3");
    setHass();
    await card.updateComplete;
    expect(calls.at(-1)).toEqual(["number", "set_value", { entity_id: "number.vscotho1_200_20_heating_curve_shift", value: 19 }]);
  });

  it("drops a curve edit on Cancel", async () => {
    await openTab("Heating");
    stepperIn(panelFor("Boiler Loop"), "Curve slope").raise.click();
    await card.updateComplete;
    byText("Cancel")!.click();
    await card.updateComplete;
    vi.advanceTimersByTime(5000);
    expect(calls).toEqual([]);
    expect(byText("Apply")).toBeUndefined();
  });

  it("sets the hot water target", async () => {
    await openTab("Hot water");
    stepperIn(panelFor("Hot water"), "Target").raise.click();
    vi.advanceTimersByTime(1600);
    expect(calls).toEqual([["number", "set_value", { entity_id: "number.vscotho1_200_20_dhw_temperature", value: 50 }]]);
  });

  it("starts a new card with a zone per Nest thermostat", () => {
    const Card = customElements.get("viessmann-boiler-card") as unknown as {
      getStubConfig(hass: HomeAssistant): { circuits?: Array<{ separated_by?: string; zones?: Array<{ name: string }> }> };
    };
    const zones = Card.getStubConfig(fake.snapshot()).circuits?.find((c) => c.separated_by)?.zones;
    expect(zones?.map((z) => z.name)).toEqual(["Bathroom", "Den", "Entryway", "Garage", "Hallway", "Living Room", "Master Bath"]);
  });

  it("charts temperatures and burner run time from Home Assistant's history, without calling ViCare", async () => {
    const ws: string[] = [];
    const hass = card.hass;
    card.hass = { ...hass, callWS: (msg) => (ws.push(msg.type), hass.callWS(msg)) };
    await openTab("Usage");
    await vi.waitFor(() => expect(root().querySelectorAll(".bar").length).toBeGreaterThan(25));

    expect(ws.sort()).toEqual(["history/history_during_period", "history/history_during_period", "recorder/statistics_during_period"]);
    expect(root().querySelectorAll(".series-line")).toHaveLength(4);
    // The recorder kept on/off history for 10 days; older days are whole hours from the counter.
    expect(root().querySelector(".chart-legend")?.textContent).toContain("Whole hours");

    const tank = () => buttons(".series-toggle").find((b) => b.textContent?.includes("Hot water tank"))!;
    tank().click();
    await card.updateComplete;
    expect(root().querySelectorAll(".series-line")).toHaveLength(3);
    expect(tank().getAttribute("aria-pressed")).toBe("false");
    expect(calls).toEqual([]);
  });

  it("lists every ViCare entity on the diagnostics tab", async () => {
    await openTab("Diagnostics");
    const rows = root().querySelectorAll(".entity-row");
    expect(rows.length).toBeGreaterThan(30);
    expect(root().textContent).toContain("10.5 min");
  });
});
