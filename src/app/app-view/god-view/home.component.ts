import { Component, OnInit, OnDestroy } from '@angular/core';
import { HSRComm } from '../../hsr-drive/comm.service';
import { GameSpeakObject, GameSpeakService } from '../game-speak-window/game-speak.service';

@Component({
  selector: 'app-home',
  template: `
    <div class='components'>
      <speed-section [gameObject]='gameObject'></speed-section>

      <volt-section [gameObject]='gameObject'></volt-section>
    </div>
    <div class='components'>

      <temp-section [gameObject]='gameObject'></temp-section>
      <misc-section [gameObject]='gameObject'></misc-section>
    </div>
  `,
  styles: [`
  section {
    margin-top: 10px;
  }
  label {
    color: white;
  }
  .content {
    text-align: center;
  }

  :host {
    box-sizing: border-box;
    overflow-x: hidden;
  }

  .mobile {
    display:none;
  }
  @media only screen and (max-width: 799px) {
    app-game-speak-window,
    .components {
      display: none;
    }
    .mobile {
      display:block;
    }
  }

  /* All gauges, components, readouts are inside of here */
  .components {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    margin: 0 10px;
    padding: 5px 5px;
  }
  .components:first-of-type {
    margin-bottom: 5px;

  }

  speed-section {
    display: inline-flex;
  }
  volt-section {
    display: inline-flex;
    margin-left: 20px;
    flex: 1;
  }
  temp-section {
    display: inline-flex;
  }
  misc-section {
    display: inline-flex;
    margin-left: 8px;
    flex: 1;
  }

  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  gameObject: GameSpeakObject;
  constructor(readonly hsrComm: HSRComm, readonly speakService: GameSpeakService) {
    this.gameObject = this.speakService.register( [`  Monitoring HSR Motor state... `]);
  }

  ngOnDestroy(){
    this.gameObject.dispose();
  }

  ngOnInit() { }

}
