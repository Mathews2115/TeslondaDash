import { Injectable } from '@angular/core';
import { HSRComm } from '../comm.service';
import { HvlvData } from '../hsr-data/hvlv-data';
import { PowerData2 } from '../hsr-data/power-data2';
export enum VoltsLevel {
  GREAT,
  NOMINAL,
  DANGER,
}
export const VOLT_ALERT = 'ALERT: A critical voltage event occurred:\n\nVoltage input to the motor dropped to critical levels!'
export const AUX_ALERT = 'WARNING: A 12v-Aux Battery event occurred: Under 12-volts was detected.';

@Injectable()
export class VoltService {
  private hvlvData: HvlvData;
  private powerData2: PowerData2;
  warning: number = 35;
  great: number = 85;
  constructor(hsrComm: HSRComm) {
    this.hvlvData = hsrComm.hsrSet.HvlvData;
    this.powerData2 = hsrComm.hsrSet.PowerData2;
  }

  get aux(): number {
    return this.hvlvData._12V_input_volts;
  }

  get auxFormatted(): string {
    return this.hvlvData._12V_input_volts_formatted;
  }

  get auxIdiotLight(): boolean {
    return this.aux < 11.3;
  }

  get packVolts(): number {
    return this.hvlvData.inputVolts;
  }

  get max(): number {
    return this.powerData2.maxHVBusVoltRounded;
  }

  get min(): number {
    return this.powerData2.minHVBusVoltRounded;
  }

  get voltPercent(): number {
    let min = this.min;
    let perc = (Math.abs(100 * (this.packVolts - min)) / (this.max - min));
    return Math.max(perc, 0);
  }

  get status(): VoltsLevel {
    let perc = this.voltPercent;
    if (perc >= this.great) {
      return VoltsLevel.GREAT;
    } else if(perc < this.warning) {
      return VoltsLevel.DANGER;
    } else {
      return VoltsLevel.NOMINAL;
    }
  }
}
