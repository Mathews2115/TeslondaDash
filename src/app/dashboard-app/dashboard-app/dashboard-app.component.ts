import { Component, OnDestroy, AfterViewInit, HostBinding } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

// app imports
import { HSRComm } from '../../hsr-drive/comm.service';
import { CommEvents } from '../../hsr-drive/comm-events.enum';
import { appSize } from '../../app.config';

enum APP_STATE {
  DEMO = 'waiting',
  RUNNING = 'ready', // AKA - CONNECTED
  CONTINUE_COUNTDOWN = 'disconnected',
}

enum DEMO_STATE {
  DASH_DEMO = 'demo',
  TITLE = 'title'
}

@Component({
  selector: 'app-dashboard-app',
  templateUrl: './dashboard-app.component.html',
  styles: [`
    :host {
      width: ${appSize.width}px;
      height: ${appSize.height}px;
      position: relative;
      display: block;
      background-image: url('assets/images/dashbackground.png');
      background-repeat: no-repeat;
    }

    @keyframes turn-on {
      0% {
        transform: scale(0, 0.001) translate3d(0, 0, 0);
        -webkit-filter: brightness(50);
        filter: brightness(50);
      }
      15% {
        transform: scale(1.0, 0.001) translate3d(0, 0, 0);
        -webkit-filter: brightness(40);
        filter: brightness(40);
        animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
      }
      40% {
        transform: scale(1, 1) translate3d(0, 0, 0);
        -webkit-filter: brightness(30);
        filter: brightness(30);
      }
      100% {
        -webkit-filter: brightness(1);
        filter: brightness(1);
      }
    }

    @keyframes turn-off {
      0% {
        transform: scale(1, 0.8) translate3d(0, 0, 0);
        -webkit-filter: brightness(1);
        filter: brightness(1);
      }
      60% {
        transform: scale(1.0, 0.001) translate3d(0, 0, 0);
        -webkit-filter: brightness(10);
        filter: brightness(10);
      }
      100% {
        animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
        transform: scale(0, 0.0001) translate3d(0, 0, 0);
        -webkit-filter: brightness(50);
        filter: brightness(50);
      }
    }

    :host.init {
      animation: turn-on 0.6s cubic-bezier(0.23, 1, 0.32, 1);
      animation-fill-mode: forwards;
    }

    :host.off {
      animation: turn-off 0.55s cubic-bezier(0.23, 1, 0.32, 1);
      animation-fill-mode: forwards;
    }

    .coin_msg {
      animation: blink-animation 3s steps(5, start) infinite;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: black;
      padding: 10px;
    }

    .overlay {
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
    }

    .overlay .credit {
      background: black;
      position: absolute;
      left: 35px;
      top: 86%;
    }

    .overlay .owner {

      position: absolute;
      right: 35px;
      top: 86%;
    }
    .overlay .credit p,
    .overlay .owner p {
      background: black;
      -webkit-margin-before: 0.5em;
      -webkit-margin-after: 0.5em;
    }

  `]
})

export class DashboardAppComponent implements OnDestroy, AfterViewInit {
  state: APP_STATE;
  nextDemoState: DEMO_STATE;
  private commListener: Subscription;
  private initAnimID: number;
  private demoStateID: number;
  showDashboard: boolean;

  @HostBinding('class.init') turningOn;

  constructor(private hsrComm: HSRComm) {
    this.turningOn = true;
    this.animateTurnOn();
    this.state = APP_STATE.DEMO;
    this.nextDemoState = DEMO_STATE.TITLE;
    this.showDashboard = false;
    this.commListener = this.hsrComm.listener.subscribe(this.onEvent);
    this.startDemoMode()
    // this.state = APP_STATE.CONTINUE_COUNTDOWN; //TEST
  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
    this.commListener.unsubscribe();
    window.clearTimeout(this.initAnimID);
    window.clearTimeout(this.demoStateID);
  }

  private demoStateHandler = (): void => {
    if (this.nextDemoState === DEMO_STATE.TITLE) {
      this.showDashboard = false;
      this.demoStateID = window.setTimeout(this.demoStateHandler, 15000);
      this.nextDemoState = DEMO_STATE.DASH_DEMO;
      this.hsrComm.demo(false);
    } else if (this.nextDemoState == DEMO_STATE.DASH_DEMO) {
      this.showDashboard = true;
      this.demoStateID = window.setTimeout(this.demoStateHandler, 10000);
      this.nextDemoState = DEMO_STATE.TITLE;
      this.hsrComm.demo(true);
    }
  }

  private startDemoMode = () => {
    this.state = APP_STATE.DEMO;
    this.nextDemoState = DEMO_STATE.TITLE;
    this.demoStateHandler();
  }

  private startDashboard = () => {
    this.showDashboard = true;
    this.state = APP_STATE.RUNNING;
    window.clearTimeout(this.initAnimID);
    window.clearTimeout(this.demoStateID);
  }

  private onEvent = (commEvent: CommEvents) => {
    if (this.state === APP_STATE.DEMO) {
      // NOT CONNECTED --> CONNECTED
      if (this.hsrComm.hsrConnected) {
        this.startDashboard();
      }
    } else if (this.state === APP_STATE.RUNNING) {
      // CONNECTED --> DISCONNECTED
      if (!this.hsrComm.hsrConnected){
        this.showDashboard = false;
        this.state = APP_STATE.CONTINUE_COUNTDOWN;
        this.switchToDemo();  // after 5 seconds, switch to DEMO mode
      }

    } else if (this.state === APP_STATE.CONTINUE_COUNTDOWN) {
      // DISCONNECTED --> CONNECTED
      if (this.hsrComm.hsrConnected){
        this.startDashboard();
      }
    }
  }

  ///////// GROSS HACK ANIMATIONS ////////////////////
  // I should utilize NG animation but this is quick and dirty for prototyping
  private animateTurnOn(): void {
    this.turningOn = true;
    window.setTimeout(() => {
      this.turningOn = false
    }, 2000)
  }

  private switchToDemo(): void {
    window.clearTimeout(this.initAnimID);
    this.initAnimID = window.setTimeout(this.startDemoMode, 15000);
  }
}
