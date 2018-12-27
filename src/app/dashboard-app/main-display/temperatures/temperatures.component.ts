import { Component, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { Element } from '@angular/compiler';

// HSR data
import { HSRComm } from '../../../hsr-drive/comm.service';
import { HSR_CAN_IDS } from '../../../hsr-drive/hsr-data/base-hsr';
import { DiTemperature } from '../../../hsr-drive/hsr-data/di-temperature';
import { DiMaxTemperature } from '../../../hsr-drive/hsr-data/di-max-temperature';

// app imports
import { appSize, colors, percColors } from '../../../app.config';
import { AnimHookService } from '../../../anim-hook.service';
import { HorizontalMeter, MeterOptions, HMDrawOptions } from '../widgets/horizontal-meter';

const actualWidth = 200;                 // canvas element size
const actualHeight = 24;                // canvas element size

enum INLET_STATE {
  CLOSED = "Inlet Closed",
  OPEN = "Inlet Open",
  INIT = "Initializing"
}

@Component({
  selector: 'app-temperatures',
  templateUrl: './temperatures.component.html',
  styleUrls: ['./temperatures.component.css']
})
export class TemperaturesComponent implements AfterViewInit {
  // canvas rendering stuff
  readonly width: number;
  readonly height: number;
  @ViewChild('statorTempMeter') _sMeter: ElementRef;
  @ViewChild('invertorTempMeter') _iMeter: ElementRef;
  private sTempMeter: HorizontalMeter;
  private iTempMeter: HorizontalMeter;

  // HSR data
  private tempData: DiTemperature;
  private maxTempData: DiMaxTemperature;
  private sPct: number;
  private iPct: number;

  flowing: string
  statorTemp: number;
  invertorTemp: number;
  inletTemp: number;

  constructor(hsrComm: HSRComm, readonly animService: AnimHookService) {
    // HSR data objects
    this.tempData = hsrComm.hsrSet.DiTemperature
    this.maxTempData = hsrComm.hsrSet.DiMaxTemperature

    this.flowing = INLET_STATE.INIT;
    this.statorTemp = 0;
    this.invertorTemp = 0;
    this.inletTemp = 0;

    this.width = actualWidth;
    this.height = actualHeight;
  }

  ngAfterViewInit(): void {
    this.initWidgets();
    this.animService.register(this.update); // register for draw updates
  }

  public update = (): void => {
    this.updateData();
    this.sTempMeter.draw({ newPercent: this.sPct });
    this.iTempMeter.draw({ newPercent: this.iPct });
  }

  private updateData(): void {
    this.sPct = this.tempData.statorTPct;
    this.iPct = this.tempData.inverterTpct;
    this.statorTemp = this.tempData.stator
    this.invertorTemp = this.tempData.inverter
    this.inletTemp = this.tempData.inlet;

    if (this.maxTempData.noFlowNeeded) {
      this.flowing = INLET_STATE.CLOSED;
    } else {
      this.flowing = INLET_STATE.OPEN;
    }
  }

  private initWidgets(): void {
    const maxUnits = 20;
    this.sTempMeter = new HorizontalMeter((<HTMLCanvasElement>this._sMeter.nativeElement).getContext('2d', { alpha: false }),
      { maxUnits: maxUnits });
    this.iTempMeter = new HorizontalMeter((<HTMLCanvasElement>this._iMeter.nativeElement).getContext('2d', { alpha: false }),
      { maxUnits: maxUnits });
  }
}
