import { Component, OnDestroy, HostBinding, DoCheck, Input } from '@angular/core';
import { PowerData } from '../../../hsr-drive/hsr-data/power-data';
import { HSRComm } from '../../../hsr-drive/comm.service';
import { HvlvData } from '../../../hsr-drive/hsr-data/hvlv-data';
import { TorquePowerData } from '../../../hsr-drive/hsr-data/torque-power-data';
import { colors, percColors, fonts } from '../../../app.config';
import { LINE_MODE } from '../reactive-line.component';
import { EDITABLE } from '../edit.component';
import { Router, ActivatedRoute } from '@angular/router';
import { GameSpeakObject } from '../../game-speak-window/game-speak.service';
import { VoltService, VoltsLevel, VOLT_ALERT } from '../../../hsr-drive/helpers/volt.service';

const nom_hex = colors.fgMain;
const regen_hex_active = colors.fgMainSecondary;
const regen_hex_normal = colors.bgMainSecondary;
const regen_hex_discharge_off = colors.fgMainOff;
const regen_hex_discharge_on = colors.fgMain;
const CLEAR_ALERT_TIME = 2 * 60 * 1000;

@Component({
  selector: "volt-section",
  template: `
    <div class='max_hvlv_container'>
      <div>
        {{ maxVolt }}
        <p>Max</p>
      </div>
      <div>
        {{ minVolt }}
        <p>Low</p>
      </div>
    </div>

    <div id='volt_container'>
      <div class='center_line'>
        <svg height="100%" width="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline points="0,20 50,20 70,48 100,48" style="fill:none;stroke:#f17500;stroke-width:4" [ngStyle]='{ "stroke":voltStatusStoke(0)}'></polyline>
          <polyline points="0,80 50,80 70,52 100,52" style="fill:none;stroke:#f17500;stroke-width:4"  [ngStyle]='{ "stroke":voltStatusStoke(1)}'></polyline>
        </svg>
      </div>
      <div class='volt_gauge_container'>
        <p class='title'> MOTOR VOLTS </p>
        <div class='container'>
          <div class='volt_gauge' vertGauge [max]='maxVolt' [min]='minVolt' [value]='volts.packVolts'></div>
        </div>
        <h2>{{ volts.packVolts }}</h2>
      </div>
      <div class='center_line'>
        <reactive-line [points]="'0,50 100,50'" [strokeWidth]=4 [mode]="${LINE_MODE.POWER_STATUS}" [value]="outputMechanicalPower"></reactive-line>
      </div>
    </div>

    <div id='amp_container'>
      <div class='max_amp'>
        <reactive-line [points]="'0,50 100,50'" [strokeWidth]=4 [mode]="${LINE_MODE.POWER_STATUS}" [value]="outputMechanicalPower"></reactive-line>
        <div class='hexagon'>
          <article class='selectable cancel discharge' [ngClass]="{ 'active':discharging }" (click)='editComponent(${EDITABLE.MAX_DISCHARGE_AMPS})'>
            <figure>
              <h2>{{ this.powerData1.maxDischargeAmps }}</h2>
              <p>Max</p>
            </figure>
          </article>
          <article class='selectable save regen' [ngClass]="{ 'active':regening }" (click)='editComponent(${EDITABLE.MAX_REGEN_AMPS})'>
            <figure>
              <h2>{{ this.powerData1.maxRegenAmps }}</h2>
              <p>Max</p>
            </figure>
          </article>
        </div>
      </div>
      <div class='amp_gauge_container'>
        <div class='x2'>
          <reactive-line [points]="'42,75 60,75 66,51'" [strokeWidth]=2 [mode]="${LINE_MODE.REGEN_STATUS}" [value]="outputMechanicalPower"></reactive-line>
          <reactive-line [points]="'42,25 60,25 66,50'" [strokeWidth]=2 [mode]="${LINE_MODE.DISCHARGE_STATUS}" [value]="outputMechanicalPower"></reactive-line>
        </div>
        <p class='title'> MOTOR AMPS </p>
        <div class='amp_gauge'  [ngClass]="{ 'discharge': discharging, 'regen': regening }">
          <div [ngClass]='ampStatus'></div>
        </div>
        <h2>{{ hvlv.currentEst }}</h2>
      </div>
    </div>
    <div class='ring_container'>
      <div class='center_line'>
      <reactive-line [points]="'0,50 100,50'" [strokeWidth]=4 [mode]="${LINE_MODE.POWER_STATUS}" [value]="outputMechanicalPower"></reactive-line>
      </div>
      <div class='ring_section'>
        <p class='title'> MOTOR kW </p>
        <div class='gauge_container'>
          <ring-meter [readout]='outputMechanicalPower' maxForward='{{ maxkWDischarge }}' maxReverse='{{ maxkWRegen }}'></ring-meter>
          <div ringCircle [value]='outputMechanicalPower' [max]='maxkWDischarge' [reverse]='true'></div>
        </div>
        <h2> {{ outputMechanicalPower }}</h2>
      </div>
      <div class='center_line x2'>
        <reactive-line [points]="'0,49 50,49 70,20 100,20'" [strokeWidth]=3 [mode]="${LINE_MODE.DISCHARGE_STATUS}" [value]="outputMechanicalPower"></reactive-line>
        <reactive-line [points]="'0,51 50,51 70,80 100,80'" [strokeWidth]=3 [mode]="${LINE_MODE.REGEN_STATUS}" [value]="outputMechanicalPower"></reactive-line>
      </div>
    </div>

    <div id='max_kw_container'>
      <div class='hexagon'>
          <article class='selectable cancel discharge' [ngClass]='{ "active":discharging }' (click)='editComponent(${EDITABLE.MAX_DISCHARGE_POWER})'>
            <figure>
              <h2>{{ maxkWDischarge}}</h2>
              <p>Max</p>
            </figure>
          </article>
          <article class='selectable save regen' [ngClass]='{ "active":regening }' (click)='editComponent(${EDITABLE.MAX_REGEN_POWER})'>
            <figure>
              <h2>{{ maxkWRegen }}</h2>
              <p>Max</p>
            </figure>
          </article>
        </div>
    </div>
 `,
  styles: [
    `/* making the honeycomb */


    .hexagon > article {
      background: ${nom_hex};
      width: 90px;
      height: 90px;
    }
    .hexagon > article.danger {
      background: ${percColors.alert};
    }
    .hexagon > article.regen {
      background: ${regen_hex_normal};
    }
    .hexagon > article.regen.active {
      background: ${regen_hex_active};
    }
    .hexagon > article.discharge {
      background: ${regen_hex_discharge_off};
    }
    .hexagon > article.discharge.active {
      background: ${regen_hex_discharge_on};
    }

    .readout {
      justify-content: center;
      display: flex;
    }
    .title {
      color: white;
    }
    /* connecting lines between components */
    .center_line {
      flex: 1; /* shorthand for  flex-grow = 1, flex-shrink = 0 and flex-basis = 0*/
      flex-direction: column;
      height: 100%;
      display: flex;
    }

    .max_hvlv_container {
      display: inline-flex;
      flex-direction: column;
    }

    .max_hvlv_container > div:first-child {
      flex: 1;
      color: ${colors.fgMain};
    }
    .max_hvlv_container > div {
      margin:10px;
      color: ${colors.bgMain};
    }

    #max_kw_container > .hexagon {
      grid-template-columns: repeat(2, 1fr);
    }
    #max_kw_container > .hexagon > article:nth-of-type(1) {
      grid-column: 1 / span 2;
      grid-row: 1;
    }
    #max_kw_container > .hexagon > article:nth-of-type(2) {
      grid-column: 1 / span 2;
      grid-row: 2;
      align-self: flex-end;
    }

    .ring_container .x2 {
      position: relative;
    }
    .x2 > reactive-line {
      position: absolute;
      top: 0;
      left: 0;
    }
    .ring_container > .center_line:nth-child(1) {
      flex: 0.3;
    }

    #volt_container {
      display: inline-flex;
      position: relative;
      width: 150px;
      text-align: center;
    }

    #volt_container  > .center_line:last-of-type {
      flex: 0.4;
    }

    /* Houses the volt gauge meter, readout and title */
    #volt_container > .volt_gauge_container {
      height: 100%;
      flex-wrap: nowrap;
      flex: 2;
      display: flex;
      flex-direction: column;
    }
    #volt_container > .volt_gauge_container > .title {
      flex: 1;
      margin: 10px 0 5px 0;
      line-height: 1.2;
    }

    #volt_container > .volt_gauge_container > .container {
      flex: 6;
    }

    #volt_container > .volt_gauge_container .volt_gauge {
      height: 100%;
      background: #7d2b12;
      transition: 0.75s;
      /* transform-origin: 50% bottom; */
    }

    /* ------------- AMPS -----------------*/
    #amp_container {
      display: inline-flex;
      position: relative;
      text-align: center;
    }

    /* Max Regen/Power Amp symbol container */
    #amp_container > .max_amp {
      display: flex;
      align-items: center;
      padding-right:14px;
    }

    #amp_container > .max_amp > .hexagon {
      grid-template-columns: repeat(2, 1fr);
      margin: 0;
      z-index: 9;
    }
    /* line running in between hexagons*/
    #amp_container > .max_amp > reactive-line {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 2;
    }

    #max_kw_container > .hexagon > article,
    #amp_container > .max_amp > .hexagon > article {
      width: 85px;
      height:85px;
    }

    #max_kw_container > .hexagon > article:nth-of-type(1),
    #amp_container > .max_amp > .hexagon > article:nth-of-type(1) {
      grid-column: 1 / span 2;
      grid-row: 1;
      margin-bottom:40px;
    }
    #amp_container > .max_amp > .hexagon > article:nth-of-type(2) {
      grid-column: 1 / span 2;
      grid-row: 2;
    }
    /* ---------------------------------------- */


    #amp_container x2,
    #amp_container .hexagon,
    #amp_container svg p {
      flex: 1;
    }

    /*  -----  Amp animation container    ------     */
    #amp_container > .amp_gauge_container {
      flex: 1;
      flex-direction: column;
      display: flex;
      width: 80px;
    }
    #amp_container > .amp_gauge_container > .amp_gauge {
      flex: 0.6;
      overflow:hidden;
      z-index: 5;
    }
    #amp_container > .amp_gauge_container > reactive-line {
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
    }

    #amp_container > .amp_gauge_container > .amp_gauge > div.slow {
      animation: slide 2s linear infinite;
    }
    #amp_container > .amp_gauge_container > .amp_gauge > div.fast {
      animation: slide .8s linear infinite;
    }
    #amp_container > .amp_gauge_container > .amp_gauge > div {
      transform: scaleY(0.0);
      transition: 0.5s;
      height:20px;
      width: 100%;
      border-radius: 5px;
      background-size: 8px 30px;
      background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.55) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.55) 50%, rgba(255, 255, 255, 0.55) 75%, transparent 75%, transparent);
    }
    #amp_container > .amp_gauge_container > .amp_gauge.regen > div {
      animation-direction: normal;
      background-color: ${colors.fgMainSecondary};
      transform: scaleY(1);
    }
    #amp_container > .amp_gauge_container > .amp_gauge.discharge > div {
      animation-direction: reverse;
      background-color: ${colors.fgMain};
      transform: scaleY(1);
    }


    @keyframes slide{
      from { background-position: 40px 0; } to { background-position: 0 0; }
    }


    #amp_container > .amp_gauge_container > .title {
      flex: 1;
    }

    .ring_section h2,
    #volt_container > .volt_gauge_container > h2,
    #amp_container > .amp_gauge_container > h2 {
      color: #f17500;
      transition: 0.75s;
      font-family:'${fonts.staticReadout}';
      background: black;
      padding-top: 4px;
      margin: 5px 0 0 0;
      flex: 1;
      color: white;
      display: inline-flex;
      justify-content: center;
      align-items: flex-end;
    }

    h2 > span {
      font-family:'${fonts.staticReadout}';
      font-size: 14px;
    }

    .ring_section {
      height:100%;
     box-sizing: content-box;
    }

    .hexagon > article.selectable figure p {
      margin-top: 0;
      font-variant-caps: all-petite-caps;
    }
  `]
})
export class VoltSectionComponent implements DoCheck, OnDestroy {
  @Input() gameObject: GameSpeakObject;
  @HostBinding('class.voltAlert') voltAlert: boolean;
  @HostBinding('class.voltNominal') voltNominal: boolean;
  powerData1: PowerData;
  hvlv: HvlvData;
  torquePower: TorquePowerData;
  minHVBusVoltRounded: number;
  maxHVBusVoltRounded: number;
  maxDischargePower: number;
  maxRegenPower: number;
  outputMechanicalPower: number;
  regenActive: boolean;
  dischargeActive: boolean;

