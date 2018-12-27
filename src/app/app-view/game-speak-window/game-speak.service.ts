import { Injectable } from '@angular/core';
import { pipe, Subscription, Observer } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { interval } from 'rxjs/observable/interval';

export type GameMessages = string[];
const CLEAR_ALERT_TIME = 2 * 60 * 1000;

type GameMsgItr = {
  next(): string
}
type GameMessageData = {
  id: number;
  msgs: GameMessages;
}

@Injectable()
export class GameSpeakService {
  messagesStack: GameMessageData[] = [];
  broadcaster: Observable<string>;

  private counter: number = 0;
  private observers: Observer<string>[] = [];
  private timerSub: Subscription;
  private msgsIterator: GameMsgItr;

  constructor() {
    this.broadcaster = new Observable<string>(observer =>{
      this.observers.push(observer);

      this.restartTimer();
      return {
        unsubscribe: () => {
          // Remove from the observers array so it's no longer notified
          this.observers.splice(this.observers.indexOf(observer), 1);
          if (this.observers.length === 0) {
            this.timerSub.unsubscribe();
          }
        }
      }
    });
    this.restartBroadcast();
  }

  private static makeMsgItr(array: string[]) {
    var nextIndex
    return {
      next: () => {
        if (array.length === 0) {
          return ''
        } else if (nextIndex < array.length) {
          return array[nextIndex++]
        } else {
          return array[nextIndex = 0];
        }
      }
    }
  }

  private startTimer(observers: Observer<string>[]): Subscription {
    this.broadcastMessage(observers);
    return interval(8000).subscribe(tick => this.broadcastMessage(observers));
  }

  private broadcastMessage(observers: Observer<string>[]) {
     observers.forEach(obs => obs.next(this.msgsIterator.next() ));
  }

  private restartTimer(): void {
    if(this.timerSub) this.timerSub.unsubscribe()
    this.timerSub = this.startTimer(this.observers);
  }

  private restartBroadcast(): void {
    let currentObj: GameMessageData;
    if (this.messagesStack.length) {
      currentObj = this.messagesStack[this.messagesStack.length - 1];
    }
    this.msgsIterator = GameSpeakService.makeMsgItr(currentObj ? currentObj.msgs : []);
    this.restartTimer();
    this.broadcastMessage(this.observers);
  }

  unregister(id: number): void {
    const index = this.messagesStack.findIndex(item => item.id === id);
    this.messagesStack.splice(index, 1);
    this.restartBroadcast();
  }

  /**
   * A component can register a callback for the game talker, it will call
   * this in intervals to display messages to the screen.
   * @param data contains a callback to get a components messages
   * @returns an unregister callback.
   */
  register(data: GameMessages): GameSpeakObject {
    let gameMessageData = {
      id: this.counter++,
      msgs: data,
    }

    this.messagesStack.push(gameMessageData);
    this.restartBroadcast();
    return new GameSpeakObject(this, gameMessageData.id);
  }

  private getMsgIdx(gameMsgID: number): number {
    return this.messagesStack.findIndex(item => item.id === gameMsgID);
  }

  addNewMessage(newMessage: string, gameMsgID: number) {
    let index = this.getMsgIdx(gameMsgID);
    this.messagesStack[index].msgs.push(newMessage);
    if (index === this.messagesStack.length - 1) {
      this.restartBroadcast();
    }
  }

  removeMessage(message: string, gameMsgID: number): void {
    let index = this.getMsgIdx(gameMsgID);
    let i = this.messagesStack[index].msgs.indexOf(message);
    this.messagesStack[index].msgs.splice(i, 1);
    if (index === this.messagesStack.length - 1) {
      this.restartBroadcast();
    }
  }

  updateMessages(newMessages: string[], gameMsgID: number): void {
    let index = this.getMsgIdx(gameMsgID);
    this.messagesStack[index].msgs = newMessages;
    if (index === this.messagesStack.length - 1) {
      this.restartBroadcast();
    }
  }

}

// Acts as a way to add/remove messages to the service as well as managing timed messages
export class GameSpeakObject {
  private timedEvents: Map<string, number>;
  constructor(private gameSpeakService: GameSpeakService, private id: number ) {
    this.timedEvents = new Map();
  }
  dispose() {
    this.gameSpeakService.unregister(this.id)
    this.clearTimedEvents();
  }
  // WARNING - this kills all timed events and just replaces current messages
  update(newMessages: string[]) {
    this.clearTimedEvents();
    this.gameSpeakService.updateMessages(newMessages, this.id);
  }

  addMsg(newMessage: string) {
    this.gameSpeakService.addNewMessage(newMessage, this.id);
  }

  removeMsg(message: string) {
    this.gameSpeakService.removeMessage(message, this.id);
  }

  // displays message for a set amount of time and automatically removes itself
  setTimedEvent(msg: string): void {
    // msg already exists but the timeout is still active
    if(this.timedEvents.has(msg)) {
      let timerID = this.timedEvents.get(msg);
      window.clearTimeout(timerID);
      this.timedEvents.delete(msg);
    } else {
      this.addMsg(msg);
    }

    // remove message after sometime has passed
    let newID = window.setTimeout(() => {
      this.timedEvents.delete(msg);
      this.removeMsg(msg);
    }, CLEAR_ALERT_TIME);

    this.timedEvents.set(msg, newID);
  }

  clearTimedEvents() {
    this.timedEvents.forEach((value, key) => window.clearTimeout(value));
    this.timedEvents.clear();
  }
}
