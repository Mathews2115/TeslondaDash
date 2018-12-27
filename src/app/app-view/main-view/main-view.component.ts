import { Component, HostBinding, AfterContentInit, DoCheck, OnDestroy } from '@angular/core';
import { GameSpeakService, GameSpeakObject } from '../game-speak-window/game-speak.service';
import { HSRComm, HSR_OFFLINE, COMM_OFFLINE } from '../../hsr-drive/comm.service';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import { StatusBarData } from './status-bar.component';
import { VoltService, VoltsLevel, VOLT_ALERT, AUX_ALERT } from '../../hsr-drive/helpers/volt.service';
import { TempService, DC_CAP_ALERT, PCB_ALERT, INVERTOR_ALERT, STATOR_ALERT } from '../../hsr-drive/helpers/temp.service';
import { GeneralStates } from '../../hsr-drive/hsr-data/general-states';
import { TorqueLimits } from '../../hsr-drive/hsr-data/torque-limits';
import { PowerData } from '../../hsr-drive/hsr-data/power-data';
import { inputPowerMax, inputCurrentMax } from '../../hsr-drive/hsr-data/hsr-drive-unit';
import { Subscription } from '../../../../node_modules/rxjs';
import { CommEvents } from '../../hsr-drive/comm-events.enum';
import { DUMPING_CAN } from '../can-dumper/can-dumper.component';

enum MONITOR {
  NONE,
  TITLE,
  SPLINES,
  DASH,
  CAN,
  HSR,
  HSR_VOLT,
  HSR_TEMP
}

const HOME = 'Welcome to the POWER PILOT - a premium Teslonda Dash peripheral!';

const activeState = state('alert',   style({
  transform: 'translateX(20px)',
}));
const inactiveState = state('normal',   style({
  transform: 'translateX(0)',
}));
const initState = state('initializing',   style({
  transform: 'translateX(-150%)',
}));
const initStateFromRight = state('disconnected',   style({
  transform: 'translateX(150%)',
}));
const normalTrans = transition('normal <=> active', animate('0.5s ease-in-out'));

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styles: [`
    .title {
      text-align: center;
      margin: 50px;
    }
    .title span {
      font-family: 'Kemco Pixel Bold';
      font-size: 38px;
      position: relative;
      width: 154px;
      display: inline-block;
      color: #009dff;
      font-style: italic;
    }
    #teslonda_car {
      width: 156px;
    }
    .car {
      flex: 0.7;
      display: flex;
      align-items: center;
      position: relative;
      justify-content: center;
    }
    #logo {
      width: 600px;
    }
    .icons {
      position: absolute;
      top:0;
      width: 156px;
      height: 100%;
    }
    .icons > div {
      width:100%;
    }

    .icons > .reverse_lights, .icons > .brake_lights {
      position: absolute;
      top: 265px;
    }
    .icons > .reverse_lights > span {
      height: 10px;
      background: white;
      width:20px;
      position: absolute;
    }
    .icons > .reverse_lights > span:first-child {
      left: 25%;
    }
    .icons > .reverse_lights > span:last-child {
      right: 25%;
    }

    .icons > .brake_lights > span {
      height: 10px;
      background: red;
      width:20px;
      position: absolute;
    }
    .icons > .brake_lights > span:first-child {
      left: 10%;
    }
    .icons > .brake_lights > span:last-child {
      right: 10%;
    }

    .icons > .volt_alert,
    .icons > .temp_alert{
      animation: full_blink 1s infinite ease-in-out;
      width: 45px;
      height: 45px;
      background: red;
      color: white;
      align-items: center;
      display: flex;
      justify-content: center;
      font-size: 30px;
      position: absolute;
      top: 205px;
      border: white solid 5px;
    }
    .icons > .volt_alert {
      left: 20px;
    }
    .icons > .temp_alert{
      right: 20px;
    }

    .icons > .hsr_warning {
      animation: full_blink 1s infinite;
      height: 45px;
      background: red;
      position: absolute;
      top: 205px;
      align-items: center;
      display: flex;
      justify-content: center;
      color: white;
      font-size: 25px;
    }

    .icons > .dash_warning {
      animation: full_blink 1s infinite;
      height: 45px;
      background: red;
      position: absolute;
      top: 80px;
      align-items: center;
      display: flex;
      justify-content: center;
      color: white;
      font-size: 25px;
      width: 45px;
      left: 30px;
    }

    .car_readout {
      display: flex;
      margin: 0 15px;
    }

    .status {
      z-index: 1;
      position: relative;
      flex:1;
      max-width: 550px;
      padding: 0 15px;
    }
    .connections {
      width: 290px;
    }
  `],
  animations: [
    trigger('barState', [
      activeState, inactiveState, initState, normalTrans,
      transition('initializing => *', animate('0.5s ease-in-out')),
    ]),
    trigger('barState1', [activeState,  inactiveState, initState, normalTrans,
      transition('initializing => *', animate('0.5s 200ms ease-in-out')),
    ]),
    trigger('barState2', [activeState,  inactiveState, initState, normalTrans,
      transition('initializing => *', animate('0.5s 400ms ease-in-out')),
    ]),
    trigger('barState3', [activeState,  inactiveState, initState, normalTrans,
      transition('initializing => *', animate('0.5s 600ms ease-in-out')),
    ]),
    trigger('barState4', [activeState,  inactiveState, initState, normalTrans,
      transition('initializing => *', animate('0.5s 800ms ease-in-out')),
    ]),
    trigger('rightState', [
      activeState, inactiveState, initStateFromRight, normalTrans,
      transition('disconnected => *', animate('0.5s ease-in-out')),
    ]),
    trigger('rightState1', [activeState,  inactiveState, initStateFromRight, normalTrans,
      transition('disconnected => *', animate('0.5s 200ms ease-in-out')),
    ]),
    trigger('rightState2', [activeState,  inactiveState, initStateFromRight, normalTrans,
      transition('disconnected => *', animate('0.5s 400ms ease-in-out')),
    ]),
    trigger('rightState3', [activeState,  inactiveState, initStateFromRight, normalTrans,
      transition('disconnected => *', animate('0.5s 600ms ease-in-out')),
    ]),
    trigger('rightState4', [activeState,  inactiveState, initStateFromRight, normalTrans,
      transition('disconnected => *', animate('0.5s 800ms ease-in-out')),
    ])
  ]
})
export class MainViewComponent implements AfterContentInit, DoCheck, OnDestroy {
  private connectionListener: Subscription;
  gameObject: GameSpeakObject;
  MONITOR_TYPE = MONITOR;
  generalStates: GeneralStates;
  torqueLimit: TorqueLimits;
  powerData1: PowerData;
  voltDanger: boolean = false;
  tempIdiotLight: boolean = false;
  tractionControlLight: boolean = false;
  brakeIdiotLight: boolean = false;
  reverseIdiotLight: boolean = false;
  torqueIdiotLight: boolean = false;

