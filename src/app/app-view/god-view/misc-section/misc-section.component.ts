import { Component, OnInit, OnDestroy, Input, DoCheck } from '@angular/core';
import { GeneralStates } from '../../../hsr-drive/hsr-data/general-states';
import { TorqueLimits } from '../../../hsr-drive/hsr-data/torque-limits';
import { HvlvData } from '../../../hsr-drive/hsr-data/hvlv-data';
import { HSRComm } from '../../../hsr-drive/comm.service';
import { colors } from '../../../app.config';
import { EDITABLE } from '../edit.component';
import { ActivatedRoute, Router } from '@angular/router';
import { GameSpeakObject } from '../../game-speak-window/game-speak.service';
import { AUX_ALERT, VoltService } from '../../../hsr-drive/helpers/volt.service';
import { SetTorqueLimits, TYPE } from '../../../hsr-drive/hsr-data/set-torque-limits';
import { StatusBarData } from '../../main-view/status-bar.component';

const regen_hex_discharge_off = colors.fgMainOff;
const regen_hex_discharge_on = colors.fgMain;

@Component({
  selector: 'misc-section',
  template: `
    <div id='util'>
      <div class='hexagon'>
        <article class='selectable cancel' [ngClass]="getSwitchClass(torqueLimit.tractionControl, tracBusy)" (click)='toggleTrac()'>
          <figure>
            <p *ngIf="!tracBusy">Traction Control</p>
            <h2>{{tracReadout}}</h2>
          </figure>
        </article>
        <article class='selectable cancel' [ngClass]="getSwitchClass(generalStates.torqueCreepEnabled, creepBusy)" (click)='toggleCreep()'>
          <figure>
            <p *ngIf="!creepBusy">Creep Mode</p>
            <h2>{{creepReadout}}</h2>
          </figure>
        </article>
        <article class='selectable cancel' [ngClass]="getSwitchClass(!generalStates.regenDisabled, regenBusy)" (click)='toggleRegen()'>
          <figure>
            <p *ngIf="!regenBusy">Regen Mode</p>
            <h2>{{regenReadout}}</h2>
          </figure>
        </article>

        <article class='selectable save' (click)='editComponent(${EDITABLE.REGEN_OUTPUT})'>
          <figure>
            <p>Regen %</p>
            <h2>{{torqueLimit.outputRegen}}%</h2>
          </figure>
        </article>

        <article class='selectable cancel' (click)='editComponent(${EDITABLE.POWER_OUTPUT})'>
          <figure>
            <p>Power %</p>
            <h2>{{torqueLimit.outputTorque}}%</h2>
          </figure>
        </article>

      </div>
    </div>
    <div id='lights'>
      <status-bar  [data]="{title: 'Misc Status'}"></status-bar>
      <status-bar  [data]="brakeLightStatus"></status-bar>
      <status-bar  [data]="BrakeLightRegenStatus"></status-bar>
      <status-bar  [data]="BrakePedalStatus"></status-bar>
      <status-bar  [data]="ReverseLightStatus"></status-bar>
    </div>
  `,
  styles: [`
    .hexagon > article {
      height: 120px;
      width: 112px;
    }
    #lights {
      margin-left: 20px;
      z-index: 1111;
      flex: 1;
    }

    #util {
      display: block;
      align-self: center;
    }
    #util > .hexagon {
      grid-template-columns: repeat(6, 1fr);
    }

    #util article:nth-of-type(1) {
      grid-column: 1 / span 2;
      grid-row: 1;
    }
    #util article:nth-of-type(2) {
      grid-column: 3 / span 2;
      grid-row: 1;
    }
    #util article:nth-of-type(3) {
      grid-column: 5 / span 2;
      grid-row: 1;
    }
    #util article:nth-of-type(4) {
      grid-column: 2 / span 2;
      grid-row: 2;
    }
    #util article:nth-of-type(5) {
      grid-column: 4 / span 2;
      grid-row: 2;
    }
    #util article:nth-of-type(1),
    #util article:nth-of-type(2),
    #util article:nth-of-type(3) {
      margin-bottom: calc(100% * -0.24);
    }

    .hexagon > article.off {
      background: ${regen_hex_discharge_off};
    }
    .hexagon > article.on {
      background: ${regen_hex_discharge_on};
    }
    .hexagon > article.busy {
      background: red;
    }
    .hexagon > article.busy figure h2{
      color: red;
      font-size: 135%;
      animation: blinking 1s infinite ease-in-out;
    }

    .hexagon > article.selectable figure h2,
    .hexagon > article.selectable figure p {
      margin-top: 0;
      font-variant-caps: all-petite-caps;
    }

  `]
})
export class MiscSectionComponent implements OnInit, OnDestroy, DoCheck {
  @Input() gameObject: GameSpeakObject;
  hvlv: HvlvData;
  torqueLimit: TorqueLimits;
  generalStates: GeneralStates;

