import { Injectable } from '@angular/core';
import { HSRComm } from '../comm.service';
import { DiTemperature } from '../hsr-data/di-temperature';
import { DiTemperature2 } from '../hsr-data/di-temperature2';
import { DiMaxTemperature } from '../hsr-data/di-max-temperature';

export const DC_CAP_ALERT = 'WARNING: DC CAP high temp event occurred.'
export const PCB_ALERT = 'ALERT: A critical temperature event occurred.\n\nMotor PCB critical Temperature level hit.'
export const STATOR_ALERT = 'ALERT: A critical temperature event occurred.\n\nMotor Stator critical Temperature level hit.'
export const INVERTOR_ALERT = 'ALERT: A critical temperature event occurred.\n\nMotor Invertor critical Temperature level hit.'


export const TEMP_PERC_THRESHOLD = 85;
interface TempStatus {
  dcCap: boolean,
  pcb: boolean,
  inverter: boolean,
  stator: boolean,
  idiot: boolean
}

@Injectable()
export class TempService {
  diTemp1: DiTemperature;
  diTemp2: DiTemperature2
  diMaxTemp: DiMaxTemperature;
  pcb: number;
  dcCap: number;
  dcCapPercent: number;
  pcbPercent: number;
  inverterTpct:number;
  statorTpct: number;

  constructor(hsrComm: HSRComm) {
    this.diTemp1 = hsrComm.hsrSet.DiTemperature;
    this.diTemp2 = hsrComm.hsrSet.DiTemperature2;
    this.diMaxTemp = hsrComm.hsrSet.DiMaxTemperature;
  }

  get idiotLight(): TempStatus {
    this.inverterTpct = this.diTemp1.inverterTpct;
    this.statorTpct = this.diTemp1.statorTPct;
    this.pcb = this.diTemp1.pcb;
    this.dcCap = this.diTemp1.dcCap;
    this.dcCapPercent = this.perc(this.dcCap, this.diMaxTemp.dcCapMax);
    this.pcbPercent = this.perc(this.pcb, this.diMaxTemp.pcbMax);

    let status: TempStatus = {
      dcCap: false, pcb: false, inverter: false, stator: false, idiot: false
    }
    if(this.dcCapPercent >= TEMP_PERC_THRESHOLD){
      status.dcCap = true;
      status.idiot = true;
    }
    if(this.pcbPercent >= TEMP_PERC_THRESHOLD){
      status.pcb = true;
      status.idiot = true;
    }
    if(this.inverterTpct >= TEMP_PERC_THRESHOLD){
      status.inverter = true;
      status.idiot = true;
    }
    if(this.statorTpct >= TEMP_PERC_THRESHOLD){
      status.stator = true;
      status.idiot = true;
    }
    return status;
  }

  private perc(current: number, max: number): number {
    return (Math.abs(100 * current) / max);
  }

}