  @HostBinding('class.initializing') initializing = true;

  constructor(private speakService: GameSpeakService,
    readonly hsrComm: HSRComm,
    readonly temp: TempService,
    readonly volts: VoltService) {
    this.gameObject = this.speakService.register([HOME]);
    this.generalStates = hsrComm.hsrSet.GeneralStates;
    this.torqueLimit = hsrComm.hsrSet.TorqueLimits;
    this.powerData1 = hsrComm.hsrSet.PowerData;
    this.connectionListener = hsrComm.listener.subscribe(status =>{
      this.initCommState(status);
    })
  }

  initCommState(status: CommEvents) {
    if (!this.hsrComm.connected) {
      this.gameObject.update([HOME, COMM_OFFLINE])
    } else if(!this.hsrComm.hsrConnected) {
      this.gameObject.update([HOME, HSR_OFFLINE])
    } else if(this.hsrComm.dumping) {
      this.gameObject.update([HOME, DUMPING_CAN]);
    } else {
      this.gameObject.update([HOME]);
    }
  }

  state(monitor: MONITOR): string {
    if(this.initializing) {
      return 'initializing'
    } else {
      return 'normal'
    }
  }
  get optionsState(): string {
    if(this.initializing) {
      return 'disconnected'
    } else {
      return 'normal'
    }
  }

  get brakeLights(): boolean {
    return (this.generalStates.brakeLight || this.generalStates.brakePedalPressed);
  }

  get dashStatus(): StatusBarData {
    if (this.hsrComm.connected) {
      return { title: 'TESLONDA DASH', value: 'CONNECTED', alert: false};
    } else {
      return { title: 'TESLONDA DASH', value: 'DISCONNECTED', alert: true};
    }
  }

  get canStatus(): StatusBarData {
    if (!this.hsrComm.connected) {
      return { title: 'CAN-BUS', value: 'NO SIGNAL', alert: true};
    } else if (this.hsrComm.canError) {
      return { title: 'CAN-BUS', value: 'ERROR DETECTED!', alert: true};
    } else {
      return { title: 'CAN-BUS', value: 'READY', alert: false};
    }
  }

  get hsrStatus(): StatusBarData {
    if (!this.hsrComm.connected) {
      return { title: 'OFFLINE!', alert: true};
    } else if (!this.hsrComm.hsrConnected){
      return { title: 'HSR MOTOR' , value: 'NOT DETECTED', alert: true};
    } else {
      return { title: 'HSR MOTOR' , value: 'ENGAGED', alert: false};
    }
  }

