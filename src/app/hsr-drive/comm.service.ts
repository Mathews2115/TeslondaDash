import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Subscriber } from 'rxjs/Subscriber';
import { Observer } from 'rxjs/Observer';

// communications
import { Socket } from './socket-io/socket.service';
import { WS_Events } from './socket-io/events.enum';
import { CommEvents } from './comm-events.enum';

// HSR Data
import { HsrTx } from './hsr-data/base-hsr';
import { HsrSet } from './hsr-data/hsr-set';
import { LogService } from './log.service';

export const COMM_OFFLINE = "Unable to communicate with main Dash interface.\n\nAttempting uplink...";
export const HSR_OFFLINE = "HSR Motor is offline.";

const NOT_CONNECTED = -1;
enum PKT {
  id,
  length,
  currentByte
}
enum STREAM_PKT {
  ts_s,
  ts_us,
  id,
  length,
  data,
}

interface STATUS_PKT {
  canDumping: boolean,
  logging: boolean,  // if true, is popuated with file name
  GPS: boolean,
  streaming: boolean, // if true, is populated with file name
  canError: string,
  serverLog: string
}

@Injectable()
export class HSRComm implements OnDestroy {
  private _socket: Socket;
  private updateListener: Subscription;
  private statusUpdateListener: Subscription;

  // optimization:  each number I think allocates to 4 bytes of memory;
  // preallocate my caching stuff so it burns less time on the pi cpu
  private canIDCache: number;
  private pktHlpr: Uint32Array;
  private timeoutID: number;
  private demoIntervalID: number;

  // Keep track of each observer (one for every active subscription)
  private observers: Subscriber<CommEvents>[];
  private connectionListener: Subscription;
  private disconnectListener: Subscription;

  // status's
  private _connected: boolean;
  private _logging: boolean;
  private _dumping: boolean;
  private _streaming: boolean;
  private _serverLog: string;
  private _canError: string;

  listener: Observable<CommEvents>;
  hsrSet: HsrSet;

  constructor(private _hsrLogger: LogService) {
    this.hsrSet = new HsrSet();

    this.observers = [];

    this.timeoutID = NOT_CONNECTED;
    this._logging = null;
    this._dumping = false;
    this._connected = false;
    this._streaming = null;

    // init our cache packet data
    this.pktHlpr = new Uint32Array(3);

    this._socket = new Socket();

    // init our Connection/Disconnection listener (others in the app can subscribe to this for updates on when we disconnect/connect to HSR comms)
    this.listener = new Observable<CommEvents>((observer) => {
      // noob reminder:  this function gets run everyone time someone subscribes

      // Return the subscriber function (runs when subscribe() function is invoked)
      this.observers.push(observer);

      // return current state of connectedness
      if (this.timeoutID === NOT_CONNECTED) {
        observer.next(CommEvents.HSR_DISCONNECTED);
      } else {
        observer.next(CommEvents.HSR_CONNECTED);
      }

      // return object with unsubscribe function; so we can remove from listeners
      return {
        unsubscribe: () => {
          // Remove from the observers array so it's no longer notified
          this.observers.splice(this.observers.indexOf(observer), 1);
          // If there's no more listeners, do cleanup
          if (this.observers.length === 0) {
            console.log('No one is listening.');
          }
        }
      };
    });
  }

  ngOnDestroy() {
    this.connectionListener.unsubscribe();
    this.disconnectListener.unsubscribe();
    this.updateListener.unsubscribe();
    this.statusUpdateListener.unsubscribe();
    window.clearInterval(this.demoIntervalID);
  }

  // Connect to Server and setup update listener
  init(url: string): Observable<CommEvents> {
    this._socket.init(url);

    this.connectionListener = this._socket.onEvent(WS_Events.CONNECT).subscribe(() => {
      console.log('connected');
      this._connected = true;
      this.observers.forEach(obs => obs.next(CommEvents.CONNECTED));
    });

    this.disconnectListener = this._socket.onEvent(WS_Events.DISCONNECT).subscribe(() => {
      console.log('disconnected');
      this._connected = false;
      this.observers.forEach(obs => obs.next(CommEvents.DISCONNECTED));
    });

    this.updateListener = this._socket.onMsg("update").subscribe((data) => this.parsePacket(data));
    this.statusUpdateListener = this._socket.onMsg("status_update").subscribe((data) => this.onStatusUpdate(data));
    return this.listener;
  }

