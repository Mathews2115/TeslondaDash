import { Component, ElementRef, AfterViewInit, ViewChild, Input } from '@angular/core';
import { Element } from '@angular/compiler';

// Dashboard hookups

import { BgRingWidgetOptions, BgRingType, BgRingWidget } from '../../dashboard-app/main-display/power-meter/bg-ring-widget';
import { appSize, colors, percColors } from '../../app.config';

// animation hook
import { AnimHookService } from '../../anim-hook.service';
import { RingWidget } from '../../dashboard-app/main-display/power-meter/ring-widget';

const actualWidth = 100;                 // canvas element size
const actualHeight = 100;                // canvas element size
const ringOptions = { radius: 6, arcWidth: 5 };
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
  selector: 'ring-meter',
  template: `<canvas #bgPM width={{width}} height={{height}} class="pixelize" style="position: absolute; z-index: 0"></canvas>
             <canvas #fgPM width={{width}} height={{height}} class="pixelize" style="position: absolute; z-index: 1"></canvas>
             `,
  styles: [`
    canvas {
      width: ${actualWidth}px;
      height: ${actualHeight}px;
      top: 0;
      left: 0;
    }
  `]
})

export class RingMeterComponent implements AfterViewInit {
  // canvas rendering stuff
  width: number;
  height: number;
  @Input() readout: number;
  @Input() maxForward: number;
  @Input() maxReverse?: number;
  @ViewChild('fgPM') _fg: ElementRef;
  @ViewChild('bgPM') _bg: ElementRef;
  regenMode: boolean;
  private backgroundRing: BgRingWidget;
  private foregroundRing: RingWidget
  private prevOutput: number;
  private powerOutput: number;

  constructor(readonly animService: AnimHookService) {
    // canvas sizes - make it smaller if you want to "pixelize it"
    this.width = cw;
    this.height = ch;

    // view data
    this.powerOutput = this.prevOutput = 0;
    this.regenMode = false;
  }

  ngAfterViewInit(): void {
    this.initWidgets();
    this.animService.register(this.update); // register for draw updates
  }

  public update = ():void => {
    this.powerOutput = this.readout;
    if (this.powerOutput !== this.prevOutput) {
      const max = this.powerOutput >= 0 ? this.maxForward : this.maxReverse;
      let speed = this.rotationSpeed(Math.abs(this.powerOutput), max);
      let color: string;
      let bgColor: string;
      if (this.powerOutput < 0) {
        speed = -speed;  // reverse speed

        if(this.maxReverse > 0){
          color = colors.fgMainSecondary;
          bgColor = colors.bgMainSecondary;
        }
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
  }

  private initWidgets(): void {
    this.backgroundRing = new BgRingWidget((<HTMLCanvasElement>this._bg.nativeElement).getContext('2d', { alpha: false }), bgRingOptions);
    this.foregroundRing = new RingWidget((<HTMLCanvasElement>this._fg.nativeElement).getContext('2d'), ringOptions, colors.fgMain, arcLength, 0, SPEEDS.STOP);
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
