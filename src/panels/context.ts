import type { SystemState } from "../system/state";
import type { BoilerCardConfig, HomeAssistant } from "../types";
import type { ViCareEntities } from "../vicare/discovery";

export interface CurveDraft {
  slope: number;
  shift: number;
}

/** What a panel needs from the card: live state, and actions that go through the card's debouncing. */
export interface PanelContext {
  hass: HomeAssistant;
  config: BoilerCardConfig;
  vicare: ViCareEntities;
  state: SystemState;
  /** Display unit for temperatures. */
  unit: string;
  /** A numeric entity's value, including a change that hasn't reached Home Assistant yet. */
  value(entityId: string | undefined): number | null;
  pending(entityId: string | undefined): boolean;
  /** Sets a number, water heater or climate target once the user pauses. */
  setValue(entityId: string, value: number): void;
  call(domain: string, service: string, data: Record<string, unknown>): void;
  moreInfo(entityId: string | undefined): void;
  curveDraft(circuit: number): CurveDraft | undefined;
  setCurveDraft(circuit: number, draft: CurveDraft | undefined): void;
  applyCurve(circuit: number): void;
}
