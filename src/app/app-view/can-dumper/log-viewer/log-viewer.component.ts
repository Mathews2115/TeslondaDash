import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ChangeDetectorRef
} from "@angular/core";

// import * as Chart from 'chart.js'
import { Chart, ChartPoint, ChartOptions } from "chart.js";
// import { Chart, ChartPoint, ChartOptions, ChartConfiguration } from "chart.js";

import { HSRComm } from "../../../hsr-drive/comm.service";
import { Subscription } from "rxjs/Subscription";
import { StreamDataPoint } from "../../../hsr-drive/stream-data";
import { LogService } from "../../../hsr-drive/log.service";
import { MenuEvent } from "../menu-event.enum";

import { AnimHookService, FREQUENCY } from "../../../anim-hook.service";
import { percColors } from "../../../app.config";
import { SpeedData } from "../../../hsr-drive/hsr-data/speed-data";
import { TorquePowerData } from "../../../hsr-drive/hsr-data/torque-power-data";
import { HvlvData } from "../../../hsr-drive/hsr-data/hvlv-data";
import { GameSpeakService, GameSpeakObject } from "../../game-speak-window/game-speak.service";
import { StatusBarData } from "../../main-view/status-bar.component";


const NOT_UPDATING = -1;
interface extremePoint {
  value: number;
  ts: number;  // seconds
}
interface zeroToSixtyRunData {
  startTime: number,
  endTime: number
  quickest: number
}

interface graphPoint {
  series: SERIES;
  data: number;
}

enum SERIES {
  MPH,
  KW,
  VOLT,
  AMP
}

//  monkey patch in the plugin 'downsample' so typescript doesn't fart in my face about it not existing
interface MonkeyPatchedConfig extends Chart.ChartConfiguration {
  options: MonkeyPatchedOptions;
}
interface MonkeyPatchedOptions extends ChartOptions {
  downsample: any;
  zoom: any;
  pan: any;
}
class CustomChart extends Chart {
  constructor(
    context: string | CanvasRenderingContext2D | HTMLCanvasElement | ArrayLike<CanvasRenderingContext2D | HTMLCanvasElement>,
    options: MonkeyPatchedConfig
  ){
    super(context, options);
  }
}

const volt_color = `${percColors.lownormal}`,
  kW_color = `${percColors.lownormal}`,
  amp_color = `${percColors.medium}`,
  mph_color = `${percColors.alert}`;

@Component({
  selector: "app-log-viewer",
  templateUrl: "./log-viewer.component.html",
  styleUrls: ["./log-viewer.component.css"]
})
export class LogViewerComponent implements OnDestroy, OnInit, AfterViewInit {
  @Output() menuSelect = new EventEmitter<MenuEvent>();
  @ViewChild("chart") _chartElm: ElementRef;
  loading: boolean;
  highestMPH: extremePoint;
  highestKW: extremePoint;
  highestAmp: extremePoint;
  lowestVolt: extremePoint;
  highestVolt: extremePoint;
  highestTorque: extremePoint;
  chart: Chart;
  series = SERIES;

  private lastMph = 0;
  private updateRequested = false;
  private updateTimeout: number;
  private _streamListener: Subscription;
  private gameObject: GameSpeakObject;
  private zeroToSixtyRun: zeroToSixtyRunData;
  private listMenuTimeout: number;
  private updateID: number;

  busy: boolean;

  constructor(
    readonly hsrComm: HSRComm,
    readonly hsrLogging: LogService,
    readonly animService: AnimHookService,
    private speakService: GameSpeakService,
    private changeDetection: ChangeDetectorRef
  ) {
    this.updateTimeout = NOT_UPDATING;
    this.gameObject = this.speakService.register( ['Viewing log data.\n\nYou can toggle graph data by hitting the legend buttons below.']);
    this.loading = false;
    this.highestMPH = { value: 0, ts: 0 };
    this.highestKW = { value: 0, ts: 0 };
    this.highestAmp = { value: 0, ts: 0 };
    this.lowestVolt = { value: 9999, ts: 0 };
    this.highestVolt = { value: 0, ts: 0 };
    this.highestTorque = { value: 0, ts: 0 };
    this.zeroToSixtyRun = { startTime: 99999, endTime: 0, quickest: 9999 }
    this.busy = false;
  }

  isHidden(type: SERIES): boolean {
    if(this.chart && this.chart.data && this.chart.data.datasets && this.chart.data.datasets[type]){
      return this.chart.data.datasets[type].hidden;
    }
    else {
      return true;
    }
  }

  onBack() {
    this.menuSelect.emit(MenuEvent.MENU);
  }

  toggle(type: SERIES) {
    this.chart.data.datasets[type].hidden = this.chart.data.datasets[type].hidden || false;
    this.chart.data.datasets[type].hidden = !this.chart.data.datasets[type].hidden;
    this.requestRender();
  }

