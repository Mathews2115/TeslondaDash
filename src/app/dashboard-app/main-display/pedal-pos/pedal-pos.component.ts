import { Component, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { Element } from '@angular/compiler';

// HSR data
import { HSRComm } from '../../../hsr-drive/comm.service';
import { HSR_CAN_IDS } from '../../../hsr-drive/hsr-data/base-hsr';
import { PedalPos } from '../../../hsr-drive/hsr-data/pedal-pos';

// app imports
import { appSize, colors, percColors } from '../../../app.config';
import { AnimHookService, FREQUENCY } from '../../../anim-hook.service';
import { HorizontalMeter, MeterOptions, HMDrawOptions } from '../widgets/horizontal-meter';

const actualWidth = 200;                 // canvas element size
const actualHeight = 24;                // canvas element size

@Component({
  selector: 'app-pedal-pos',
  templateUrl: './pedal-pos.component.html',
  styleUrls: ['./pedal-pos.component.css']
})
export class PedalPosComponent implements AfterViewInit {
  // canvas rendering stuff
  readonly width: number;
  readonly height: number;
  @ViewChild('pedalMeter') _Meter: ElementRef;
  private pedalMeter: HorizontalMeter;

  // data from HSR unit
  private pedalPos: PedalPos;

  // view data
  posPercent: number;

  constructor(hsrComm: HSRComm, readonly animService: AnimHookService) {
    // HSR data objects
    this.pedalPos = hsrComm.hsrSet.PedalPos
    this.posPercent = 0;

    // canvas meter h,w
    this.width = actualWidth;
    this.height = actualHeight;
  }

  ngAfterViewInit():void {
    this.animService.oneShot(this.initWidgets);
  }

  public update = (timestamp: number):void => {
    this.pedalMeter.draw({ newPercent: this.pedalPos.pedalPosition });
  }

  private initWidgets = (timestamp: number):void => {
    const maxUnits = 10;
    const symbolWidth = 30;
    this.pedalMeter = new HorizontalMeter((<HTMLCanvasElement>this._Meter.nativeElement).getContext('2d', { alpha: false }),
                      { symbol: 'P', symbolColor: colors.bgMain, symbolWidth: symbolWidth,
                        maxUnits: maxUnits, unitColor: colors.fgMain });
    // initial draw of widget
    this.pedalMeter.draw({ newPercent: 0 });

    this.animService.register(this.update, FREQUENCY.MAX); // register for draw updates
  }
}