  constructor(readonly hsrComm:HSRComm, readonly volts: VoltService,
    private router: Router,
    private route: ActivatedRoute) {
    this.powerData1 = hsrComm.hsrSet.PowerData;
    this.hvlv = hsrComm.hsrSet.HvlvData;
    this.torquePower = hsrComm.hsrSet.TorquePowerData;
    this.update();
  }

  ngOnDestroy(){

  }

  private update() {
    this.maxDischargePower = this.powerData1.maxDischargePower;
    this.maxRegenPower = this.powerData1.maxRegenPower
    this.minHVBusVoltRounded = this.volts.min;
    this.maxHVBusVoltRounded = this.volts.max;
    this.outputMechanicalPower = this.torquePower.outputMechanicalPower;
    this.voltStatus();


    if(this.voltAlert && this.gameObject){
      this.gameObject.setTimedEvent(VOLT_ALERT);
    }
  }

  ngDoCheck(){
    this.update();
  }

  get ampStatus(): string {
    let current = Math.abs(this.hvlv.currentEst);
    let percentage = 0;
    let max = 100;
    if (current > 0) {
      max = this.powerData1.maxDischargeAmps;
    } else if (current < 0) {
      max = this.powerData1.maxRegenAmps;
    }
    percentage = (100 * current) / max;

    return (percentage > 50? 'fast' : 'slow')
  }