  updateValue(obj: HsrTx) {
    if (obj.sendCanID !== null) {
      this._socket.send('update_server', {
        id: obj.sendCanID,
        data: obj.data.buffer
      });
    }
  }

  startDumping() {
    this._socket.send('start dumping', {});
  }

  stopDumping() {
    this._socket.send('stop dumping', {});
  }

  get serverLog(): string {
    return this._serverLog;
  }

  get canError(): boolean {
    return this._canError && this._canError.length > 0;
  }

  // is the server logging data?
  get logging():boolean {
    return !!this._logging;
  }

  // is the server in the process of a CAN-Dump?
  get dumping():boolean {
    return this._dumping;
  }
  // connected to dash?
  get connected():boolean {
    return this._connected;  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  }

  get streaming(): boolean {
    return !!this._streaming;
  }

  // getting actual data from server?
  get hsrConnected(): boolean {
    return this.timeoutID != NOT_CONNECTED;
  }

  get loggerService(): LogService {
    this._hsrLogger.allowLogStream();
    return this._hsrLogger;
  }

  demo(start: boolean = false): void {
    window.clearInterval(this.demoIntervalID);
    if (start) {
      for (let hsrObj of this.hsrSet.hsrData) {
        if (hsrObj) hsrObj.demo();
      }
      this.demoIntervalID = window.setInterval(this.demoUpdate, 10);
    } else {
      window.clearInterval(this.demoIntervalID);
    }
  }

  private demoUpdate = (): void => {
    // animate rpms
    let speedData = this.hsrSet.SpeedData;
    let speed = speedData.motorRPM;
    if (speed < 10000) {
      speedData.demo(speed + 10);
    } else if (speed > 10000) {
      speedData.demo(speed + 0);
    }
  }

  // super ugly function but super optimized (lol)
  // Avoid as much GC / allocation as possible
  private parsePacket(packet: ArrayBuffer): void {
    let data = new DataView(packet);

    // timeout check - if we haven't gotten any msg's in a bit; tell the App we were disconnected
    this.timeoutCheck(packet.byteLength > 0);

    // here is some stupid memory allocation optimization that probably doesn't work and looks goddamn gross
    while (this.pktHlpr[PKT.currentByte] < packet.byteLength) {
      // get CAN ID
      this.pktHlpr[PKT.id] = data.getUint16(this.pktHlpr[PKT.currentByte]);
      this.pktHlpr[PKT.currentByte] += 2;

      // get CAN data length
      this.pktHlpr[PKT.length] = data.getUint8(this.pktHlpr[PKT.currentByte]);
      this.pktHlpr[PKT.currentByte] += 1;

      // update CAN data using ID
      if (this.hsrSet.exists(this.pktHlpr[PKT.id])) {
        this.hsrSet.update(this.pktHlpr[PKT.id],
          data.buffer.slice(this.pktHlpr[PKT.currentByte], this.pktHlpr[PKT.currentByte] + this.pktHlpr[PKT.length])
        );
      }
      this.pktHlpr[PKT.currentByte] += this.pktHlpr[PKT.length];
    }

    // reset count for next time
    this.pktHlpr[PKT.currentByte] = 0
  }

  private onStatusUpdate(data: STATUS_PKT): void {
    this._dumping = data.canDumping;
    this._logging = data.logging;
    this._streaming = data.streaming;
    this._canError = data.canError;
    this._serverLog = data.serverLog;
  }

  // disconnect if more than two seconds go by, otherwise resume connection if we start getting packets again
  private timeoutCheck(dataExists): void {
    if (dataExists) {
      // We are getting data! - let the everyone in the app know we are CONNECTED!
      if (this.timeoutID == NOT_CONNECTED) {
        window.clearInterval(this.demoIntervalID);
        this.resetTimeout();
        this.observers.forEach(obs => obs.next(CommEvents.HSR_CONNECTED));
      }
      else {
        this.resetTimeout();
      }
    }
  }

  // if two seconds go by without any communications, turn off
  private resetTimeout(): void {
    window.clearTimeout(this.timeoutID);
    this.timeoutID = window.setTimeout(() => {
      this.timeoutID = NOT_CONNECTED;

      // only spit out DISCON msg if we were previously connected and then stopped getting shit from our server
      this.observers.forEach(obs => obs.next(CommEvents.HSR_DISCONNECTED));
    }, 2000);
  }
}