  creepBusy: boolean = false;
  tracBusy: boolean = false;
  regenBusy: boolean = false;

  regenReadout: string = ""
  tracReadout: string = ""
  creepReadout: string = ""

  lastCreep: boolean;
  lastTrac: boolean;
  lastRegen: boolean;

  constructor(readonly volts: VoltService,
    readonly hsrComm: HSRComm,
    private route: ActivatedRoute,
    private router: Router) {
    this.hvlv = hsrComm.hsrSet.HvlvData;
    this.torqueLimit = hsrComm.hsrSet.TorqueLimits;
    this.generalStates = hsrComm.hsrSet.GeneralStates;
   }

   getSwitchClass(flag: boolean, busyFlag: boolean = false):string {
     if (busyFlag) {
      return "busy"
     } else {
        return flag ? 'on' : 'off'
     }
   }

  ngOnInit() {

  }
  ngOnDestroy(){
  }
  ngDoCheck(){
    if(this.volts.auxIdiotLight && this.gameObject){
      this.gameObject.setTimedEvent(AUX_ALERT);
    }

    if (this.creepBusy) {
      this.creepBusy = (this.lastCreep === this.generalStates.torqueCreepEnabled);
    } else {
      this.creepReadout = this.generalStates.torqueCreepEnabled ? 'ON' : 'OFF'
    }

    if (this.tracBusy) {
      this.tracBusy = (this.lastTrac === this.torqueLimit.tractionControl);
    } else {
      this.tracReadout = this.torqueLimit.tractionControl ? 'ON' : 'OFF'
    }

    if (this.regenBusy) {
      this.regenBusy = (this.lastRegen === this.generalStates.regenDisabled);
    } else {
      this.regenReadout = this.generalStates.regenDisabled ? 'DISABLED' : 'ENABLED'
    }
  }

  editComponent(component: EDITABLE) {
    this.router.navigate(['..', component], {relativeTo: this.route});
  }

  toggleCreep() {
    if (!this.creepBusy) {
      this.creepBusy = true;
      this.lastCreep =  this.generalStates.torqueCreepEnabled;

      let hsrObj = new SetTorqueLimits(TYPE.TORQUE_CREEP_ENABLED);
      hsrObj.enableCreep = !this.generalStates.torqueCreepEnabled;
      this.creepReadout = 'SENDING'
      this.hsrComm.updateValue(hsrObj);
    }
  }

  toggleTrac() {
    if (!this.tracBusy) {
      this.tracBusy = true;

      this.lastTrac = this.torqueLimit.tractionControl;

      let hsrObj = new SetTorqueLimits(TYPE.CRUDE_TRACTION_CONTROL_ENABLED);
      hsrObj.tractionControl = !this.torqueLimit.tractionControl;
      this.tracReadout = 'SENDING'
      this.hsrComm.updateValue(hsrObj);
    }
  }

  toggleRegen() {
    if (!this.regenBusy) {
      this.regenBusy = true;
      this.lastRegen = this.generalStates.regenDisabled;
      let hsrObj = new SetTorqueLimits(TYPE.REGEN_DISABLED);
      hsrObj.disableRegen = !this.generalStates.regenDisabled;
      this.regenReadout = 'SENDING'
      this.hsrComm.updateValue(hsrObj);
    }
  }

  get brakeLightStatus(): StatusBarData {
    let brakeLight = this.generalStates.brakeLight;
    return { title: 'Brake Light', value: brakeLight ? 'ON' : 'OFF', alert: brakeLight, class: 'normal' };
  }

  get BrakeLightRegenStatus(): StatusBarData {
    let status =  this.generalStates.regenBrakingOverBrakeLightTorqueThreshold;
    return { title: 'Brake (Regen)', value: status ? 'ON' : '--', alert: status, class: 'normal' };
  }

  get BrakePedalStatus(): StatusBarData {
    let status = this.generalStates.brakePedalPressed;
    return { title: 'Brake Pedal', value: status ? 'PRESSED' : '--', alert: status, class: 'normal' };
  }

  get ReverseLightStatus(): StatusBarData {
    let status = this.generalStates.reverseLight;
    return { title: 'Reverse Light', value: status ? 'ON' : 'OFF', alert: status, class: 'normal' };
  }
}
