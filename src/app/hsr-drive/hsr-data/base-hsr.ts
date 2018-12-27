export enum HSR_CAN_IDS {
  CAN_TABLE = 0x510,
  DI_TEMPERATURE = 0x506,
  DI_TEMPERATURE2 = 0x514,
  DI_MAX_T = 0x516,
  SPEED_DATA = 0x115,
  TORQUE_POWER_DATA = 0x116,
  GENERAL_STATES = 0x117,
  CRUISE_STATE = 0x118,
  HVLV_DATA = 0x119,
  POWER_DATA = 0x120,
  POWER_DATA2 = 0x121,
  TORQUE_LIMITS = 0x122,
  SPEED_LIMIT = 0x123,
  IO_CONFIGS = 0x124,
  PEDAL_POS = 0x125,
  INPUT_ACK = 0x210,
  // INPUT REQUESTS
  GEAR_REQUEST = 0x030,
  CRUISE_COMMAND = 0x218,
  SET_POWER_DATA = 0x220,
  SET_POWER_DATA2 = 0x221,
  OUTPUT_OVERRIDE = 0x231,
  SET_SPEED_LIMIT = 0x223,
  SET_TORQUE_LIMITS = 0x222,
  SET_IO_CONFIGS = 0x224,
  CONFIG_COMMAND = 0x2FF
}


/**
* @property littleEndian - If false or undefined, a big-endian value should be assumed,
* otherwise a little-endian value will be used in get functions.
*/
export interface HsrObj {
  canID: HSR_CAN_IDS;
  length: number;
  data: DataView;
  valid: boolean;
  littleEndian: boolean;
  update(data: ArrayBuffer): void;
  demo(): void;
}

export interface HsrTx extends HsrObj {
  sendCanID: HSR_CAN_IDS;
}

export abstract class BaseHsr implements HsrObj {
  data: DataView;
  valid: boolean;
  readonly littleEndian: boolean;
  readonly convertToF: boolean;

  /**
   * @param length       - the payload length in bytes
   */
  constructor(readonly length: number, data?: DataView) {
    this.valid = true;
    this.data = new DataView(new ArrayBuffer(this.length));
    if (data) {
      this.update(data.buffer.slice(0));  // deep copy of buffer
    }
    this.littleEndian = false;
    this.convertToF = true;
  }

  /**
   * Replace data with new data.  asserts valid flag if bytelength matches
   * @param newData New Array buffer data - replaces old data
   * @returns valid - true if bytelength is correct
   */
  update(newData: ArrayBuffer): boolean {
    this.valid = (newData.byteLength === this.length);
    if (this.valid) {
      this.data = new DataView(newData);
    }
    // if(!this.valid){
    //   debugger
    // }
    return this.valid;
  }

  abstract demo(): void;

  protected c2f(celcius: number): number {
    if (this.convertToF) {
      return Math.round(1.8 * celcius) + 32;
    } else {
      return Math.round(celcius);
    }
  }

  protected precisionRound(number: number, precision: number): number {
    const factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  }

  abstract get canID(): HSR_CAN_IDS;
}