  get hsrStatusTemp(): StatusBarData {
    if (!this.hsrComm.hsrConnected) {
      return { title: 'OFFLINE!', alert: true};
    } else if (this.tempIdiotLight){
      return { title: 'HSR TEMPERATURES' , value: 'DANGER', alert: true};
    } else {
      return { title: 'HSR TEMPERATURES' , value: 'NOMINAL', alert: false};
    }
  }

  get hsrStatusVolt(): StatusBarData {
    if (!this.hsrComm.hsrConnected) {
      return { title: 'OFFLINE!', alert: true};
    } else if (this.voltDanger){
      return { title: 'HSR VOLTAGES' , value: 'DANGER', alert: true};
    } else {
      return { title: 'HSR VOLTAGES' , value: 'NOMINAL', alert: false};
    }
  }

  get tractionControl(): StatusBarData {
    if (!this.hsrComm.hsrConnected) {
      return { title: 'OFFLINE!', alert: true};
    } else if (this.tractionControlLight){
      return { title: 'TRAC CONTROL' , value: 'ENABLED', alert: false, class: 'traction'};
    } else {
      return { title: 'TRAC CONTROL' , value: 'DISABLED', alert: true, class: 'traction'};
    }
  }

  get creepMode(): StatusBarData {
    if (!this.hsrComm.hsrConnected) {
      return { title: 'OFFLINE!', alert: true};
    } else if (this.torqueIdiotLight){
      return { title: 'CREEP MODE' , value: 'ENABLED', alert: false, class: 'creep'};
    } else {
      return { title: 'CREEP MODE' , value: 'DISABLED', alert: true, class: 'creep'};
    }
  }

  get regenMode(): StatusBarData {
    if (!this.hsrComm.hsrConnected) {
      return { title: 'OFFLINE!', alert: true};
    }
    else if (this.generalStates.regenDisabled || this.torqueLimit.outputRegen == 0){
      return { title: 'REGEN BRAKE' , value: 'DISABLED', alert: true, class: 'regen'};
    }
    else if (this.torqueLimit.outputRegen < 100){
      return { title: 'REGEN BRAKE' , value: 'MODIFIED', alert: false, class: 'regen'};
    }
    else {
      return { title: 'REGEN BRAKE' , value: 'ENABLED', alert: false, class: 'regen'};
    }
  }

  get choochMode(): StatusBarData {
    if (!this.hsrComm.hsrConnected) {
      return { title: 'OFFLINE!', alert: true};
    } else if (this.torqueLimit.outputTorque == 100
      && this.powerData1.maxDischargePower >= inputPowerMax
      && this.powerData1.maxDischargeAmps >= inputCurrentMax
    ){
      return { title: 'CHOOCH MODE' , value: 'FULL', alert: true, class: 'chooch'};
    } else {
      return { title: 'CHOOCH MODE ' , value: 'NORMAL', alert: false, class: 'chooch'};
    }
  }

  ngAfterContentInit() {
    setTimeout(() => this.initializing = false);
  }

  ngDoCheck() {
    if (this.hsrComm.hsrConnected) {
      // check values here instead of getting hammered by the update
      this.reverseIdiotLight = this.generalStates.reverseLight;
      this.voltDanger = this.volts.status == VoltsLevel.DANGER;
      let tempStatus = this.temp.idiotLight;
      this.tempIdiotLight = tempStatus.idiot;
      this.tractionControlLight = this.torqueLimit.tractionControl;
      this.brakeIdiotLight = this.brakeLights;
      this.torqueIdiotLight = this.generalStates.torqueCreepEnabled;

      if (this.gameObject) {
        if (this.voltDanger) {
          this.gameObject.setTimedEvent(VOLT_ALERT);
        }
        if (this.volts.auxIdiotLight) {
          this.gameObject.setTimedEvent(AUX_ALERT);
        }
        if (tempStatus.dcCap) {
          this.gameObject.setTimedEvent(DC_CAP_ALERT);
        }
        if (tempStatus.pcb) {
          this.gameObject.setTimedEvent(PCB_ALERT);
        }
        if (tempStatus.inverter) {
          this.gameObject.setTimedEvent(INVERTOR_ALERT);
        }
        if (tempStatus.stator) {
          this.gameObject.setTimedEvent(STATOR_ALERT);
        }
      }
    } else {
      this.gameObject.clearTimedEvents();
    }
  }

  ngOnDestroy(){
    this.connectionListener.unsubscribe();
    this.gameObject.dispose();
    this.gameObject = null;
  }
}