  ngOnInit() {
    this.chart = new CustomChart((<HTMLCanvasElement>this._chartElm.nativeElement).getContext("2d"), {
      type: "line",
      data: {
        datasets: [
          {
            label: "MPH",
            data: [],
            borderColor: `${mph_color}`,
            fill: false,
            pointRadius: 0,
            yAxisID: "mph-axis"
          },
          {
            label: "kW",
            data: [],
            borderColor: `${kW_color}`,
            fill: false,
            pointRadius: 0,
            yAxisID: "volt_kW",
            borderDash: [5]
          },
          {
            label: "Volt",
            data: [],
            borderColor: `${volt_color}`,
            fill: false,
            pointRadius: 0,
            yAxisID: "volt_kW"
          },
          {
            label: "Amp",
            data: [],
            borderColor: `${amp_color}`,
            fill: false,
            pointRadius: 0,
            yAxisID: "amps"
          }
        ]
      },
      options: {
        downsample: {
          enabled: true,
          threshold: 600, // max number of points to display per dataset
          restoreOriginalData: true
        },
        pan: {
          enabled: false,
          mode: 'x'
        },
        zoom: {
          enabled: false,
          drag: true,
          mode: 'x',
          sensitivity: 3,
          limits: {
            max: 10,
            min: 1
          }
        },
        events: ["click", "touchstart", "touchmove", "touchend"],
        spanGaps: true,
        showLines: true,
        animation: {
          duration: 0,                    // (off for perf) general animation time
        },
        elements: {
          line: {
            tension: 0,    // (off for perf) disables bezier curves
          },
          point: {
            radius: 0,       // disable points
          }
        },
        hover: {
          animationDuration: 0          // (off for perf) duration of animations when hovering an item
        },
        responsiveAnimationDuration: 0, // (off for perf) animation duration after a resize
        legend: {
          display: false
        },
        scales: {
          gridLines: {
            display: false,
            color: '#FFF'
          },
          ticks: {
            fontColor: '#FFF'
          },
          xAxes: [
            {
              type: 'linear',
              display: true,
              ticks: {
                source: "data",
                fontColor: '#FFF',
                callback: function(value, index, values) {
                  return value + 's';
                }
              },
            }
          ],
          yAxes: [
            {
              id: "mph-axis",
              position: "left",
              scaleLabel: {
                display: true,
                labelString: "MPH",
                fontColor: `${mph_color}`
              },
              ticks: {
                fontColor: `${mph_color}`
              }
            },
            {
              id: "volt_kW",
              position: "right",
              scaleLabel: {
                display: true,
                labelString: "Volts / kW",
                fontColor: `${volt_color}`
              },
              ticks: {
                fontColor: `${volt_color}`
              }
            },
            {
              id: "amps",
              position: "right",
              scaleLabel: {
                display: true,
                labelString: "amps",
                fontColor: `${amp_color}`
              },
              ticks: {
                fontColor: `${amp_color}`
              }
            }
          ]
        }
      }}
    );

    // load any initial data
    this.hsrLogging.streamData.forEach(dataStreamPoint => this.onStreamUpdate(dataStreamPoint) );

    // listen for updates
    this._streamListener = this.hsrLogging.streamBroadcast.subscribe(this.onStreamUpdate);
  }

  ngAfterViewInit() {
    // only update the view every frame due a large amount of data coming in
    this.changeDetection.detach();
    this.updateID = this.animService.register(() => {
      this.changeDetection.detectChanges();
    }, FREQUENCY.HALF)
  }

  ngOnDestroy() {
    this.animService.unregister(this.updateID);
    this.gameObject.dispose();
    this._streamListener.unsubscribe();
    window.clearTimeout(this.updateTimeout);
    window.clearTimeout(this.listMenuTimeout);
    this.chart.destroy();
    this.hsrLogging.stop();
  }

  get mphStatus(): StatusBarData {
    return { title: 'Peak MPH' , value: `${this.highestMPH.value} @ ${this.highestMPH.ts}s`, alert: false, class: 'alert'};
  }
  get kwStatus(): StatusBarData {
    return { title: 'Peak kW' , value: `${this.highestKW.value} kW @ ${this.highestKW.ts}s`, alert: false, class: 'lownormal'};
  }
  get ampStatus(): StatusBarData {
    return { title: 'Peak Amp' , value: `${this.highestAmp.value} A @ ${this.highestAmp.ts}s`, alert: false, class: 'medium'};
  }
  get lowVoltStatus(): StatusBarData {
    return { title: 'Lowest Volt' , value: `${this.lowestVolt.value} v @ ${this.lowestVolt.ts}s`, alert: false, class: 'lownormal'};
  }
  get highVoltStatus(): StatusBarData {
    return { title: 'Highest Volt' , value: `${this.highestVolt.value} v @ ${this.highestVolt.ts}s`, alert: false, class: 'lownormal'};
  }
  get highTorqueStatus(): StatusBarData {
    return { title: 'Peak Torque' , value: `${this.highestTorque.value} lb-ft @ ${this.highestTorque.ts}s`, alert: false, class: 'low'};
  }
  get quickestZeroSixty(): StatusBarData {
    let value = (this.zeroToSixtyRun.quickest != 9999) ? `~${this.zeroToSixtyRun.quickest.toFixed(2)}s` : 'N/A';
    return { title: 'Quickest 0-60mph', value: value, alert: false, class: 'white'};
  }

