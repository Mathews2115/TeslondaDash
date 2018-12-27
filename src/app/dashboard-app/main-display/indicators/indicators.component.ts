import { Component, OnInit } from '@angular/core';

// HSR data
import { HSRComm } from '../../../hsr-drive/comm.service';
import { HSR_CAN_IDS } from '../../../hsr-drive/hsr-data/base-hsr';
import { TorqueLimits } from '../../../hsr-drive/hsr-data/torque-limits';
import { GeneralStates } from '../../../hsr-drive/hsr-data/general-states';
import { DiTemperature } from '../../../hsr-drive/hsr-data/di-temperature';
import { DiMaxTemperature } from '../../../hsr-drive/hsr-data/di-max-temperature';

// app imports
import { AnimHookService, FREQUENCY } from '../../../anim-hook.service';

@Component({
  selector: 'app-indicators',
  templateUrl: './indicators.component.html',
  styleUrls: ['./indicators.component.css']
})
export class IndicatorsComponent {
  private generalStates: GeneralStates;
  private torqueLimits: TorqueLimits;
  private temperatures: DiTemperature;
  private maxTemps: DiMaxTemperature;

  creepOn: boolean;
  tcOn: boolean;
  tempAlert: boolean;

  constructor(hsrComm: HSRComm, readonly animService: AnimHookService) {
    // HSR data objects
    this.generalStates = hsrComm.hsrSet.GeneralStates
    this.torqueLimits = hsrComm.hsrSet.TorqueLimits
    this.temperatures = hsrComm.hsrSet.DiTemperature
    this.maxTemps = hsrComm.hsrSet.DiMaxTemperature
    this.animService.register(this.update, FREQUENCY.MIN); // register for draw updates
    this.creepOn = false;
    this.tempAlert = false;
    this.tcOn = false;
  }

  public update = ():void => {
    this.creepOn = this.generalStates.torqueCreepEnabled;
    this.tcOn = this.torqueLimits.tractionControl
    this.tempAlert = this.tempCheck()
  }

  private tempCheck(): boolean {
    return (Math.abs(this.maxTemps.inverterMax - this.temperatures.inverter) < this.temperatures.alertThreshold)
    || (Math.abs(this.maxTemps.statorMax - this.temperatures.stator) < this.temperatures.alertThreshold)
    || (Math.abs(this.maxTemps.dcCapMax - this.temperatures.dcCap) < this.temperatures.dcCapAlertThreshold)
    || (Math.abs(this.maxTemps.pcbMax - this.temperatures.pcb) < this.temperatures.alertThreshold)
  }
}
