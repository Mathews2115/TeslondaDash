import { Injectable } from '@angular/core';

interface AnimFunctions {
  callback: Function;
  id: number;
}

enum FPS {
  SIXTY = 16.6,      // 60fps
  FOURTYFIVE = 22.2, // 45fps
  THIRTY = 33.3,     // 30fps
  FIFTEEN = 66.6,    // 15fps
  LOW = 200,    // 5fps
}

export enum FREQUENCY {
  MAX = FPS.SIXTY,
  HALF = FPS.FOURTYFIVE,
  MIN = FPS.FIFTEEN,
  EVERY_SECOND = 1000,
}

@Injectable()
export class AnimHookService {

  private fullFPS: AnimFunctions[];
  private halfFPS: AnimFunctions[];
  private minFPS: AnimFunctions[];
  private secondsFPS: AnimFunctions[];
  private rafID: number;
  private lastFullUpdate: number;
  private lastHalfUpdate: number;
  private lastMinUpdate: number;
  private lastSecondUpdate: number;

  constructor() {
    this.fullFPS = [];
    this.halfFPS = [];
    this.minFPS = [];
    this.secondsFPS = [];
    this.lastFullUpdate = 0;
    this.lastHalfUpdate = 0;
    this.lastMinUpdate = 0;
    this.lastSecondUpdate = 0;
    this.rafID = window.requestAnimationFrame(this.firstUpdate);
  }

  // register for draw update
  // returns id for unregistering if needed
  register(callback: Function, frequency:FREQUENCY=FREQUENCY.MAX, priority: number=0): number {
    const callbackObj = { id: Math.random(), callback: callback }
    if(frequency === FREQUENCY.MAX) {
      this.fullFPS.push(callbackObj)
      this.fullFPS.sort(this.comparePriority);
    } else if (frequency === FREQUENCY.HALF) {
      this.halfFPS.push(callbackObj)
      this.halfFPS.sort(this.comparePriority);
    } else if(frequency === FREQUENCY.EVERY_SECOND){
      this.secondsFPS.push(callbackObj)
      this.secondsFPS.sort(this.comparePriority);
    } else {
      this.minFPS.push(callbackObj)
      this.minFPS.sort(this.comparePriority);
    }

    return callbackObj.id;
  }

  unregister(id): void {
    let index = this.fullFPS.findIndex((obj) => { return obj.id === id; });
    if (index !== -1){
      this.fullFPS.splice(index,1);
    }
    index = this.halfFPS.findIndex((obj) => { return obj.id === id; });
    if (index !== -1){
      this.halfFPS.splice(index,1);
    }
    index = this.minFPS.findIndex((obj) => { return obj.id === id; });
    if (index !== -1){
      this.minFPS.splice(index,1);
    }
    index = this.secondsFPS.findIndex((obj) => { return obj.id === id; });
    if (index !== -1){
      this.secondsFPS.splice(index,1);
    }
  }

  stop(): void {
    window.cancelAnimationFrame(this.rafID);
  }

  oneShot(callback: FrameRequestCallback): void {
    window.requestAnimationFrame(callback);
  }

  public firstUpdate = (timeStamp: number):void => {
    // init time stamps
    this.lastFullUpdate = timeStamp;
    this.lastHalfUpdate = timeStamp;
    this.lastMinUpdate = timeStamp;
    this.lastSecondUpdate = timeStamp;
    this.rafID = window.requestAnimationFrame(this.update);
  }

  public update = (timestamp: number=0):void => {
    this.rafID = window.requestAnimationFrame(this.update);
    this.fullUpdate(timestamp);
    this.halfUpdate(timestamp);
    this.minUpdate(timestamp);
    this.secUpdate(timestamp);
  }

  private fullUpdate(timestamp): void {
    if (timestamp - this.lastFullUpdate > FREQUENCY.MAX){
      this.lastFullUpdate = timestamp;
      this.fullFPS.forEach(obj => { obj.callback(timestamp); });
    }
  }

  private halfUpdate(timestamp) {
    if (timestamp - this.lastHalfUpdate > FREQUENCY.HALF){
      this.lastHalfUpdate = timestamp;
      this.halfFPS.forEach(obj => { obj.callback(timestamp); });
    }
  }

  private minUpdate(timestamp) {
    if (timestamp - this.lastMinUpdate > FREQUENCY.MIN){
      this.lastMinUpdate = timestamp;
      this.minFPS.forEach(obj => { obj.callback(timestamp); });
    }
  }

  private secUpdate(timestamp) {
    if (timestamp - this.lastSecondUpdate > FREQUENCY.EVERY_SECOND){
      this.lastSecondUpdate = timestamp;
      this.secondsFPS.forEach(obj => { obj.callback(timestamp); });
    }
  }

  private comparePriority(a, b) {
    return a.priority - b.priority;
  }
}
