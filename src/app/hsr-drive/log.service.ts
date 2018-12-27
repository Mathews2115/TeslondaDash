import { Injectable, OnDestroy } from "@angular/core";
import { StreamDataPoint } from "./stream-data";
import { HsrSet } from "./hsr-data/hsr-set";
import { Observable } from "rxjs/Observable";
import { Subscriber } from "rxjs/Subscriber";
import { Socket } from "./socket-io/socket.service";
import { Subscription } from "rxjs/Subscription";
import { SERVER_URL, EXTRAS_URL } from "../app.config";
import { Observer } from "rxjs/Observer";
import { HSR_CAN_IDS, BaseHsr } from "./hsr-data/base-hsr";

interface LogResponse {
  fileName: string;
}

enum LOG_STATE {
  READY,    // if we are idle, not doing anything
  LOGGING,  // if we are currently logging data
  STREAMING, // if we are just streaming data (not logging)
}

// type ResponseFunction = (err?: any) => {};

export enum LogType {
  ZERO_SIXTY_PULL = '_0_60_PULL',
  GENERAL = '_LOG',
  QTR_MILE = '_QTR_MILE',
  _8TH_MILE = '_8TH_MILE'
}

export interface LogCreation {
  type: LogType,
  name: string
}

enum LOG_EVENT {
  GET_LOGS = "list logs",
  LOGS_RECEIVED = "list_update",
  STREAM_UPDATE = "stream_update",
  START = "start logging",
  LOAD = "load log",
  DELETE = "delete log",
  STOP = "all stop"
}

@Injectable()
export class LogService implements OnDestroy {
  streamBroadcast: Observable<StreamDataPoint>;
  loadedFile:  string;  // name of the file we are
  
  private _socket: Socket;
  private _streamData: StreamDataPoint[];
  private _streamObservers: Subscriber<StreamDataPoint>[];
  private _initialized: boolean;
  private _logStreamListener: Subscription;
  private _IDsListener: HSR_CAN_IDS[] = [];        // Only stream/display data we are listening too

  constructor() {
    this._initialized = false;
    this._streamObservers = [];
  }

  ngOnDestroy() {
    this._logStreamListener.unsubscribe();
  }

  allowLogStream(): void {
    if (!this._initialized) {
      this._streamData = [];
      this._socket = new Socket();

      this.streamBroadcast = new Observable<StreamDataPoint>(observer => {
        // noob reminder:  this function gets run everyone time someone subscribes
        // Return the subscriber function (runs when subscribe() function is invoked)
        this._streamObservers.push(observer);

        // return object with unsubscribe function; so we can remove from listeners
        return {
          unsubscribe: () => {
            // Remove from the _streamObservers array so it's no longer notified
            this._streamObservers.splice(this._streamObservers.indexOf(observer), 1);
            // If there's no more listeners, do cleanup
            // if (this._streamObservers.length === 0) {
            //   console.log("No more log listeners");
            // }
          }
        };
      });

      this._socket.init(SERVER_URL + EXTRAS_URL);
      this._logStreamListener = this._socket
        .onMsg(LOG_EVENT.STREAM_UPDATE)
        .subscribe(data => this.onLogUpdate(data));
      this._initialized = true;
    }
  }

  listLogs(obs: Observer<string[]>): Subscription {
    if (this._initialized) {
      this._socket.send(LOG_EVENT.GET_LOGS, {});
      return this._socket.once(LOG_EVENT.LOGS_RECEIVED).subscribe(data => {
        if(data.error || data.list == null || data.list.length == 0){
          data.error = data.error || 'No logs found.'
          obs.error(data.error);
        }
        else {
          obs.next(data.list);
        }
        obs.complete();
      })
    }
  }

  loadLog(fileName: string, ids: HSR_CAN_IDS[]) {
    this._streamData = [];
    this._IDsListener = ids;
    this._socket.send(LOG_EVENT.LOAD, fileName, (data: LogResponse) => {
      this.loadedFile = data.fileName;
    });
  }

  deleteLog() {
    this._socket.send(LOG_EVENT.DELETE, this.loadedFile);
  }

  get streamData(): StreamDataPoint[] {
    return this._streamData;
  }

  /**
   * Requests server to start logging data
   * @param data name of log and type
   */
  startLogging(data: LogCreation, ids: HSR_CAN_IDS[]) {
    if (this._initialized) {
      this._streamData = [];
      this._IDsListener = ids;
      this._socket.send(LOG_EVENT.START, data, (data: LogResponse) => {
        this.loadedFile = data.fileName;
      });
    }
  }

  /**
   * Requests server to stop logging data or streaming data
   */
  stop() {
    if (this._initialized) {
      this._socket.send(LOG_EVENT.STOP, {});
    }
    this._IDsListener = [];
  }

  private onLogUpdate(packet: ArrayBuffer): void {
    let data = new DataView(packet);
    let currentByte = 0;
    try {
      while (currentByte < packet.byteLength) {
        // get time elapsed
        let seconds = data.getUint32(currentByte);
        currentByte += 4;
        let us = data.getUint32(currentByte);
        currentByte += 4;

        // get CAN ID
        let can_id = data.getUint16(currentByte);
        currentByte += 2;

        // get CAN data length
        let dataLength = data.getUint8(currentByte);
        currentByte += 1;

        // if we are listening for any ids, lets update our listeners
        if(this._IDsListener.includes(can_id)) {
          // get our key - round to nearest ms
          let msElapsed = (seconds * 1e9 + us) / 1e6;
          let time = Math.round(msElapsed); //parseFloat((msElapsed * 0.001).toFixed(2));

          let dataPoint = {
            ts: time,
            data: new DataView(data.buffer.slice(currentByte, currentByte + dataLength)),
            id: can_id
          };

          // Update streaming data
          this._streamData.push(dataPoint);
          this._streamObservers.forEach(obs => obs.next(dataPoint));
        }
        currentByte += dataLength;
      }
    } catch (error) {
      console.error(error);
      this.stop();
    }
  }
}
