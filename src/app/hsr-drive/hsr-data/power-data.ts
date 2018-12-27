import { BaseHsr, HSR_CAN_IDS, HsrTx } from '../hsr-data/base-hsr';

import { inputPowerMax, regenMax } from '../hsr-data/hsr-drive-unit';
/**
 *
 *
 *  HSR_powerData
 *  Length 8 bytes
 *  1HZ
 *
 * Example Data  (120)  [08FC 25B2 028A 0DAC]
 *                        1100      400
 * cansend can0 220# 08FC 2AF8 028A 0FA0
 *
 * SET_POWER_DATA = 0x220,
 *
 */

// Power Data byte offsets
enum PWR_DATA_OFFSETS {
  REGEN_CURRENT,
  DISCHARGE_CURRENT = 2,
  REGEN_POWER = 4,
  DISCHARGE_POWER = 6
}

// Power Data
export class PowerData extends BaseHsr implements HsrTx {
  readonly offset: number = 0.1; // incoming data is offset by (value * 10.0);
  static rxID = HSR_CAN_IDS.POWER_DATA;
  static txID = HSR_CAN_IDS.SET_POWER_DATA;
  constructor(data?: DataView) {
    super(8, data);
  }
  demo(): void {}

  get canID(): HSR_CAN_IDS {
    return PowerData.rxID;
  }

  get sendCanID(): HSR_CAN_IDS {
    return PowerData.txID;
  }

  /** Max HV charge/regen current (amps) */
  get maxRegenAmps(): number {
    return this.data.getUint16(PWR_DATA_OFFSETS.REGEN_CURRENT, this.littleEndian) * this.offset;
  }
  /** Max HV discharge current (amps) */
  get maxDischargeAmps(): number {
    return this.data.getUint16(PWR_DATA_OFFSETS.DISCHARGE_CURRENT, this.littleEndian) * this.offset;
  }
  /** Max HV charge/regen power (kW) - if not set in HSR unit - a hardcorded value is returned */
   get maxRegenPower(): number {
    return Math.round(this.data.getUint16(PWR_DATA_OFFSETS.REGEN_POWER, this.littleEndian) * this.offset || regenMax);
  }
   /** Max HV discharge power (kW) */
   get maxDischargePower(): number {
    return Math.round(this.data.getUint16(PWR_DATA_OFFSETS.DISCHARGE_POWER, this.littleEndian) * this.offset || inputPowerMax);
  }

  set maxRegenAmps(maxRegenAmp: number) {
    this.data.setUint16(PWR_DATA_OFFSETS.REGEN_CURRENT, Math.round(maxRegenAmp / this.offset), this.littleEndian);
  }
  set maxDischargeAmps(maxDischargeAmp: number) {
    this.data.setUint16(PWR_DATA_OFFSETS.DISCHARGE_CURRENT, Math.round(maxDischargeAmp / this.offset),  this.littleEndian);
  }
  set maxRegenPower(maxRegenPower: number ){
    this.data.setUint16(PWR_DATA_OFFSETS.REGEN_POWER, Math.round(maxRegenPower / this.offset), this.littleEndian);
  }
  set maxDischargePower(maxDischargePower: number) {
    this.data.setUint16(PWR_DATA_OFFSETS.DISCHARGE_POWER, Math.round(maxDischargePower / this.offset), this.littleEndian);
  }
}
