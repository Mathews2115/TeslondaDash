import { Component, OnInit, DoCheck, Input, OnDestroy } from '@angular/core';
import { DiTemperature } from '../../../hsr-drive/hsr-data/di-temperature';
import { DiTemperature2 } from '../../../hsr-drive/hsr-data/di-temperature2';
import { DiMaxTemperature } from '../../../hsr-drive/hsr-data/di-max-temperature';
import { HSRComm } from '../../../hsr-drive/comm.service';
import { percColors } from '../../../app.config';
import { GameSpeakObject } from '../../game-speak-window/game-speak.service';
import { TEMP_PERC_THRESHOLD, DC_CAP_ALERT, PCB_ALERT, INVERTOR_ALERT, STATOR_ALERT } from '../../../hsr-drive/helpers/temp.service';


const CLEAR_ALERT_TIME = 2 * 60 * 1000;

@Component({
  selector: 'temp-section',
  template: `
    <div id='misc'>
      <div class='hexagon'>
        <article>
          <figure>
            <h2>{{ diTemp2.ph1 }}°F</h2>
            <p>PH1</p>
          </figure>
        </article>
        <article>
          <figure>
            <h2>{{ diTemp2.ph2 }}°F</h2>
            <p>PH2</p>
          </figure>
        </article>
        <article>
          <figure>
            <h2>{{ diTemp2.ph3 }}°F</h2>
            <p>PH3</p>
          </figure>
        </article>
        <article [ngStyle]='{"background-color":unitColor(pcbPercent)}'>
          <figure>
            <h2>{{ diTemp1.pcb }}°F</h2>
            <p>PCB</p>
          </figure>
        </article>
        <article [ngStyle]="{'background-color': unitColor(dcCapPercent)}" >
          <figure>
            <h2>{{ diTemp1.dcCap }}°F</h2>
            <p>DC Cap</p>
          </figure>
        </article>
        <article [ngStyle]='{"background-color":unitColor(inverterTpct)}'>
          <figure>
            <h2>{{ diTemp1.inverter }}°F</h2>
            <p>Inverter</p>
          </figure>
        </article>
        <article [ngStyle]='{"background-color":unitColor(statorTpct)}'>
          <figure>
            <h2>{{ diTemp1.stator }}°F</h2>
            <p>Stator</p>
          </figure>
        </article>
      </div>
    </div>
    <div id='inlet'>
      <div class='hexagon'>
        <article>
          <figure>
            <h2>{{diMaxTemp.noFlowNeeded ? 'YES' : 'NO'}}</h2>
            <p>Flow Needed?</p>
          </figure>
        </article>

        <article class='adjustable'>
          <figure>
            <h2>{{diMaxTemp.inletPassiveTarget}}°F</h2>
            <p>Inlet closes@</p>
          </figure>
        </article>

        <article>
          <figure>
            <h2>{{diTemp1.heatsink}}°F</h2>
            <p>Heat Sink</p>
          </figure>
        </article>

        <article>
          <figure>
            <h2>{{diTemp1.inlet}}°F</h2>
            <p>Inlet</p>
          </figure>
        </article>
      </div>
    </div>
`,
  styles: [`

    .hexagon > article {
      height: 100px;
      width: 110px;
    }
    #misc {
      display: block;
    }
    #misc > .hexagon {
      grid-template-columns: repeat(6, 1fr);
    }
    #misc article:nth-of-type(1) {
      grid-column: 1 / span 2;
      grid-row: 2;
    }
    #misc article:nth-of-type(2) {
      grid-column: 3 / span 2;
      grid-row: 2;
    }
    #misc article:nth-of-type(3) {
      grid-column: 5 / span 2;
      grid-row: 2;
    }
    #misc article:nth-of-type(4) {
      grid-column: 2 / span 2;
      grid-row: 1;
    }
    #misc article:nth-of-type(5) {
      grid-column: 4 / span 2;
      grid-row: 1;
    }
    #misc article:nth-of-type(6) {
      grid-column: 2 / span 2;
      grid-row: 3;
    }
    #misc article:nth-of-type(7) {
      grid-column: 4 / span 2;
      grid-row: 3;
    }
    /* A small adjustment in the vertical */
    #misc article:nth-of-type(4),
    #misc article:nth-of-type(5) {
      margin-bottom: calc(100% * -0.22);
    }

    #misc article:nth-of-type(6),
    #misc article:nth-of-type(7) {
      margin-top: calc(100% * -.22);
    }

    #inlet {
      display: block;
      margin-left: 7px;
    }
    #inlet > .hexagon {
      grid-template-columns: repeat(4, 1fr);
      grid-gap: 1%;
    }
    #inlet article:nth-of-type(1) {
      grid-column: 2 / span 2;
      grid-row: 1;
    }
    #inlet article:nth-of-type(2) {
      grid-column: 3 / span 2;
      grid-row: 2;
    }
    #inlet article:nth-of-type(3) {
      grid-column: 2 / span 2;
      grid-row: 3;
    }

    #inlet article:nth-of-type(4) {
      grid-column: 1 / span 2;
      grid-row: 2;
    }

    #inlet article:nth-of-type(1) {
      margin-bottom: calc(100% * -0.22);
    }

    #inlet article:nth-of-type(3){
      margin-top: calc(100% * -.22);
    }

  `]
})
export class TempSectionComponent implements DoCheck, OnDestroy {
  @Input() gameObject: GameSpeakObject;
  diTemp1: DiTemperature;
  diTemp2: DiTemperature2
  diMaxTemp: DiMaxTemperature;
  pcb: number;
  dcCap: number;
  dcCapPercent: number;
  pcbPercent: number;
  inverterTpct:number;
  statorTpct: number;

