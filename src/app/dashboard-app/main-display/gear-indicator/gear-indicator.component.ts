import { Component, AfterViewInit } from '@angular/core';

// HSR data
import { HSRComm } from '../../../hsr-drive/comm.service';
import { HSR_CAN_IDS } from '../../../hsr-drive/hsr-data/base-hsr';
import { GeneralStates, GEARS } from '../../../hsr-drive/hsr-data/general-states';

// app imports
import { AnimHookService, FREQUENCY } from '../../../anim-hook.service';

const GEAR = [
  '-',
  'D',
  'R',
  'N'
]

@Component({
  selector: 'app-gear-indicator',
  templateUrl: './gear-indicator.component.html',
  styleUrls: ['./gear-indicator.component.css']
})

export class GearIndicatorComponent {
  private generalStates: GeneralStates;
  private readonly GEAR = [];
  indicatorOutput: string;

  constructor(hsrComm: HSRComm, readonly animService: AnimHookService) {
    // HSR data objects
    this.generalStates = hsrComm.hsrSet.GeneralStates;
    this.animService.register(this.update, FREQUENCY.MIN); // register for draw updates

    // assign our gear lookup
    this.GEAR[0] = '-'
    this.GEAR[GEARS.DRIVE] = 'D'
    this.GEAR[GEARS.REVERSE] = 'R'
    this.GEAR[GEARS.NEUTRAL] = 'N'
    this.indicatorOutput = this.GEAR[0]
  }

  public update = ():void => {
    this.indicatorOutput = this.GEAR[this.generalStates.currentAcceptedGear];
  }

}
