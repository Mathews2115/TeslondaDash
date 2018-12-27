import { Component, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { Element } from '@angular/compiler';

// HSR data
import { HSRComm } from '../../../hsr-drive/comm.service';
import { HSR_CAN_IDS } from '../../../hsr-drive/hsr-data/base-hsr';
import { TorquePowerData } from '../../../hsr-drive/hsr-data/torque-power-data';
import { PowerData } from '../../../hsr-drive/hsr-data/power-data';

// Dashboard hookups
import { RingParmas, Widget, WidgetBase } from '../widget';
import { RingWidget } from './ring-widget';
import { BgRingWidgetOptions, BgRingType, BgRingWidget } from './bg-ring-widget';
import { appSize, colors, percColors } from '../../../app.config';

// animation hook
import { AnimHookService } from '../../../anim-hook.service';

const actualWidth = 200;                 // canvas element size
const actualHeight = 200;                // canvas element size
const ringOptions = { radius: 20, arcWidth: 10 };
const bgRingOptions = { powerColor:colors.bgMain, regenColor:colors.bgMainSecondary, radius: ringOptions.radius, arcWidth: ringOptions.arcWidth }
const cw = Math.floor(actualWidth / 4);  // canvas pixel size
const ch = Math.floor(actualHeight / 4); // canvas pixel size
const arcLength = 65;

enum SPEEDS {
  STOP = 0,
  SLOWEST = 2,
  SLOWER = 3,
  SLOW = 5,
  MEDIUM = 7,
  FAST = 10,
  FASTER = 13,
  FASTEST = 20
}

@Component({
  selector: 'app-power-meter',
  template: `<div class="bg-text"> Power (kW) </div>
             <canvas #bgPM width={{width}} height={{height}} class="pixelize" style="position: absolute; z-index: 0"></canvas>
             <canvas #fgPM width={{width}} height={{height}} class="pixelize" style="position: absolute; z-index: 1"></canvas>
             <div class="readout" [class.secondary]="regenMode" >{{ output }}</div>`,
  styles: [`
    :host {
      display: inline-block;
      position: absolute;
      top: 32px;
      left: 34px;
      width: ${actualWidth}px;
      height: ${actualHeight + 20}px;
    }
    canvas {
      width: ${actualWidth}px;
      height: ${actualHeight}px;
    }
    .readout {
      position: absolute;
      top: 95px;
      text-align: right;
      width: 146px;
      font-size: 44px;
    }
  `]
})

export class PowerMeterComponent implements AfterViewInit {
  // canvas rendering stuff
  width: number;
  height: number;
  @ViewChild('fgPM') _fgPowerMeter: ElementRef;
  @ViewChild('bgPM') _bgPowerMeter: ElementRef;
  private backgroundRing: BgRingWidget;
  private foregroundRing: RingWidget;

  // data from HSR unit
  private torqueData: TorquePowerData;
  private powerData: PowerData;
  private powerOutput: number
  private prevOutput: number;

  // view output
  regenMode: boolean;
  output: number;

  constructor(hsrComm: HSRComm,
              readonly animService: AnimHookService) {
    // canvas sizes - make it smaller if you want to "pixelize it"
    this.width = cw;
    this.height = ch;

    // HSR data objects
    this.torqueData = hsrComm.hsrSet.TorquePowerData
    this.powerData = hsrComm.hsrSet.PowerData

    // view data
    this.powerOutput = this.output = this.prevOutput = 0;
    this.regenMode = false;
  }

  ngAfterViewInit(): void {
    this.initWidgets();
    this.animService.register(this.update); // register for draw updates
  }

  public update = ():void => {
    this.powerOutput = this.torqueData.outputMechanicalPower;
    if (this.powerOutput !== this.prevOutput) {
      const max = this.powerOutput >= 0 ? this.powerData.maxDischargePower : this.powerData.maxRegenPower;
      let speed = this.rotationSpeed(Math.abs(this.powerOutput), max);
      let color: string;
      let bgColor: string;

      if (this.powerOutput < 0) {
        speed = -speed;  // reverse speed
        color = colors.fgMainSecondary;
        bgColor = colors.bgMainSecondary;
      } else {
        // power mode
        color = this.meterColor(this.powerOutput, speed);
        bgColor = colors.bgMain;
      }

      if (this.regenMode !== (speed < 0)) {
        // if state changes, update background ring color
        this.backgroundRing.draw((speed < 0) ? BgRingType.REGEN : BgRingType.POWER);
      }

      this.foregroundRing.draw({color:color, speed:speed});

      this.regenMode = (speed < 0); // cache regen state
      this.prevOutput = this.powerOutput; // cache power output state
    }
    else {
      this.foregroundRing.draw();
    }
    this.output = Math.abs(this.powerOutput);
  }

  private initWidgets(): void {
    this.backgroundRing = new BgRingWidget((<HTMLCanvasElement>this._bgPowerMeter.nativeElement).getContext('2d', { alpha: false }), bgRingOptions);
    this.foregroundRing = new RingWidget((<HTMLCanvasElement>this._fgPowerMeter.nativeElement).getContext('2d'), ringOptions, colors.fgMain, arcLength, 0, SPEEDS.STOP);
    this.backgroundRing.draw();
    this.update();
  }

  private rotationSpeed(current: number, max: number): number {
    let speed = SPEEDS.STOP;
    if (current > 0) {
      if (current < (max * .05)) {
        speed = SPEEDS.SLOWEST;
      } else if (current < (max * .1)) {
        speed = SPEEDS.SLOWER;
      } else if (current < (max * .2)) {
        speed = SPEEDS.SLOW;
      } else if (current < (max * .3)) {
        speed = SPEEDS.MEDIUM;
      } else if (current < (max * .5)) {
        speed = SPEEDS.FAST;
      } else if (current < (max * .7)) {
        speed = SPEEDS.FASTER;
      } else if (current >= (max * .7)) {
        speed = SPEEDS.FASTEST;
      }
    }
    return speed;
  }

  private meterColor(powerOutput: number, speed: SPEEDS): string {
    // TODO: powerOutput - if negative, use regen colors
    let color: string;
    switch (speed) {
      case SPEEDS.STOP:
      case SPEEDS.SLOWEST:
      case SPEEDS.SLOWER:
      case SPEEDS.SLOW:
        color = percColors.normal;
        break;

      case SPEEDS.MEDIUM:
        color = percColors.medium;
        break;

      case SPEEDS.FAST:
      case SPEEDS.FASTER:
        color = percColors.warning;
        break;

      case SPEEDS.FASTEST:
        color = percColors.alert;
        break;

      default:
        color = percColors.normal;
        break;
    }
    return color;
  }
}
