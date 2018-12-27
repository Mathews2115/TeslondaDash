import { Component, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { Element } from '@angular/compiler';

// HSR data
import { HSRComm } from '../../../hsr-drive/comm.service';
import { HSR_CAN_IDS } from '../../../hsr-drive/hsr-data/base-hsr';
import { TorqueLimits } from '../../../hsr-drive/hsr-data/torque-limits';
import { GeneralStates } from '../../../hsr-drive/hsr-data/general-states';

// app imports
import { appSize, colors, percColors } from '../../../app.config';
import { AnimHookService, FREQUENCY } from '../../../anim-hook.service';
import { HorizontalMeter, MeterOptions, HMDrawOptions } from '../widgets/horizontal-meter';

const actualWidth = 200;                 // canvas element size
const actualHeight = 24;                // canvas element size

@Component({
  selector: 'app-limits',
  templateUrl: './limits.component.html',
  styleUrls: ['./limits.component.css']
})
export class LimitsComponent implements AfterViewInit {

  // canvas rendering stuff
  readonly width: number;
  readonly height: number;
  @ViewChild('torqueMeter') _tMeter: ElementRef;
  @ViewChild('regenMeter') _rMeter: ElementRef;
  private torqueMeter: HorizontalMeter;
  private regenMeter: HorizontalMeter;

  // data from HSR unit
  private torqueLimits: TorqueLimits;
  private generalStates: GeneralStates;

  // view data
  regenPercent: number;
  torquePercent: number;

  constructor(hsrComm: HSRComm, readonly animService: AnimHookService) {
    // HSR data objects
    this.torqueLimits = hsrComm.hsrSet.TorqueLimits
    this.generalStates = hsrComm.hsrSet.GeneralStates
    this.regenPercent = 0;
    this.torquePercent = 0;
    this.width = actualWidth;
    this.height = actualHeight;
  }

  ngAfterViewInit():void {
    this.animService.oneShot(this.initWidgets);
  }

  public update = (timestamp: number):void => {
    let newRegen: number;
    if (this.generalStates.rawInputStates.regenOff) {
      newRegen = 0;
    } else {
      newRegen = this.torqueLimits.outputRegen
    }

    this.torqueMeter.draw({ newPercent: this.torqueLimits.outputTorque });
    this.regenMeter.draw({ newPercent: newRegen });
  }

  private initWidgets = (timestamp: number):void => {
    const maxUnits = 10;
    const symbolWidth = 30;
    this.torqueMeter = new HorizontalMeter((<HTMLCanvasElement>this._tMeter.nativeElement).getContext('2d', { alpha: false }),
                      { symbol: 'T', symbolColor: colors.bgMain, symbolWidth: symbolWidth,
                        maxUnits: maxUnits, unitColor: colors.fgMain });
    this.regenMeter = new HorizontalMeter((<HTMLCanvasElement>this._rMeter.nativeElement).getContext('2d', { alpha: false }),
                      { symbol: 'R', symbolColor: colors.bgMainSecondary, symbolWidth: symbolWidth,
                        maxUnits: maxUnits, unitColor: colors.fgMainSecondary });

    // initial draw of widgets

    this.torqueMeter.draw({ newPercent: 100 });
    this.regenMeter.draw({ newPercent: 100 });

    this.animService.register(this.update, FREQUENCY.MIN); // register for draw updates
  }

}
