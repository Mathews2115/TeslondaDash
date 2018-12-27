import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { HSRComm } from '../../hsr-drive/comm.service';
import { MatSliderChange } from '@angular/material/slider';
import { HsrObj, HsrTx } from '../../hsr-drive/hsr-data/base-hsr';
import { PowerData } from '../../hsr-drive/hsr-data/power-data';
import { regenAMax, regenMax, rpmMax, inputPowerMax, inputCurrentMax } from '../../hsr-drive/hsr-data/hsr-drive-unit';
import { TorqueLimits } from '../../hsr-drive/hsr-data/torque-limits';
import { GeneralStates } from '../../hsr-drive/hsr-data/general-states';
import { SpeedLimit } from '../../hsr-drive/hsr-data/speed-limit';
import { SetTorqueLimits, TYPE } from '../../hsr-drive/hsr-data/set-torque-limits';
import { colors } from '../../app.config';
import { GameSpeakService, GameSpeakObject } from '../game-speak-window/game-speak.service';

export enum EDITABLE {
  MAX_DISCHARGE_AMPS,
  MAX_DISCHARGE_POWER,
  MAX_REGEN_AMPS,
  MAX_REGEN_POWER,
  MAX_SPEED_LIMIT,
  TRACTION_CONTROL,
  CREEP_MODE,
  REGEN_OFF,
  REGEN_OUTPUT,
  POWER_OUTPUT
}

enum DATA_TYPE {
  BOOL = 'bool',
  NUM = 'num'
}

export interface DataGroup {
  oldValue(): number | boolean;
  newValue(): number | boolean;
  setValue(num: number | boolean): void;
  getFormatted(): string,
  formattedCurrent(): string,
  newHSR: HsrTx;
  name: string;
  max: number;
  inc(): void;
  dec(): void;
  set(value: number | boolean): void;
}


