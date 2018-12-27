import { BaseHsr, HSR_CAN_IDS, HsrTx } from '../hsr-data/base-hsr';
/**
 *
 *
 *  HSR_torqueLimits
 *  Length 3 bytes
 *  10 Hz
 *
 *   FA FA 00
 *
 */

// Torque Limits byte offsets
enum TQ_OFFSETS {
  REGEN_TORQUE,
  OUTPUT_TORQUE,
  CRUDE_TRACTION_CONTROL_ENABLED
}

// Torque Limits
export class TorqueLimits extends BaseHsr {
  readonly offset: number = 0.4; // incoming data is offset by (value / 0.4), example: 250 = 100%)
  static rxID: HSR_CAN_IDS = HSR_CAN_IDS.TORQUE_LIMITS;
  constructor(data?: DataView) {
    super(3, data);
  }

  demo(): void {

  }

  get canID(): HSR_CAN_IDS {
    return TorqueLimits.rxID;
  }

  /**
   * Regen Torque Percent
   * @returns { number } 0-100% value
   */
  get outputRegen(): number {
    return Math.round(this.data.getUint8(TQ_OFFSETS.REGEN_TORQUE) * this.offset);
  }

  /**
   * Output Torque Percent
   * @returns { number } 0-100% value
   */
  get outputTorque(): number {
    return Math.round(this.data.getUint8(TQ_OFFSETS.OUTPUT_TORQUE) * this.offset);
  }

  /**
   * HSR Crude Traction Control Enabled
   * @returns { boolean } Enabled
   */
  get tractionControl(): boolean {
    return !!this.data.getUint8(TQ_OFFSETS.CRUDE_TRACTION_CONTROL_ENABLED);
  }
}
