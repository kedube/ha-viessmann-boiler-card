export interface HeatingCurve {
  slope: number;
  shift: number;
  /** Active room setpoint in °C (the normal, reduced or comfort temperature). */
  roomSetpoint: number;
}

/**
 * Supply temperature target (°C) for an outside temperature, using the heating
 * curve formula Viessmann publishes for Vitotronic controls.
 */
export function supplyTarget(curve: HeatingCurve, outsideC: number): number {
  const dar = outsideC - curve.roomSetpoint;
  return curve.roomSetpoint + curve.shift - curve.slope * dar * (1.4347 + 0.021 * dar + 247.9e-6 * dar * dar);
}
