import { version } from "../package.json";

export const CARD_TAG = "viessmann-boiler-card";
export const EDITOR_TAG = "viessmann-boiler-card-editor";
export const CARD_VERSION = version;

/** The renders sit in a folder beside the card's script: /local/ for a copied build, /hacsfiles/<repo>/ under HACS. */
export const DEFAULT_ASSET_URL = new URL(/* @vite-ignore */ "viessmann-boiler-card/", import.meta.url).pathname;

export const MODELS: Record<string, { name: string; variant: string }> = {
  "vitocrossal-300-cu3a-199": { name: "Vitocrossal 300", variant: "CU3A 199" },
};
