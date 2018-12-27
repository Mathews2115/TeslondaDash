import { BaseHsr, HSR_CAN_IDS } from '../hsr-data/base-hsr';
/**
 *
 *
 *  HSR_DI_TEMPERATURE2
 *
 */

// Byte Offsets
export enum DI_TEMP2_OFFSETS {
  PH1,
  PH2,
  PH3,
  POWER_PCB,
  IGBT_JUNC
}
// DOCUMENTATION ALERT:  Jason's documentation seems incorrect for this one
// It is actually 7 bytes, not 5?
// and only the first three bytes seem to change
// 514#42424200FFB605  "00FFB605" never changes?


/**
 * DI_temperature2 - DBC Signal objects
 */
export class DiTemperature2 extends BaseHsr {
  readonly offset:  number = -40; // incoming data is offset by (value + 40) (after offset, data can be -40c to 200c)
  static rxID: HSR_CAN_IDS = HSR_CAN_IDS.DI_TEMPERATURE2;
  constructor() {
    super(7);
  }

  demo():void{ }

  get canID(): HSR_CAN_IDS {
    return DiTemperature2.rxID;
  }

  /**
    *  Degrees of ph1 in C - converted to F
    */
  get ph1(): number {
    return this.c2f(this.data.getUint8(DI_TEMP2_OFFSETS.PH1) + this.offset);
  }

  /**
    * Degrees of ph2 in C - converted to F
    */
  get ph2(): number {
    return this.c2f(this.data.getUint8(DI_TEMP2_OFFSETS.PH2) + this.offset);
  }

  /**
    * Degrees of ph3 in C - converted to F
    */
  get ph3(): number {
    return this.c2f(this.data.getUint8(DI_TEMP2_OFFSETS.PH3) + this.offset);
  }

  /**
   * Degrees of powerPcb in C - converted to F
   */
  get powerPcb(): number {
    return this.c2f(this.data.getUint8(DI_TEMP2_OFFSETS.POWER_PCB) + this.offset);
  }

  /**
   * Degrees of IGBTJunct in C - converted to F
   */
  get IGBTJunc(): number {
    return this.c2f(this.data.getUint8(DI_TEMP2_OFFSETS.IGBT_JUNC) + this.offset);
  }
}