@Component({
  selector: 'edit',
  template: `
  <section class='components'>
    <section class='bar'>
      <div class='anim'></div>
    </section>

    <section class='main'>
      <div class='old_value'>
        <p>Current Value</p>
        <div class='hexagon'>
          <article>
            <figure>
              <h2>{{ data.formattedCurrent()}}</h2>
              <p>{{data.name}}</p>
            </figure>
          </article>
        </div>
      </div>

      <div class='connecting_line'>
        <svg height="100%" width="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline points="0,50 90,50 90,70 100,70" style="fill:none;stroke:#f17500;stroke-width:4"> </polyline>
          <polyline points="0,50 90,50 90,30 100,30" style="fill:none;stroke:#f17500;stroke-width:4"> </polyline>
        </svg>
    </div>

    <div class='adjustment' [ngSwitch]="editType ">
      <p>Adjustment Control</p>
      <div class='hexagon' *ngSwitchCase="'bool'">
        <article class='selectable save' (click)='toggleOnOff()'>
          <figure>
            <h2>Turning {{ data.getFormatted() }}</h2>
          </figure>
        </article>
      </div>
      <div class='slider-container' *ngSwitchCase="'num'">
        <mat-slider min="0" [max]="data.max" step="10" (change)="sliderChange($event)" [value]="data.newValue()"> </mat-slider>
        <div class='arrows_button_container'>
          <button (click)='down()'> << </button>
          <button (click)='up()'> >> </button>
        </div>
      </div>
    </div>

    <div class='connecting_line'>
      <svg height="100%" width="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline points="0,70 10,70 10,50 100,50" style="fill:none;stroke:#f17500;stroke-width:4"> </polyline>
        <polyline points="0,30 10,30 10,50 100,50 " style="fill:none;stroke:#f17500;stroke-width:4"> </polyline>
      </svg>
    </div>

    <div class='new'>
      <p>New Value</p>
      <div class='hexagon'>
        <article (click)='commit()' class='selectable save'>
          <figure>
            <p>COMMIT</p>
          </figure>
        </article>
        <article (click)='cancel()' class='selectable cancel'>
          <figure>
            <p>CANCEL</p>
          </figure>
        </article>
        <article>
          <figure>
            <h2>{{ data.getFormatted() }}</h2>
            <p>{{data.name}}</p>
          </figure>
        </article>
      </div>
      </div>
    </section>
    <section class='bar'>
      <div class='anim'></div>
    </section>
  </section>

  `,
  styles: [`
  :host {
    flex:1;
    flex-direction:column;
  }

  :host ,
  .components {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  section.bar {
    flex: 0.6;
    width:100%;
    background-color: ${colors.fgMain};
    position: relative;
  }
  section.main {
    flex: 4;
    display: inline-flex;
    justify-content: center;
    margin: 36px 0;
    position: relative;
  }

  .connected > section.main > section > p {
    font-size: 70px;
    background: ${colors.background};
    color: ${colors.fgMain};
    margin: 1rem;
  }

  .disco > section.main p {
    align-self: center;
    font-size: 70px;
    background: ${colors.background};
    justify-self: center;
    z-index: 12;
    padding: 58px;
    color: ${colors.fgMain};
    animation: blink_text 1s infinite
  }

  .anim {
    background-image: repeating-linear-gradient(
      -45deg,transparent,transparent 4rem,
      ${colors.background} 4rem,
      ${colors.background} 10rem);
      animation-duration: 50s;
  }

  section.bar:nth-of-type(1) > .anim{
    animation-direction: reverse;
  }

  .hexagon > article {
    height: 125px;
    width: 125px;
  }

  /* connecting lines between components */
  .connecting_line {
    flex:0.2;
  }

  .components {
    margin: 0 10px;
  }

  /* ------  OLD VALUE SECTION ------- */
  .old_value {
    display: inline-flex;
    flex: 0.5;
    flex-direction: column;
    align-items: center;
  }
  .old_value .hexagon > article {
    width: 150px;
    height: 150px;
  }
  .adjustment > p,
  .new > p,
  .old_value > p {
    text-align: center;
    color: white;
    font-size: 120%;
  }
  .old_value > .hexagon {
    grid-template-columns: repeat(1, 1fr);
    align-content: center;
  }

  /* ------  Adjustment VALUE SECTION ------- */
  .adjustment {
    display: inline-flex;
    flex: 1;
    flex-direction: column;

  }
  .adjustment > .hexagon {
    grid-template-columns: repeat(1, 1fr);
    align-content: center;
  }
  .adjustment > .hexagon > article {
    width: 150px;
    height: 150px;
    justify-self: center;
  }
  .adjustment > .button_container {
    margin:10px;
  }
  button{
    color: white;
    background-color: #005522;
    margin: 5px auto;
    width: 200px;
    height: 40px;
    text-align: center;
    display: block;
    border: #005522 5px solid;
  }

  .adjustment  .slider-container {
    width: 95%;
    margin: 0 auto;
    /* HACK - just do this the right way later (FLEX FLLEX) */
    padding-top: 14%
  }
  .adjustment .arrows_button_container {
   display:flex;
  }
  .adjustment .arrows_button_container button {
    margin: 0 2%;
    padding: 0;
    flex: 1;
    background-color: ${colors.bgMainSecondary};
    border-color: ${colors.bgMainSecondary};;
  }

  .new {
    display: inline-flex;
    flex: 0.7;
    flex-direction: column;
    align-items: center;
  }
  .new > .hexagon {
    grid-template-columns: repeat(4, 1fr);
  }
  .new > .hexagon > article:nth-of-type(1) {
    grid-column: 1 / span 2;
    grid-row: 2;
  }
  .new > .hexagon > article:nth-of-type(2) {
    grid-column: 3 / span 2;
    grid-row: 2;
  }
  .new > .hexagon > article:nth-of-type(3) {
    grid-column: 2 / span 2;
    grid-row: 1;
  }
  /* A small adjustment in the vertical */
  .new > .hexagon > article:nth-of-type(n + 3) {
    margin-bottom: calc(100% * -0.24);
  }

  `]
})
export class EditComponent implements OnInit, OnDestroy {
  data: DataGroup;
  editType: string;
  private powerData: PowerData;
  private torqueLimits: TorqueLimits;
  private generalStates: GeneralStates;
  private speedLimit: SpeedLimit;
  private gameObject: GameSpeakObject;
  constructor(
    private speakService: GameSpeakService,
    private router: Router,
    private route: ActivatedRoute,
    readonly hsrComm: HSRComm) {
    this.powerData = hsrComm.hsrSet.PowerData;
    this.torqueLimits = hsrComm.hsrSet.TorqueLimits;
    this.generalStates = hsrComm.hsrSet.GeneralStates;
    this.speedLimit = hsrComm.hsrSet.SpeedLimit;
   }

