export const CARD_TAG = "viessmann-boiler-card";
export const EDITOR_TAG = "viessmann-boiler-card-editor";
export const CARD_VERSION = "0.2.0";

/** Home Assistant serves /config/www at /local/. */
export const DEFAULT_ASSET_URL = "/local/viessmann-boiler-card/";

export const MODELS: Record<string, { name: string; variant: string }> = {
  "vitocrossal-300-cu3a-199": { name: "Vitocrossal 300", variant: "CU3A 199" },
};
