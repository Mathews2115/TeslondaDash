import { BaseHsr, HSR_CAN_IDS } from '../hsr-data/base-hsr';
const NM_FTLB_CONV =  0.73756;
/**
 *
 *
 *  HSR_torquePowerData
 *
 */


/**
 * TORQUE_POWER_DATA_OFFSETS - Offsets in bytes
 */
export enum TORQUE_POWER_DATA_OFFSETS {
  OUTPUT_TORQUE,
  OUTPUT_MECHANICAL_POWER = 2
}

export class TorquePowerData extends BaseHsr {
  readonly offset: number = 4.0;  // incoming data is offset by (value * 4.0)
  static rxID: HSR_CAN_IDS = HSR_CAN_IDS.TORQUE_POWER_DATA;
  constructor(data?: DataView) {
    super(4, data);
  }

  demo(): void {
    this.data.setInt16(TORQUE_POWER_DATA_OFFSETS.OUTPUT_MECHANICAL_POWER, 700 / this.offset);
  }

  get canID(): HSR_CAN_IDS {
    return TorquePowerData.rxID;
  }

  /**
   * Output torque (FT LB) (original value from HSR is Nm but we convert it to good ol' american FT LB)
   */

  get outputTorque(): number {
    return Math.round((this.data.getInt16(TORQUE_POWER_DATA_OFFSETS.OUTPUT_TORQUE, this.littleEndian) / this.offset) * NM_FTLB_CONV);
  }

  /**
   * Output Mechanical Power (kW)
   */
  get outputMechanicalPower(): number {
    return Math.round(this.data.getInt16(TORQUE_POWER_DATA_OFFSETS.OUTPUT_MECHANICAL_POWER, this.littleEndian) / this.offset);
  }
}
