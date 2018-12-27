import { Component, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { Element } from '@angular/compiler';

// HSR data
import { HSRComm } from '../../../hsr-drive/comm.service';
import { HSR_CAN_IDS } from '../../../hsr-drive/hsr-data/base-hsr';
import { SpeedData } from '../../../hsr-drive/hsr-data/speed-data';
// import { SpeedLimit } from '../../../hsr-drive/hsr-data/speed-limit';

// Dashboard hookups
import { Widget, WidgetBase } from '../widget';
import { appSize, colors } from '../../../app.config';
import { QtrSweepMeter, SpeedoOptions } from '../widgets/half-sweep';

const actualWidth = 300;
const actualHeight = 320;
let calcSpeed = 0;

// animation hook
import { AnimHookService } from '../../../anim-hook.service';
@Component({
  selector: 'app-speedo',
  templateUrl: './speedo.component.html',
  styles: [`
    :host {
      position: absolute;
      top: 28px;
      left: 248px;
      display: block;
      width: ${actualWidth}px;
      height: ${actualHeight}px;
    }
    canvas {
      width: ${actualWidth}px;
      height: ${actualHeight}px;
    }
    #speed-label {
      position: fixed;
      text-align: right;
      top: 240px;
      left: 414px;
      font-size: 20px;
    }
    .speedo {
      position: absolute;
      top: 206px;
      text-align: right;
      font-size: 88px;
      width: 292px;
    }
  `]
})

export class SpeedoComponent implements AfterViewInit {
  // canvas rendering stuff
  width: number;
  height: number;
  @ViewChild('speedoMeter') _speedMeter: ElementRef;
  meter: QtrSweepMeter;
  output: number;

  // data from HSR unit
  private speedData: SpeedData;

  constructor(hsrComm: HSRComm, readonly animService: AnimHookService) {
    this.speedData = hsrComm.hsrSet.SpeedData
    this.width = Math.floor(actualWidth/3);
    this.height = Math.floor(actualWidth/3); // we make it square so it upsamples/skews it heigth wise
    this.output = 0;
  }

  ngAfterViewInit() {
    this.initWidgets();
    this.meter.draw();
    this.animService.register(this.update); // register for draw updates
  }

  public update = ():void => {
    calcSpeed = this.speedData.teslondaSpeed;
    if (this.output !== calcSpeed){
      this.output = calcSpeed;
      this.meter.draw(this.output);
    }
  }

  private initWidgets():void {
    const ctx = (<HTMLCanvasElement>this._speedMeter.nativeElement).getContext('2d', { alpha: false });
    const speedOptions = {
      x: ctx.canvas.width,
      y: ctx.canvas.height,
      w: 30,                  // length of the notches
      r: ctx.canvas.width-15, // radius starting from lower right corner
      bgColor: colors.background,
      color: colors.fgMain
    }
    this.meter = new QtrSweepMeter(ctx, speedOptions);
  }
}
