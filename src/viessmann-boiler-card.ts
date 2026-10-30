import { ViessmannBoilerCard } from "./card";
import { CARD_TAG, CARD_VERSION, EDITOR_TAG, USAGE_TAG } from "./const";
import { ViessmannBoilerCardEditor } from "./editor";
import { ViessmannBoilerUsage } from "./panels/usage";

if (!customElements.get(CARD_TAG)) customElements.define(CARD_TAG, ViessmannBoilerCard);
if (!customElements.get(EDITOR_TAG)) customElements.define(EDITOR_TAG, ViessmannBoilerCardEditor);
if (!customElements.get(USAGE_TAG)) customElements.define(USAGE_TAG, ViessmannBoilerUsage);

interface CustomCardEntry {
  type: string;
  name: string;
  description: string;
  preview?: boolean;
}

const registry = window as unknown as { customCards?: CustomCardEntry[] };
registry.customCards ??= [];
if (!registry.customCards.some((c) => c.type === CARD_TAG)) {
  registry.customCards.push({
    type: CARD_TAG,
    name: "Viessmann Boiler Card",
    description: "Realistic, animated view of a Viessmann ViCare heating system.",
    preview: true,
  });
}

console.info(
  `%c VIESSMANN-BOILER-CARD %c ${CARD_VERSION} `,
  "color:#fff;background:#d6001c;font-weight:700",
  "color:#d6001c;background:#fff",
);
