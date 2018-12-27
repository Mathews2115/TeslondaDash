import { Component, OnInit } from '@angular/core';

// HSR data
import { HSRComm } from '../../../hsr-drive/comm.service';
import { HSR_CAN_IDS } from '../../../hsr-drive/hsr-data/base-hsr';
import { HvlvData } from '../../../hsr-drive/hsr-data/hvlv-data';

// app imports
import { AnimHookService, FREQUENCY } from '../../../anim-hook.service';

@Component({
  selector: 'app-voltages',
  templateUrl: './voltages.component.html',
  styleUrls: ['./voltages.component.css']
})
export class VoltagesComponent {
  batt12Readout: string;
  batt12Alert: boolean;
  packAlert: boolean;
  packVolt: number;
  packAmp: number;

  // hsr data
  private hvlvData: HvlvData;

  constructor(hsrComm: HSRComm, readonly animService: AnimHookService) {
    this.hvlvData = hsrComm.hsrSet.HvlvData
    this.batt12Readout = '0.0';
    this.batt12Alert = false;
    this.packAlert = false;
    this.packVolt = 0;
    this.packAmp = 0;
    this.animService.register(this.update, FREQUENCY.HALF); // register for draw updates at a medium interval
  }

  public update = (): void => {
    this.batt12Readout =  this.hvlvData._12V_input_volts_formatted
    this.batt12Alert = (this.hvlvData._12V_input_volts < 11.4);
    this.packAlert = (this.hvlvData.inputVolts < 330)
    this.packVolt =  this.hvlvData.inputVolts;
    this.packAmp =  this.hvlvData.currentEst;
  }

  private precisionRound(number: number, precision: number): number {
    const factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  }
}
