import { BaseHsr, HSR_CAN_IDS } from '../hsr-data/base-hsr';

/**
 *
 *
 *  HSR_DI_TEMPERATURE
 *
 */

 // byte offsets
export enum DI_TEMP_OFFSETS {
  PCB,
  INVERTER,
  STATOR,
  DCCAP,
  HEATSINK,
  INLET,
  INVERTER_PCT,
  STATOR_PCT
}

/**
 * DI_TEMPERATURE - DBC Signal objects
 */
export class DiTemperature extends BaseHsr {
  readonly tempOffset: number = -40;    // incoming data is offset by (value + 40) (after offset, data can be -40c to 200c);
  readonly percentOffset: number = 0.4; // incoming data is offset by 0.4 (im assuming?);
  readonly alertThreshold: number;
  readonly dcCapAlertThreshold: number;
  static rxID: number = HSR_CAN_IDS.DI_TEMPERATURE;

  constructor() {
    super(8);
    this.alertThreshold = this.c2f(2); // in F
    this.dcCapAlertThreshold = this.c2f(0.2);
  }

  demo(): void {
    this.data.setUint8(DI_TEMP_OFFSETS.STATOR, 27 - this.tempOffset);
    this.data.setUint8(DI_TEMP_OFFSETS.INVERTER, 27 - this.tempOffset);
    this.data.setUint8(DI_TEMP_OFFSETS.INLET, 27 - this.tempOffset);
    this.data.setUint8(DI_TEMP_OFFSETS.INVERTER_PCT, 150 / this.percentOffset);
    this.data.setUint8(DI_TEMP_OFFSETS.STATOR_PCT, 180 / this.percentOffset);
  }

  get canID(): HSR_CAN_IDS {
    return DiTemperature.rxID;
  }

  /**
    *  Degrees of pcb - converted to F
    */
  get pcb(): number {
    return Math.round(this.c2f(this.data.getUint8(DI_TEMP_OFFSETS.PCB) + this.tempOffset));
  }

  /**
    * Degrees of inverter in C - converted to f
    */
  get inverter(): number {
    return Math.round(this.c2f(this.data.getUint8(DI_TEMP_OFFSETS.INVERTER) + this.tempOffset));
  }

  // Degrees of stator in C- converted to f
  get stator(): number {
    return Math.round(this.c2f(this.data.getUint8(DI_TEMP_OFFSETS.STATOR) + this.tempOffset));
  }

  // Degrees of dcCap in C- converted to f
  get dcCap(): number {
    return Math.round(this.c2f(this.data.getUint8(DI_TEMP_OFFSETS.DCCAP) + this.tempOffset));
  }

  // Degrees of heatSink in C- converted to f
  get heatsink(): number {
    return Math.round(this.c2f(this.data.getUint8(DI_TEMP_OFFSETS.HEATSINK) + this.tempOffset));
  }

  // Degrees of inlet in C- converted to f
  get inlet(): number {
    return Math.round(this.c2f(this.data.getUint8(DI_TEMP_OFFSETS.INLET) + this.tempOffset));
  }

  /**
   * inverterTpct percentage
   */
  get inverterTpct(): number {
    return Math.round(this.data.getUint8(DI_TEMP_OFFSETS.INVERTER_PCT) * this.percentOffset);
  }

  /**
   * statorTPct percentage
   */
  get statorTPct(): number {
    return Math.round(this.data.getUint8(DI_TEMP_OFFSETS.STATOR_PCT) * this.percentOffset);
  }
}
