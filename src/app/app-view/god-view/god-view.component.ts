import { Component, OnInit, ChangeDetectorRef, AfterViewInit, OnDestroy } from '@angular/core';

// app imports
import { AnimHookService, FREQUENCY } from '../../anim-hook.service';
import { HSRComm } from '../../hsr-drive/comm.service';
import { GameSpeakService, GameSpeakObject } from '../game-speak-window/game-speak.service';
import { Subscription } from 'rxjs';
import { colors } from '../../app.config';

@Component({
  selector: 'app-god-view',
  template: `
  <app-game-speak-window></app-game-speak-window>
  <div class='main_window' *ngIf="hsrComm.hsrConnected">
    <router-outlet></router-outlet>
  </div>
  <div class='scene' *ngIf="!hsrComm.hsrConnected">
    <div class='bar'></div>
    <div class='msg_background'>
      <div class='anim'> </div>
      <p> OFFLINE </p>
    </div>
    <div class='bar'></div>
  </div>
    `,
  styles: [`
    app-game-speak-window {
      flex: 1 0 100%;
    }
    .main_window {
      flex: 1;
    }
    :host ,
    .scene {
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .bar {
      flex: 0.6;
      width:100%;
      background-color: ${colors.fgMain};
      position: relative;
    }
    .msg_background {
      flex: 4;
      width: 100%;
      background-color:  ${colors.background};
      display: inline-flex;
      justify-content: center;
      margin: 36px 0;
      position: relative;
    }

    .msg_background p {
      align-self: center;
      font-size: 70px;
      background: ${colors.background};;
      justify-self: center;
      z-index: 12;
      padding: 58px;
      color: ${colors.fgMain};
      animation: blink_text 1s infinite
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
  `]
})
export class GodViewComponent implements AfterViewInit, OnDestroy {
  gameObject: GameSpeakObject;
  private updateID: number;
  private connectionListener: Subscription;
  messages: string[];

  constructor(
    private speakService: GameSpeakService,
    readonly hsrComm: HSRComm,
    private changeDetection: ChangeDetectorRef,
    private animService: AnimHookService) {
    this.gameObject = speakService.register(['Initializing HSR Interface...']);
    this.connectionListener = hsrComm.listener.subscribe(status =>{
      if (hsrComm.hsrConnected) {
        this.gameObject.update(['HSR Interface established.'])
      } else if (hsrComm.connected) {
        this.gameObject.update(['Attempting to establish comms with HSR Interface...'])
      } else {
        this.gameObject.update(['Attempting to establish comms with Dash Interface...'])
      }
    })

  }

  ngOnDestroy() {
    this.connectionListener.unsubscribe();
    this.animService.unregister(this.updateID);
    this.gameObject.dispose();
    this.gameObject = null;
  }

  ngAfterViewInit() {
    // only update the view every frame due a large amount of data coming in
    this.changeDetection.detach();
    this.updateID = this.animService.register(() => {
      this.changeDetection.detectChanges();
    }, FREQUENCY.MAX)
  }
}