  voltStatus() {
    let status = this.volts.status;
    if (status == VoltsLevel.GREAT) {
      this.voltAlert = false;
      this.voltNominal = true;
    } else if (status == VoltsLevel.DANGER) {
      this.voltAlert = true;
      this.voltNominal = false;
    }
    else {
      this.voltAlert = false;
      this.voltNominal = false;
    }
    this.regenActive = this.outputMechanicalPower < 0;
    this.dischargeActive = this.outputMechanicalPower > 0;
  }

  voltageDanger() {
    return this.voltAlert;
  }
  voltageNominal() {
    return this.voltNominal;
  }
  voltStatusStoke(mode: number): string {
    if (mode == 0) {
      return this.voltNominal ? `${colors.fgMainSecondary}` : `${colors.bgMainSecondary}`
    } else if (mode == 1) {
      return this.voltAlert ? `${percColors.alert}` : `${colors.bgMain}`
    }
    return colors.fgMain;
  }

  get maxkWDischarge(): number {
    return this.maxDischargePower;
  }
  get maxkWRegen() {
    return this.maxRegenPower;
  }

  get minVolt(): number {
    return this.minHVBusVoltRounded;
  }
  get maxVolt(): number {
    return this.maxHVBusVoltRounded;
  }
  get regening(): boolean {
    return this.outputMechanicalPower < 0;
  }

  get discharging(): boolean {
    return this.outputMechanicalPower > 0;
  }

  editComponent(component: EDITABLE) {
    this.router.navigate(['..', component], {relativeTo: this.route});
  }
}
