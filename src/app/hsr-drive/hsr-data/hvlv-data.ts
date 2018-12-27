import { BaseHsr, HSR_CAN_IDS } from '../hsr-data/base-hsr';

/**
 *
 *
 *  HSR_HVLVdata
 *  Length 5 bytes
 *
 *  For this model :
 *    amps estim max: 1150A
 *
 */

// High Voltage Data Byte offsets
enum HVLV_OFFSETS {
  HV_INPUT_VOLTAGE,
  HV_CURRENT_ESTIMATE = 2,
  _12V_INPUT_VOLTAGE = 4
}

// High Voltage Data
export class HvlvData extends BaseHsr {
  readonly offset: number = 0.125;  // incoming data is offset by (value * 8.0);
  static rxID: HSR_CAN_IDS = HSR_CAN_IDS.HVLV_DATA

  constructor(data?: DataView) {
    super(5, data);
  }

  demo(): void {
    this.data.setUint16(HVLV_OFFSETS.HV_INPUT_VOLTAGE,  380 / this.offset);
    this.data.setUint16(HVLV_OFFSETS.HV_CURRENT_ESTIMATE,  95 / this.offset);
    this.data.setUint8(HVLV_OFFSETS._12V_INPUT_VOLTAGE,  12.1 / this.offset);
  }

  get canID(): HSR_CAN_IDS {
    return HvlvData.rxID;
  }

  /** High voltage input voltage (volts) */
  get inputVolts(): number {
    return Math.round(this.data.getUint16(HVLV_OFFSETS.HV_INPUT_VOLTAGE, this.littleEndian) * this.offset);
  }

  /** High voltage current estimate (amps) */
  get currentEst(): number {
    return  Math.round(this.data.getInt16(HVLV_OFFSETS.HV_CURRENT_ESTIMATE, this.littleEndian) * this.offset);
  }

  /** 12V input Voltage (volts)*/
  get _12V_input_volts(): number {
    return (this.data.getUint8(HVLV_OFFSETS._12V_INPUT_VOLTAGE) * this.offset);
  }

  // returns value in 0.0 form
  get _12V_input_volts_formatted(): string {
    return this.precisionRound(this._12V_input_volts, 1).toFixed(1);
  }
}
