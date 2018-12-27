import { Component, OnDestroy, Input } from '@angular/core';
import { SpeedData } from '../../../hsr-drive/hsr-data/speed-data';
import { SpeedLimit } from '../../../hsr-drive/hsr-data/speed-limit';
import { HSRComm } from '../../../hsr-drive/comm.service';
import { PedalPos } from '../../../hsr-drive/hsr-data/pedal-pos';
import { fonts } from '../../../app.config';
import { EDITABLE } from '../edit.component';
import { ActivatedRoute, Router } from '@angular/router';
import { GameSpeakObject } from '../../game-speak-window/game-speak.service';

const SPEED_LIMIT_HIT = 'WHOA THERE!\n\nWARNING: Max Motor RPM limit hit event occurred.'


@Component({
  selector: 'speed-section',
  template: `
      <div id='pedal'>
        <div class='hexagon'>
          <article>
            <figure>
              <h2>{{ pedalPos.pedalPositionRounded }}%</h2>
              <p>Pedal</p>
            </figure>
          </article>
          <article class='non-important'>
            <figure>
              <h2>{{ pedalPos.pedalPositionTrackARounded }}</h2>
              <p>Track A</p>
            </figure>
          </article>
          <article class='non-important'>
            <figure>
              <h2>{{pedalPos.pedalPositionTrackB}}</h2>
              <p>Track B</p>
            </figure>
          </article>
        </div>
      </div>
      <div class='ring_container'>
        <div class='lines'>
          <reactive-line [points]="'0,70 50,70 70,50 100,50'" [max]=100 [value]="pedalPos.pedalPositionRounded"></reactive-line>
        </div>
        <div class='ring_section'>
          <p class='title'> MOTOR RPM </p>
          <div class='gauge_container'>
            <ring-meter [readout]='rpm' maxForward='{{ rpmMax }}'></ring-meter>
            <div ringCircle [value]='rpm' [max]='rpmMax'></div>
          </div>
          <h2> {{ rpm }} </h2>
        </div>
        <div class='lines'>
          <reactive-line [points]="'0,50 50,50 70,30 100,30'" [max]="rpmMax" [value]="rpm"></reactive-line>
        </div>
      </div>
      <div id='speed_limit'>
        <div class='hexagon'>
          <article class='selectable cancel' (click)='editComponent(${EDITABLE.MAX_SPEED_LIMIT})'>
            <figure>
              <h2>{{ rpmMax }}</h2>
              <p>RPM Max</p>
            </figure>
          </article>
          <article>
            <figure>
              <h2>{{ speedData.teslondaSpeed }}</h2>
              <p>MPH</p>
            </figure>
          </article>
          <article class='selectable cancel' (click)='editComponent(${EDITABLE.MAX_SPEED_LIMIT})'>
            <figure>
              <h2>{{ mphMax }}</h2>
              <p>MPH Max</p>
            </figure>
          </article>
        </div>
      </div>
    `,
  styles: [`
    .title {
      color: white;
    }
    .hexagon > article {
      height: 96px;
      width: 93px;
    }
    .hexagon > article.selectable > figure > p {
      font-size: 75%;
    }
    .lines {
      height: 100%;
    }
    .ring_section h2 {
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
    .ring_section  h2 > span {
      font-family:'${fonts.staticReadout}';
      font-size: 14px;
    }

    .ring_section {
      height:100%;
    }

    /*  ---------  PEDAL DATA SECTION ---------    */
    #pedal {
      display: block;
      align-self: center;
    }
    #pedal article:nth-of-type(1) {
      grid-column: 2 / span 2;
      grid-row: 1;
    }
    #pedal article:nth-of-type(2) {
      grid-column: 1 / span 2;
      grid-row: 2;
    }
    #pedal article:nth-of-type(3) {
      grid-column: 3 / span 2;
      grid-row: 2;
    }
    /* A small adjustment in the vertical */
    #pedal article:nth-of-type(1) {
      margin-bottom: calc(100% * -0.23);
    }

    /*  ---------  SPEED DATA SECTION ---------    */
    #speed_limit {
      display: block;
      align-self: center;
    }
    #speed_limit > .hexagon {
      grid-template-columns: repeat(4, 1fr);
    }
    #speed_limit > .hexagon > article:nth-of-type(1) {
      grid-column: 2 / span 2;
      grid-row: 2;
    }
    #speed_limit  > .hexagon > article:nth-of-type(2) {
      grid-column: 1 / span 2;
      grid-row: 1;
    }
    #speed_limit  > .hexagon > article:nth-of-type(3) {
      grid-column: 3 / span 2;
      grid-row: 1;
    }
    /* A small adjustment in the vertical */
    #speed_limit  > .hexagon > article:nth-of-type(n + 2),
    #speed_limit  > .hexagon > article:nth-of-type(n + 3) {
      margin-bottom: calc(100% * -0.23);
    }
  `]
})
export class SpeedSectionComponent implements OnDestroy {
  speedData: SpeedData;
  speedLimit: SpeedLimit;
  pedalPos: PedalPos;
  @Input() gameObject: GameSpeakObject

  constructor(readonly hsrComm: HSRComm, private route: ActivatedRoute, private router: Router) {
    this.speedData = hsrComm.hsrSet.SpeedData;
    this.speedLimit = hsrComm.hsrSet.SpeedLimit;
    this.pedalPos = hsrComm.hsrSet.PedalPos;
  }

  ngOnDestroy(){
  }

  teslondaMPH(): number {
    return this.speedData.teslondaSpeed;
  }

  editComponent(component: EDITABLE) {
    this.router.navigate(['..', component], {relativeTo: this.route});
  }

  get rpm(): number {
    let rpm = this.speedData.motorRPM;
    // TURN THIS OFF, it keeps firing?
    // let percent = (Math.abs(100 * rpm) / this.speedLimit.rpmLimit);
    // if(percent >= 99 && this.gameObject){
    //   this.gameObject.setTimedEvent(SPEED_LIMIT_HIT);
    // }
    return rpm;
  }
  get rpmMax(): number {
    return this.speedLimit.rpmLimit;
  }
  get mphMax(): number {
    return this.speedLimit.teslondaMPHLimit;
  }
}