  constructor(readonly hsrComm: HSRComm) {
    this.diTemp1 = hsrComm.hsrSet.DiTemperature
    this.diTemp2 = hsrComm.hsrSet.DiTemperature2
    this.diMaxTemp = hsrComm.hsrSet.DiMaxTemperature
    this.update();
  }
  ngOnDestroy(){
  }
  getStatus(current: number, max: number): string {
    let percentage = (Math.abs(100 * current) / max);
    return this.unitColor(percentage);
  }

  unitColor(percent: number): string {
    if (percent < 20) {
      return percColors.low;
    } else if (percent < 40) {
      return percColors.lownormal;
    } else if (percent < 60) {
      return percColors.normal;
    } else if (percent < 70) {
      return percColors.medium;
    } else if (percent < 85) {
      return percColors.warning;
    } else if (percent <= 100) {
      return percColors.alert;
    } else {
      return percColors.normal;
    }
  }

  ngDoCheck(){
    this.update();
  }

  private update() {
    this.inverterTpct = this.diTemp1.inverterTpct;
    this.statorTpct = this.diTemp1.statorTPct;
    this.pcb = this.diTemp1.pcb;
    this.dcCap = this.diTemp1.dcCap;
    this.dcCapPercent = (Math.abs(100 * this.dcCap) / this.diMaxTemp.dcCapMax);
    this.pcbPercent = (Math.abs(100 * this.pcb) / this.diMaxTemp.pcbMax);

    if(this.gameObject) {
      if(this.dcCapPercent >= TEMP_PERC_THRESHOLD){
        this.gameObject.setTimedEvent(DC_CAP_ALERT);
      }
      if(this.pcbPercent >= TEMP_PERC_THRESHOLD){
        this.gameObject.setTimedEvent(PCB_ALERT);
      }
      if(this.inverterTpct >= TEMP_PERC_THRESHOLD){
        this.gameObject.setTimedEvent(INVERTOR_ALERT);
      }
      if(this.statorTpct >= TEMP_PERC_THRESHOLD){
        this.gameObject.setTimedEvent(STATOR_ALERT);
      }
    }
  }
}