  deleteFile() {
    if (!this.busy && this.hsrComm.loggerService.loadedFile && !this.hsrComm.logging) {
      this.gameObject.addMsg("Deleting...");
      this.busy = true;
      this.hsrComm.loggerService.deleteLog();
      this.listMenuTimeout = window.setTimeout(() => this.menuSelect.emit(MenuEvent.LIST), 1000); // TODO: actually have a ACK on deletion;dumb and hacky
    }
  }

  private render(): void{
    this.updateRequested = false;
    this.updateTimeout= -1;  // reset update function
    this.chart.update();
  }

  private requestRender(): void {
    if (this.updateTimeout === NOT_UPDATING) {
      this.updateTimeout = window.setTimeout(() => this.render() , 1000)
    };
  }

  private logData(x: number, y: number, series: SERIES): void {
    this.updateRequested  = true;
    (<ChartPoint[]>this.chart.data.datasets[series].data).push({y: y, x: parseFloat((x * 0.001).toFixed(2))})
  }

  private msToSec(msElapsed: number): number {
    return parseFloat((msElapsed * 0.001).toFixed(2)); // seconds 1.xx precision
  }

  private onStreamUpdate = (data: StreamDataPoint): void => {
    if (data.id == SpeedData.rxID) {
      let time = this.msToSec(data.ts);
      let speedData = new SpeedData(data.data);

      // --------  determine 0-60 times -------------------
      if (this.lastMph <= 1.1 && speedData.teslondaSpeed > 1.1) {
        this.zeroToSixtyRun.startTime = time;
      } else if (this.zeroToSixtyRun.startTime && this.lastMph > 1.1 && speedData.teslondaSpeed >= 60) {
        this.zeroToSixtyRun.endTime = time;
      }
      if (this.zeroToSixtyRun.endTime && this.zeroToSixtyRun.startTime < this.zeroToSixtyRun.endTime) {
        this.zeroToSixtyRun.quickest = this.zeroToSixtyRun.endTime - this.zeroToSixtyRun.startTime ;
        this.zeroToSixtyRun.endTime = null;
        this.zeroToSixtyRun.startTime = null;
      }
      this.lastMph = speedData.teslondaSpeed

      // ---------   highest MPH ---------------------------
      if (speedData.teslondaSpeed > this.highestMPH.value) {
        this.highestMPH.value = speedData.teslondaSpeed;
        this.highestMPH.ts = time;
      }
      // graph MPH
      this.logData(data.ts, speedData.teslondaSpeed, SERIES.MPH);
    }

    if (data.id == TorquePowerData.rxID) {
      let powerData = new TorquePowerData(data.data);

      // ------------------  highest KW ---------------------------
      if (powerData.outputMechanicalPower > this.highestKW.value) {
        this.highestKW.value = powerData.outputMechanicalPower;
        this.highestKW.ts = this.msToSec(data.ts);
      }
      // ------------------  highest torque ------------------------
      if (powerData.outputTorque > this.highestTorque.value) {
        console.log(powerData.outputTorque)
        this.highestTorque.value = powerData.outputTorque;
        this.highestTorque.ts = this.msToSec(data.ts);
      }
      // graph kW
      this.logData(data.ts, powerData.outputMechanicalPower, SERIES.KW);
    }

    if (data.id == HvlvData.rxID) {
      let hvData = new HvlvData(data.data);
      // ------------------ detect lowest voltage point ------------
      if (hvData.inputVolts < this.lowestVolt.value) {
        this.lowestVolt.value = hvData.inputVolts;
        this.lowestVolt.ts = this.msToSec(data.ts);
      }
      if (hvData.inputVolts > this.highestVolt.value) {
        this.highestVolt.value = hvData.inputVolts;
        this.highestVolt.ts = this.msToSec(data.ts);
      }
      // ------------------ highest AMP ----------------------------
      if (hvData.currentEst > this.highestAmp.value) {
        this.highestAmp.value = hvData.currentEst;
        this.highestAmp.ts = this.msToSec(data.ts);
      }
      this.logData(data.ts, hvData.inputVolts, SERIES.VOLT);
      this.logData(data.ts, hvData.currentEst, SERIES.AMP);
    }

    // request the chart to update if any of the above datasets were updated during this stream update
    if(this.updateRequested) this.requestRender();
  };
}
