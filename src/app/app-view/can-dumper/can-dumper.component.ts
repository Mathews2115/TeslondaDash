import { Component, OnInit, OnDestroy } from '@angular/core';
import { HSRComm } from '../../hsr-drive/comm.service';
import { LogType } from '../../hsr-drive/log.service';
import { MenuEvent } from './menu-event.enum';
import { streamingItems } from './stream-items';
import { GameSpeakObject, GameSpeakService } from '../game-speak-window/game-speak.service';
import { Subscription } from 'rxjs';

export const DUMPING_CAN = 'Dumping raw CAN messages...',
LOGGING_MSG = 'Streaming data from dash...',
NO_COMMS_MSG = 'Attempting to establish comms with Dash Interface...',
DATA_MSG = 'Welcome to data central.\n\nPlease select an option.';

@Component({
  selector: 'app-can-dumper',
  templateUrl: './can-dumper.component.html',
  styleUrls: ['./can-dumper.component.css']
})
export class CanDumperComponent implements OnInit, OnDestroy {
  gameObject: GameSpeakObject;
  busy:boolean;
  state: MenuEvent;
  readonly types = LogType;
  readonly states = MenuEvent;
  private connectionListener: Subscription;
  private timeoutID: number;
  constructor(readonly hsrComm: HSRComm,
    private speakService: GameSpeakService) {
    this.busy = false;
    this.gameObject = this.speakService.register( ['']);

    this.gameObject = speakService.register(['Initializing HSR Interface...']);
    this.connectionListener = hsrComm.listener.subscribe(status =>{
      this.initState();
    })
  }

  initState() {
    if (!this.hsrComm.connected) {
      this.gameObject.update([NO_COMMS_MSG])
    } else if(this.hsrComm.dumping) {
      this.gameObject.update([DUMPING_CAN]);
      this.state = MenuEvent.MENU;
    } else if(this.hsrComm.logging) {
      this.gameObject.update([LOGGING_MSG]);
      this.state = MenuEvent.VIEW;
    } else {
      this.gameObject.update([DATA_MSG]);
      this.state = MenuEvent.MENU;
    }
  }

  msgUpdate() {
    if (!this.hsrComm.connected) {
      this.gameObject.update([NO_COMMS_MSG])
    } else if(this.hsrComm.dumping) {
      this.gameObject.update([DUMPING_CAN]);
    } else if(this.hsrComm.logging) {
      this.gameObject.update([LOGGING_MSG]);
    } else {
      this.gameObject.update([DATA_MSG]);
    }
  }

  menuSelect(type: MenuEvent): void {
    this.state = type;
  }

  dumpCAN(): void {
    if(!this.busy) {
      debugger
      this.hsrComm.dumping ? this.stopRawDump() : this.startRawDump();
      this.actBusy();
    }
  }

  denied(type): void {
    this.gameObject.update(['This feature is currently disabled.']);
  }

  log(type): void {
    if(!this.busy && !this.hsrComm.dumping) this.hsrComm.loggerService.startLogging({name: type, type: type}, streamingItems);
    this.menuSelect(MenuEvent.VIEW);
    this.msgUpdate();
  }

  stopLogging(): void {
    if (!this.busy) {
      this.hsrComm.loggerService.stop();
      this.actBusy();
    }
    this.msgUpdate();
  }

  private startRawDump(): void {
    this.hsrComm.startDumping();
  }

  private stopRawDump(): void {
    this.hsrComm.stopDumping();
  }

  // TODO: actually learn animations for angular5
  private actBusy() {
    this.busy = true;
    this.timeoutID = window.setTimeout(() => {
      this.busy = false;
      this.msgUpdate();
    }, 1000);
  }
  ngOnInit() {  }

  ngOnDestroy() {
    this.connectionListener.unsubscribe();
    this.gameObject.dispose();
    window.clearTimeout(this.timeoutID);
  }
}