  ngOnDestroy() {
    this.gameObject.dispose();
  }
  // ALL THIS IS BAD AND NOT DRY AND I HATE IT BUT I HAVE NO TIME RIGHT NOW AAAAAAH
  ngOnInit() {
    let id = this.route.snapshot.paramMap.get('id');
    switch (id) {
      case EDITABLE.REGEN_OFF.toString():
        this.gameObject = this.speakService.register( ['Do you want to disable Regen?\nThis will stop the motor from "regenerative" braking.']);

        this.editType = DATA_TYPE.BOOL;
        this.data = {
          oldValue: () => this.generalStates.regenDisabled,
          newValue: () => (<SetTorqueLimits>this.data.newHSR).disableRegen,
          setValue: (value: boolean) => (<SetTorqueLimits>this.data.newHSR).disableRegen = value,
          newHSR: (() => {
            let hsrObj = new SetTorqueLimits(TYPE.REGEN_DISABLED);
            hsrObj.disableRegen = !!this.generalStates.regenDisabled;
            return hsrObj;
          })(),
          name: 'Disable Regen',
          max: 0,
          formattedCurrent: () =>  this.data.oldValue() ? 'YES' : 'NO',
          getFormatted: () => this.data.newValue() ? 'YES' : 'NO',
          inc: () => { },
          dec: () => { },
          set: (flag: boolean) => this.data.setValue(flag)
        };
        break;
      case EDITABLE.CREEP_MODE.toString():
        this.gameObject = this.speakService.register( ['Do you want to enable Torque Creep Mode?\nWhen enabled the motor will slowly creep forward when the accelerator is depressed.\n\nJust like an automatic transmission!']);

        this.editType = DATA_TYPE.BOOL;
        this.data = {
          oldValue: () => this.generalStates.torqueCreepEnabled,
          newValue: () => (<SetTorqueLimits>this.data.newHSR).enableCreep,
          setValue: (value: boolean) => (<SetTorqueLimits>this.data.newHSR).enableCreep = value,
          newHSR: (() => {
            let hsrObj = new SetTorqueLimits(TYPE.TORQUE_CREEP_ENABLED);
            hsrObj.enableCreep = !!this.generalStates.torqueCreepEnabled;
            return hsrObj;
          })(),
          name: 'Torque Creep Mode',
          max: 0,
          formattedCurrent: () =>  this.data.oldValue() ? 'ON' : 'OFF',
          getFormatted: () => this.data.newValue() ? 'ON' : 'OFF',
          inc: () => { },
          dec: () => { },
          set: (flag: boolean) => this.data.setValue(flag)
        };
        break;
      case EDITABLE.TRACTION_CONTROL.toString():
        this.gameObject = this.speakService.register( [
          'Do you want to enable Crude Traction Control?'
        ]);

        this.editType = DATA_TYPE.BOOL;
        this.data = {
          oldValue: () => this.torqueLimits.tractionControl,
          newValue: () => (<SetTorqueLimits>this.data.newHSR).tractionControl,
          setValue: (value: boolean) => (<SetTorqueLimits>this.data.newHSR).tractionControl = value,
          formattedCurrent: () =>  this.data.oldValue() ? 'ON' : 'OFF',
          getFormatted: () => this.data.newValue() ? 'ON' : 'OFF',
          newHSR: (() => {
            let hsrObj = new SetTorqueLimits(TYPE.CRUDE_TRACTION_CONTROL_ENABLED);
            hsrObj.tractionControl = !!this.torqueLimits.tractionControl;
            return hsrObj;
          })(),
          name: 'Traction Control',
          max: 0,
          inc: () => { },
          dec: () => { },
          set: (flag: boolean) => this.data.setValue(flag)
        };
        break;
      case EDITABLE.MAX_DISCHARGE_AMPS.toString():
        this.gameObject = this.speakService.register( [
          'Adjusting maximum discharge amperage.  \nThis is a "soft limit" on what the HSR Motor will pull for total amps.'
        ]);
        this.editType = DATA_TYPE.NUM;
        this.data = {
          oldValue: () => this.powerData.maxDischargeAmps,
          newValue: () => (<PowerData>this.data.newHSR).maxDischargeAmps,
          setValue: (value: number) => (<PowerData>this.data.newHSR).maxDischargeAmps = value,
          formattedCurrent: () =>  this.data.oldValue().toString() + ' Amps',
          getFormatted: () => this.data.newValue().toString() + ' Amps',
          newHSR: (() => {
            let hsrObj = new PowerData(this.powerData.data);
            hsrObj.maxDischargeAmps = this.powerData.maxDischargeAmps;
            return hsrObj;
          })(),
          name: 'Max Discharge Amps',
          max: inputCurrentMax,
          inc: () => { if (<number>this.data.newValue() < this.data.max) this.data.setValue(<number>this.data.newValue() + 1); },
          dec: () => { if (<number>this.data.newValue() > 0) this.data.setValue(<number>this.data.newValue() - 1); },
          set: (num: number) => this.data.setValue(num)
        };
        break;
      case EDITABLE.MAX_DISCHARGE_POWER.toString():
        this.gameObject = this.speakService.register( [
          'Adjusting maximum discharge power.  \nThis is a "soft limit" on what the HSR Motor will pull for total kilowatts.'
        ]);
        this.editType = DATA_TYPE.NUM;
        this.data = {
          oldValue: () => this.powerData.maxDischargePower,
          newValue: () => (<PowerData>this.data.newHSR).maxDischargePower,
          setValue: (value: number) => (<PowerData>this.data.newHSR).maxDischargePower = value,
          formattedCurrent: () =>  this.data.oldValue().toString() + ' kW',
          getFormatted: () => this.data.newValue().toString() + ' kW',
          newHSR: (() => {
            let hsrObj = new PowerData(this.powerData.data);
            hsrObj.maxDischargePower = this.powerData.maxDischargePower;
            return hsrObj;
          })(),
          name: 'Max Discharge Power',
          max: inputPowerMax,
          inc: () => { if (<number>this.data.newValue() < this.data.max) this.data.setValue(<number>this.data.newValue() + 1); },
          dec: () => { if (<number>this.data.newValue() > 0) this.data.setValue(<number>this.data.newValue() - 1); },
          set: (num: number) => this.data.setValue(num)
        };
        break;
      case EDITABLE.MAX_REGEN_AMPS.toString():
        this.gameObject = this.speakService.register( [
          'Adjusting maximum regen amperage.\n\nThis is a "soft limit" on what the HSR Motor will allow for total amps while regenerative braking.'
        ]);
        this.editType = DATA_TYPE.NUM;
        this.data = {
          oldValue: () => this.powerData.maxRegenAmps,
          newValue: () => (<PowerData>this.data.newHSR).maxRegenAmps,
          setValue: (value: number) => (<PowerData>this.data.newHSR).maxRegenAmps = value,
          formattedCurrent: () => this.data.oldValue().toString() + ' Amps',
          getFormatted: () => this.data.newValue().toString() + ' Amps',
          newHSR: (() => {
            let hsrObj = new PowerData(this.powerData.data);
            hsrObj.maxRegenAmps = this.powerData.maxRegenAmps;
            return hsrObj;
          })(),
          name: 'Max Regen Amps',
          max: regenAMax,
          inc: () => { if (<number>this.data.newValue() < this.data.max) this.data.setValue(<number>this.data.newValue() + 1); },
          dec: () => { if (<number>this.data.newValue() > 0) this.data.setValue(<number>this.data.newValue() - 1); },
          set: (num: number) => this.data.setValue(num)
        };
        break;
      case EDITABLE.MAX_REGEN_POWER.toString():
        this.gameObject = this.speakService.register( [
          'Adjusting maximum regen Power.\n\nThis is a "soft limit" on what the HSR Motor will allow for total kilowatts while regenerative braking.'
        ]);
        this.editType = DATA_TYPE.NUM;
        this.data = {
          oldValue: () => this.powerData.maxRegenPower,
          newValue: () => (<PowerData>this.data.newHSR).maxRegenPower,
          setValue: (value: number) => (<PowerData>this.data.newHSR).maxRegenPower = value,
          formattedCurrent: () => this.data.oldValue().toString() + ' kW',
          getFormatted: () => this.data.newValue().toString() + ' kW',
          newHSR: (() => {
            let hsrObj = new PowerData(this.powerData.data);
            hsrObj.maxRegenPower = this.powerData.maxRegenPower;
            return hsrObj;
          })(),
          name: 'Max Regen Power',
          max: regenMax,
          inc: () => { if (<number>this.data.newValue() < this.data.max) this.data.setValue(<number>this.data.newValue() + 1); },
          dec: () => { if (<number>this.data.newValue() > 0) this.data.setValue(<number>this.data.newValue() - 1); },
          set: (num: number) => this.data.setValue(num)
        };
        break;
      case EDITABLE.MAX_SPEED_LIMIT.toString():
        this.gameObject = this.speakService.register( [
          `Adjusting maximum speed limit.\n\nThis translates to maximum motor RPM before acceleration commands are ignored.\nMax RPM: ${this.speedLimit.rpmLimit}\nMax MPH: ${this.speedLimit.teslondaMPHLimit}`
        ]);
        this.editType = DATA_TYPE.NUM;
        this.data = {
          oldValue: () => this.speedLimit.teslondaMPHLimit,
          newValue: () => (<SpeedLimit>this.data.newHSR).teslondaMPHLimit,
          setValue: (value: number) => (<SpeedLimit>this.data.newHSR).teslondaMPHLimit = value,
          formattedCurrent: () => this.data.oldValue().toString() + ' MPH',
          getFormatted: () => this.data.newValue().toString() + ' MPH',
          newHSR: (() => {
            let hsrObj = new SpeedLimit(this.speedLimit.data);
            hsrObj.teslondaMPHLimit = this.speedLimit.teslondaMPHLimit;
            return hsrObj;
          })(),
          name: 'Speed Limit',
          max: rpmMax,
          inc: () => { if (<number>this.data.newValue() < this.data.max) this.data.setValue(<number>this.data.newValue() + 1); },
          dec: () => { if (<number>this.data.newValue() > 0) this.data.setValue(<number>this.data.newValue() - 1); },
          set: (num: number) => this.data.setValue(num)
        };
        break;
      case EDITABLE.REGEN_OUTPUT.toString():
        this.gameObject = this.speakService.register( [
          'Adjusting maximum regen output percentage.\n\nYou can limit the REGEN ability by moving the slider and tapping the COMMIT button.'
        ]);
        this.editType = DATA_TYPE.NUM;
        this.data = {
          oldValue: () => this.torqueLimits.outputRegen,
          newValue: () => (<SetTorqueLimits>this.data.newHSR).outputRegen,
          setValue: (value: number) => (<SetTorqueLimits>this.data.newHSR).outputRegen = value,
          formattedCurrent: () => this.data.oldValue().toString() + ' %',
          getFormatted: () => this.data.newValue().toString() + ' %',
          newHSR: (() => {
            let hsrObj = new SetTorqueLimits(TYPE.REGEN_PERCENT);
            hsrObj.outputRegen = this.torqueLimits.outputRegen;
            return hsrObj;
          })(),
          name: 'Regen Output',
          max: 100,
          inc: () => { if (<number>this.data.newValue() < this.data.max) this.data.setValue(<number>this.data.newValue() + 1); },
          dec: () => { if (<number>this.data.newValue() > 0) this.data.setValue(<number>this.data.newValue() - 1); },
          set: (num: number) => this.data.setValue(num)
        };
        break;
      case EDITABLE.POWER_OUTPUT.toString():
        this.gameObject = this.speakService.register( [
          'Adjusting maximum power output percentage.\n\nYou can limit the POWER ability by moving the slider and tapping the COMMIT button.'
        ]);
        this.editType = DATA_TYPE.NUM;
        this.data = {
          oldValue: () => this.torqueLimits.outputTorque,
          newValue: () => (<SetTorqueLimits>this.data.newHSR).outputTorque,
          setValue: (value: number) => (<SetTorqueLimits>this.data.newHSR).outputTorque = value,
          formattedCurrent: () => this.data.oldValue().toString() + ' %',
          getFormatted: () => this.data.newValue().toString() + ' %',
          newHSR: (() => {
            let hsrObj = new SetTorqueLimits(TYPE.TORQUE_PERCENT);
            hsrObj.outputTorque = this.torqueLimits.outputTorque;
            return hsrObj;
          })(),
          name: 'Power Output',
          max: 100,
          inc: () => { if (<number>this.data.newValue() < this.data.max) this.data.setValue(<number>this.data.newValue() + 1); },
          dec: () => { if (<number>this.data.newValue() > 0) this.data.setValue(<number>this.data.newValue() - 1); },
          set: (num: number) => this.data.setValue(num)
        };
        break;
      default:
        this.gameObject = this.speakService.register( [
          `'͉͖ͤ̆̋ͦn̤͍̝͉͇̏̅ͭ͛̒̚ ̞̹͕͔͉͋̅̍e̤͕̥͖̥͍̰ͤ͋r̼̜͓̳ͤr̲̺̩͈̥̯̘ͯͦ̈̉̚o̰̝̥r͈̞̱̝ͤͣͤ̆̃ ̤̊̂ͪͦ̍ͯḫ͈̩̖̪͒ͦa̝̫͉̖͇͇͒͑ͬͅs̱̭̻͈̫̭ͬ̿̓ ̦̍ͦ̿ͩo͕̬̣̬͋c̮̬̯ͥ̔̉ͣͣ̏̚c̥͔̖͎̟ụ̥̖̻̩͙̩̋r̺̻̤̝̳̳͉̓͛̈́r̫̟͙̙̲̜̅̋̐̑ͨ̔e̱̊̄ͩ͒ͨͫd̪͚̻̠̰͑`
        ]);
        console.error('invalid type');
        this.cancel()
        break;
    }
  }

  sliderChange(data: MatSliderChange) {
    this.data.set(data.value);
  }

  down(): void {
    this.data.dec();
  }

  up(): void {
    this.data.inc()
  }

  toggleOnOff(): void {
    this.data.set(!this.data.newValue());
  }

  cancel() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  commit() {
    if (this.data && this.data.oldValue() !== this.data.newValue()) {
      console.log(`sending ${this.data.newValue()}`)
      this.hsrComm.updateValue(this.data.newHSR);
    }
    this.router.navigate(['..'], { relativeTo: this.route });
  }
}
