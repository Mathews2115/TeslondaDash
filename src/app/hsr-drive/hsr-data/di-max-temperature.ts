import { BaseHsr, HSR_CAN_IDS } from '../hsr-data/base-hsr';
/**
 *
 *  HSR_DI_maxT
 *
 *  516  50 6E CA 82 00 78
 *
 *        noFlow=false
 */

 // DOCUMENTATION ALERT:  Jason's documentation seems incorrect for this one
// It is actually 6 bytes, not 5.  pcbMax is actually uint16 not uint8
// 516#506ECA820078


 // Byte offsets
export enum MAX_OFFSETS {
  INLET_PASSIVE_TARGET = 0,
  NO_FLOW_NEEDED = 0,
  INVERTER = 1,
  STATOR = 2,
  DC_CAP = 3,
  PCB = 4
}

/**
 * DI_maxT - DBC Signal objects
 */
export class DiMaxTemperature extends BaseHsr {
  readonly tempOffset: number = -40;     // incoming data is offset by (value + 40) (after offset, data can be -40c to 200c);
  private flowCache: number;
  static rxID: HSR_CAN_IDS = HSR_CAN_IDS.DI_MAX_T;

  constructor() {
    super(6);
  }

  demo():void{}

  get canID(): HSR_CAN_IDS {
    return DiMaxTemperature.rxID;
  }

  /**
    *  Degrees of inletPassiveTarget in C - to F
    */
  get inletPassiveTarget(): number {
     this.flowCache = this.data.getUint8(MAX_OFFSETS.INLET_PASSIVE_TARGET) & 0x7F;
     return this.c2f(this.flowCache + this.tempOffset);
  }

  // SG_DI_noFlowNeeded
  get noFlowNeeded(): boolean {
    return !!(this.data.getUint8(MAX_OFFSETS.NO_FLOW_NEEDED) & 0x80);
  }

  // SG_DI_inverterTMax - Degrees in C to F
  get inverterMax(): number {
    return this.c2f(this.data.getUint8(MAX_OFFSETS.INVERTER) + this.tempOffset);
  }

  // SG_DI_statorTMax - Degrees in C
  get statorMax(): number {
    return this.c2f(this.data.getUint8(MAX_OFFSETS.STATOR) + this.tempOffset);
  }

  // SG_DI_dcCapTMax - Degrees in C
  get dcCapMax(): number {
    return this.c2f(this.data.getUint8(MAX_OFFSETS.DC_CAP) + this.tempOffset);
  }

  // SG_DI_pcbTMax - Degrees in C
  get pcbMax(): number {
    return this.c2f(this.data.getUint16(MAX_OFFSETS.PCB) + this.tempOffset);
  }
}
