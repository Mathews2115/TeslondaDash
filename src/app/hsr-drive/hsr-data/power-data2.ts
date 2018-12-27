import { BaseHsr, HSR_CAN_IDS } from '../hsr-data/base-hsr';

/**
 *
 *
 *  HSR_powerData2
 *  Length 4 bytes
 *  1 Hz
 *
 *  example data - 121  [09 F6 0F C0]
 *
 */

// Power Data2 byte offsets
enum PWR_DATA2_OFFSETS {
  MIN_HV_BUS_VOLT = 0,
  MAX_HV_BUS_VOLT = 2
}

// Power Data 2
export class PowerData2 extends BaseHsr {
  readonly offset: number = 0.1; // incoming data is offset by (value * 10.0);
  static rxID: HSR_CAN_IDS = HSR_CAN_IDS.POWER_DATA2;
  constructor() {
    super(4);
  }

  demo(): void {}

  get canID(): HSR_CAN_IDS {
    return PowerData2.rxID;
  }

  /** min HV bus voltage (volts) */
  get minHVBusVolt(): number {
    return this.data.getUint16(PWR_DATA2_OFFSETS.MIN_HV_BUS_VOLT, this.littleEndian) * this.offset;
  }
  get minHVBusVoltRounded(): number {
    return Math.round(this.minHVBusVolt);
  }

  /** Max HV bus voltage (volts)  */
  get maxHVBusVolt(): number {
    return this.data.getUint16(PWR_DATA2_OFFSETS.MAX_HV_BUS_VOLT, this.littleEndian) * this.offset;
  }
  get maxHVBusVoltRounded(): number {
    return Math.round(this.maxHVBusVolt);
  }
}
